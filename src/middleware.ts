import { type NextRequest, NextResponse } from "next/server"

export async function middleware(
  request: NextRequest
): Promise<NextResponse | Response> {
  const res = NextResponse.next()

  const host = request.headers.get("host")
  if (!host) {
    console.error("Host header is missing")
    return NextResponse.error()
  }

  return res
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
