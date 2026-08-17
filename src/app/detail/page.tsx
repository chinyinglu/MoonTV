'use client';

import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Film,
  Play,
  Sparkles,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { buildDetailUrl } from '@/lib/detail-url';

import PageLayout from '@/components/PageLayout';
import PosterImage from '@/components/PosterImage';

interface PosterPalette {
  body: string;
  header: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  isDark: boolean;
}

interface RelatedMovie {
  id: string;
  title: string;
  poster: string;
  rate: string;
  year: string;
  type: string;
}

interface DetailData {
  id: string;
  title: string;
  originalTitle: string;
  year: string;
  intro: string;
  pubdate: string;
  duration: string;
  countries: string[];
  genres: string[];
  rate: string;
  ratingCount: number;
  poster: string;
  palette?: PosterPalette;
  people: Array<{
    id: string;
    name: string;
    latinName: string;
    role: string;
    character: string;
    avatar: string;
    profileUrl: string;
  }>;
  related: RelatedMovie[];
  photos: string[];
}

function DetailPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const fallbackTitle = searchParams.get('title') || '影片详情';
  const fallbackPoster = searchParams.get('poster') || '';
  const fallbackYear = searchParams.get('year') || '';
  const fallbackRate = searchParams.get('rate') || '';
  const type = searchParams.get('type') || 'movie';
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    fetch(`/api/douban/detail?id=${encodeURIComponent(id)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('detail unavailable');
        return response.json() as Promise<DetailData>;
      })
      .then(setDetail)
      .catch(() => undefined)
      .finally(() => setDetailLoading(false));

    return () => controller.abort();
  }, [id]);

  const movie = useMemo(
    () => ({
      title: detail?.title || fallbackTitle,
      originalTitle: detail?.originalTitle || '',
      poster: detail?.poster || fallbackPoster,
      year: detail?.year || fallbackYear,
      rate: detail?.rate || fallbackRate,
      intro: detail?.intro || '',
      duration: detail?.duration || '',
      pubdate: detail?.pubdate || '',
      countries: detail?.countries || [],
      genres: detail?.genres || [],
      palette: detail?.palette,
    }),
    [detail, fallbackPoster, fallbackRate, fallbackTitle, fallbackYear]
  );

  const playHref = `/play?title=${encodeURIComponent(movie.title.trim())}${
    movie.year ? `&year=${encodeURIComponent(movie.year)}` : ''
  }&stype=${encodeURIComponent(type)}`;
  const paletteStyle = {
    '--detail-body': movie.palette?.body || '#111513',
    '--detail-deep': movie.palette?.primaryDark || '#252b29',
    '--detail-mid': movie.palette?.header || '#4f5956',
    '--detail-light': movie.palette?.primaryLight || '#9ca7a3',
    '--detail-soft': movie.palette?.secondary || '#eff3f2',
  } as CSSProperties;

  return (
    <PageLayout activePath='/detail'>
      <div
        className='detail-page relative min-h-screen overflow-hidden pb-24'
        style={paletteStyle}
      >
        <div className='detail-page-ambient pointer-events-none fixed inset-0 -z-10'>
          <PosterImage
            src={movie.poster}
            alt=''
            fill
            priority
            sizes='100vw'
            className='detail-page-ambient-image'
            fallbackLabel=''
          />
          <div className='detail-page-ambient-wash absolute inset-0' />
        </div>

        <article className='w-full'>
          <section className='detail-hero cinema-enter relative min-h-[calc(100svh-2.5rem)] overflow-hidden sm:min-h-[calc(100svh-3.5rem)]'>
            <div className='detail-hero-ambient absolute inset-0'>
              <PosterImage
                src={movie.poster}
                alt=''
                fill
                priority
                sizes='100vw'
                className='detail-hero-ambient-image'
                fallbackLabel=''
              />
            </div>
            <div className='detail-hero-focus absolute inset-0'>
              <PosterImage
                src={movie.poster}
                alt={movie.title}
                fill
                priority
                sizes='(max-width: 1024px) 100vw, 58vw'
                quality={95}
                className='detail-hero-artwork'
                fallbackLabel={movie.title}
              />
            </div>
            <div className='detail-hero-tone pointer-events-none absolute inset-0' />
            <div className='detail-hero-vignette pointer-events-none absolute inset-0' />
            <div className='hero-grain pointer-events-none absolute inset-0' />

            <div className='relative z-10 flex min-h-[calc(100svh-2.5rem)] items-end px-5 pb-10 pt-[52svh] sm:min-h-[calc(100svh-3.5rem)] sm:px-10 sm:pb-14 lg:items-center lg:justify-end lg:px-16 lg:py-16'>
              <div className='detail-copy w-full lg:w-[60%] lg:max-w-4xl'>
                <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/18 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-2xl'>
                  <Sparkles className='h-4 w-4 text-current' />
                  影片档案 · Film archive
                </div>

                <h1 className='text-balance max-w-4xl text-4xl font-black leading-[0.94] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl'>
                  {movie.title}
                </h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className='mt-3 text-base tracking-wide text-white/62 sm:text-xl'>
                    {movie.originalTitle}
                  </p>
                )}

                <div className='mt-6 flex flex-wrap gap-2.5 text-sm text-white/72'>
                  {movie.year && (
                    <span className='detail-chip'>
                      <CalendarDays className='h-4 w-4' />
                      {movie.year}
                    </span>
                  )}
                  {movie.duration && (
                    <span className='detail-chip'>
                      <Clock3 className='h-4 w-4' />
                      {movie.duration}
                    </span>
                  )}
                  {movie.genres.map((genre) => (
                    <span key={genre} className='detail-chip'>
                      {genre}
                    </span>
                  ))}
                  {movie.rate && (
                    <span className='detail-chip text-white'>
                      <Star className='h-4 w-4 fill-current' />
                      {movie.rate}
                    </span>
                  )}
                </div>

                <p className='mt-7 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8'>
                  {movie.intro ||
                    (detailLoading
                      ? '正在加载影片简介…'
                      : `《${movie.title}》的详细资料暂未加载，仍可直接查找可播放资源。`)}
                </p>

                <div className='mt-8 flex flex-wrap items-center gap-3'>
                  <Link
                    href={playHref}
                    className='inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black shadow-2xl transition hover:-translate-y-0.5'
                  >
                    <Play className='h-5 w-5 fill-current' />
                    查找播放资源
                  </Link>
                  {id && (
                    <a
                      href={`https://movie.douban.com/subject/${id}/`}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex min-h-12 items-center gap-2 rounded-full border border-white/22 bg-black/18 px-5 py-3 text-sm font-bold text-white backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white hover:text-black'
                    >
                      豆瓣条目
                      <ArrowUpRight className='h-4 w-4' />
                    </a>
                  )}
                </div>

                <div className='mt-9 grid gap-3 text-sm text-white/65 sm:grid-cols-2'>
                  {(movie.pubdate || movie.year) && (
                    <div className='detail-info-row'>
                      <CalendarDays className='h-4 w-4' />
                      上映：{movie.pubdate || movie.year}
                    </div>
                  )}
                  {movie.countries.length > 0 && (
                    <div className='detail-info-row'>
                      <Film className='h-4 w-4' />
                      地区：{movie.countries.join(' / ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {detail?.people && detail.people.length > 0 && (
            <section className='cinema-enter cinema-delay-1 mx-auto mt-10 max-w-[1400px] px-4 sm:px-6 lg:px-10'>
              <div className='mb-5 flex items-end justify-between gap-4'>
                <div>
                  <p className='ui-kicker'>Cast & crew</p>
                  <h2 className='mt-1 text-2xl font-bold text-[color:var(--text)] sm:text-3xl'>
                    主创团队
                  </h2>
                </div>
                <p className='hidden text-xs text-[color:var(--text-soft)] sm:block'>
                  左右滑动查看更多
                </p>
              </div>
              <div className='detail-people flex gap-4 overflow-x-auto pb-4'>
                {detail.people.map((person, personIndex) => {
                  const personKey = `${person.id}-${personIndex}`;
                  const personCard = (
                    <article className='person-card group w-[132px] flex-none sm:w-[154px]'>
                      <div className='person-avatar relative aspect-[3/4] overflow-hidden rounded-[1.35rem] border border-white/14 bg-white/[0.045] shadow-2xl'>
                        <PosterImage
                          src={person.avatar}
                          alt={person.name}
                          fill
                          sizes='154px'
                          className='object-cover transition duration-700 group-hover:scale-105'
                          fallbackLabel={person.name.trim().slice(0, 1) || '影'}
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent' />
                      </div>
                      <p className='mt-3 truncate text-sm font-semibold text-[color:var(--text)]'>
                        {person.name}
                      </p>
                      {person.latinName && (
                        <p className='mt-0.5 truncate text-[10px] text-[color:var(--text-soft)]'>
                          {person.latinName}
                        </p>
                      )}
                      <p className='mt-1 truncate text-xs text-[color:var(--text-soft)]'>
                        {person.character || person.role}
                      </p>
                    </article>
                  );

                  return person.profileUrl ? (
                    <a
                      key={personKey}
                      href={person.profileUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='rounded-[1.35rem] focus:outline-none focus:ring-2 focus:ring-[color:var(--focus)]'
                    >
                      {personCard}
                    </a>
                  ) : (
                    <div key={personKey}>{personCard}</div>
                  );
                })}
              </div>
            </section>
          )}

          {detail?.related && detail.related.length > 0 && (
            <section className='cinema-enter cinema-delay-2 mx-auto mt-12 max-w-[1400px] px-4 sm:px-6 lg:px-10'>
              <div className='mb-5 flex items-end justify-between gap-4'>
                <div>
                  <p className='ui-kicker'>More like this</p>
                  <h2 className='mt-1 text-2xl font-bold text-[color:var(--text)] sm:text-3xl'>
                    相关影片
                  </h2>
                </div>
                <ChevronRight className='h-5 w-5 text-[color:var(--text-soft)]' />
              </div>
              <div className='detail-related flex gap-4 overflow-x-auto pb-5'>
                {detail.related.map((related) => (
                  <Link
                    key={related.id}
                    href={buildDetailUrl({
                      id: related.id,
                      title: related.title,
                      poster: related.poster,
                      year: related.year,
                      rate: related.rate,
                      type: related.type,
                    })}
                    className='related-card group w-[168px] flex-none sm:w-[196px]'
                  >
                    <div className='relative aspect-[2/3] overflow-hidden rounded-[1.35rem] border border-white/12 bg-white/[0.04] shadow-2xl'>
                      <PosterImage
                        src={related.poster}
                        alt={related.title}
                        fill
                        sizes='196px'
                        className='object-cover transition duration-700 group-hover:scale-[1.045]'
                        fallbackLabel={related.title}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent' />
                      {related.rate && (
                        <span className='absolute right-2 top-2 rounded-full border border-white/15 bg-black/55 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-xl'>
                          {related.rate}
                        </span>
                      )}
                    </div>
                    <p className='mt-3 truncate text-sm font-semibold text-[color:var(--text)]'>
                      {related.title}
                    </p>
                    <p className='mt-1 text-xs text-[color:var(--text-soft)]'>
                      {related.year || '影片档案'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {detail?.photos && detail.photos.length > 0 && (
            <section className='cinema-enter cinema-delay-2 mx-auto mt-12 max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10'>
              <div className='mb-5'>
                <p className='ui-kicker'>Gallery</p>
                <h2 className='mt-1 text-2xl font-bold text-[color:var(--text)] sm:text-3xl'>
                  剧照
                </h2>
              </div>
              <div className='detail-gallery flex gap-4 overflow-x-auto pb-4'>
                {detail.photos.map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className='glass-card relative aspect-video min-w-[82vw] overflow-hidden rounded-[1.5rem] sm:min-w-[480px]'
                  >
                    <PosterImage
                      src={photo}
                      alt={`${movie.title} 剧照 ${index + 1}`}
                      fill
                      sizes='(max-width: 640px) 82vw, 480px'
                      className='object-cover transition duration-700 hover:scale-[1.035]'
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </PageLayout>
  );
}

export default function DetailPage() {
  return (
    <Suspense>
      <DetailPageContent />
    </Suspense>
  );
}
