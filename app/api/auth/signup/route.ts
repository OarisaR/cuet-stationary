import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { generateToken } from '@/lib/jwt';
import type { User, AuthResponse } from '@/lib/models';

const VENDOR_EMAILS = (process.env.VENDOR_EMAILS || 'vendor@cuet.com').split(',').map(e => e.trim());

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if email is a vendor email
    if (VENDOR_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Vendor accounts cannot be created through signup. Please contact admin.' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: User = {
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName: displayName || '',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Generate token
    const token = generateToken({
      userId: result.insertedId.toString(),
      email: newUser.email,
      role: 'student',
    });

    const response: AuthResponse = {
      success: true,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        displayName: newUser.displayName,
        role: 'student',
      },
      token,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    );
  }
}
