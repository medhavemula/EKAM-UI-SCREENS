import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { Check } from 'lucide-react';

const TRIGGER_THRESHOLD = 58;
const REFRESH_HOLD_HEIGHT = 64;
const MAX_PULL = 96;

interface EkamRefreshSpinnerProps {
  pullProgress: MotionValue<number>;
  status: 'idle' | 'pulling' | 'ready' | 'refreshing' | 'done';
  tone: 'dark' | 'light';
  reducedMotion: boolean;
}

export function EkamRefreshSpinner({
  pullProgress,
  status,
  tone,
  reducedMotion,
}: EkamRefreshSpinnerProps) {
  const pullRotation = useTransform(pullProgress, [0, 1], [-40, 250]);
  const ringScale = useTransform(pullProgress, [0, 0.4, 1], [0.68, 0.9, 1]);
  const containerOpacity = useTransform(pullProgress, [0, 0.2, 0.7], [0, 0.7, 1]);

  const isDarkSurface = tone === 'dark';
  const active = status === 'refreshing' || status === 'done';

  const statusText =
    status === 'done'
      ? 'Updated just now'
      : status === 'refreshing'
        ? 'Syncing EKAM network...'
        : status === 'ready'
          ? 'Release to refresh'
          : 'Pull to refresh';

  return (
    <motion.div
      style={{ opacity: active ? 1 : containerOpacity }}
      className="flex items-center justify-center gap-3 px-4 py-1.5 select-none"
    >
      {/* Custom EKAM Orbital Emblem Spinner */}
      <motion.div
        style={active ? undefined : { scale: ringScale }}
        animate={
          status === 'ready' && !reducedMotion
            ? { scale: [1, 1.09, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.25 }}
        className={`relative w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${
          isDarkSurface
            ? 'bg-[#122636] ring-1 ring-white/15'
            : 'bg-white dark:bg-[#161822] ring-1 ring-slate-200/80 dark:ring-white/12'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {status === 'done' ? (
            <motion.div
              key="done-check"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="w-6 h-6 rounded-full bg-emerald-500/18 text-emerald-500 flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2.8} />
            </motion.div>
          ) : (
            <motion.div
              key="orbital-spinner"
              style={
                status === 'refreshing'
                  ? undefined
                  : { rotate: reducedMotion ? 0 : pullRotation }
              }
              animate={
                status === 'refreshing' && !reducedMotion
                  ? { rotate: 360 }
                  : undefined
              }
              transition={
                status === 'refreshing' && !reducedMotion
                  ? { duration: 0.9, repeat: Infinity, ease: 'linear' }
                  : undefined
              }
              className="w-7 h-7 flex items-center justify-center"
            >
              <svg viewBox="0 0 32 32" className="w-7 h-7 overflow-visible" aria-hidden="true">
                {/* Outer Navy Track */}
                <circle
                  cx="16"
                  cy="16"
                  r="11.5"
                  fill="none"
                  strokeWidth="2.4"
                  className={
                    isDarkSurface
                      ? 'stroke-sky-300/20'
                      : 'stroke-[#123142]/15 dark:stroke-sky-400/20'
                  }
                />
                {/* Copper Active Arc */}
                <circle
                  cx="16"
                  cy="16"
                  r="11.5"
                  fill="none"
                  stroke="#D85D27"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeDasharray="46 28"
                />
                {/* Inner Navy Counter-Arc */}
                <circle
                  cx="16"
                  cy="16"
                  r="6.8"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="22 22"
                  className={
                    isDarkSurface
                      ? 'stroke-sky-300/80'
                      : 'stroke-[#123142] dark:stroke-sky-400'
                  }
                />
                {/* Warm Amber Keystone Dot */}
                <circle cx="16" cy="4.5" r="2.2" fill="#F38B1E" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="text-left min-w-[132px]">
        <div
          className={`text-[11.5px] font-semibold tracking-tight leading-tight ${
            status === 'done'
              ? 'text-emerald-500'
              : status === 'ready' || status === 'refreshing'
                ? 'text-[#F38B1E]'
                : isDarkSurface
                  ? 'text-slate-300'
                  : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {statusText}
        </div>
        <div
          className={`text-[10px] leading-tight mt-0.5 ${
            isDarkSurface ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {status === 'refreshing' ? 'Fetching live chapter activity' : 'EKAM live sync'}
        </div>
      </div>
    </motion.div>
  );
}

interface PullToRefreshContainerProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  tone?: 'dark' | 'light';
  reducedMotion?: boolean;
  className?: string;
}

export function PullToRefreshContainer({
  children,
  onRefresh,
  tone = 'light',
  reducedMotion = false,
  className = '',
}: PullToRefreshContainerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing' | 'done'>('idle');
  const statusRef = useRef(status);
  statusRef.current = status;

  const pullHeightMv = useMotionValue(0);
  const smoothHeight = useSpring(pullHeightMv, {
    stiffness: reducedMotion ? 900 : 380,
    damping: reducedMotion ? 60 : 34,
    mass: 0.75,
  });
  const pullProgress = useTransform(smoothHeight, [0, TRIGGER_THRESHOLD], [0, 1]);

  const dragRef = useRef({
    active: false,
    engaging: false,
    startX: 0,
    startY: 0,
    didDrag: false,
  });

  const getScrollTop = useCallback(() => {
    const scroller = rootRef.current?.closest('.ekam-scroll') as HTMLElement | null;
    if (scroller) return scroller.scrollTop;
    return window.scrollY || 0;
  }, []);

  const triggerRefresh = useCallback(async () => {
    setStatus('refreshing');
    pullHeightMv.set(REFRESH_HOLD_HEIGHT);
    try {
      await Promise.all([
        Promise.resolve(onRefresh?.()),
        new Promise<void>((resolve) => window.setTimeout(resolve, reducedMotion ? 420 : 900)),
      ]);
    } finally {
      setStatus('done');
      window.setTimeout(() => {
        pullHeightMv.set(0);
        window.setTimeout(() => {
          setStatus('idle');
        }, 180);
      }, reducedMotion ? 200 : 420);
    }
  }, [onRefresh, pullHeightMv, reducedMotion]);

  useEffect(() => {
    const finishDrag = () => {
      if (!dragRef.current.active) return;
      const wasEngaged = dragRef.current.engaging;
      dragRef.current.active = false;
      dragRef.current.engaging = false;

      if (!wasEngaged) return;

      const currentPull = pullHeightMv.get();
      if (currentPull >= TRIGGER_THRESHOLD && statusRef.current !== 'refreshing') {
        void triggerRefresh();
      } else if (statusRef.current !== 'refreshing') {
        pullHeightMv.set(0);
        setStatus('idle');
      }
    };

    const onWindowPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      if (statusRef.current === 'refreshing' || statusRef.current === 'done') return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      if (!dragRef.current.engaging) {
        if (dy < 10) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          dragRef.current.active = false;
          return;
        }
        if (getScrollTop() > 2) {
          dragRef.current.active = false;
          return;
        }
        dragRef.current.engaging = true;
        dragRef.current.didDrag = true;
        window.getSelection()?.removeAllRanges();
      }

      if (dy <= 0) {
        pullHeightMv.set(0);
        setStatus('idle');
        return;
      }

      const resisted = Math.min(MAX_PULL, 94 * (1 - Math.exp(-dy / 145)));
      pullHeightMv.set(resisted);
      setStatus(resisted >= TRIGGER_THRESHOLD ? 'ready' : 'pulling');
    };

    const el = rootRef.current;
    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current.engaging && e.cancelable) {
        e.preventDefault();
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    el?.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
      el?.removeEventListener('touchmove', onTouchMove);
    };
  }, [getScrollTop, pullHeightMv, triggerRefresh]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (statusRef.current === 'refreshing' || statusRef.current === 'done') return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const target = e.target as HTMLElement | null;
    if (
      target?.closest(
        'canvas, input, textarea, select, option, [data-no-ptr="true"]'
      )
    ) {
      return;
    }

    if (getScrollTop() > 2) return;

    dragRef.current = {
      active: true,
      engaging: false,
      startX: e.clientX,
      startY: e.clientY,
      didDrag: false,
    };
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.didDrag) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.didDrag = false;
    }
  };

  const traySurfaceClass =
    tone === 'dark'
      ? 'bg-[#0B1620] border-b border-white/5'
      : 'bg-[#EEF1F7] dark:bg-[#0B0D14] border-b border-slate-200/50 dark:border-white/5';

  return (
    <div
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onClickCapture={handleClickCapture}
      className={`min-h-full flex flex-col ${className}`}
    >
      {/* Expanding EKAM Refresh Well */}
      <motion.div
        style={{ height: smoothHeight }}
        aria-live="polite"
        className={`overflow-hidden flex items-center justify-center shrink-0 ${traySurfaceClass}`}
      >
        <EkamRefreshSpinner
          pullProgress={pullProgress}
          status={status}
          tone={tone}
          reducedMotion={reducedMotion}
        />
      </motion.div>

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
