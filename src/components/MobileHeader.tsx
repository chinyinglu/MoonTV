'use client';

import Link from 'next/link';

import { BackButton } from './BackButton';
import { LogoutButton } from './LogoutButton';
import { SettingsButton } from './SettingsButton';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';

interface MobileHeaderProps {
  showBackButton?: boolean;
}

const MobileHeader = ({ showBackButton = false }: MobileHeaderProps) => {
  const { siteName } = useSite();
  return (
    <header className='glass-panel sticky top-0 z-[550] w-full rounded-none border-x-0 border-t-0 md:hidden'>
      <div className='flex h-14 items-center justify-between px-3'>
        <div className='flex items-center gap-1'>
          {showBackButton ? <BackButton /> : <SettingsButton />}
        </div>
        <Link
          href='/'
          className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2'
        >
          <span
            className='flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black'
            style={{
              background: 'var(--inverse)',
              color: 'var(--inverse-text)',
            }}
          >
            {siteName.trim().slice(0, 1).toUpperCase()}
          </span>
          <span
            className='max-w-[150px] truncate text-sm font-bold tracking-[-0.03em]'
            style={{ color: 'var(--text)' }}
          >
            {siteName}
          </span>
        </Link>
        <div className='flex items-center gap-1'>
          <LogoutButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
