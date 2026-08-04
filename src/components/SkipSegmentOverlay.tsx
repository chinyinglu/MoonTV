'use client';

import { SkipForward } from 'lucide-react';

export type SkipSegmentKind = 'intro' | 'outro';

interface SkipSegmentOverlayProps {
  kind: SkipSegmentKind | null;
  seconds?: number;
  canNextEpisode: boolean;
  onSkip: () => void;
}

export default function SkipSegmentOverlay({
  kind,
  seconds,
  canNextEpisode,
  onSkip,
}: SkipSegmentOverlayProps) {
  if (!kind) return null;

  const isIntro = kind === 'intro';
  const title = isIntro ? '片头' : '片尾';

  return (
    <div className='pointer-events-none absolute inset-x-3 bottom-16 z-[520] flex justify-end sm:inset-x-6 sm:bottom-20'>
      <div className='pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-black/75 p-2 text-white shadow-2xl backdrop-blur-2xl'>
        <div className='hidden px-2 sm:block'>
          <p className='text-xs font-semibold'>检测到{title}</p>
          <p className='mt-0.5 text-[10px] text-white/55'>
            {seconds ? `约 ${Math.ceil(seconds)} 秒` : '可跳过'}
          </p>
        </div>
        <button
          type='button'
          onClick={onSkip}
          className='inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/90'
        >
          <SkipForward className='h-4 w-4 fill-current' />
          {isIntro
            ? '跳过片头'
            : canNextEpisode
            ? '跳过片尾 · 下一集'
            : '跳过片尾'}
        </button>
      </div>
    </div>
  );
}
