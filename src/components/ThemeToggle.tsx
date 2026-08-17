/* eslint-disable @typescript-eslint/no-explicit-any,react-hooks/exhaustive-deps */

'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const setThemeColor = (theme?: string) => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme === 'dark' ? '#08090a' : '#f2f2ee';
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', theme === 'dark' ? '#08090a' : '#f2f2ee');
    }
  };

  useEffect(() => {
    setMounted(true);
    setThemeColor(resolvedTheme);
  }, []);

  if (!mounted) {
    // 渲染一个占位符以避免布局偏移
    return <div className='w-10 h-10' />;
  }

  const toggleTheme = () => {
    // 检查浏览器是否支持 View Transitions API
    const targetTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeColor(targetTheme);
    if (!(document as any).startViewTransition) {
      setTheme(targetTheme);
      return;
    }

    (document as any).startViewTransition(() => {
      setTheme(targetTheme);
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className='theme-toggle'
      aria-label='Toggle theme'
      title={resolvedTheme === 'dark' ? '切换到白天模式' : '切换到夜间模式'}
    >
      <span className='theme-toggle-orbit' aria-hidden='true'>
        <SunMedium
          className={`theme-toggle-glyph ${
            resolvedTheme === 'dark' ? 'is-visible' : 'is-hidden'
          }`}
        />
        <MoonStar
          className={`theme-toggle-glyph ${
            resolvedTheme === 'dark' ? 'is-hidden' : 'is-visible'
          }`}
        />
      </span>
    </button>
  );
}
