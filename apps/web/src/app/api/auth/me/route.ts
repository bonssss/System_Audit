import { NextResponse } from 'next/server';
import { getCurrentUser, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    const response = NextResponse.json({ success: false, user: null }, { status: 401 });
    // Clear dead / expired cookie from client
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    return response;
  }

  return NextResponse.json({
    success: true,
    user,
  });
}

