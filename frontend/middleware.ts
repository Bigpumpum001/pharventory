import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ฟังก์ชันตรวจสอบ token
const validateToken = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export function middleware(request: NextRequest) {
  // ถ้าเป็นหน้า login ให้ผ่านไปได้เลย
  if (request.nextUrl.pathname === "/login") {
    // ถ้ามี token อยู่แล้ว ให้ redirect ไป dashboard
    const token = request.cookies.get("token")?.value;
    if (token && validateToken(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ตรวจสอบ token สำหรับหน้าที่ต้องการ authentication
  const protectedPaths = ['/dashboard', '/inventory', '/dispense', '/receipt', '/stocklogs'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath) {
    const token = request.cookies.get("token")?.value;
    
    if (!token || !validateToken(token)) {
      // ถ้าไม่มี token หรือ token หมดอายุ ให้ redirect ไป login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ถ้า token ถูกต้อง หรือเป็นหน้าไม่ต้องป้องกัน ให้ผ่านไปได้
  return NextResponse.next();
}

// กำหนดว่า middleware ทำงานกับ path ไหนบ้าง
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
