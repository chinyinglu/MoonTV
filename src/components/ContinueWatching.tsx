/* eslint-disable no-console */
'use client';

import { Play, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { PlayRecord } from '@/lib/db.client';
import {
  clearAllPlayRecords,
  deletePlayRecord,
  getAllPlayRecords,
  subscribeToDataUpdates,
} from '@/lib/db.client';

import PosterImage from '@/components/PosterImage';
import ScrollableRow from '@/components/ScrollableRow';

interface ContinueWatchingProps {
  className?: string;
}

type RecordItem = PlayRecord & { key: string };

export default function ContinueWatching({ className }: ContinueWatchingProps) {
  const router = useRouter();
  const [playRecords, setPlayRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const updatePlayRecords = (allRecords: Record<string, PlayRecord>) => {
    setPlayRecords(
      Object.entries(allRecords)
        .map(([key, record]) => ({ ...record, key }))
        .sort((a, b) => b.save_time - a.save_time)
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        updatePlayRecords(await getAllPlayRecords());
      } catch (error) {
        console.error('获取播放记录失败:', error);
        setPlayRecords([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    return subscribeToDataUpdates(
      'playRecordsUpdated',
      (records: Record<string, PlayRecord>) => updatePlayRecords(records)
    );
  }, []);

  if (!loading && playRecords.length === 0) return null;

  const parseKey = (key: string) => {
    const [source, id] = key.split('+');
    return { source, id };
  };

  const openRecord = (record: RecordItem) => {
    const { source, id } = parseKey(record.key);
    const params = new URLSearchParams({ source, id, title: record.title });
    if (record.year) params.set('year', record.year);
    if (record.search_title) params.set('stitle', record.search_title);
    if (record.total_episodes > 1) params.set('stype', 'tv');
    router.push(`/play?${params.toString()}`);
  };

  return (
    <section className={`cinema-enter mb-10 ${className || ''}`}>
      <div className='mb-5 flex items-end justify-between'>
        <div>
          <p className='ui-kicker'>Resume playback</p>
          <h2 className='ui-heading mt-1 text-2xl sm:text-3xl'>继续观看</h2>
        </div>
        {!loading && playRecords.length > 0 && (
          <button
            className='text-xs font-semibold transition-opacity hover:opacity-50'
            style={{ color: 'var(--text-soft)' }}
            onClick={async () => {
              await clearAllPlayRecords();
              setPlayRecords([]);
            }}
          >
            清空记录
          </button>
        )}
      </div>

      <ScrollableRow scrollDistance={560}>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className='skeleton-shimmer aspect-[16/9] min-w-[82vw] snap-start rounded-[1.6rem] sm:min-w-[440px] lg:min-w-[520px]'
              />
            ))
          : playRecords.map((record) => {
              const { source, id } = parseKey(record.key);
              const progress =
                record.total_time > 0
                  ? Math.min(100, (record.play_time / record.total_time) * 100)
                  : 0;
              return (
                <article
                  key={record.key}
                  className='continue-card group relative aspect-[16/9] min-w-[82vw] snap-start overflow-hidden rounded-[1.6rem] border sm:min-w-[440px] lg:min-w-[520px]'
                  style={{ borderColor: 'var(--line)' }}
                >
                  <button
                    type='button'
                    className='absolute inset-0 z-10 text-left'
                    onClick={() => openRecord(record)}
                    aria-label={`继续观看 ${record.title}`}
                  />
                  <PosterImage
                    src={record.cover}
                    alt={record.title}
                    fill
                    sizes='(max-width: 640px) 82vw, 520px'
                    className='object-cover transition duration-[1000ms] ease-out group-hover:scale-[1.025]'
                    fallbackLabel={record.title}
                  />
                  <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.9)_100%)]' />
                  <div className='pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_0_1px,transparent_1.2px)] [background-size:38px_38px]' />

                  <div className='absolute left-4 top-4 z-20 flex items-center gap-2'>
                    {record.total_episodes > 1 && (
                      <span className='rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-xl'>
                        第 {record.index} / {record.total_episodes} 集
                      </span>
                    )}
                    <span className='rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-semibold text-white/75 backdrop-blur-xl'>
                      {record.source_name}
                    </span>
                  </div>

                  <button
                    type='button'
                    onClick={async (event) => {
                      event.stopPropagation();
                      await deletePlayRecord(source, id);
                      setPlayRecords((items) =>
                        items.filter((item) => item.key !== record.key)
                      );
                    }}
                    className='ui-icon-button absolute right-4 top-4 z-30 h-9 w-9 border-white/20 bg-black/30 text-white opacity-0 transition group-hover:opacity-100'
                    aria-label={`删除 ${record.title} 的观看记录`}
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>

                  <div className='absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-6'>
                    <div className='flex items-end justify-between gap-4'>
                      <div className='min-w-0'>
                        <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-white/45'>
                          {record.year || '继续播放'} · 已观看{' '}
                          {Math.round(progress)}%
                        </p>
                        <h3 className='mt-2 truncate text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl'>
                          {record.title}
                        </h3>
                      </div>
                      <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-xl transition duration-500 group-hover:scale-110'>
                        <Play className='ml-0.5 h-4 w-4 fill-current' />
                      </span>
                    </div>
                    <div className='mt-5 h-1 overflow-hidden rounded-full bg-white/20'>
                      <div
                        className='h-full rounded-full bg-white transition-[width] duration-700'
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
      </ScrollableRow>
    </section>
  );
}
