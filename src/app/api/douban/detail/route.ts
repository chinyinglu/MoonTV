import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface DoubanPerson {
  id?: string;
  name?: string;
  latin_name?: string;
  character?: string;
  url?: string;
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

interface DoubanColorScheme {
  primary_color_light?: string;
  primary_color_dark?: string;
  secondary_color?: string;
  is_dark?: boolean;
}

interface DoubanDetailResponse {
  id?: string;
  title?: string;
  original_title?: string;
  year?: string;
  intro?: string;
  pubdate?: string[];
  duration?: string[];
  durations?: string[];
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
  cover_url?: string;
  cover?: {
    image?: {
      large?: {
        url?: string;
      };
      normal?: {
        url?: string;
      };
    };
  };
  body_bg_color?: string;
  header_bg_color?: string;
  color_scheme?: DoubanColorScheme;
  directors?: DoubanPerson[];
  actors?: DoubanPerson[];
  photos?: DoubanPhoto[];
}

interface DoubanCrewResponse {
  directors?: DoubanPerson[];
  actors?: DoubanPerson[];
}

interface DoubanRecommendation {
  id?: string;
  title?: string;
  type?: string;
  card_subtitle?: string;
  pic?: {
    normal?: string;
    large?: string;
  };
  rating?: {
    value?: number;
  };
}

const normalizeColor = (value?: string, fallback = '') => {
  const color = value?.trim().replace(/^#/, '');
  return color && /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : fallback;
};

const getAvatar = (person: DoubanPerson) => {
  const avatar =
    person.avatar?.large ||
    person.avatar?.normal ||
    person.avatars?.large ||
    person.avatars?.normal ||
    person.pic?.large ||
    person.pic?.normal ||
    '';
  return avatar.includes('personage-default') ? '' : avatar;
};

async function fetchDouban(url: string, referer: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        Accept: 'application/json',
        Referer: referer,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121 Safari/537.36',
      },
      next: { revalidate: 86400 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.trim();
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid subject id' }, { status: 400 });
  }

  const referer = `https://m.douban.com/movie/subject/${id}/`;
  const detailUrl = `https://m.douban.com/rexxar/api/v2/movie/${id}`;
  const crewUrl = `${detailUrl}/celebrities`;
  const recommendationsUrl = `${detailUrl}/recommendations?start=0&count=12`;

  try {
    const [detailResult, crewResult, recommendationsResult] =
      await Promise.allSettled([
        fetchDouban(detailUrl, referer),
        fetchDouban(crewUrl, referer),
        fetchDouban(recommendationsUrl, referer),
      ]);

    if (detailResult.status !== 'fulfilled' || !detailResult.value.ok) {
      const status =
        detailResult.status === 'fulfilled' ? detailResult.value.status : 502;
      return NextResponse.json(
        { error: 'Unable to load subject detail' },
        { status }
      );
    }

    const data = (await detailResult.value.json()) as DoubanDetailResponse;
    const crew =
      crewResult.status === 'fulfilled' && crewResult.value.ok
        ? ((await crewResult.value.json()) as DoubanCrewResponse)
        : null;
    const recommendations =
      recommendationsResult.status === 'fulfilled' &&
      recommendationsResult.value.ok
        ? ((await recommendationsResult.value.json()) as DoubanRecommendation[])
        : [];

    const directors = crew?.directors?.length
      ? crew.directors
      : data.directors || [];
    const actors = crew?.actors?.length ? crew.actors : data.actors || [];
    const people = [
      ...directors.map((person) => ({ person, role: '导演' })),
      ...actors.map((person) => ({ person, role: '演员' })),
    ]
      .filter(({ person }) => person.name)
      .slice(0, 12)
      .map(({ person, role }, index) => ({
        id: person.id || `${person.name}-${index}`,
        name: person.name || '',
        latinName: person.latin_name || '',
        role,
        character:
          person.character && person.character !== role ? person.character : '',
        avatar: getAvatar(person),
        profileUrl: person.url || '',
      }));

    const palette = {
      body: normalizeColor(data.body_bg_color, '#101312'),
      header: normalizeColor(data.header_bg_color, '#343a38'),
      primaryLight: normalizeColor(
        data.color_scheme?.primary_color_light,
        '#9da5a3'
      ),
      primaryDark: normalizeColor(
        data.color_scheme?.primary_color_dark,
        '#343a38'
      ),
      secondary: normalizeColor(data.color_scheme?.secondary_color, '#eef2f1'),
      isDark: data.color_scheme?.is_dark ?? true,
    };

    return NextResponse.json({
      id: data.id || id,
      title: data.title || '',
      originalTitle: data.original_title || '',
      year: data.year || '',
      intro: data.intro || '',
      pubdate: data.pubdate?.[0] || '',
      duration: data.duration?.[0] || data.durations?.[0] || '',
      countries: data.countries || [],
      genres: (data.genres || [])
        .map((genre) => (typeof genre === 'string' ? genre : genre.name || ''))
        .filter(Boolean),
      rate: data.rating?.value ? String(data.rating.value) : '',
      ratingCount: data.rating?.count || 0,
      poster:
        data.cover?.image?.large?.url ||
        data.cover?.image?.normal?.url ||
        data.pic?.large ||
        data.pic?.normal ||
        data.cover_url ||
        '',
      palette,
      people,
      related: recommendations
        .filter((item) => item.id && item.title)
        .slice(0, 10)
        .map((item) => ({
          id: item.id || '',
          title: item.title || '',
          poster: item.pic?.large || item.pic?.normal || '',
          rate: item.rating?.value ? String(item.rating.value) : '',
          year: item.card_subtitle?.match(/\b\d{4}\b/)?.[0] || '',
          type: item.type || 'movie',
        })),
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
