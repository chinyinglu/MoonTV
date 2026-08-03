'use client';

import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

import { buildImageProxyUrl, getImageCandidates } from '@/lib/utils';

type PosterImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src?: string;
  fallbackLabel?: string;
  onLoadSuccess?: () => void;
};

export default function PosterImage({
  src = '',
  alt,
  fallbackLabel = '暂无封面',
  onLoadSuccess,
  ...props
}: PosterImageProps) {
  const [candidates, setCandidates] = useState<string[]>(() => {
    const normalizedUrl = src.trim().replace(/^http:\/\//i, 'https://');
    return normalizedUrl
      ? [buildImageProxyUrl(normalizedUrl), normalizedUrl]
      : [];
  });
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidates(getImageCandidates(src));
    setCandidateIndex(0);
  }, [src]);

  if (!candidates[candidateIndex]) {
    return (
      <div
        className='absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(129,140,248,0.22),transparent_36%),linear-gradient(145deg,#111827,#05070c)] px-4 text-center text-xs font-medium tracking-[0.18em] text-white/45'
        role='img'
        aria-label={alt}
      >
        {fallbackLabel}
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={candidates[candidateIndex]}
      alt={alt}
      referrerPolicy='no-referrer'
      onLoad={onLoadSuccess}
      onError={() => setCandidateIndex((index) => index + 1)}
    />
  );
}
