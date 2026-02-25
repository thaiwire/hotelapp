import { NextRequest, NextResponse } from "next/server";

const PRIVATE_ROUTE_PREFIXES = ["/admin", "/customer", "/hotel_owner"];

type UserRole = "admin" | "customer" | "hotel_owner";

const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  customer: "/customer/dashboard",
  hotel_owner: "/hotel_owner/dashboard",
};

const PRIVATE_PREFIX_BY_ROLE: Record<UserRole, string> = {
  admin: "/admin",
  customer: "/customer",
  hotel_owner: "/hotel_owner",
};

const decodeJwtPayload = (token: string): { role?: UserRole } | null => {
  try {
    const base64Url = token.split(".")[1];

    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));

    return payload;
  } catch {
    return null;
  }
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const payload = token ? decodeJwtPayload(token) : null;
  const role = payload?.role;
  const hasValidRole = Boolean(role && role in DASHBOARD_BY_ROLE);
  const dashboardPath = hasValidRole
    ? DASHBOARD_BY_ROLE[role as UserRole]
    : null;

  const isPrivateRoute = PRIVATE_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isPrivateRoute) {
    if (!token || !hasValidRole || !dashboardPath) {
      return NextResponse.next();
    }

    if (pathname !== dashboardPath) {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!hasValidRole || !dashboardPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const privatePrefix = PRIVATE_PREFIX_BY_ROLE[role as UserRole];
  const isAllowedPrivateRoute = pathname.startsWith(privatePrefix);

  if (!isAllowedPrivateRoute) {
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};