import React, { useEffect, useId, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function EkamWordmark({
  light = false,
  size = 'md',
  animated = false,
  reducedMotion = false,
}: {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  reducedMotion?: boolean;
}) {
  const heightClass = size === 'lg' ? 'h-11' : size === 'sm' ? 'h-5' : 'h-7';
  const letterClass = `${
    light ? 'fill-white' : 'fill-[#123142] dark:fill-white'
  } transition-[fill] duration-300 ease-out`;
  const dotColor = '#F38B1E';
  const shouldAnimate = animated && !reducedMotion;

  const letterAnim = (delay: number) =>
    shouldAnimate
      ? {
          initial: { opacity: 0, scale: 0.84, y: 4 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] as const },
        }
      : {};

  const dotAnim = (delay: number) =>
    shouldAnimate
      ? {
          initial: { opacity: 0, scale: 0 },
          animate: { opacity: 1, scale: 1 },
          transition: { type: 'spring' as const, stiffness: 360, damping: 18, delay },
        }
      : {};

  return (
    <svg
      viewBox="0 0 240 64"
      className={`${heightClass} w-auto select-none shrink-0 overflow-visible`}
      aria-label="EKAM"
      role="img"
    >
      {/* E: bold bracket + centered orange dot */}
      <motion.path
        d="M4 6 H45 V16 H14.5 V48 H45 V58 H4 Z"
        className={letterClass}
        style={{ transformOrigin: '24px 32px' }}
        {...letterAnim(0.2)}
      />
      <motion.circle
        cx="33.5"
        cy="32"
        r="8.2"
        fill={dotColor}
        style={{ transformOrigin: '33.5px 32px' }}
        {...dotAnim(0.46)}
      />

      {/* K: top-left diagonal-cut wedge + bottom-left orange dot + right chevron */}
      <motion.g style={{ transformOrigin: '78px 32px' }} {...letterAnim(0.27)}>
        <path d="M57 6 H67.5 V16.5 L57 26.5 Z" className={letterClass} />
        <path d="M87.5 6 H100.5 L77 32 L101.5 58 H88.5 L64 32 Z" className={letterClass} />
      </motion.g>
      <motion.circle
        cx="63"
        cy="50.5"
        r="7.5"
        fill={dotColor}
        style={{ transformOrigin: '63px 50.5px' }}
        {...dotAnim(0.53)}
      />

      {/* A: bottom-left orange dot + geometric apex, crossbar & full right leg */}
      <motion.path
        fillRule="evenodd"
        d="M128.5 6 H141 L162 58 H150.5 L143.5 40.5 H115.5 Z M134.8 19 L128.2 33 H140.5 Z"
        className={letterClass}
        style={{ transformOrigin: '138px 32px' }}
        {...letterAnim(0.34)}
      />
      <motion.circle
        cx="114.5"
        cy="50.5"
        r="7.5"
        fill={dotColor}
        style={{ transformOrigin: '114.5px 50.5px' }}
        {...dotAnim(0.6)}
      />

      {/* M: bottom-left orange dot + elevated V-arch & full right leg */}
      <motion.path
        d="M168 6 H179.5 L197 30.5 L214.5 6 H225.5 L235.5 58 H224 L217.5 22.5 L197 51 Z"
        className={letterClass}
        style={{ transformOrigin: '202px 32px' }}
        {...letterAnim(0.41)}
      />
      <motion.circle
        cx="171.5"
        cy="50.5"
        r="7.5"
        fill={dotColor}
        style={{ transformOrigin: '171.5px 50.5px' }}
        {...dotAnim(0.67)}
      />
    </svg>
  );
}

export function ConstellationBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-0 h-full w-64 opacity-25"
      viewBox="0 0 260 180"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="rgba(255,255,255,0.45)" strokeWidth="1">
        <line x1="72" y1="18" x2="144" y2="54" />
        <line x1="144" y1="54" x2="218" y2="26" />
        <line x1="144" y1="54" x2="188" y2="112" />
        <line x1="188" y1="112" x2="246" y2="76" />
        <line x1="188" y1="112" x2="118" y2="146" />
        <line x1="118" y1="146" x2="64" y2="96" />
        <line x1="64" y1="96" x2="144" y2="54" />
        <line x1="218" y1="26" x2="246" y2="76" />
      </g>
      <circle cx="72" cy="18" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <circle cx="144" cy="54" r="4" fill="#D85D27" />
      <circle cx="218" cy="26" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <circle cx="188" cy="112" r="3.5" stroke="#D85D27" strokeWidth="1.5" />
      <circle cx="246" cy="76" r="2.5" fill="rgba(255,255,255,0.65)" />
      <circle cx="118" cy="146" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <circle cx="64" cy="96" r="2.5" fill="rgba(255,255,255,0.65)" />
    </svg>
  );
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  reducedMotion = false,
  className = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  reducedMotion?: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 380;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + diff * eased));
      if (t < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reducedMotion]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

