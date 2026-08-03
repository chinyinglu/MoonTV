'use client';

import {
  CalendarDays,
  Clapperboard,
  Film,
  Heart,
  Sparkles,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { SearchResult } from '@/lib/types';

import PosterImage from './PosterImage';

interface ArchivePerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ArchiveData {
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
  people: ArchivePerson[];
  photos: string[];
}

interface MovieArchiveProps {
  detail: SearchResult | null;
  title: string;
  year: string;
  poster: string;
  favorited: boolean;
  onToggleFavorite: () => void;
  currentEpisode: number;
}

export default function MovieArchive({
  detail,
  title,
  year,
  poster,
  favorited,
  onToggleFavorite,
  currentEpisode,
}: MovieArchiveProps) {
  const [archive, setArchive] = useState<ArchiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const doubanId = detail?.douban_id;

  useEffect(() => {
    if (!doubanId) {
      setArchive(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/douban/detail?id=${encodeURIComponent(String(doubanId))}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('archive unavailable');
        return response.json() as Promise<ArchiveData>;
      })
      .then(setArchive)
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setArchive(null);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [doubanId]);

  const movie = useMemo(
    () => ({
      title: archive?.title || title || detail?.title || '影片档案',
      originalTitle: archive?.originalTitle || '',
      poster: archive?.poster || poster || detail?.poster || '',
      year: archive?.year || year || detail?.year || '',
      intro: archive?.intro || detail?.desc || '',
      genres: archive?.genres?.length
        ? archive.genres
        : ([detail?.class, detail?.type_name].filter(Boolean) as string[]),
      countries: archive?.countries || [],
      pubdate: archive?.pubdate || '',
      duration: archive?.duration || '',
      rate: archive?.rate || '',
    }),
    [archive, detail, poster, title, year]
  );

  return (
    <section className='glass-panel play-archive cinema-enter cinema-delay-1 overflow-hidden rounded-[2rem]'>
      <div className='grid md:grid-cols-[230px_minmax(0,1fr)] lg:grid-cols-[270px_minmax(0,1fr)]'>
        <div className='relative hidden min-h-[390px] overflow-hidden md:block'>
          <PosterImage
            src={movie.poster}
            alt={movie.title}
            fill
            sizes='270px'
            className='object-cover transition duration-[1400ms] hover:scale-[1.035]'
            fallbackLabel={movie.title}
          />
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/35' />
        </div>

        <div className='relative p-6 sm:p-8 lg:p-10'>
          <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_0%,rgba(129,140,248,0.14),transparent_25rem)]' />
          <div className='relative'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-white/55'>
                  <Sparkles className='h-3.5 w-3.5 text-current' />
                  播放中 · 影片档案
                </div>
                <h2 className='text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl'>
                  {movie.title}
                </h2>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className='mt-2 text-sm tracking-wide text-white/38'>
                    {movie.originalTitle}
                  </p>
                )}
              </div>
              <button
                type='button'
                onClick={onToggleFavorite}
                className={`group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${
                  favorited
                    ? 'border-white/20 bg-white/10 text-current'
                    : 'border-white/12 bg-white/[0.06] text-white/55 hover:bg-white/12 hover:text-white'
                }`}
                aria-label={favorited ? '取消收藏' : '收藏影片'}
              >
                <Heart
                  className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`}
                />
              </button>
            </div>

            <div className='mt-5 flex flex-wrap gap-2 text-xs text-white/65 sm:text-sm'>
              {movie.year && (
                <span className='glass-chip'>
                  <CalendarDays className='h-3.5 w-3.5' />
                  {movie.year}
                </span>
              )}
              {movie.duration && (
                <span className='glass-chip'>
                  <Clapperboard className='h-3.5 w-3.5' />
                  {movie.duration}
                </span>
              )}
              {movie.genres.slice(0, 4).map((genre) => (
                <span key={genre} className='glass-chip'>
                  {genre}
                </span>
              ))}
              {movie.rate && (
                <span className='glass-chip border-white/15 text-current'>
                  <Star className='h-3.5 w-3.5 fill-current' />
                  {movie.rate}
                </span>
              )}
            </div>

            <p className='mt-6 max-w-4xl whitespace-pre-line text-sm leading-7 text-white/68 sm:text-base sm:leading-8'>
              {movie.intro ||
                (loading
                  ? '正在同步影片档案…'
                  : '当前播放源暂未提供影片简介。')}
            </p>

            <div className='mt-6 grid gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-xs text-white/45 sm:grid-cols-2 sm:text-sm'>
              {(movie.pubdate || movie.year) && (
                <div className='flex items-center gap-2'>
                  <CalendarDays className='h-4 w-4' />
                  上映：{movie.pubdate || movie.year}
                </div>
              )}
              {movie.countries.length > 0 && (
                <div className='flex items-center gap-2'>
                  <Film className='h-4 w-4' />
                  地区：{movie.countries.join(' / ')}
                </div>
              )}
              {detail?.source_name && (
                <div className='flex items-center gap-2'>
                  <Clapperboard className='h-4 w-4' />
                  片源：{detail.source_name}
                </div>
              )}
              {detail?.episodes && detail.episodes.length > 1 && (
                <div className='flex items-center gap-2'>
                  <Sparkles className='h-4 w-4' />共 {detail.episodes.length} 集
                  · 当前第 {currentEpisode} 集
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(loading || (archive?.people && archive.people.length > 0)) && (
        <div className='border-t border-white/10 px-6 py-6 sm:px-8 lg:px-10'>
          <div className='mb-5 flex items-end justify-between gap-4'>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-[0.24em] text-white/30'>
                Cast & Crew
              </p>
              <h3 className='mt-1 text-xl font-bold text-white'>主创团队</h3>
            </div>
            <span className='text-xs text-white/30'>左右滑动查看更多</span>
          </div>
          <div className='archive-people flex snap-x gap-4 overflow-x-auto pb-2'>
            {loading && !archive
              ? Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className='min-w-[96px] animate-pulse text-center'
                  >
                    <div className='mx-auto h-20 w-20 rounded-full bg-white/[0.07]' />
                    <div className='mx-auto mt-3 h-3 w-14 rounded bg-white/[0.06]' />
                  </div>
                ))
              : archive?.people.map((person, index) => {
                  const initial = person.name.trim().slice(0, 1) || '影';
                  return (
                    <div
                      key={`${person.id}-${index}`}
                      className='group min-w-[96px] snap-start text-center'
                    >
                      <div className='archive-avatar relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/12 bg-white/[0.04] shadow-xl transition duration-500 group-hover:-translate-y-1.5 group-hover:border-white/35 sm:h-24 sm:w-24'>
                        <PosterImage
                          src={person.avatar}
                          alt={person.name}
                          fill
                          sizes='96px'
                          className='object-cover transition duration-700 group-hover:scale-110'
                          fallbackLabel={initial}
                        />
                      </div>
                      <p className='mt-3 truncate text-sm font-semibold text-white/88'>
                        {person.name}
                      </p>
                      <p className='mt-1 text-xs text-white/35'>
                        {person.role}
                      </p>
                    </div>
                  );
                })}
          </div>
        </div>
      )}

      {archive?.photos && archive.photos.length > 0 && (
        <div className='border-t border-white/10 px-6 py-6 sm:px-8 lg:px-10'>
          <h3 className='mb-4 text-xl font-bold text-white'>精选剧照</h3>
          <div className='flex snap-x gap-4 overflow-x-auto pb-2'>
            {archive.photos.map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                className='relative aspect-video min-w-[72vw] snap-start overflow-hidden rounded-[1.25rem] border border-white/10 sm:min-w-[380px]'
              >
                <PosterImage
                  src={photo}
                  alt={`${movie.title} 剧照 ${index + 1}`}
                  fill
                  sizes='380px'
                  className='object-cover transition duration-700 hover:scale-105'
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
