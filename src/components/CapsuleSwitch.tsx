interface CapsuleSwitchProps {
  options: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

const CapsuleSwitch = ({
  options,
  active,
  onChange,
  className,
}: CapsuleSwitchProps) => (
  <div
    className={`glass-panel inline-flex rounded-full p-1 ${className || ''}`}
    role='tablist'
  >
    {options.map((option) => {
      const selected = option.value === active;
      return (
        <button
          key={option.value}
          type='button'
          role='tab'
          aria-selected={selected}
          onClick={() => !selected && onChange(option.value)}
          className='min-w-20 rounded-full px-4 py-2 text-xs font-semibold transition duration-300 sm:text-sm'
          style={
            selected
              ? { background: 'var(--inverse)', color: 'var(--inverse-text)' }
              : { color: 'var(--text-soft)' }
          }
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default CapsuleSwitch;
