// Script to check inventory collection and add sample products if empty
import { getDatabase } from '../lib/mongodb';

async function checkInventory() {
  try {
    const db = await getDatabase();
    const inventoryCollection = db.collection('inventory');
    
    const count = await inventoryCollection.countDocuments();
    console.log(`Total inventory items: ${count}`);
    
    const productsWithStock = await inventoryCollection.countDocuments({ stock_quantity: { $gt: 0 } });
    console.log(`Products with stock > 0: ${productsWithStock}`);
    
    const allProducts = await inventoryCollection.find({}).toArray();
    console.log('\nAll products:');
    allProducts.forEach(product => {
      console.log(`- ${product.product_name}: stock=${product.stock_quantity}, price=${product.price}`);
    });
    
    // If no products, add sample data
    if (count === 0) {
      console.log('\n\nNo products found! Adding sample products...');
      const sampleProducts = [
        {
          product_name: 'Classic Notebook',
          category: 'Notebooks',
          description: 'A5 ruled notebook with 200 pages',
          brand: 'Navana',
          price: 120,
          stock_quantity: 50,
          emoji: '📓',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          product_name: 'Blue Ballpoint Pen',
          category: 'Pens',
          description: 'Smooth writing blue ink pen',
          brand: 'Matador',
          price: 10,
          stock_quantity: 100,
          emoji: '🖊️',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          product_name: 'Geometry Box',
          category: 'Tools',
          description: 'Complete geometry set with compass, protractor',
          brand: 'Deli',
          price: 250,
          stock_quantity: 30,
          emoji: '📐',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          product_name: 'Colored Pencil Set',
          category: 'Art',
          description: '24 vibrant colors for drawing and coloring',
          brand: 'Faber-Castell',
          price: 350,
          stock_quantity: 20,
          emoji: '🎨',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          product_name: 'Backpack',
          category: 'Accessories',
          description: 'Durable student backpack with laptop compartment',
          brand: 'Wildcraft',
          price: 1500,
          stock_quantity: 15,
          emoji: '🎒',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      const result = await inventoryCollection.insertMany(sampleProducts);
      console.log(`✅ Added ${result.insertedCount} sample products`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkInventory();
