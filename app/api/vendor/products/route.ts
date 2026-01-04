import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getDatabase } from '@/lib/mongodb';
import type { Product } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Get vendor's products
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const productsCollection = db.collection<Product>('products');

    const products = await productsCollection
      .find({ vendorId: new ObjectId(user.userId) })
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

// POST - Add new product
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, price, stock, category, emoji, description } = await request.json();

    if (!name || !price || stock === undefined || !category || !emoji) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const productsCollection = db.collection<Product>('products');

    const product: Product = {
      vendorId: new ObjectId(user.userId),
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      emoji,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await productsCollection.insertOne(product);

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
