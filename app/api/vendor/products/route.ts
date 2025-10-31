import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Inventory } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get vendor's/admin's products from inventory
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lowStockThreshold = searchParams.get('lowStock');

    const db = await getDatabase();
    const inventoryCollection = db.collection<Inventory>('inventory');

    // Build query based on filters
    const query: any = {};
    
    // If lowStock parameter is provided, filter by low stock
    if (lowStockThreshold) {
      const threshold = parseInt(lowStockThreshold);
      query.stock_quantity = { $lte: threshold };
    }

    // Get inventory items
    const products = await inventoryCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Get vendor products error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Add new product to inventory
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, price, stock, category, emoji, description, brand } = await request.json();

    // Check for missing required fields
    if (!name || price === undefined || stock === undefined || !category) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ Validate price - cannot be negative
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { success: false, message: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    // ✅ Validate stock - cannot be negative
    const parsedStock = parseInt(stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json(
        { success: false, message: 'Stock quantity cannot be negative' },
        { status: 400 }
      );
    }

    // ✅ Validate product name is not empty
    if (!name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Product name cannot be empty' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const inventoryCollection = db.collection<Inventory>('inventory');

    const product: Inventory = {
      product_name: name,
      price: parsedPrice,
      stock_quantity: parsedStock,
      category,
      brand,
      emoji,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await inventoryCollection.insertOne(product);

    return NextResponse.json(
      { success: true, productId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add product' },
      { status: 500 }
    );
  }
}