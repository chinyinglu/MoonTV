import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface DoubanPerson {
  id?: string;
  name?: string;
  avatar?: {
    normal?: string;
    large?: string;
  };
  avatars?: {
    normal?: string;
    large?: string;
  };
  pic?: {
    normal?: string;
    large?: string;
  };
}

interface DoubanPhoto {
  image?: {
    normal?: string;
    large?: string;
  };
}

interface DoubanDetailResponse {
  id?: string;
  title?: string;
  original_title?: string;
  year?: string;
  intro?: string;
  pubdate?: string[];
  duration?: string[];
  countries?: string[];
  genres?: Array<{ name?: string } | string>;
  rating?: {
    value?: number;
    count?: number;
  };
  pic?: {
    normal?: string;
    large?: string;
  };
  directors?: DoubanPerson[];
  actors?: DoubanPerson[];
  photos?: DoubanPhoto[];
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.trim();
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid subject id' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://m.douban.com/rexxar/api/v2/movie/${id}`,
      {
        headers: {
          Accept: 'application/json',
          Referer: `https://m.douban.com/movie/subject/${id}/`,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121 Safari/537.36',
        },
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unable to load subject detail' },
        { status: response.status }
      );
    }

    const data = (await response.json()) as DoubanDetailResponse;
    const people = [...(data.directors || []), ...(data.actors || [])]
      .filter((person) => person.name)
      .slice(0, 8)
      .map((person, index) => ({
        id: person.id || `${person.name}-${index}`,
        name: person.name || '',
        role: index < (data.directors?.length || 0) ? '导演' : '演员',
        avatar:
          person.avatar?.large ||
          person.avatar?.normal ||
          person.avatars?.large ||
          person.avatars?.normal ||
          person.pic?.large ||
          person.pic?.normal ||
          '',
      }));

    return NextResponse.json({
      id: data.id || id,
      title: data.title || '',
      originalTitle: data.original_title || '',
      year: data.year || '',
      intro: data.intro || '',
      pubdate: data.pubdate?.[0] || '',
      duration: data.duration?.[0] || '',
      countries: data.countries || [],
      genres: (data.genres || [])
        .map((genre) => (typeof genre === 'string' ? genre : genre.name || ''))
        .filter(Boolean),
      rate: data.rating?.value ? String(data.rating.value) : '',
      ratingCount: data.rating?.count || 0,
      poster: data.pic?.large || data.pic?.normal || '',
      people,
      photos: (data.photos || [])
        .map((photo) => photo.image?.large || photo.image?.normal || '')
        .filter(Boolean)
        .slice(0, 8),
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load subject detail' },
      { status: 502 }
    );
  }
}
