import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    console.log("🔥 Middleware running for:", pathname, "Role:", token?.role);
    // Protect every route under /admin
    if (pathname.startsWith("/admin")) {
      const role = token?.role as string | undefined;
      // Only Admin and Super Admin are allowed
      const isAllowed = role === "ADMIN" || role === "SUPERADMIN";

      if (!isAllowed) {
        // User (or any other role) → redirect to home / dashboard
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/signin",
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/apa-agent/:path*"],
};
