import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DashboardFlankCurves, EkamWordmark } from './EkamBrand';
import { createSpringItemVariants, createStaggerListVariants } from './motionPresets';
import { ScreenId } from '../types/ekam';

type SkeletonTone = 'neutral' | 'copper' | 'navy' | 'teal' | 'dark-surface';

const TONE_BASE_CLASSES: Record<SkeletonTone, string> = {
  neutral: 'bg-slate-200/80 dark:bg-white/[0.08]',
  copper: 'bg-[#D85D27]/22 dark:bg-[#F38B1E]/22',
  navy: 'bg-[#123142]/16 dark:bg-sky-300/18',
  teal: 'bg-[#15647B]/20 dark:bg-cyan-300/18',
  'dark-surface': 'bg-white/15',
};

const TONE_SHEEN_GRADIENT: Record<SkeletonTone, string> = {
  neutral:
    'linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.68) 46%, rgba(243,139,30,0.16) 54%, transparent 85%)',
  copper:
    'linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.45) 48%, rgba(243,139,30,0.34) 56%, transparent 85%)',
  navy:
    'linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.42) 48%, rgba(56,189,248,0.22) 56%, transparent 85%)',
  teal:
    'linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.44) 48%, rgba(56,189,248,0.24) 56%, transparent 85%)',
  'dark-surface':
    'linear-gradient(105deg, transparent 15%, rgba(255,255,255,0.28) 48%, rgba(243,139,30,0.26) 56%, transparent 85%)',
};

