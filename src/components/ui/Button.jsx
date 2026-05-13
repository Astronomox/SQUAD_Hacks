import React from 'react';
import clsx from 'clsx';

const SIZE = {
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
};

const KIND = {
  primary:   'bg-brand text-white hover:bg-brand-hover shadow-card border border-brand-dark/10',
  secondary: 'bg-white text-ink-900 hover:bg-ink-50 border border-ink-200',
  ghost:     'bg-transparent text-ink-700 hover:bg-ink-50',
  danger:    'bg-bad text-white hover:bg-red-700 border border-red-900/10',
  warning:   'bg-warn text-white hover:bg-amber-700',
  success:   'bg-ok text-white hover:bg-green-700',
  soft:      'bg-brand-pale text-brand-dark hover:bg-orange-100 border border-brand-border',
  outline:   'bg-transparent text-ink-700 hover:bg-ink-50 border border-ink-200',
  'outline-danger':  'bg-transparent text-bad   hover:bg-bad-pale  border border-bad/30',
  'outline-warning': 'bg-transparent text-warn  hover:bg-warn-pale border border-warn/30',
  'outline-success': 'bg-transparent text-ok    hover:bg-ok-pale   border border-ok/30',
};

const Button = React.forwardRef(function Button(
  { as: Component = 'button', kind = 'primary', size = 'md', icon, iconRight, className, children, ...rest },
  ref
) {
  return (
    <Component
      ref={ref}
      {...rest}
      className={clsx(
        'inline-flex items-center justify-center font-medium font-body transition focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none',
        SIZE[size],
        KIND[kind],
        className
      )}
    >
      {icon  && <span className="shrink-0 flex">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0 flex">{iconRight}</span>}
    </Component>
  );
});

export default Button;
