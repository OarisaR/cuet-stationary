import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { generateToken } from '@/lib/jwt';
import type { Student, AuthResponse } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, student_id, hall_name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const studentsCollection = db.collection<Student>('students');

    // Check if student already exists
    const existingStudent = await studentsCollection.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const newStudent: Student = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name,
      phone: phone,
      student_id: student_id,
      hall_name: hall_name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await studentsCollection.insertOne(newStudent);

    // Generate token
    const token = generateToken({
      userId: result.insertedId.toString(),
      email: newStudent.email,
      userType: 'student',
    });

    const response: AuthResponse = {
      success: true,
      user: {
        id: result.insertedId.toString(),
        email: newStudent.email,
        name: newStudent.name,
        userType: 'student',
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