export function EkamSkeletonBlock({
  className = '',
  tone = 'neutral',
  reducedMotion = false,
  delay = 0,
}: {
  className?: string;
  tone?: SkeletonTone;
  reducedMotion?: boolean;
  delay?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${TONE_BASE_CLASSES[tone]} ${className}`}
    >
      {!reducedMotion && (
        <motion.div
          initial={{ x: '-110%' }}
          animate={{ x: '160%' }}
          transition={{
            duration: 1.45,
            repeat: Infinity,
            repeatDelay: 0.25,
            delay,
            ease: [0.35, 0, 0.25, 1],
          }}
          style={{
            background: TONE_SHEEN_GRADIENT[tone],
            willChange: 'transform',
          }}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </div>
  );
}

export function EkamCardShell({
  children,
  className = '',
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: ReturnType<typeof createSpringItemVariants>;
}) {
  return (
    <motion.div
      variants={variants}
      className={`rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.08)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.65)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function DashboardSkeleton({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const listVariants = createStaggerListVariants(reducedMotion, 0.055, 0.02);
  const itemVariants = createSpringItemVariants(reducedMotion, 14, 0.96);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading dashboard"
      className="min-h-full bg-[#F6F7FB] dark:bg-[#0B0D14] pb-8 relative overflow-hidden"
    >
      {/* Preserved Organic Side Flanks */}
      <DashboardFlankCurves muted />

      {/* Top Row */}
      <div className="relative z-10 px-4 pt-4 pb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <EkamSkeletonBlock reducedMotion={reducedMotion} className="w-10 h-10 rounded-full justify-self-start" />
        <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" delay={0.04} className="h-5 w-20 rounded-md justify-self-center" />
        <div className="justify-self-end flex items-center gap-2">
          <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.08} className="w-10 h-10 rounded-full" />
          <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.14} className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Centered Identity Hub */}
      <div className="relative z-10 px-4 pt-1 pb-5 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white dark:bg-[#161822] border border-slate-100 dark:border-white/12 shadow-[0_14px_32px_-8px_rgba(18,49,66,0.16)] flex items-center justify-center">
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-11 h-7 rounded-lg" />
        </div>
        <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.08} className="mt-3.5 h-5 w-40 rounded-lg" />
        <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.14} className="mt-2 h-3 w-32 rounded-md" />
        <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.18} className="mt-1.5 h-3 w-44 rounded-md" />

        {/* 6 Circular Quick Links */}
        <div className="mt-4 flex items-center justify-center gap-2.5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <EkamSkeletonBlock
              key={idx}
              reducedMotion={reducedMotion}
              delay={idx * 0.05}
              className="w-9.5 h-9.5 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Bento Skeleton Stack */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-4 space-y-3"
      >
        {/* Copper Focal Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-[22px] bg-gradient-to-r from-[#FF782C]/22 via-[#F26422]/18 to-[#D85D27]/22 border border-[#D85D27]/20 p-4 flex items-center gap-3.5"
        >
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-4 w-40 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={0.1} className="h-3 w-52 rounded-md" />
          </div>
        </motion.div>

        {/* Dual Row 1: Softer Teal & Ocean Navy */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-[#22748B]/14 dark:bg-[#22748B]/24 border border-[#22748B]/20 p-4 min-h-[126px] flex flex-col justify-between">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="teal" className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="teal" className="h-4 w-24 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="teal" delay={0.1} className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <div className="rounded-[22px] bg-[#1B465D]/14 dark:bg-[#1B465D]/35 border border-[#1B465D]/18 p-4 min-h-[126px] flex flex-col justify-between">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" className="h-4 w-24 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" delay={0.1} className="h-3 w-20 rounded-md" />
            </div>
          </div>
        </motion.div>

        {/* Dual Row 2: Copper & Light */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-[#D85D27]/18 border border-[#D85D27]/20 p-4 min-h-[122px] flex flex-col justify-between">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-4 w-24 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={0.1} className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <EkamCardShell className="p-4 min-h-[122px] flex flex-col justify-between">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-4 w-24 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.1} className="h-3 w-20 rounded-md" />
            </div>
          </EkamCardShell>
        </motion.div>

        {/* Strip CTA */}
        <EkamCardShell variants={itemVariants} className="p-3.5 flex items-center gap-3">
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-3.5 w-36 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.1} className="h-3 w-48 rounded-md" />
          </div>
        </EkamCardShell>

        {/* Dark 3D Constellation Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-[24px] bg-gradient-to-br from-[#0E3548] via-[#0A2533] to-[#061822] p-4.5 border border-white/10 flex items-center justify-between gap-3"
        >
          <div className="flex-1 space-y-2.5">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-3 w-20 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-5 w-40 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" delay={0.1} className="h-3 w-36 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" delay={0.15} className="h-8 w-28 rounded-full mt-1" />
          </div>
          <EkamSkeletonBlock
            reducedMotion={reducedMotion}
            tone="dark-surface"
            className="w-[96px] h-[116px] rounded-2xl rotate-[-6deg] shrink-0"
          />
        </motion.div>

        {/* Recent Referrals Ledger */}
        <EkamCardShell variants={itemVariants} className="divide-y divide-slate-100 dark:divide-white/8 overflow-hidden">
          {[0, 1].map((row) => (
            <div key={row} className="p-4 space-y-2">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={row * 0.08} className="h-3 w-32 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={row * 0.08 + 0.05} className="h-4 w-48 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={row * 0.08 + 0.1} className="h-3 w-36 rounded-md" />
            </div>
          ))}
        </EkamCardShell>
      </motion.div>
    </div>
  );
}

export function ThreeStageSkeletonOverlay({
  variant = 'compact',
  label = 'Initializing 3D Nexus',
  reducedMotion = false,
}: {
  variant?: 'compact' | 'fullscreen';
  label?: string;
  reducedMotion?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-busy="true"
      aria-label={label}
      className="absolute inset-0 z-20 bg-gradient-to-b from-[#081520] via-[#0B1926] to-[#0D2131] flex flex-col items-center justify-center p-5 overflow-hidden select-none"
    >
      {/* Subtle Architectural Floor Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,184,212,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,184,212,0.18) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />

      {/* Branded Orbital Crest & Hexagonal Nexus Wireframe */}
      <div className="relative flex flex-col items-center justify-center">
        <div className={variant === 'fullscreen' ? 'w-32 h-32' : 'w-24 h-24'}>
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible" aria-hidden="true">
            <motion.ellipse
              cx="60"
              cy="62"
              rx="46"
              ry="16"
              fill="none"
              stroke="rgba(56,189,248,0.32)"
              strokeWidth="1.25"
              strokeDasharray="4 4"
              animate={reducedMotion ? undefined : { rotate: [0, 360] }}
              transition={reducedMotion ? undefined : { duration: 14, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '60px 62px' }}
            />
            <motion.circle
              cx="60"
              cy="60"
              r="34"
              fill="none"
              stroke="#D85D27"
              strokeWidth="1.75"
              strokeDasharray="64 42"
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={reducedMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '60px 60px' }}
            />
            <motion.polygon
              points="60,34 81,47 81,73 60,86 39,73 39,47"
              fill="rgba(216,93,39,0.14)"
              stroke="#F38B1E"
              strokeWidth="1.5"
              animate={
                reducedMotion
                  ? undefined
                  : { scale: [0.95, 1.04, 0.95], opacity: [0.75, 1, 0.75] }
              }
              transition={
                reducedMotion
                  ? undefined
                  : { duration: 2.1, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ transformOrigin: '60px 60px' }}
            />
            <circle cx="60" cy="60" r="5" fill="#F38B1E" />
          </svg>
        </div>

        <div className="mt-2 flex flex-col items-center gap-1.5">
          <EkamWordmark light size="sm" />
          <div className="text-[11px] font-medium tracking-wide text-slate-300/85">
            {label}
          </div>
          <EkamSkeletonBlock
            reducedMotion={reducedMotion}
            tone="dark-surface"
            className="mt-1 h-1.5 w-32 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function BusinessHubSkeleton({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.04);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Business Hub"
      className="min-h-full bg-[#F5F6FA] dark:bg-[#0B0D14] pb-8"
    >
      {/* Midnight Navy Header + Glass Segmented Navigation Skeleton */}
      <div className="bg-gradient-to-b from-[#060F1E] via-[#091930] to-[#122338] px-4 pt-4 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-3.5 w-44 rounded-md" />
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="w-7 h-7 rounded-full" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="space-y-2">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-8 w-36 rounded-xl" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={0.08} className="h-3.5 w-52 rounded-md" />
          </div>
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-12 h-12 rounded-full shrink-0" />
        </div>

        <div className="rounded-full bg-white/10 border border-white/15 p-1.5 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <EkamSkeletonBlock
              key={i}
              reducedMotion={reducedMotion}
              tone={i === 0 ? 'copper' : 'dark-surface'}
              delay={i * 0.06}
              className="h-10 rounded-full"
            />
          ))}
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-4 space-y-4"
      >
        {/* Bold EKAM Orange Hero Card Skeleton */}
        <motion.div
          variants={itemVariants}
          className="rounded-[24px] bg-gradient-to-br from-[#FF7A29]/28 via-[#E55E22]/22 to-[#BE4D14]/25 p-5 border border-[#D85D27]/30 space-y-4 shadow-[0_18px_36px_-14px_rgba(216,93,39,0.28)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-3 w-28 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-7 w-48 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" delay={0.1} className="h-3.5 w-56 rounded-md" />
            </div>
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" className="w-11 h-11 rounded-2xl shrink-0" />
          </div>
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" className="h-14 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-2.5">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" className="h-10 rounded-xl" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-10 rounded-xl" />
          </div>
        </motion.div>

        {/* Dual Bento Metric Cards (Navy + Copper Glass) */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-[#123142]/18 dark:bg-[#123142]/55 border border-[#123142]/22 p-4 space-y-3">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" className="h-4 w-24 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" delay={0.08} className="h-3 w-28 rounded-md" />
            </div>
          </div>
          <div className="rounded-[22px] bg-[#D85D27]/16 border border-[#D85D27]/28 p-4 space-y-3">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-4 w-24 rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={0.08} className="h-3 w-28 rounded-md" />
            </div>
          </div>
        </motion.div>

        {/* Pipeline & Reports Cards */}
        <motion.div variants={itemVariants} className="space-y-3">
          <EkamCardShell className="p-4 space-y-3">
            <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-4 w-36 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.06} className="h-14 w-full rounded-xl" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.12} className="h-14 w-full rounded-xl" />
          </EkamCardShell>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function ProfessionalHubSkeleton({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.95);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Professional Network"
      className="min-h-full bg-[#F5F6FA] dark:bg-[#0B0D14] pb-8"
    >
      {/* Curved Navy Hero */}
      <div className="relative bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#19455C] px-5 pt-5 pb-16 rounded-b-[30px] overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2.5">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-7 w-44 rounded-xl" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={0.08} className="h-3 w-36 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="w-10 h-10 rounded-full" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" delay={0.08} className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2">
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-3 w-24 rounded-md" />
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" delay={0.08} className="h-8 w-40 rounded-xl" />
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" delay={0.14} className="h-3 w-48 rounded-md" />
        </div>
      </div>

      {/* Overlapping Floating 4-Action Dock */}
      <div className="relative z-20 -mt-10 px-4">
        <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_18px_38px_-14px_rgba(18,49,66,0.16)] grid grid-cols-4 py-3.5 px-2 gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <EkamSkeletonBlock
                reducedMotion={reducedMotion}
                tone={idx === 0 ? 'copper' : 'neutral'}
                delay={idx * 0.05}
                className="w-10 h-10 rounded-xl"
              />
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={idx * 0.05} className="h-2.5 w-11 rounded" />
            </div>
          ))}
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-5 space-y-5"
      >
        {/* Spotlight Split */}
        <motion.div variants={itemVariants} className="grid grid-cols-[1.45fr_1fr] gap-3">
          <div className="rounded-[22px] bg-[#123142]/15 dark:bg-[#123142]/40 p-4 min-h-[112px] flex flex-col justify-between">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" className="h-3 w-20 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="navy" delay={0.08} className="h-4 w-32 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={0.14} className="h-3 w-24 rounded-md" />
          </div>
          <div className="rounded-[22px] bg-[#D85D27]/16 p-4 min-h-[112px] flex flex-col justify-between">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-7 h-7 rounded-full" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={0.08} className="h-5 w-18 rounded-md" />
          </div>
        </motion.div>

        {/* Journal Feed Card Skeletons */}
        {[0, 1, 2].map((idx) => (
          <EkamCardShell key={idx} variants={itemVariants} className="p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <EkamSkeletonBlock
                  reducedMotion={reducedMotion}
                  tone={idx === 0 ? 'navy' : 'teal'}
                  className="w-11 h-11 rounded-2xl shrink-0"
                />
                <div className="space-y-1.5">
                  <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-4 w-32 rounded-md" />
                  <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.08} className="h-3 w-40 rounded-md" />
                </div>
              </div>
              <EkamSkeletonBlock reducedMotion={reducedMotion} className="w-9 h-9 rounded-xl shrink-0" />
            </div>
            <div className="space-y-2">
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.05} className="h-3.5 w-full rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.1} className="h-3.5 w-[88%] rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.15} className="h-3.5 w-[64%] rounded-md" />
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-white/8 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <EkamSkeletonBlock key={j} reducedMotion={reducedMotion} delay={j * 0.04} className="h-4 w-12 mx-auto rounded-md" />
              ))}
            </div>
          </EkamCardShell>
        ))}
      </motion.div>
    </div>
  );
}

