import { getDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

async function cleanDuplicateCartItems() {
  try {
    const db = await getDatabase();
    const cartCollection = db.collection('cart');

    // Get all cart items
    const allItems = await cartCollection.find({}).toArray();
    
    console.log(`Total cart items: ${allItems.length}`);

    // Group by studentId + productId
    const itemsByKey = new Map<string, any[]>();
    
    for (const item of allItems) {
      const key = `${item.studentId}_${item.productId}`;
      if (!itemsByKey.has(key)) {
        itemsByKey.set(key, []);
      }
      itemsByKey.get(key)!.push(item);
    }

    // Find duplicates
    let duplicatesFound = 0;
    let itemsDeleted = 0;

    for (const [key, items] of itemsByKey.entries()) {
      if (items.length > 1) {
        duplicatesFound++;
        console.log(`\nDuplicate found for ${key}:`);
        console.log(`  - ${items.length} items found`);
        
        // Keep the most recent one (or one with highest quantity)
        items.sort((a, b) => {
          // First sort by quantity (keep higher quantity)
          if (a.quantity !== b.quantity) {
            return b.quantity - a.quantity;
          }
          // Then by date (keep more recent)
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        });

        const keepItem = items[0];
        const deleteItems = items.slice(1);

        console.log(`  - Keeping: ${keepItem._id} (qty: ${keepItem.quantity})`);
        
        for (const item of deleteItems) {
          console.log(`  - Deleting: ${item._id} (qty: ${item.quantity})`);
          await cartCollection.deleteOne({ _id: new ObjectId(item._id) });
          itemsDeleted++;
        }
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Duplicates found: ${duplicatesFound}`);
    console.log(`   Items deleted: ${itemsDeleted}`);
    console.log(`   Items remaining: ${allItems.length - itemsDeleted}`);

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning cart:', error);
    process.exit(1);
  }
}

cleanDuplicateCartItems();
