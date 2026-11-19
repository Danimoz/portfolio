import { NextResponse, type NextRequest } from 'next/server'
import connectToDb from '@/lib/mongo'
import { Composition } from '@/lib/models'
import { compositionLookup, compositionRedirect } from '@/lib/compositionUrls'

// Resolve before the root loading boundary can stream an HTTP 200 response.
export async function proxy(request: NextRequest) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return NextResponse.next()
  try {
    const identifier = decodeURIComponent(request.nextUrl.pathname.split('/').pop() ?? '')
    await connectToDb()
    const composition = await Composition.findOne(compositionLookup(identifier)).select('_id slug')
    const redirect = composition ? compositionRedirect(composition, identifier) : null
    if (redirect) {
      const destination = request.nextUrl.clone()
      destination.pathname = redirect
      return NextResponse.redirect(destination, 308)
    }
    return NextResponse.next()
  } catch {
    return new NextResponse('Compositions are temporarily unavailable. Please try again shortly.', {
      status: 503,
      headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
    })
  }
}

export const config = { matcher: '/music-catalog/:identifier' }
