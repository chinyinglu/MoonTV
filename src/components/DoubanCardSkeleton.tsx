import { ImagePlaceholder } from '@/components/ImagePlaceholder';

const DoubanCardSkeleton = () => (
  <div className='glass-card w-full rounded-[1.25rem] p-2'>
    <ImagePlaceholder aspectRatio='aspect-[2/3]' />
    <div
      className='mx-auto mb-1 mt-3 h-3 w-2/3 rounded-full'
      style={{ background: 'var(--surface-subtle)' }}
    />
  </div>
);

export default DoubanCardSkeleton;
