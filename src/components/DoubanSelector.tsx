'use client';

interface SelectorOption {
  label: string;
  value: string;
}

interface DoubanSelectorProps {
  type: 'movie' | 'tv' | 'show';
  primarySelection?: string;
  secondarySelection?: string;
  onPrimaryChange: (value: string) => void;
  onSecondaryChange: (value: string) => void;
}

const MOVIE_PRIMARY: SelectorOption[] = [
  { label: '热门电影', value: '热门' },
  { label: '最新电影', value: '最新' },
  { label: '豆瓣高分', value: '豆瓣高分' },
  { label: '冷门佳片', value: '冷门佳片' },
];
const MOVIE_REGION: SelectorOption[] = [
  { label: '全部', value: '全部' },
  { label: '华语', value: '华语' },
  { label: '欧美', value: '欧美' },
  { label: '韩国', value: '韩国' },
  { label: '日本', value: '日本' },
];
const TV_OPTIONS: SelectorOption[] = [
  { label: '全部', value: 'tv' },
  { label: '国产', value: 'tv_domestic' },
  { label: '欧美', value: 'tv_american' },
  { label: '日本', value: 'tv_japanese' },
  { label: '韩国', value: 'tv_korean' },
  { label: '动漫', value: 'tv_animation' },
  { label: '纪录片', value: 'tv_documentary' },
];
const SHOW_OPTIONS: SelectorOption[] = [
  { label: '全部', value: 'show' },
  { label: '国内', value: 'show_domestic' },
  { label: '国外', value: 'show_foreign' },
];

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SelectorOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
      <span
        className='min-w-[42px] text-xs font-semibold'
        style={{ color: 'var(--text-soft)' }}
      >
        {label}
      </span>
      <div
        className='scrollbar-hide flex max-w-full gap-1 overflow-x-auto rounded-full border p-1'
        style={{
          borderColor: 'var(--line)',
          background: 'var(--surface-subtle)',
        }}
        role='tablist'
        aria-label={label}
      >
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type='button'
              role='tab'
              aria-selected={active}
              onClick={() => !active && onChange(option.value)}
              className='whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition duration-300 sm:px-4 sm:text-sm'
              style={
                active
                  ? {
                      background: 'var(--inverse)',
                      color: 'var(--inverse-text)',
                    }
                  : { color: 'var(--text-soft)' }
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DoubanSelector({
  type,
  primarySelection,
  secondarySelection,
  onPrimaryChange,
  onSecondaryChange,
}: DoubanSelectorProps) {
  if (type === 'movie') {
    return (
      <div className='space-y-3'>
        <FilterGroup
          label='分类'
          options={MOVIE_PRIMARY}
          value={primarySelection || MOVIE_PRIMARY[0].value}
          onChange={onPrimaryChange}
        />
        <FilterGroup
          label='地区'
          options={MOVIE_REGION}
          value={secondarySelection || MOVIE_REGION[0].value}
          onChange={onSecondaryChange}
        />
      </div>
    );
  }

  const options = type === 'tv' ? TV_OPTIONS : SHOW_OPTIONS;
  return (
    <FilterGroup
      label='类型'
      options={options}
      value={secondarySelection || options[0].value}
      onChange={onSecondaryChange}
    />
  );
}
