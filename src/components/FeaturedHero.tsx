'use client';

import { ArrowLeft, ArrowRight, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { buildDetailUrl } from '@/lib/detail-url';
import { DoubanItem } from '@/lib/types';
import { getHighResolutionImageUrl } from '@/lib/utils';

import PosterImage from './PosterImage';

interface FeaturedHeroProps {
  items?: DoubanItem[];
  loading?: boolean;
}

export default function FeaturedHero({
  items = [],
  loading,
}: FeaturedHeroProps) {
  const featuredItems = items.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const synopsisCacheRef = useRef(new Map<string, string>());
  const [synopsis, setSynopsis] = useState('');
  const item = featuredItems[activeIndex];
  const heroPoster = getHighResolutionImageUrl(item?.poster || '');

  const next = useCallback(() => {
    if (featuredItems.length < 2) return;
    setDirection(1);
    setActiveIndex((current) => (current + 1) % featuredItems.length);
  }, [featuredItems.length]);

  const previous = useCallback(() => {
    if (featuredItems.length < 2) return;
    setDirection(-1);
    setActiveIndex(
      (current) => (current - 1 + featuredItems.length) % featuredItems.length
    );
  }, [featuredItems.length]);

  const select = useCallback((index: number) => {
    setActiveIndex((current) => {
      setDirection(index >= current ? 1 : -1);
      return index;
    });
  }, []);

  useEffect(() => {
    if (activeIndex >= featuredItems.length) setActiveIndex(0);
  }, [activeIndex, featuredItems.length]);

  useEffect(() => {
    if (paused || featuredItems.length < 2) return;
    const timer = window.setInterval(next, 7000);
    return () => window.clearInterval(timer);
  }, [featuredItems.length, next, paused]);

  useEffect(() => {
    if (!item?.id) {
      setSynopsis('');
      return;
    }

    const cached = synopsisCacheRef.current.get(item.id);
    if (cached !== undefined) {
      setSynopsis(cached);
      return;
    }

    const controller = new AbortController();
    setSynopsis('');
    fetch(`/api/douban/detail?id=${encodeURIComponent(item.id)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('synopsis unavailable');
        return response.json() as Promise<{ intro?: string }>;
      })
      .then((data) => {
        const intro = data.intro?.trim() || '暂无剧情简介。';
        synopsisCacheRef.current.set(item.id, intro);
        setSynopsis(intro);
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setSynopsis('暂无剧情简介。');
      });

    return () => controller.abort();
  }, [item?.id]);
  if (loading || !featuredItems.length) {
    return (
      <div className='glass-panel relative min-h-[430px] overflow-hidden rounded-[2rem] sm:min-h-[580px]'>
        <div className='skeleton-shimmer absolute inset-0' />
        <div className='absolute bottom-8 left-7 right-7'>
          <p className='ui-kicker'>Preparing today&apos;s selection</p>
          <div
            className='mt-4 h-9 w-3/5 rounded-full'
            style={{ background: 'var(--surface-strong)' }}
          />
          <div
            className='mt-3 h-3 w-2/5 rounded-full'
            style={{ background: 'var(--surface-strong)' }}
          />
        </div>
      </div>
    );
  }

  const playHref = `/play?title=${encodeURIComponent(item.title.trim())}${
    item.year ? `&year=${item.year}` : ''
  }&stype=movie`;
  const detailHref = buildDetailUrl({
    id: item.id,
    title: item.title,
    poster: item.poster,
    year: item.year,
    rate: item.rate,
    type: 'movie',
  });

  return (
    <section
      className='hero-shell cinema-enter group relative min-h-[520px] overflow-hidden rounded-[2rem] bg-black sm:min-h-[650px] lg:min-h-[700px]'
      aria-label='今日精选'
      aria-roledescription='轮播图'
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          next();
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          previous();
        }
      }}
      onTouchStart={(event) => {
        touchStartRef.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartRef.current === null) return;
        const distance =
          (event.changedTouches[0]?.clientX ?? touchStartRef.current) -
          touchStartRef.current;
        touchStartRef.current = null;
        if (Math.abs(distance) > 48) distance < 0 ? next() : previous();
      }}
    >
      <div
        key={item.id}
        className={`hero-image-layer absolute inset-0 ${
          direction > 0 ? 'hero-slide-next' : 'hero-slide-prev'
        }`}
      >
        <PosterImage
          src={heroPoster}
          alt={item.title}
          fill
          priority
          sizes='(max-width: 768px) 100vw, (max-width: 1536px) 92vw, 1480px'
          quality={95}
          className='hero-artwork transition-transform duration-[2200ms] ease-out group-hover:scale-[1.018]'
          fallbackLabel={item.title}
        />
      </div>
      <div className='hero-image-tone pointer-events-none absolute inset-0' />
      <div className='hero-image-vignette pointer-events-none absolute inset-0' />
      <div className='hero-image-floor pointer-events-none absolute inset-0' />
      <div className='hero-grain pointer-events-none absolute inset-0' />

      <div
        key={`copy-${item.id}`}
        className='hero-copy-enter absolute inset-x-0 bottom-0 z-10 p-6 pb-10 sm:p-10 sm:pb-14 lg:max-w-[72%] lg:p-14 lg:pb-16'
      >
        <div className='mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/65'>
          <span className='h-px w-8 bg-white/55' />
          今日精选 · Editor&apos;s choice
        </div>
        <h1 className='text-balance max-w-3xl text-4xl font-black leading-[0.94] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl'>
          {item.title}
        </h1>
        <div className='mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-white/65'>
          {item.year && <span>{item.year}</span>}
          <span className='h-1 w-1 rounded-full bg-white/35' />
          <span>剧情 · 热门</span>
          {item.rate && (
            <>
              <span className='h-1 w-1 rounded-full bg-white/35' />
              <span className='rounded-full border border-white/25 px-2.5 py-1 text-xs text-white'>
                {item.rate}
              </span>
            </>
          )}
        </div>
        <p className='hero-synopsis mt-5 max-w-2xl text-sm leading-6 text-white/70 sm:text-base'>
          {synopsis || '正在载入剧情简介…'}
        </p>
        <div className='mt-7 flex flex-wrap items-center gap-3'>
          <Link href={playHref} className='glass-primary-button'>
            <Play className='h-4 w-4 fill-current' />
            立即观看
          </Link>
          <Link href={detailHref} className='glass-secondary-button'>
            影片档案
            <ChevronRight className='h-4 w-4' />
          </Link>
        </div>
      </div>

      {featuredItems.length > 1 && (
        <>
          <div className='absolute right-5 top-5 z-30 hidden items-center gap-2 sm:flex'>
            <button
              type='button'
              onClick={previous}
              className='flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black'
              aria-label='上一部精选影片'
            >
              <ArrowLeft className='h-4 w-4' />
            </button>
            <button
              type='button'
              onClick={next}
              className='flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black'
              aria-label='下一部精选影片'
            >
              <ArrowRight className='h-4 w-4' />
            </button>
          </div>

          <div className='absolute bottom-7 right-6 z-30 flex items-center gap-2 sm:bottom-10 sm:right-10'>
            <span className='mr-2 text-[10px] font-bold tabular-nums tracking-[0.16em] text-white/55'>
              0{activeIndex + 1} / 0{featuredItems.length}
            </span>
            {featuredItems.map((featured, index) => (
              <button
                key={featured.id}
                type='button'
                onClick={() => select(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === activeIndex
                    ? 'w-7 bg-white'
                    : 'w-1.5 bg-white/35 hover:bg-white/70'
                }`}
                aria-label={`切换到 ${featured.title}`}
                aria-current={index === activeIndex}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