export function GroupsHubSkeleton({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.04);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.94);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Groups"
      className="min-h-full bg-gradient-to-b from-[#ECEEF7]/85 via-[#F4F5FA] to-[#F8F9FC] dark:from-[#121622] dark:via-[#0B0D14] dark:to-[#0A0C12] pb-8"
    >
      {/* Navy Architectural Header */}
      <div className="bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#173E52] px-5 pt-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-7 w-28 rounded-xl" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" delay={0.08} className="h-3 w-40 rounded-md" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" delay={0.12} className="h-3 w-44 rounded-md" />
          </div>
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-10 w-22 rounded-xl" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/10">
          {[0, 1, 2].map((i) => (
            <EkamSkeletonBlock
              key={i}
              reducedMotion={reducedMotion}
              tone="dark-surface"
              delay={i * 0.06}
              className="h-8.5 rounded-xl"
            />
          ))}
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-4 space-y-4"
      >
        <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-11.5 w-full rounded-2xl" />
        <div className="flex items-center gap-2">
          {(['w-16', 'w-22', 'w-24', 'w-20'] as const).map((widthClass, i) => (
            <EkamSkeletonBlock
              key={i}
              reducedMotion={reducedMotion}
              delay={i * 0.05}
              className={`h-8 ${widthClass} rounded-xl shrink-0`}
            />
          ))}
        </div>

        {/* Group Cards */}
        {[0, 1, 2].map((idx) => (
          <EkamCardShell key={idx} variants={itemVariants} className="p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1">
                <EkamSkeletonBlock
                  reducedMotion={reducedMotion}
                  tone={idx === 0 ? 'copper' : 'navy'}
                  className="w-13 h-13 rounded-2xl shrink-0"
                />
                <div className="space-y-2 flex-1 pt-0.5">
                  <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-4.5 w-40 rounded-md" />
                  <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.08} className="h-3 w-32 rounded-md" />
                </div>
              </div>
              <EkamSkeletonBlock reducedMotion={reducedMotion} className="w-9 h-9 rounded-xl shrink-0" />
            </div>
            <div className="space-y-1.5">
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.06} className="h-3 w-full rounded-md" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} delay={0.12} className="h-3 w-4/5 rounded-md" />
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {[0, 1, 2].map((a) => (
                    <EkamSkeletonBlock key={a} reducedMotion={reducedMotion} className="w-6.5 h-6.5 rounded-full" />
                  ))}
                </div>
                <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-3 w-18 rounded-md" />
              </div>
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-4 w-14 rounded-md" />
            </div>
          </EkamCardShell>
        ))}
      </motion.div>
    </div>
  );
}

