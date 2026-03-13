import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value; 
  const { pathname } = request.nextUrl;

  // Danh sách các route cần bảo vệ
  const protectedPaths = ['/attendance', '/recruitment', '/core-hr', '/payroll', '/admin'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  // TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // TRƯỜNG HỢP 2: KIỂM TRA ROLE CHI TIẾT
  if (token && role) {
    if (role === 'Employee') {
      const adminOnly = ['/recruitment', '/core-hr', '/payroll', '/attendance/config'];
      if (adminOnly.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/attendance/checkin', request.url));
      }
    }
    
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Chạy middleware trên tất cả các trang trừ file tĩnh
};