export function PremiumButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'navy' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D85D27] focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none cursor-pointer';

  const sizes = {
    sm: 'min-h-[38px] px-3.5 py-1.5 text-xs',
    md: 'min-h-[44px] px-5 py-2.5 text-sm',
    lg: 'min-h-[48px] px-6 py-3 text-sm',
  };

  const variants = {
    primary: 'bg-[#D85D27] hover:bg-[#BE4D14] text-white shadow-sm shadow-[#D85D27]/20',
    navy: 'bg-[#123142] hover:bg-[#0D2431] text-white dark:bg-[#1E475E] dark:hover:bg-[#265672]',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 dark:bg-[#1C1C22] dark:hover:bg-[#25252D] dark:text-slate-100 dark:border-white/10',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-white/5 dark:text-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#D85D27] hover:text-[#BE4D14] transition-colors cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function EmptyStateView({
  kind,
  title,
  description,
  actionLabel,
  onAction,
}: {
  kind: 'referrals' | 'visitors' | 'm2o' | 'feed' | 'invites' | 'requests';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#151519]">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D85D27]/12 to-[#123142]/10 dark:from-[#D85D27]/20 dark:to-sky-500/10 flex items-center justify-center mb-4">
        <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" aria-hidden="true">
          {kind === 'referrals' && (
            <>
              <rect x="6" y="13" width="36" height="23" rx="4" stroke="#123142" className="dark:stroke-slate-200" strokeWidth="2.2" />
              <path d="M8 16 L24 27 L40 16" stroke="#D85D27" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
          {kind === 'visitors' && (
            <>
              <rect x="12" y="10" width="24" height="30" rx="4" stroke="#123142" className="dark:stroke-slate-200" strokeWidth="2.2" />
              <circle cx="24" cy="21" r="4.5" stroke="#D85D27" strokeWidth="2.2" />
              <path d="M17 33 C18.5 29.5 29.5 29.5 31 33" stroke="#123142" className="dark:stroke-slate-200" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
          {kind === 'm2o' && (
            <>
              <circle cx="24" cy="14" r="4" fill="#D85D27" />
              <circle cx="12" cy="30" r="3.5" stroke="#123142" className="dark:stroke-slate-200" strokeWidth="2.2" />
              <circle cx="24" cy="33" r="3.5" stroke="#123142" className="dark:stroke-slate-200" strokeWidth="2.2" />
              <circle cx="36" cy="30" r="3.5" stroke="#123142" className="dark:stroke-slate-200" strokeWidth="2.2" />
              <path d="M24 18 V29 M21 17 L14 27 M27 17 L34 27" stroke="#D85D27" strokeWidth="1.8" strokeLinecap="round" />
            </>
          )}
          {(kind === 'feed' || kind === 'invites' || kind === 'requests') && (
            <>
              <rect x="9" y="10" width="30" height="28" rx="5" stroke="#123142" className="dark:stroke-slate-200" strokeWidth="2.2" />
              <path d="M16 19 H32 M16 25 H26 M16 31 H22" stroke="#D85D27" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
        </svg>
      </div>
      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <PremiumButton onClick={onAction} size="sm">
            {actionLabel}
          </PremiumButton>
        </div>
      )}
    </div>
  );
}

export function DashboardFlankCurves({ muted = false }: { muted?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const leftGradId = `ekam-flank-left-${uid}`;
  const leftHighlightId = `ekam-flank-left-hl-${uid}`;
  const rightGradId = `ekam-flank-right-${uid}`;
  const rightHighlightId = `ekam-flank-right-hl-${uid}`;

  return (
    <>
      {/* Left Slate-Teal / Ocean-Navy Organic Flank Curve (Mirrored Directly Opposite Right Curve) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 44 168"
        fill="none"
        className={`pointer-events-none absolute left-0 top-[84px] w-[42px] h-[168px] drop-shadow-[0_12px_22px_rgba(30,92,117,0.22)] ${
          muted ? 'opacity-80' : ''
        }`}
      >
        <defs>
          <linearGradient id={leftGradId} x1="0%" y1="0%" x2="88%" y2="100%">
            <stop offset="0%" stopColor="#2C8CA6" />
            <stop offset="52%" stopColor="#1E5C75" />
            <stop offset="100%" stopColor="#153E52" />
          </linearGradient>
          <linearGradient id={leftHighlightId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.34" />
            <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#2C8CA6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 0 C 8 28, 36 48, 36 84 C 36 120, 8 140, 0 168 Z"
          fill={`url(#${leftGradId})`}
        />
        <path
          d="M 0 16 C 10 38, 28 56, 28 84 C 28 112, 10 130, 0 152"
          stroke={`url(#${leftHighlightId})`}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Right Vibrant EKAM Orange Organic Flank Curve (Mirrored Directly Opposite Left Curve) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 44 168"
        fill="none"
        className={`pointer-events-none absolute right-0 top-[84px] w-[42px] h-[168px] drop-shadow-[0_12px_22px_rgba(216,93,39,0.26)] ${
          muted ? 'opacity-80' : ''
        }`}
      >
        <defs>
          <linearGradient id={rightGradId} x1="100%" y1="0%" x2="12%" y2="100%">
            <stop offset="0%" stopColor="#FF782C" />
            <stop offset="52%" stopColor="#F26422" />
            <stop offset="100%" stopColor="#D85D27" />
          </linearGradient>
          <linearGradient id={rightHighlightId} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE4C4" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#FDBA74" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FF782C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 44 0 C 36 28, 8 48, 8 84 C 8 120, 36 140, 44 168 Z"
          fill={`url(#${rightGradId})`}
        />
        <path
          d="M 44 16 C 34 38, 16 56, 16 84 C 16 112, 34 130, 44 152"
          stroke={`url(#${rightHighlightId})`}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}
