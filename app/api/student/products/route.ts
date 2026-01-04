import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import type { Product } from '@/lib/models';

// GET - Get all products or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const db = await getDatabase();
    const productsCollection = db.collection<Product>('products');

    let query: any = { stock: { $gt: 0 } };

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const products = await productsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
