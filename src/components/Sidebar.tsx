'use client';

import { Clapperboard, Film, Home, Menu, Search, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import { useSite } from './SiteProvider';

interface SidebarContextType {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
});
export const useSidebar = () => useContext(SidebarContext);

declare global {
  interface Window {
    __sidebarCollapsed?: boolean;
  }
}

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  activePath?: string;
}

const Sidebar = ({ onToggle }: SidebarProps) => {
  const { siteName } = useSite();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    typeof window.__sidebarCollapsed === 'boolean'
      ? window.__sidebarCollapsed
      : false
  );

  useLayoutEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      const value = JSON.parse(saved) as boolean;
      setIsCollapsed(value);
      window.__sidebarCollapsed = value;
    }
  }, []);

  useLayoutEffect(() => {
    if (isCollapsed) document.documentElement.dataset.sidebarCollapsed = 'true';
    else delete document.documentElement.dataset.sidebarCollapsed;
  }, [isCollapsed]);

  const handleToggle = useCallback(() => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
    window.__sidebarCollapsed = next;
    onToggle?.(next);
  }, [isCollapsed, onToggle]);

  const currentType = searchParams.get('type');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navItems = useMemo(
    () => [
      {
        icon: Home,
        label: '首页',
        hint: 'Home',
        href: '/',
        active: pathname === '/',
      },
      {
        icon: Search,
        label: '搜索',
        hint: 'Search',
        href: '/search',
        active: pathname === '/search',
      },
      {
        icon: Film,
        label: '电影',
        hint: 'Films',
        href: '/douban?type=movie',
        active: pathname === '/douban' && currentType === 'movie',
      },
      {
        icon: Tv,
        label: '剧集',
        hint: 'Series',
        href: '/douban?type=tv',
        active: pathname === '/douban' && currentType === 'tv',
      },
      {
        icon: Clapperboard,
        label: '综艺',
        hint: 'Shows',
        href: '/douban?type=show',
        active: pathname === '/douban' && currentType === 'show',
      },
    ],
    [currentType, pathname]
  );

  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => item.active)
  );
  const highlightedIndex = hoveredIndex ?? activeIndex;

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className='hidden md:flex'>
        <aside
          data-sidebar
          className={`fixed bottom-0 left-0 top-0 z-30 flex flex-col border-r transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isCollapsed ? 'w-[76px]' : 'w-[230px]'
          }`}
          style={{
            borderColor: 'var(--line)',
            background: 'var(--surface)',
            backdropFilter: 'blur(28px) saturate(110%)',
          }}
        >
          <div className='flex h-24 items-center px-4'>
            <Link href='/' className='group flex min-w-0 items-center gap-3'>
              <span
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-black'
                style={{
                  borderColor: 'var(--line-strong)',
                  background: 'var(--inverse)',
                  color: 'var(--inverse-text)',
                }}
              >
                {siteName.trim().slice(0, 1).toUpperCase()}
              </span>
              {!isCollapsed && (
                <span className='min-w-0'>
                  <span
                    className='block truncate text-[15px] font-bold tracking-[-0.03em]'
                    style={{ color: 'var(--text)' }}
                  >
                    {siteName}
                  </span>
                  <span
                    className='mt-0.5 block text-[9px] font-bold uppercase tracking-[0.22em]'
                    style={{ color: 'var(--text-faint)' }}
                  >
                    Private cinema
                  </span>
                </span>
              )}
            </Link>
          </div>

          <nav
            className='relative flex-1 space-y-1.5 px-3 pt-3'
            aria-label='主导航'
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span
              className='nav-liquid-highlight absolute left-3 right-3 top-3 h-12'
              style={{
                transform: `translate3d(0, ${highlightedIndex * 54}px, 0)`,
              }}
              aria-hidden='true'
            />
            {navItems.map((item, index) => {
              const highlighted = index === highlightedIndex;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? 'page' : undefined}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  className={`group relative z-10 flex h-12 items-center rounded-2xl transition-[color,transform] duration-300 ${
                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                  } ${highlighted ? 'nav-item-highlighted' : ''}`}
                  style={{
                    color: highlighted
                      ? 'var(--inverse-text)'
                      : 'var(--text-soft)',
                  }}
                >
                  <item.icon className='h-[18px] w-[18px] shrink-0 stroke-[1.7] transition-transform duration-500 group-hover:scale-110' />
                  {!isCollapsed && (
                    <span className='flex min-w-0 flex-1 items-baseline justify-between gap-2'>
                      <span className='text-sm font-semibold'>
                        {item.label}
                      </span>
                      <span className='text-[9px] uppercase tracking-[0.14em] opacity-45'>
                        {item.hint}
                      </span>
                    </span>
                  )}
                  {!isCollapsed && item.active && (
                    <span className='h-1.5 w-1.5 rounded-full bg-current' />
                  )}
                  {isCollapsed && <span className='sr-only'>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className='p-3'>
            {!isCollapsed && (
              <div
                className='mb-3 rounded-2xl border p-4'
                style={{
                  borderColor: 'var(--line)',
                  background: 'var(--surface-subtle)',
                }}
              >
                <p className='ui-kicker'>Library status</p>
                <p
                  className='mt-2 text-xs leading-5'
                  style={{ color: 'var(--text-soft)' }}
                >
                  封面、播放与影片档案保持实时同步。
                </p>
              </div>
            )}
            <button
              type='button'
              onClick={handleToggle}
              className={`flex h-11 w-full items-center rounded-2xl transition duration-300 hover:-translate-y-0.5 ${
                isCollapsed ? 'justify-center' : 'gap-3 px-3.5'
              }`}
              style={{
                color: 'var(--text-soft)',
                background: 'var(--surface-subtle)',
              }}
              aria-label={isCollapsed ? '展开侧栏' : '收起侧栏'}
            >
              <Menu className='h-[18px] w-[18px] stroke-[1.7]' />
              {!isCollapsed && (
                <span className='text-xs font-semibold'>收起导航</span>
              )}
            </button>
          </div>
        </aside>
        <div
          className={`shrink-0 transition-[width] duration-500 ${
            isCollapsed ? 'w-[76px]' : 'w-[230px]'
          }`}
        />
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
