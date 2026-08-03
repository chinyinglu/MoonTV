'use client';

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Film,
  Play,
  Sparkles,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import PageLayout from '@/components/PageLayout';
import PosterImage from '@/components/PosterImage';

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
  people: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
  }>;
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
    }),
    [detail, fallbackPoster, fallbackRate, fallbackTitle, fallbackYear]
  );

  const playHref = `/play?title=${encodeURIComponent(movie.title.trim())}${
    movie.year ? `&year=${encodeURIComponent(movie.year)}` : ''
  }&stype=${encodeURIComponent(type)}`;

  return (
    <PageLayout activePath='/detail'>
      <div className='relative min-h-screen overflow-hidden px-4 py-6 sm:px-10 sm:py-10'>
        <div className='pointer-events-none fixed inset-0 -z-10'>
          <PosterImage
            src={movie.poster}
            alt=''
            fill
            priority
            sizes='100vw'
            className='scale-110 object-cover opacity-30 blur-3xl saturate-150'
            fallbackLabel=''
          />
          <div
            className='absolute inset-0'
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--page) 38%, transparent), var(--page) 78%)',
            }}
          />
        </div>

        <article className='cinema-enter mx-auto max-w-7xl'>
          <div className='glass-panel grid overflow-hidden rounded-[2rem] lg:grid-cols-[minmax(280px,0.7fr)_1.5fr]'>
            <div className='relative min-h-[460px] overflow-hidden lg:min-h-[690px]'>
              <PosterImage
                src={movie.poster}
                alt={movie.title}
                fill
                priority
                sizes='(max-width: 1024px) 100vw, 36vw'
                className='object-cover transition-transform duration-[1800ms] ease-out hover:scale-[1.035]'
                fallbackLabel={movie.title}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:to-black/45' />
            </div>

            <div className='relative flex flex-col justify-end p-6 sm:p-10 lg:p-14'>
              <div className='absolute inset-0 bg-white/[0.025]' />
              <div className='relative'>
                <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs tracking-[0.2em] text-[color:var(--text-soft)] backdrop-blur-2xl'>
                  <Sparkles className='h-4 w-4 text-current' />
                  影片档案
                </div>

                <h1 className='max-w-3xl text-4xl font-black leading-none tracking-[-0.05em] text-[color:var(--text)] sm:text-6xl lg:text-7xl'>
                  {movie.title}
                </h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className='mt-3 text-base tracking-wide text-[color:var(--text-soft)] sm:text-lg'>
                    {movie.originalTitle}
                  </p>
                )}

                <div className='mt-7 flex flex-wrap gap-2.5 text-sm text-[color:var(--text-soft)]'>
                  {movie.year && (
                    <span className='glass-chip'>
                      <CalendarDays className='h-4 w-4' />
                      {movie.year}
                    </span>
                  )}
                  {movie.duration && (
                    <span className='glass-chip'>
                      <Clock3 className='h-4 w-4' />
                      {movie.duration}
                    </span>
                  )}
                  {movie.genres.map((genre) => (
                    <span key={genre} className='glass-chip'>
                      {genre}
                    </span>
                  ))}
                  {movie.rate && (
                    <span className='glass-chip border-white/15 text-current'>
                      <Star className='h-4 w-4 fill-current' />
                      {movie.rate}
                    </span>
                  )}
                </div>

                <p className='mt-8 max-w-3xl text-base leading-8 text-[color:var(--text-soft)] sm:text-lg'>
                  {movie.intro ||
                    (detailLoading
                      ? '正在加载影片简介…'
                      : `《${movie.title}》的详细资料暂未加载，仍可直接查找可播放资源。`)}
                </p>

                <div className='mt-9 flex flex-wrap items-center gap-3'>
                  <Link href={playHref} className='glass-primary-button'>
                    <Play className='h-5 w-5 fill-current' />
                    查找播放资源
                  </Link>
                  {id && (
                    <a
                      href={`https://movie.douban.com/subject/${id}/`}
                      target='_blank'
                      rel='noreferrer'
                      className='glass-secondary-button'
                    >
                      豆瓣条目
                      <ArrowUpRight className='h-4 w-4' />
                    </a>
                  )}
                </div>

                <div className='mt-10 grid gap-3 text-sm text-[color:var(--text-soft)] sm:grid-cols-2'>
                  {(movie.pubdate || movie.year) && (
                    <div className='glass-info-row'>
                      <CalendarDays className='h-4 w-4' />
                      上映：{movie.pubdate || movie.year}
                    </div>
                  )}
                  {movie.countries.length > 0 && (
                    <div className='glass-info-row'>
                      <Film className='h-4 w-4' />
                      地区：{movie.countries.join(' / ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {detail?.people && detail.people.length > 0 && (
            <section className='cinema-enter cinema-delay-1 mt-8'>
              <h2 className='mb-5 text-2xl font-bold text-[color:var(--text)]'>
                主创团队
              </h2>
              <div className='glass-panel flex gap-5 overflow-x-auto rounded-[1.75rem] p-5 sm:p-7'>
                {detail.people.map((person) => (
                  <div
                    key={person.id}
                    className='group min-w-[96px] text-center'
                  >
                    <div className='person-avatar relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/15 bg-white/5 shadow-xl transition duration-500 group-hover:-translate-y-1 group-hover:border-white/35 sm:h-24 sm:w-24'>
                      <PosterImage
                        src={person.avatar}
                        alt={person.name}
                        fill
                        sizes='96px'
                        className='object-cover transition duration-700 group-hover:scale-110'
                        fallbackLabel={person.name.trim().slice(0, 1) || '影'}
                      />
                    </div>
                    <p className='mt-3 truncate text-sm font-semibold text-[color:var(--text)]'>
                      {person.name}
                    </p>
                    <p className='mt-1 text-xs text-[color:var(--text-soft)]'>
                      {person.role}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {detail?.photos && detail.photos.length > 0 && (
            <section className='cinema-enter cinema-delay-2 mt-8 pb-20'>
              <h2 className='mb-5 text-2xl font-bold text-[color:var(--text)]'>
                剧照
              </h2>
              <div className='flex gap-4 overflow-x-auto pb-4'>
                {detail.photos.map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className='glass-card relative aspect-video min-w-[78vw] overflow-hidden rounded-[1.5rem] sm:min-w-[440px]'
                  >
                    <PosterImage
                      src={photo}
                      alt={`${movie.title} 剧照 ${index + 1}`}
                      fill
                      sizes='(max-width: 640px) 78vw, 440px'
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
