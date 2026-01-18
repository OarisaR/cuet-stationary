// Script to migrate old product schema to new inventory schema
import { getDatabase } from '../lib/mongodb';

async function migrateProducts() {
  try {
    const db = await getDatabase();
    const inventoryCollection = db.collection('inventory');
    
    console.log('Checking for products with old schema...');
    
    // Find products with old field names
    const oldSchemaProducts = await inventoryCollection.find({
      $or: [
        { product_name: { $exists: false } },
        { stock_quantity: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${oldSchemaProducts.length} products to migrate`);
    
    if (oldSchemaProducts.length === 0) {
      console.log('✅ All products already using new schema');
      process.exit(0);
      return;
    }
    
    let migrated = 0;
    
    for (const product of oldSchemaProducts) {
      const updates: any = {};
      
      // Migrate name -> product_name
      if (!product.product_name && product.name) {
        updates.product_name = product.name;
      }
      
      // Migrate stock -> stock_quantity
      if (product.stock_quantity === undefined && product.stock !== undefined) {
        updates.stock_quantity = product.stock;
      }
      
      // Set default values if still missing
      if (!updates.product_name && !product.product_name) {
        updates.product_name = 'Unnamed Product';
      }
      
      if (updates.stock_quantity === undefined && product.stock_quantity === undefined) {
        updates.stock_quantity = 0;
      }
      
      // Update the product
      if (Object.keys(updates).length > 0) {
        await inventoryCollection.updateOne(
          { _id: product._id },
          { $set: updates }
        );
        migrated++;
        console.log(`✓ Migrated: ${updates.product_name || product.name || 'Unknown'}`);
      }
    }
    
    console.log(`\n✅ Migration complete! Updated ${migrated} products`);
    
    // Show summary
    const totalCount = await inventoryCollection.countDocuments();
    const withStock = await inventoryCollection.countDocuments({ stock_quantity: { $gt: 0 } });
    console.log(`\nSummary:`);
    console.log(`- Total products: ${totalCount}`);
    console.log(`- Products with stock: ${withStock}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

migrateProducts();
