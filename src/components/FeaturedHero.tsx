'use client';

import { ArrowLeft, ArrowRight, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { buildDetailUrl } from '@/lib/detail-url';
import { DoubanItem } from '@/lib/types';
import { getHighResolutionImageUrl } from '@/lib/utils';

import PosterImage from './PosterImage';

interface FeaturedHeroProps {
  items?: DoubanItem[];
  loading?: boolean;
}

interface PosterPalette {
  body?: string;
  header?: string;
  primaryLight?: string;
  primaryDark?: string;
  secondary?: string;
  isDark?: boolean;
}

interface HeroMetadata {
  intro: string;
  palette?: PosterPalette;
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
  const metadataCacheRef = useRef(new Map<string, HeroMetadata>());
  const [synopsis, setSynopsis] = useState('');
  const [palette, setPalette] = useState<PosterPalette | undefined>();
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
      setPalette(undefined);
      return;
    }

    const cached = metadataCacheRef.current.get(item.id);
    if (cached !== undefined) {
      setSynopsis(cached.intro);
      setPalette(cached.palette);
      return;
    }

    const controller = new AbortController();
    setSynopsis('');
    setPalette(undefined);
    fetch(`/api/douban/detail?id=${encodeURIComponent(item.id)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('synopsis unavailable');
        return response.json() as Promise<{
          intro?: string;
          palette?: PosterPalette;
        }>;
      })
      .then((data) => {
        const intro = data.intro?.trim() || '暂无剧情简介。';
        metadataCacheRef.current.set(item.id, {
          intro,
          palette: data.palette,
        });
        setSynopsis(intro);
        setPalette(data.palette);
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          setSynopsis('暂无剧情简介。');
          setPalette(undefined);
        }
      });

    return () => controller.abort();
  }, [item?.id]);
  if (loading || !featuredItems.length) {
    return (
      <div className='relative min-h-[430px] overflow-hidden sm:min-h-[580px]'>
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
  const paletteStyle = {
    '--hero-poster-deep': palette?.primaryDark || '#080a09',
    '--hero-poster-mid': palette?.header || '#303634',
    '--hero-poster-light': palette?.primaryLight || '#919b98',
    '--hero-poster-soft': palette?.secondary || '#eef2f1',
  } as CSSProperties;

  return (
    <section
      className='hero-shell cinema-enter group relative min-h-[calc(100svh-2rem)] overflow-hidden bg-black sm:min-h-[max(900px,108svh)]'
      style={paletteStyle}
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
        key={`ambient-${item.id}`}
        className='hero-ambient-layer absolute inset-0'
      >
        <PosterImage
          src={heroPoster}
          alt=''
          fill
          priority
          sizes='100vw'
          quality={80}
          className='hero-ambient-artwork'
          fallbackLabel=''
        />
      </div>
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
          className='hero-artwork transition-transform duration-[2200ms] ease-out group-hover:scale-[1.12]'
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
          <div className='pointer-events-none absolute inset-0 z-30 hidden sm:block'>
            <button
              type='button'
              onClick={previous}
              className='hero-nav-button hero-nav-prev pointer-events-auto'
              aria-label='上一部精选影片'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
            <button
              type='button'
              onClick={next}
              className='hero-nav-button hero-nav-next pointer-events-auto'
              aria-label='下一部精选影片'
            >
              <ArrowRight className='h-5 w-5' />
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
