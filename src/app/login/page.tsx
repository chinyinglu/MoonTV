/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useSite } from '@/components/SiteProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldAskUsername, setShouldAskUsername] = useState(false);
  const [enableRegister, setEnableRegister] = useState(false);
  const { siteName } = useSite();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageType = (window as any).RUNTIME_CONFIG?.STORAGE_TYPE;
    setShouldAskUsername(storageType && storageType !== 'localstorage');
    setEnableRegister(Boolean((window as any).RUNTIME_CONFIG?.ENABLE_REGISTER));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!password || (shouldAskUsername && !username)) return;
    try {
      setLoading(true);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          ...(shouldAskUsername ? { username } : {}),
        }),
      });
      if (response.ok) router.replace(searchParams.get('redirect') || '/');
      else if (response.status === 401) setError('密码错误');
      else {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? '服务器错误');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!password || !username) return;
    try {
      setLoading(true);
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) router.replace(searchParams.get('redirect') || '/');
      else {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? '服务器错误');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'glass-panel block h-13 w-full rounded-2xl px-4 py-3 text-sm focus:outline-none';

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16'>
      <div className='absolute right-5 top-5'>
        <ThemeToggle />
      </div>
      <div className='pointer-events-none absolute left-[12%] top-[16%] hidden text-[clamp(7rem,18vw,18rem)] font-black leading-none tracking-[-0.08em] opacity-[0.025] sm:block'>
        CINEMA
      </div>

      <section className='glass-panel relative z-10 grid w-full max-w-4xl overflow-hidden rounded-[2rem] md:grid-cols-[0.9fr_1.1fr]'>
        <div
          className='hidden min-h-[570px] flex-col justify-between border-r p-10 md:flex'
          style={{
            borderColor: 'var(--line)',
            background: 'var(--inverse)',
            color: 'var(--inverse-text)',
          }}
        >
          <div>
            <div className='flex h-12 w-12 items-center justify-center rounded-full border border-current'>
              <LockKeyhole className='h-5 w-5' />
            </div>
            <p className='mt-8 text-[10px] font-bold uppercase tracking-[0.22em] opacity-55'>
              Private screening room
            </p>
          </div>
          <div>
            <h1 className='text-balance text-5xl font-black leading-[0.92] tracking-[-0.06em]'>
              {siteName}
            </h1>
            <p className='mt-6 max-w-xs text-sm leading-6 opacity-58'>
              登录你的私人片库，继续上次的观看进度。
            </p>
          </div>
          <p className='text-[10px] uppercase tracking-[0.18em] opacity-35'>
            Nordic interface · Secure access
          </p>
        </div>

        <div className='p-7 sm:p-10 md:p-12'>
          <div className='md:hidden'>
            <p className='ui-kicker'>Private screening room</p>
            <h1 className='ui-heading mt-3 text-4xl'>{siteName}</h1>
          </div>
          <div className='mt-8 md:mt-0'>
            <p className='ui-kicker'>Account access</p>
            <h2 className='ui-heading mt-3 text-3xl'>欢迎回来</h2>
            <p className='ui-muted mt-3 text-sm'>输入凭据以进入片库。</p>
          </div>

          <form onSubmit={handleSubmit} className='mt-10 space-y-5'>
            {shouldAskUsername && (
              <div>
                <label
                  htmlFor='username'
                  className='mb-2 block text-xs font-semibold'
                  style={{ color: 'var(--text-soft)' }}
                >
                  用户名
                </label>
                <input
                  id='username'
                  type='text'
                  autoComplete='username'
                  className={fieldClass}
                  placeholder='输入用户名'
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            )}
            <div>
              <label
                htmlFor='password'
                className='mb-2 block text-xs font-semibold'
                style={{ color: 'var(--text-soft)' }}
              >
                访问密码
              </label>
              <input
                id='password'
                type='password'
                autoComplete='current-password'
                className={fieldClass}
                placeholder='输入访问密码'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && (
              <p className='rounded-xl border border-red-500/25 bg-red-500/5 px-3 py-2 text-sm text-red-500'>
                {error}
              </p>
            )}

            <div className='flex gap-3 pt-3'>
              {shouldAskUsername && enableRegister && (
                <button
                  type='button'
                  onClick={handleRegister}
                  disabled={!password || !username || loading}
                  className='glass-secondary-button flex-1 disabled:cursor-not-allowed disabled:opacity-35'
                >
                  {loading ? '注册中…' : '注册'}
                </button>
              )}
              <button
                type='submit'
                disabled={
                  !password || loading || (shouldAskUsername && !username)
                }
                className='glass-primary-button flex-1 disabled:cursor-not-allowed disabled:opacity-35'
              >
                {loading ? '验证中…' : '进入片库'}
                <ArrowRight className='h-4 w-4' />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