export function FeedListSkeleton({
  variant = 'generic',
  reducedMotion = false,
}: {
  variant?:
    | 'opportunity'
    | 'chapter_feed'
    | 'connections'
    | 'visitors'
    | 'meetings'
    | 'm2o'
    | 'events'
    | 'reports'
    | 'testimonials'
    | 'notifications'
    | 'search'
    | 'messages'
    | 'profile'
    | 'group_view'
    | 'generic';
  reducedMotion?: boolean;
}) {
  const listVariants = createStaggerListVariants(reducedMotion, 0.055, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading screen content"
      className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col"
    >
      {/* Top SubHeader Placeholder */}
      {variant === 'profile' || variant === 'group_view' ? (
        <div className="bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#173E52] px-4 pt-4 pb-10 space-y-4">
          <div className="flex items-center gap-2.5">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="w-10 h-10 rounded-xl" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-5 w-32 rounded-lg" />
          </div>
          {variant === 'group_view' && (
            <div className="flex items-center gap-3.5 pt-1">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="w-14 h-14 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-5 w-44 rounded-lg" />
                <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-3 w-32 rounded-md" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-3.5 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EkamSkeletonBlock reducedMotion={reducedMotion} className="w-10 h-10 rounded-xl" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-5 w-36 rounded-lg" />
          </div>
          <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-9 w-20 rounded-xl" />
        </div>
      )}

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="p-4 space-y-3.5 flex-1"
      >
        {/* Profile Floating Identity Card */}
        {variant === 'profile' && (
          <EkamCardShell variants={itemVariants} className="-mt-10 p-5 flex flex-col items-center space-y-3">
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-18 h-18 rounded-full" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-5 w-40 rounded-lg" />
            <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="h-3 w-48 rounded-md" />
            <div className="w-full pt-3 border-t border-slate-100 dark:border-white/8 grid grid-cols-2 gap-4">
              <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-9 rounded-xl" />
              <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-9 rounded-xl" />
            </div>
          </EkamCardShell>
        )}

        {/* Reports Chart Skeleton */}
        {variant === 'reports' && (
          <>
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <EkamCardShell key={i} className="p-4 space-y-2.5">
                  <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-3 w-24 rounded-md" />
                  <EkamSkeletonBlock reducedMotion={reducedMotion} tone={i % 2 === 0 ? 'copper' : 'navy'} className="h-7 w-14 rounded-lg" />
                </EkamCardShell>
              ))}
            </motion.div>
            <EkamCardShell variants={itemVariants} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-4 w-36 rounded-md" />
                <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-3 w-20 rounded-md" />
              </div>
              <div className="h-24 flex items-end justify-around gap-3 pt-2">
                {(['h-10', 'h-16', 'h-13', 'h-20', 'h-15', 'h-22'] as const).map((heightClass, i) => (
                  <EkamSkeletonBlock
                    key={i}
                    reducedMotion={reducedMotion}
                    tone={i === 5 ? 'copper' : 'navy'}
                    delay={i * 0.06}
                    className={`w-6 ${heightClass} rounded-md`}
                  />
                ))}
              </div>
            </EkamCardShell>
          </>
        )}

        {/* Meetings Dark Hero Skeleton */}
        {variant === 'meetings' && (
          <motion.div
            variants={itemVariants}
            className="rounded-3xl bg-gradient-to-br from-[#0F2634] to-[#173B4E] p-5 space-y-4 border border-white/10"
          >
            <div className="flex items-center gap-3.5">
              <EkamSkeletonBlock reducedMotion={reducedMotion} tone="copper" className="w-12 h-13 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-5 w-36 rounded-md" />
                <EkamSkeletonBlock reducedMotion={reducedMotion} tone="dark-surface" className="h-3 w-44 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <EkamSkeletonBlock
                  key={i}
                  reducedMotion={reducedMotion}
                  tone="dark-surface"
                  delay={i * 0.04}
                  className="h-12 rounded-xl"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Search / Tab Strip for List Screens */}
        {variant !== 'profile' && variant !== 'reports' && variant !== 'meetings' && (
          <motion.div variants={itemVariants} className="space-y-2.5">
            <EkamSkeletonBlock reducedMotion={reducedMotion} className="h-11 w-full rounded-xl" />
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <EkamSkeletonBlock
                  key={i}
                  reducedMotion={reducedMotion}
                  tone={i === 0 ? 'copper' : 'neutral'}
                  delay={i * 0.05}
                  className="h-9 rounded-xl"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Staggered List Rows */}
        {variant !== 'reports' &&
          [0, 1, 2, 3].map((row) => (
            <EkamCardShell key={row} variants={itemVariants} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <EkamSkeletonBlock
                    reducedMotion={reducedMotion}
                    tone={row % 2 === 0 ? 'navy' : 'copper'}
                    delay={row * 0.05}
                    className="w-11 h-11 rounded-2xl shrink-0"
                  />
                  <div className="space-y-2 flex-1">
                    <EkamSkeletonBlock reducedMotion={reducedMotion} delay={row * 0.05} className="h-4 w-40 rounded-md" />
                    <EkamSkeletonBlock reducedMotion={reducedMotion} delay={row * 0.05 + 0.06} className="h-3 w-52 rounded-md" />
                  </div>
                </div>
                <EkamSkeletonBlock reducedMotion={reducedMotion} delay={row * 0.05} className="w-14 h-7 rounded-xl shrink-0" />
              </div>
              {(variant === 'opportunity' || variant === 'chapter_feed' || variant === 'testimonials' || variant === 'group_view') && (
                <div className="space-y-1.5 pt-1">
                  <EkamSkeletonBlock reducedMotion={reducedMotion} delay={row * 0.06} className="h-3 w-full rounded-md" />
                  <EkamSkeletonBlock reducedMotion={reducedMotion} delay={row * 0.06 + 0.06} className="h-3 w-3/4 rounded-md" />
                </div>
              )}
            </EkamCardShell>
          ))}
      </motion.div>
    </div>
  );
}

export function ScreenSkeletonRouter({
  screen,
  reducedMotion = false,
}: {
  screen: ScreenId;
  reducedMotion?: boolean;
}) {
  if (screen === 'dashboard') {
    return <DashboardSkeleton reducedMotion={reducedMotion} />;
  }
  if (screen === 'business_home') {
    return <BusinessHubSkeleton reducedMotion={reducedMotion} />;
  }
  if (screen === 'prof_home') {
    return <ProfessionalHubSkeleton reducedMotion={reducedMotion} />;
  }
  if (screen === 'groups_home') {
    return <GroupsHubSkeleton reducedMotion={reducedMotion} />;
  }

  const mapVariant: Partial<
    Record<
      ScreenId,
      | 'opportunity'
      | 'chapter_feed'
      | 'connections'
      | 'visitors'
      | 'meetings'
      | 'm2o'
      | 'events'
      | 'reports'
      | 'testimonials'
      | 'notifications'
      | 'search'
      | 'messages'
      | 'profile'
      | 'group_view'
    >
  > = {
    opportunity: 'opportunity',
    chapter_feed: 'chapter_feed',
    connections: 'connections',
    visitors: 'visitors',
    meetings: 'meetings',
    many_to_one: 'm2o',
    events: 'events',
    reports: 'reports',
    testimonials: 'testimonials',
    notifications: 'notifications',
    search: 'search',
    messages: 'messages',
    profile: 'profile',
    group_view: 'group_view',
  };

  return (
    <FeedListSkeleton
      variant={mapVariant[screen] || 'generic'}
      reducedMotion={reducedMotion}
    />
  );
}

export function SkeletonCrossfade({
  loading,
  skeleton,
  children,
  reducedMotion = false,
  className = 'min-h-full',
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  reducedMotion?: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div
          key="ekam-skeleton"
          initial={{ opacity: reducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.08 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={className}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="ekam-content"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
