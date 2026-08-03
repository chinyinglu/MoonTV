'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ScrollableRowProps {
  children: React.ReactNode;
  scrollDistance?: number;
}

export default function ScrollableRow({
  children,
  scrollDistance = 760,
}: ScrollableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    setCanLeft(element.scrollLeft > 2);
    setCanRight(
      element.scrollWidth - element.scrollLeft - element.clientWidth > 2
    );
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    update();
    const resizeObserver = new ResizeObserver(update);
    const mutationObserver = new MutationObserver(update);
    resizeObserver.observe(element);
    mutationObserver.observe(element, { childList: true, subtree: true });
    window.addEventListener('resize', update);
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [children, update]);

  const scroll = (direction: 1 | -1) => {
    containerRef.current?.scrollBy({
      left: scrollDistance * direction,
      behavior: 'smooth',
    });
  };

  return (
    <div className='group/row relative'>
      <div
        ref={containerRef}
        className='scrollbar-hide flex snap-x gap-4 overflow-x-auto px-1 pb-8 pt-2 sm:gap-5 sm:px-2 sm:pb-10'
        onScroll={update}
      >
        {children}
      </div>
      {canLeft && (
        <button
          type='button'
          onClick={() => scroll(-1)}
          className='ui-icon-button absolute left-2 top-[40%] z-20 hidden -translate-y-1/2 opacity-0 shadow-xl transition-opacity group-hover/row:opacity-100 sm:flex'
          aria-label='向左滚动'
        >
          <ArrowLeft className='h-4 w-4' />
        </button>
      )}
      {canRight && (
        <button
          type='button'
          onClick={() => scroll(1)}
          className='ui-icon-button absolute right-2 top-[40%] z-20 hidden -translate-y-1/2 opacity-0 shadow-xl transition-opacity group-hover/row:opacity-100 sm:flex'
          aria-label='向右滚动'
        >
          <ArrowRight className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
