'use client';

import { Clapperboard, Film, Home, Search, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface MobileBottomNavProps {
  activePath?: string;
}

const MobileBottomNav = ({ activePath }: MobileBottomNavProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = activePath || pathname;
  const currentType = searchParams.get('type');
  const items = [
    { icon: Home, label: '首页', href: '/', active: currentPath === '/' },
    {
      icon: Search,
      label: '搜索',
      href: '/search',
      active: currentPath === '/search',
    },
    {
      icon: Film,
      label: '电影',
      href: '/douban?type=movie',
      active: pathname === '/douban' && currentType === 'movie',
    },
    {
      icon: Tv,
      label: '剧集',
      href: '/douban?type=tv',
      active: pathname === '/douban' && currentType === 'tv',
    },
    {
      icon: Clapperboard,
      label: '综艺',
      href: '/douban?type=show',
      active: pathname === '/douban' && currentType === 'show',
    },
  ];

  return (
    <nav
      className='glass-panel fixed bottom-3 left-3 right-3 z-[600] overflow-hidden rounded-[1.45rem] md:hidden'
      style={{ bottom: 'calc(0.65rem + env(safe-area-inset-bottom))' }}
      aria-label='移动导航'
    >
      <ul className='grid grid-cols-5 gap-1 p-1.5'>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className='flex h-12 flex-col items-center justify-center gap-1 rounded-[1rem] transition duration-300'
              style={
                item.active
                  ? {
                      background: 'var(--inverse)',
                      color: 'var(--inverse-text)',
                    }
                  : { color: 'var(--text-faint)' }
              }
            >
              <item.icon className='h-[18px] w-[18px] stroke-[1.7]' />
              <span className='text-[9px] font-semibold'>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
