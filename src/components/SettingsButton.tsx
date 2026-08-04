/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Check, Clock3, Settings, SkipForward, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { SkipSegmentKind } from './SkipSegmentOverlay';

export interface SkipSegmentSettingsControls {
  enabled: boolean;
  autoIntro: boolean;
  autoOutro: boolean;
  introEnd?: number;
  outroStart?: number;
  episodeLabel?: string;
  getCurrentTime: () => number;
  onEnabledChange: (enabled: boolean) => void;
  onAutoChange: (kind: SkipSegmentKind, enabled: boolean) => void;
  onSetMarker: (kind: SkipSegmentKind) => void;
  onClearMarker: (kind: SkipSegmentKind) => void;
}

interface SettingsButtonProps {
  skipSegmentControls?: SkipSegmentSettingsControls;
}

const formatPlaybackTime = (seconds?: number) => {
  const value = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = value % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
        2,
        '0'
      )}:${String(secs).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  skipSegmentControls,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultAggregateSearch, setDefaultAggregateSearch] = useState(true);
  const [doubanProxyUrl, setDoubanProxyUrl] = useState('');
  const [imageProxyUrl, setImageProxyUrl] = useState('');
  const [enableOptimization, setEnableOptimization] = useState(true);
  const [enableImageProxy, setEnableImageProxy] = useState(false);
  const [skipSegmentsEnabled, setSkipSegmentsEnabled] = useState(true);
  const [skipAutoIntro, setSkipAutoIntro] = useState(true);
  const [skipAutoOutro, setSkipAutoOutro] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [skipNotice, setSkipNotice] = useState('');
  const [mounted, setMounted] = useState(false);

  const effectiveSkipEnabled =
    skipSegmentControls?.enabled ?? skipSegmentsEnabled;
  const effectiveAutoIntro = skipSegmentControls?.autoIntro ?? skipAutoIntro;
  const effectiveAutoOutro = skipSegmentControls?.autoOutro ?? skipAutoOutro;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedAggregateSearch = localStorage.getItem('defaultAggregateSearch');
    if (savedAggregateSearch !== null) {
      setDefaultAggregateSearch(JSON.parse(savedAggregateSearch));
    }

    const savedDoubanProxyUrl = localStorage.getItem('doubanProxyUrl');
    if (savedDoubanProxyUrl !== null) {
      setDoubanProxyUrl(savedDoubanProxyUrl);
    }

    const savedEnableImageProxy = localStorage.getItem('enableImageProxy');
    const defaultImageProxy = (window as any).RUNTIME_CONFIG?.IMAGE_PROXY || '';
    if (savedEnableImageProxy !== null) {
      setEnableImageProxy(JSON.parse(savedEnableImageProxy));
    } else if (defaultImageProxy) {
      setEnableImageProxy(true);
    }

    const savedImageProxyUrl = localStorage.getItem('imageProxyUrl');
    if (savedImageProxyUrl !== null) {
      setImageProxyUrl(savedImageProxyUrl);
    } else if (defaultImageProxy) {
      setImageProxyUrl(defaultImageProxy);
    }

    const savedEnableOptimization = localStorage.getItem('enableOptimization');
    if (savedEnableOptimization !== null) {
      setEnableOptimization(JSON.parse(savedEnableOptimization));
    }

    const savedSkipSegmentsEnabled = localStorage.getItem(
      'skip_segments_enabled'
    );
    const savedSkipAutoIntro = localStorage.getItem('skip_auto_intro');
    const savedSkipAutoOutro = localStorage.getItem('skip_auto_outro');
    if (savedSkipSegmentsEnabled !== null) {
      setSkipSegmentsEnabled(savedSkipSegmentsEnabled === 'true');
    }
    if (savedSkipAutoIntro !== null) {
      setSkipAutoIntro(savedSkipAutoIntro === 'true');
    }
    if (savedSkipAutoOutro !== null) {
      setSkipAutoOutro(savedSkipAutoOutro === 'true');
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !skipSegmentControls) return;

    const updateCurrentTime = () => {
      setCurrentPlaybackTime(skipSegmentControls.getCurrentTime());
    };
    updateCurrentTime();
    const timer = window.setInterval(updateCurrentTime, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, skipSegmentControls]);

  const handleAggregateToggle = (value: boolean) => {
    setDefaultAggregateSearch(value);
    localStorage.setItem('defaultAggregateSearch', JSON.stringify(value));
  };

  const handleDoubanProxyUrlChange = (value: string) => {
    setDoubanProxyUrl(value);
    localStorage.setItem('doubanProxyUrl', value);
  };

  const handleImageProxyUrlChange = (value: string) => {
    setImageProxyUrl(value);
    localStorage.setItem('imageProxyUrl', value);
  };

  const handleOptimizationToggle = (value: boolean) => {
    setEnableOptimization(value);
    localStorage.setItem('enableOptimization', JSON.stringify(value));
  };

  const handleImageProxyToggle = (value: boolean) => {
    setEnableImageProxy(value);
    localStorage.setItem('enableImageProxy', JSON.stringify(value));
  };

  const handleSkipSegmentsToggle = (value: boolean) => {
    setSkipSegmentsEnabled(value);
    localStorage.setItem('skip_segments_enabled', String(value));
    skipSegmentControls?.onEnabledChange(value);
    setSkipNotice(value ? '片头片尾功能已显示' : '片头片尾功能已隐藏');
  };

  const handleSkipAutoToggle = (kind: SkipSegmentKind, value: boolean) => {
    if (kind === 'intro') {
      setSkipAutoIntro(value);
      localStorage.setItem('skip_auto_intro', String(value));
    } else {
      setSkipAutoOutro(value);
      localStorage.setItem('skip_auto_outro', String(value));
    }
    skipSegmentControls?.onAutoChange(kind, value);
  };

  const handleSetSkipMarker = (kind: SkipSegmentKind) => {
    if (!skipSegmentControls) return;
    const markerTime = skipSegmentControls.getCurrentTime();
    skipSegmentControls.onSetMarker(kind);
    setCurrentPlaybackTime(markerTime);
    setSkipNotice(
      `${
        kind === 'intro' ? '片头结束' : '片尾开始'
      }已保存为 ${formatPlaybackTime(markerTime)}`
    );
  };

  const handleClearSkipMarker = (kind: SkipSegmentKind) => {
    if (!skipSegmentControls) return;
    skipSegmentControls.onClearMarker(kind);
    setSkipNotice(`${kind === 'intro' ? '片头' : '片尾'}标记已清除`);
  };

  const handleSettingsClick = () => {
    setIsOpen((open) => !open);
    setSkipNotice('');
  };

  const handleClosePanel = () => {
    setIsOpen(false);
    setSkipNotice('');
  };

  const handleResetSettings = () => {
    const defaultImageProxy = (window as any).RUNTIME_CONFIG?.IMAGE_PROXY || '';

    setDefaultAggregateSearch(true);
    setEnableOptimization(true);
    setDoubanProxyUrl('');
    setEnableImageProxy(!!defaultImageProxy);
    setImageProxyUrl(defaultImageProxy);
    setSkipSegmentsEnabled(true);
    setSkipAutoIntro(true);
    setSkipAutoOutro(false);

    localStorage.setItem('defaultAggregateSearch', JSON.stringify(true));
    localStorage.setItem('enableOptimization', JSON.stringify(true));
    localStorage.setItem('doubanProxyUrl', '');
    localStorage.setItem(
      'enableImageProxy',
      JSON.stringify(!!defaultImageProxy)
    );
    localStorage.setItem('imageProxyUrl', defaultImageProxy);
    localStorage.setItem('skip_segments_enabled', 'true');
    localStorage.setItem('skip_auto_intro', 'true');
    localStorage.setItem('skip_auto_outro', 'false');
    skipSegmentControls?.onEnabledChange(true);
    skipSegmentControls?.onAutoChange('intro', true);
    skipSegmentControls?.onAutoChange('outro', false);
    setSkipNotice('片头片尾设置已恢复默认');
  };

  const settingsPanel = (
    <>
      <div
        className='fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm'
        onClick={handleClosePanel}
      />

      <div className='fixed left-1/2 top-1/2 z-[1001] max-h-[86vh] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-black/10 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-gray-950 sm:p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
              本地设置
            </h3>
            <button
              onClick={handleResetSettings}
              className='rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40'
              title='重置为默认设置'
            >
              重置
            </button>
          </div>
          <button
            onClick={handleClosePanel}
            className='flex h-8 w-8 items-center justify-center rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
            aria-label='Close'
          >
            <X className='h-full w-full' />
          </button>
        </div>

        <div className='space-y-6'>
          <div className='rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <SkipForward className='h-4 w-4 text-gray-700 dark:text-gray-200' />
                  <h4 className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                    片头片尾
                  </h4>
                </div>
                <p className='mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400'>
                  关闭后隐藏播放器中的全部跳过提示。
                </p>
              </div>
              <label className='flex cursor-pointer items-center'>
                <span className='relative'>
                  <input
                    type='checkbox'
                    className='peer sr-only'
                    aria-label='启用片头片尾跳过'
                    checked={effectiveSkipEnabled}
                    onChange={(event) =>
                      handleSkipSegmentsToggle(event.target.checked)
                    }
                  />
                  <span className='block h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-black dark:bg-gray-700 dark:peer-checked:bg-white' />
                  <span className='absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5 dark:peer-checked:bg-black' />
                </span>
              </label>
            </div>

            {effectiveSkipEnabled && (
              <div className='mt-4 space-y-4 border-t border-gray-200 pt-4 dark:border-white/10'>
                <div className='grid grid-cols-2 gap-2'>
                  {(
                    [
                      ['intro', '自动跳过片头', effectiveAutoIntro],
                      ['outro', '自动跳过片尾', effectiveAutoOutro],
                    ] as const
                  ).map(([kind, label, checked]) => (
                    <label
                      key={kind}
                      className='flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200'
                    >
                      <input
                        type='checkbox'
                        checked={checked}
                        aria-label={label}
                        onChange={(event) =>
                          handleSkipAutoToggle(kind, event.target.checked)
                        }
                        className='h-4 w-4 rounded border-gray-300 accent-black dark:accent-white'
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {skipSegmentControls ? (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400'>
                      <span className='min-w-0 truncate'>
                        {skipSegmentControls.episodeLabel || '当前播放内容'}
                      </span>
                      <span className='inline-flex shrink-0 items-center gap-1 font-mono'>
                        <Clock3 className='h-3.5 w-3.5' />
                        {formatPlaybackTime(currentPlaybackTime)}
                      </span>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                      <button
                        type='button'
                        onClick={() => handleSetSkipMarker('intro')}
                        className='rounded-xl bg-black px-3 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-black'
                      >
                        当前点设为片头结束
                      </button>
                      <button
                        type='button'
                        onClick={() => handleSetSkipMarker('outro')}
                        className='rounded-xl bg-black px-3 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-black'
                      >
                        当前点设为片尾开始
                      </button>
                    </div>

                    <div className='space-y-2'>
                      {skipSegmentControls.introEnd !== undefined && (
                        <div className='flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-xs dark:border-white/10'>
                          <span className='inline-flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                            <Check className='h-3.5 w-3.5' />
                            片头结束{' '}
                            {formatPlaybackTime(skipSegmentControls.introEnd)}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleClearSkipMarker('intro')}
                            className='text-red-500 hover:text-red-700 dark:text-red-400'
                          >
                            清除片头
                          </button>
                        </div>
                      )}
                      {skipSegmentControls.outroStart !== undefined && (
                        <div className='flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-xs dark:border-white/10'>
                          <span className='inline-flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                            <Check className='h-3.5 w-3.5' />
                            片尾开始{' '}
                            {formatPlaybackTime(skipSegmentControls.outroStart)}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleClearSkipMarker('outro')}
                            className='text-red-500 hover:text-red-700 dark:text-red-400'
                          >
                            清除片尾
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className='rounded-xl border border-dashed border-gray-300 px-3 py-3 text-xs leading-5 text-gray-500 dark:border-white/15 dark:text-gray-400'>
                    播放影片时回到这里，即可用当前播放时间标记片头与片尾。
                  </p>
                )}

                {skipNotice && (
                  <p className='rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300'>
                    {skipNotice}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className='flex items-center justify-between gap-4'>
            <div>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                默认聚合搜索结果
              </h4>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                搜索时默认按标题和年份聚合显示结果
              </p>
            </div>
            <label className='flex cursor-pointer items-center'>
              <span className='relative'>
                <input
                  type='checkbox'
                  className='peer sr-only'
                  checked={defaultAggregateSearch}
                  onChange={(event) =>
                    handleAggregateToggle(event.target.checked)
                  }
                />
                <span className='block h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-black dark:bg-gray-600 dark:peer-checked:bg-white' />
                <span className='absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5' />
              </span>
            </label>
          </div>

          <div className='flex items-center justify-between gap-4'>
            <div>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                启用优选和测速
              </h4>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                如出现播放器劫持问题可关闭
              </p>
            </div>
            <label className='flex cursor-pointer items-center'>
              <span className='relative'>
                <input
                  type='checkbox'
                  className='peer sr-only'
                  checked={enableOptimization}
                  onChange={(event) =>
                    handleOptimizationToggle(event.target.checked)
                  }
                />
                <span className='block h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-black dark:bg-gray-600 dark:peer-checked:bg-white' />
                <span className='absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5' />
              </span>
            </label>
          </div>

          <div className='space-y-3'>
            <div>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                豆瓣数据代理
              </h4>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                设置代理 URL 以绕过豆瓣访问限制，留空则使用服务端 API
              </p>
            </div>
            <input
              type='text'
              className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
              placeholder='例如: https://proxy.example.com/fetch?url='
              value={doubanProxyUrl}
              onChange={(event) =>
                handleDoubanProxyUrlChange(event.target.value)
              }
            />
          </div>

          <div className='flex items-center justify-between gap-4'>
            <div>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                启用图片代理
              </h4>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                启用后，所有图片加载将通过代理服务器
              </p>
            </div>
            <label className='flex cursor-pointer items-center'>
              <span className='relative'>
                <input
                  type='checkbox'
                  className='peer sr-only'
                  checked={enableImageProxy}
                  onChange={(event) =>
                    handleImageProxyToggle(event.target.checked)
                  }
                />
                <span className='block h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-black dark:bg-gray-600 dark:peer-checked:bg-white' />
                <span className='absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5' />
              </span>
            </label>
          </div>

          <div className='space-y-3'>
            <div>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                图片代理地址
              </h4>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                仅在启用图片代理时生效
              </p>
            </div>
            <input
              type='text'
              className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                enableImageProxy
                  ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
                  : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500'
              }`}
              placeholder='例如: https://imageproxy.example.com/?url='
              value={imageProxyUrl}
              onChange={(event) =>
                handleImageProxyUrlChange(event.target.value)
              }
              disabled={!enableImageProxy}
            />
          </div>
        </div>

        <div className='mt-6 border-t border-gray-200 pt-4 dark:border-gray-700'>
          <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
            这些设置只保存在当前浏览器中
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={handleSettingsClick}
        className='flex h-10 w-10 items-center justify-center rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-200/50 dark:text-gray-300 dark:hover:bg-gray-700/50'
        aria-label='Settings'
      >
        <Settings className='h-full w-full' />
      </button>

      {isOpen && mounted && createPortal(settingsPanel, document.body)}
    </>
  );
};
