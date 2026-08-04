import { NextResponse } from 'next/server';

export const runtime = 'edge';

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^\[?::1\]?$/,
  /^\[?fc/i,
  /^\[?fd/i,
];

function isSafeImageUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname))) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
  }

  const targetUrl = isSafeImageUrl(imageUrl);
  if (!targetUrl) {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const imageResponse = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: `${targetUrl.protocol}//${targetUrl.host}/`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: imageResponse.statusText },
        { status: imageResponse.status }
      );
    }

    const contentType = imageResponse.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return NextResponse.json(
        { error: 'Upstream response is not an image' },
        { status: 415 }
      );
    }

    if (!imageResponse.body) {
      return NextResponse.json(
        { error: 'Image response has no body' },
        { status: 500 }
      );
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=2592000');
    headers.set('CDN-Cache-Control', 'public, s-maxage=2592000');
    headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=2592000');

    return new Response(imageResponse.body, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error fetching image' },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
