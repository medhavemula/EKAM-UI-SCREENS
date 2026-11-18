import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Compass,
  Eye,
  EyeOff,
  Globe,
  Handshake,
  Home,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Pause,
  Phone,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue } from 'motion/react';
import { ScreenId, ThemeMode } from '../../types/ekam';
import { ConstellationBackdrop, EkamWordmark, PremiumButton } from '../EkamBrand';
import { EkamGlobeSplash3D } from '../EkamGlobeSplash3D';

const PATTERN_ICONS = [
  { Icon: Briefcase, x: '11%', y: '10%', rot: -14, delay: 0.1 },
  { Icon: Handshake, x: '34%', y: '7%', rot: 10, delay: 0.16 },
  { Icon: TrendingUp, x: '62%', y: '9%', rot: -8, delay: 0.22 },
  { Icon: Building2, x: '84%', y: '13%', rot: 12, delay: 0.28 },
  { Icon: Users, x: '18%', y: '23%', rot: 8, delay: 0.18 },
  { Icon: Calendar, x: '78%', y: '25%', rot: -10, delay: 0.24 },
  { Icon: Globe, x: '14%', y: '70%', rot: -12, delay: 0.2 },
  { Icon: MessageSquare, x: '82%', y: '68%', rot: 14, delay: 0.26 },
  { Icon: Award, x: '26%', y: '83%', rot: 10, delay: 0.3 },
  { Icon: Sparkles, x: '53%', y: '86%', rot: -6, delay: 0.34 },
  { Icon: ShieldCheck, x: '76%', y: '81%', rot: 8, delay: 0.32 },
  { Icon: Compass, x: '48%', y: '15%', rot: 6, delay: 0.14 },
];

export function SplashScreen({
  theme,
  onToggleTheme,
  reducedMotion = false,
  onFinish,
}: {
  theme: ThemeMode;
  onToggleTheme: () => void;
  reducedMotion?: boolean;
  onFinish: () => void;
}) {
  const [cycleKey, setCycleKey] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(!reducedMotion);
  const [isSweeping, setIsSweeping] = useState(false);
  const bgPulseOpacity = useMotionValue(reducedMotion ? 1 : 0.9);

  const triggerSweepToLogin = () => {
    if (isSweeping) return;
    if (reducedMotion) {
      onFinish();
      return;
    }
    setIsSweeping(true);
  };

  useEffect(() => {
    setIsSweeping(false);
  }, [cycleKey]);

  useEffect(() => {
    if (isSweeping) {
      const ctrl = animate(bgPulseOpacity, 0, { duration: 0.3 });
      return () => ctrl.stop();
    }
    if (reducedMotion) {
      bgPulseOpacity.set(1);
      return;
    }
    bgPulseOpacity.set(0.9);
    const ctrl = animate(bgPulseOpacity, 1, {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    });
    return () => ctrl.stop();
  }, [bgPulseOpacity, isSweeping, reducedMotion, cycleKey]);

  useEffect(() => {
    if (!autoAdvance || reducedMotion || isSweeping) return;
    const t = window.setTimeout(() => {
      setIsSweeping(true);
    }, 3000);
    return () => window.clearTimeout(t);
  }, [autoAdvance, reducedMotion, isSweeping, cycleKey]);

  useEffect(() => {
    if (!isSweeping) return;
    const t = window.setTimeout(() => {
      onFinish();
    }, 560);
    return () => window.clearTimeout(t);
  }, [isSweeping, onFinish]);

  return (
    <div
      key={cycleKey}
      className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] text-slate-900 dark:text-white flex flex-col justify-between p-6 relative overflow-hidden select-none"
    >
      <motion.div
        aria-hidden="true"
        style={{ opacity: bgPulseOpacity }}
        className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-[#FAFAFC] via-[#EFF4F7] to-[#FAFAFC] dark:from-[#0B0B0F] dark:via-[#101822] dark:to-[#0B0B0F]"
      >
        {PATTERN_ICONS.map(({ Icon, x, y, rot, delay }, idx) => (
          <motion.div
            key={idx}
            initial={
              reducedMotion
                ? { opacity: theme === 'dark' ? 0.22 : 0.18, scale: 1 }
                : { opacity: 0, scale: 0.65 }
            }
            animate={{
              opacity: theme === 'dark' ? 0.22 : 0.18,
              scale: 1,
              y: reducedMotion ? 0 : [0, idx % 2 === 0 ? -4 : 4, 0],
            }}
            transition={{
              opacity: { duration: 0.45, delay: reducedMotion ? 0 : delay },
              scale: { duration: 0.45, delay: reducedMotion ? 0 : delay },
              y: reducedMotion
                ? { duration: 0 }
                : { duration: 4.5 + (idx % 3), repeat: Infinity, ease: 'easeInOut', delay },
            }}
            style={{ left: x, top: y, rotate: `${rot}deg` }}
            className={`absolute ${
              idx % 3 === 0
                ? 'text-[#D85D27]'
                : 'text-[#123142] dark:text-slate-300'
            }`}
          >
            <Icon className="w-7 h-7" strokeWidth={1.75} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        animate={{ opacity: isSweeping ? 0 : 1, y: isSweeping ? -10 : 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-20 flex items-center justify-between"
      >
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#123142]/70 dark:text-slate-400">
          Fortune · Hyd
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setAutoAdvance(true);
              setCycleKey((k) => k + 1);
            }}
            aria-label="Replay splash animation"
            title="Replay splash animation"
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-[#D85D27]/50 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAutoAdvance((v) => !v)}
            aria-label={autoAdvance ? 'Pause auto-transition' : 'Resume auto-transition'}
            title={autoAdvance ? 'Pause auto-transition' : 'Resume auto-transition'}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-[#D85D27]/50 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            {autoAdvance ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-[#D85D27]/50 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? { opacity: 0.3, scale: 1 } : { opacity: 0.15, scale: 0.9 }}
        animate={
          isSweeping
            ? { opacity: 0, scale: 1.35 }
            : reducedMotion
            ? { opacity: 0.3, scale: 1 }
            : { opacity: [0.22, 0.46, 0.22], scale: [0.94, 1.08, 0.94] }
        }
        transition={
          isSweeping
            ? { duration: 0.35 }
            : reducedMotion
            ? { duration: 0.2 }
            : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
        }
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle,rgba(216,93,39,0.16)_0%,rgba(18,49,66,0.12)_48%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(243,139,30,0.2)_0%,rgba(18,49,66,0.28)_48%,transparent_72%)]" />
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={reducedMotion ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  scale: { type: 'spring', duration: 0.6, bounce: 0.26 },
                  opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                }
          }
          style={{ transformOrigin: 'center center' }}
          className="container relative w-[276px] h-[276px] flex items-center justify-center"
        >
          {!reducedMotion && !isSweeping && (
            <>
              <motion.div
                initial={{ scale: 0.88, opacity: 0.4 }}
                animate={{ scale: 1.34, opacity: 0 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-[#D85D27]/35 pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.88, opacity: 0.32 }}
                animate={{ scale: 1.34, opacity: 0 }}
                transition={{ duration: 2.4, delay: 1.2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-[#123142]/30 dark:border-white/20 pointer-events-none"
              />
            </>
          )}

          <motion.div
            initial={reducedMotion ? { opacity: 0.28, scale: 1 } : { opacity: 0, scale: 0.8 }}
            animate={
              isSweeping
                ? { opacity: 0, scale: 1.5 }
                : { opacity: [0.22, 0.38, 0.22], scale: [0.96, 1.06, 0.96] }
            }
            transition={
              isSweeping
                ? { duration: 0.35 }
                : reducedMotion
                ? { duration: 0.2 }
                : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }
            className="absolute inset-6 rounded-full bg-[#D85D27]/20 blur-2xl pointer-events-none"
          />

          <motion.div
            initial={
              reducedMotion
                ? { scale: 1, y: 0, opacity: 1 }
                : { scale: 0.8, y: 0, opacity: 0 }
            }
            animate={
              isSweeping
                ? { scale: 2.75, y: 295, opacity: 1 }
                : { scale: 1, y: 0, opacity: 1 }
            }
            transition={
              isSweeping
                ? { duration: 0.56, ease: [0.22, 1, 0.36, 1] }
                : reducedMotion
                ? { duration: 0 }
                : {
                    scale: { type: 'spring', duration: 0.6, bounce: 0.26 },
                    opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  }
            }
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg viewBox="0 0 280 280" className="w-full h-full drop-shadow-[0_24px_38px_rgba(18,49,66,0.28)]">
              <defs>
                <linearGradient id="ekamSplashCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0E2635" />
                  <stop offset="55%" stopColor="#123142" />
                  <stop offset="100%" stopColor="#1A455B" />
                </linearGradient>
                <linearGradient id="ekamSplashRim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F38B1E" stopOpacity="0.65" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#D85D27" stopOpacity="0.45" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="140"
                cy="140"
                r="134"
                fill="none"
                stroke="#D85D27"
                strokeWidth="1.25"
                initial={{ opacity: 0.25 }}
                animate={
                  reducedMotion || isSweeping
                    ? { opacity: isSweeping ? 0 : 0.25 }
                    : { opacity: [0.16, 0.44, 0.16] }
                }
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle
                cx="140"
                cy="140"
                r="126"
                fill="url(#ekamSplashCircleGrad)"
                stroke="url(#ekamSplashRim)"
                strokeWidth="2.5"
              />
            </svg>
          </motion.div>

          <motion.div
            initial={reducedMotion ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 6 }}
            animate={
              isSweeping
                ? { scale: 0.64, opacity: 1, y: -248 }
                : { scale: 1, opacity: 1, y: 0 }
            }
            transition={
              isSweeping
                ? { duration: 0.54, ease: [0.22, 1, 0.36, 1] }
                : reducedMotion
                ? { duration: 0 }
                : { delay: 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
            }
            className="relative z-20 flex flex-col items-center text-center"
          >
            <EkamWordmark light={!isSweeping} size="lg" animated reducedMotion={reducedMotion} />
            <motion.p
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: isSweeping ? 0 : 1, y: 0 }}
              transition={{ delay: isSweeping || reducedMotion ? 0 : 0.72, duration: 0.34 }}
              className="mt-2.5 text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-300"
            >
              Chapters · Referrals
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.p
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: isSweeping ? 0 : 1, y: isSweeping ? 8 : 0 }}
          transition={{ delay: isSweeping || reducedMotion ? 0 : 0.55, duration: 0.35 }}
          className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide text-center"
        >
          Trusted business network &amp; chapter hub
        </motion.p>
      </div>

      <motion.div
        animate={{ opacity: isSweeping ? 0 : 1, y: isSweeping ? 18 : 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-xs mx-auto space-y-3 relative z-20 pb-2"
      >
        {autoAdvance && !reducedMotion && (
          <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <motion.div
              key={`prog-${cycleKey}`}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.0, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-[#D85D27] to-[#BE4D14] rounded-full"
            />
          </div>
        )}
        <PremiumButton fullWidth onClick={triggerSweepToLogin}>
          Enter EKAM
        </PremiumButton>
      </motion.div>
    </div>
  );
}

export function LoginScreen({
  theme,
  onToggleTheme,
  reducedMotion = false,
  onReplaySplash,
  onSignIn,
  onNavigate,
}: {
  theme: ThemeMode;
  onToggleTheme: () => void;
  reducedMotion?: boolean;
  onReplaySplash?: () => void;
  onSignIn: (email: string) => void;
  onNavigate: (s: ScreenId) => void;
}) {
  const [email, setEmail] = useState('khajapeer.mulla@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [agreed, setAgreed] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const canSubmit = email.trim().length > 3 && password.trim().length >= 4 && agreed;

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col justify-between relative overflow-hidden">
      {/* Top Bar + Settled Wordmark (matches Smart-Animate arrival from Splash) */}
      <div className="px-6 pt-6 pb-2 relative z-10">
        <div className="flex items-center justify-between mb-5">
          {onReplaySplash ? (
            <button
              type="button"
              onClick={onReplaySplash}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#D85D27]/50 hover:text-[#D85D27] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Splash</span>
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-[#D85D27]/50 flex items-center justify-center transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                }
          }
          style={{ transformOrigin: 'center center' }}
          className="flex flex-col items-center justify-center text-center mx-auto py-1"
        >
          <div className="flex items-center justify-center">
            <EkamWordmark light={theme === 'dark'} size="md" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-3.5">
            Welcome back
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Sign in to your EKAM chapter workspace.
          </p>
        </motion.div>
      </div>

      {/* Form Card */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: reducedMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="mx-5 my-3 relative z-10 rounded-3xl bg-white dark:bg-[#171923] border border-slate-300/90 dark:border-white/18 ring-1 ring-[#123142]/[0.06] dark:ring-white/[0.07] p-5 shadow-[0_18px_40px_-12px_rgba(18,49,66,0.16),0_4px_12px_-2px_rgba(18,49,66,0.07)] dark:shadow-[0_20px_44px_-12px_rgba(0,0,0,0.72)]"
      >
        <form
          className="space-y-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) onSignIn(email);
          }}
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full h-11 px-4 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 pl-4 pr-12 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/20"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-[#D85D27]"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot_password')}
              className="text-xs font-semibold text-[#D85D27] hover:text-[#BE4D14] cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <div className="pt-0.5 flex items-start gap-2.5">
            <input
              id="login-agree"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#D85D27] shrink-0 cursor-pointer"
            />
            <label htmlFor="login-agree" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="font-semibold text-[#D85D27] underline underline-offset-2 cursor-pointer"
              >
                Terms of Use and Privacy Policy
              </button>
              .
            </label>
          </div>

          <div className="pt-1.5">
            <PremiumButton type="submit" fullWidth size="lg" disabled={!canSubmit}>
              Sign in
            </PremiumButton>
          </div>
        </form>
      </motion.div>

      {/* Sweeping Bottom Curved Wave (morphed destination of the Splash blob) */}
      <motion.div
        initial={reducedMotion ? false : { y: 46, opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-auto pt-12 pb-6 px-6 text-center text-white"
      >
        <svg
          viewBox="0 0 400 130"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            <linearGradient id="ekamLoginWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0E2635" />
              <stop offset="100%" stopColor="#123142" />
            </linearGradient>
          </defs>
          <path
            d="M 0 18 C 95 62, 235 68, 400 96 L 400 130 L 0 130 Z"
            fill="url(#ekamLoginWaveGrad)"
          />
          <path
            d="M 0 18 C 95 62, 235 68, 400 96"
            fill="none"
            stroke="#D85D27"
            strokeWidth="2.5"
            strokeOpacity="0.85"
          />
        </svg>

        <div className="relative z-10 text-xs text-slate-200 pt-5">
          New to EKAM?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="font-semibold text-[#FF945E] hover:text-white underline underline-offset-2 cursor-pointer"
          >
            Apply for membership
          </button>
        </div>
      </motion.div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#151519] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Terms &amp; Conditions</h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              By using EKAM you agree to participate in good faith across business referrals, chapter meetings, and
              community spaces. There is zero tolerance for objectionable content or abusive conduct.
            </p>
            <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#D85D27]"
              />
              <span>I have read and agree to the Terms of Use and Privacy Policy.</span>
            </label>
            <div className="flex gap-2.5 pt-1">
              <PremiumButton variant="secondary" fullWidth onClick={() => setShowTermsModal(false)}>
                Close
              </PremiumButton>
              <PremiumButton
                fullWidth
                onClick={() => {
                  setAgreed(true);
                  setShowTermsModal(false);
                }}
              >
                Agree
              </PremiumButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RegisterScreen({
  theme = 'light',
  onToggleTheme,
  reducedMotion = false,
  onBack,
  onComplete,
}: {
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  reducedMotion?: boolean;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [[step, direction], setStepState] = useState<[number, number]>([1, 1]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [chapter, setChapter] = useState('Fortune · Hyderabad');

  const goToStep = (next: number) => {
    if (next === step) return;
    setStepState([next, next > step ? 1 : -1]);
  };

  const sharedSpring = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 290, damping: 28, mass: 0.95 };

  const headerVariants = {
    enter: (dir: number) =>
      reducedMotion
        ? { opacity: 1, x: 0 }
        : { opacity: 0, x: dir * 24, filter: 'blur(3px)' },
    center: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: reducedMotion ? { duration: 0 } : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: (dir: number) =>
      reducedMotion
        ? { opacity: 1, x: 0 }
        : {
            opacity: 0,
            x: dir * -24,
            filter: 'blur(3px)',
            transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
          },
  };

  const stepBodyVariants = {
    enter: (dir: number) =>
      reducedMotion
        ? { opacity: 1, x: 0 }
        : { opacity: 0, x: dir * 32, scale: 0.97 },
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: reducedMotion
        ? { duration: 0 }
        : {
            x: { type: 'spring' as const, stiffness: 290, damping: 28 },
            opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
            scale: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
          },
    },
    exit: (dir: number) =>
      reducedMotion
        ? { opacity: 1, x: 0 }
        : {
            opacity: 0,
            x: dir * -32,
            scale: 0.97,
            transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
          },
  };

  const stepMeta = [
    {
      title: 'About you',
      subtitle: 'Tell us who you are. Your chapter will use these details to reach you.',
    },
    {
      title: 'Your business',
      subtitle: 'Select your primary business identity and preferred EKAM chapter.',
    },
    {
      title: 'Application ready',
      subtitle: `Your membership request for ${chapter} is ready to submit.`,
    },
  ][step - 1];

  return (
    <LayoutGroup id="ekam-register-flow">
      <div className="min-h-full bg-[#F4F6FA] dark:bg-[#090B10] flex flex-col relative">
        {/* Rich Architectural Header Banner */}
        <div className="relative bg-gradient-to-br from-[#0A1D29] via-[#123142] to-[#1A465C] px-5 pt-6 pb-20 text-white overflow-hidden border-b border-white/10">
          {/* Atmospheric Warm & Cool Depth (Parallax-linked to step) */}
          <motion.div
            aria-hidden="true"
            animate={reducedMotion ? undefined : { x: (step - 1) * -18 }}
            transition={sharedSpring}
            className="pointer-events-none absolute -inset-x-8 inset-y-0 bg-[radial-gradient(circle_at_88%_14%,rgba(243,139,30,0.22),transparent_48%),radial-gradient(circle_at_10%_12%,rgba(56,189,248,0.12),transparent_44%)]"
          />
          {/* Subtle Precision Arcs */}
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 400 220"
            animate={reducedMotion ? undefined : { x: (step - 1) * 14 }}
            transition={sharedSpring}
            className="pointer-events-none absolute inset-0 w-full h-full opacity-20"
            fill="none"
          >
            <circle cx="48" cy="184" r="118" stroke="white" strokeOpacity="0.18" strokeDasharray="3 5" />
            <circle cx="352" cy="36" r="96" stroke="#F38B1E" strokeOpacity="0.35" />
          </motion.svg>
          <ConstellationBackdrop />

          <div className="relative z-10 flex items-center justify-between">
            <button
              type="button"
              onClick={step > 1 ? () => goToStep(step - 1) : onBack}
              className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 hover:bg-white/18 hover:border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <EkamWordmark light size="sm" />
            {onToggleTheme ? (
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Toggle theme"
                className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 hover:bg-white/18 hover:border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-9" />
            )}
          </div>

          <div className="relative z-10 mt-6 text-center px-3 min-h-[72px] flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={`reg-header-${step}`}
                custom={direction}
                variants={headerVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <h1 className="font-display text-[24px] font-bold tracking-tight text-white">
                  {stepMeta.title}
                </h1>
                <p className="mt-2 text-[12.5px] text-slate-200/85 max-w-[276px] mx-auto leading-relaxed">
                  {stepMeta.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Persistent Shared Elevated Floating Card */}
        <motion.div
          layout={!reducedMotion}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            layout: sharedSpring,
          }}
          className="-mt-12 mx-4 mb-5 flex-1 relative z-10 rounded-[28px] bg-white dark:bg-[#161822] border border-slate-200/95 dark:border-white/15 ring-1 ring-[#123142]/[0.05] dark:ring-white/[0.06] p-6 pt-6 pb-6 shadow-[0_24px_50px_-14px_rgba(18,49,66,0.22),0_6px_16px_-4px_rgba(18,49,66,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_24px_52px_-14px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col justify-between overflow-hidden"
        >
          {/* Top Accent Specular Line */}
          <div
            aria-hidden="true"
            className="absolute inset-x-8 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D85D27]/55 to-transparent"
          />

          {/* Shared-Element Step Progress Indicator */}
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-white/8">
            <div className="flex items-center gap-1.5 flex-1">
              {[1, 2, 3].map((n) => {
                const isActive = n === step;
                const isDone = n < step;
                return (
                  <motion.div
                    key={n}
                    layout={!reducedMotion}
                    transition={sharedSpring}
                    style={{ flex: isActive ? 2.2 : 1, borderRadius: 9999 }}
                    className={`relative h-1.5 overflow-hidden ${
                      isDone
                        ? 'bg-[#D85D27]/55'
                        : 'bg-slate-200/90 dark:bg-white/12'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="reg-step-active"
                        transition={sharedSpring}
                        style={{ borderRadius: 9999 }}
                        className="absolute inset-0 bg-gradient-to-r from-[#D85D27] to-[#F38B1E] shadow-[0_0_8px_rgba(216,93,39,0.45)]"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums shrink-0 pl-2 inline-flex items-center gap-1">
              <span>Step</span>
              <span className="relative inline-flex w-2.5 justify-center overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  <motion.span
                    key={step}
                    custom={direction}
                    initial={reducedMotion ? false : { y: direction * 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reducedMotion ? undefined : { y: direction * -10, opacity: 0 }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>of 3</span>
            </span>
          </div>

          {/* Step Content Viewport with Directional + Shared-Surface Transitions */}
          <div className="relative flex-1 flex flex-col">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              {step === 1 && (
                <motion.div
                  key="reg-body-1"
                  custom={direction}
                  variants={stepBodyVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full space-y-4"
                >
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 tracking-tight">
                      Full name
                    </label>
                    <div className="relative group">
                      <motion.div
                        layoutId="reg-shared-surface-1"
                        transition={sharedSpring}
                        style={{ borderRadius: 16 }}
                        className="pointer-events-none absolute inset-0 bg-[#F4F6F9] dark:bg-[#0F1118] border border-slate-200/90 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-colors duration-150 group-focus-within:bg-white dark:group-focus-within:bg-[#151822] group-focus-within:border-[#D85D27] group-focus-within:ring-4 group-focus-within:ring-[#D85D27]/12"
                      />
                      <User className="z-10 w-4 h-4 text-slate-400 group-focus-within:text-[#D85D27] transition-colors pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full name"
                        className="relative z-10 w-full h-12 pl-10 pr-4 rounded-2xl bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400/90 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 tracking-tight">
                      Email
                    </label>
                    <div className="relative group">
                      <motion.div
                        layoutId="reg-shared-surface-2"
                        transition={sharedSpring}
                        style={{ borderRadius: 16 }}
                        className="pointer-events-none absolute inset-0 bg-[#F4F6F9] dark:bg-[#0F1118] border border-slate-200/90 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-colors duration-150 group-focus-within:bg-white dark:group-focus-within:bg-[#151822] group-focus-within:border-[#D85D27] group-focus-within:ring-4 group-focus-within:ring-[#D85D27]/12"
                      />
                      <Mail className="z-10 w-4 h-4 text-slate-400 group-focus-within:text-[#D85D27] transition-colors pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="relative z-10 w-full h-12 pl-10 pr-4 rounded-2xl bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400/90 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 tracking-tight">
                      Mobile number
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        placeholder="Code"
                        aria-label="Country code"
                        className="h-12 px-3 text-center font-mono-tabular font-medium rounded-2xl bg-[#F4F6F9] dark:bg-[#0F1118] border border-slate-200/90 dark:border-white/10 text-sm text-slate-900 dark:text-white transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-[#151822] focus:border-[#D85D27] focus:ring-4 focus:ring-[#D85D27]/12 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)]"
                      />
                      <div className="col-span-2 relative group">
                        <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-[#D85D27] transition-colors pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Mobile number"
                          className="w-full h-12 pl-10 pr-4 rounded-2xl bg-[#F4F6F9] dark:bg-[#0F1118] border border-slate-200/90 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400/90 transition-all duration-150 focus:outline-none focus:bg-white dark:focus:bg-[#151822] focus:border-[#D85D27] focus:ring-4 focus:ring-[#D85D27]/12 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)]"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="reg-body-2"
                  custom={direction}
                  variants={stepBodyVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full space-y-4"
                >
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 tracking-tight">
                      Business name
                    </label>
                    <div className="relative group">
                      <motion.div
                        layoutId="reg-shared-surface-1"
                        transition={sharedSpring}
                        style={{ borderRadius: 16 }}
                        className="pointer-events-none absolute inset-0 bg-[#F4F6F9] dark:bg-[#0F1118] border border-slate-200/90 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-colors duration-150 group-focus-within:bg-white dark:group-focus-within:bg-[#151822] group-focus-within:border-[#D85D27] group-focus-within:ring-4 group-focus-within:ring-[#D85D27]/12"
                      />
                      <Building2 className="z-10 w-4 h-4 text-slate-400 group-focus-within:text-[#D85D27] transition-colors pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Business name"
                        className="relative z-10 w-full h-12 pl-10 pr-4 rounded-2xl bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400/90 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 tracking-tight">
                      Preferred chapter
                    </label>
                    <div className="relative group">
                      <motion.div
                        layoutId="reg-shared-surface-2"
                        transition={sharedSpring}
                        style={{ borderRadius: 16 }}
                        className="pointer-events-none absolute inset-0 bg-[#F4F6F9] dark:bg-[#0F1118] border border-slate-200/90 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-colors duration-150 group-focus-within:bg-white dark:group-focus-within:bg-[#151822] group-focus-within:border-[#D85D27] group-focus-within:ring-4 group-focus-within:ring-[#D85D27]/12"
                      />
                      <MapPin className="z-10 w-4 h-4 text-slate-400 group-focus-within:text-[#D85D27] transition-colors pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        className="relative z-10 w-full h-12 pl-10 pr-10 appearance-none rounded-2xl bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option>Fortune · Hyderabad</option>
                        <option>Alliance · Hyderabad</option>
                        <option>Harmony · Hyderabad</option>
                      </select>
                      <ChevronDown className="z-10 w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="reg-body-3"
                  custom={direction}
                  variants={stepBodyVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full flex-1 flex flex-col items-center justify-center text-center py-6 space-y-4"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md" />
                    {/* Shared-Element Morph: Field Surface 1 transforms smoothly into confirmation halo */}
                    <motion.div
                      layoutId="reg-shared-surface-1"
                      transition={sharedSpring}
                      style={{ borderRadius: 32 }}
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/35 shadow-sm"
                    />
                    <motion.div
                      initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={reducedMotion ? { duration: 0 } : { delay: 0.14, type: 'spring', stiffness: 420, damping: 22 }}
                      className="relative z-10 text-emerald-600 dark:text-emerald-400"
                    >
                      <Check className="w-7 h-7 stroke-[2.5]" />
                    </motion.div>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Application ready
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                      Your membership request for{' '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{chapter}</span> is ready to
                      submit.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Persistent Shared Primary Action Footer */}
          <motion.div
            layout={!reducedMotion}
            transition={{ layout: sharedSpring }}
            className="pt-4 mt-4 border-t border-slate-100 dark:border-white/8"
          >
            <PremiumButton
              fullWidth
              size="lg"
              onClick={() => {
                if (step < 3) goToStep(step + 1);
                else onComplete();
              }}
              className="!rounded-full h-12 font-semibold bg-gradient-to-r from-[#D85D27] to-[#C8511B] hover:from-[#C8511B] hover:to-[#B54614] shadow-[0_12px_26px_-6px_rgba(216,93,39,0.45)] hover:shadow-[0_14px_30px_-6px_rgba(216,93,39,0.55)] overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={step < 3 ? 'cta-continue' : 'cta-submit'}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.16, ease: 'easeOut' }}
                  className="inline-flex items-center justify-center gap-2"
                >
                  {step < 3 ? (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Submit &amp; Return to Sign In</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
            </PremiumButton>
          </motion.div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

export function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <div className="relative bg-gradient-to-br from-[#0E2635] to-[#163B4E] px-5 pt-6 pb-10 text-white overflow-hidden">
        <ConstellationBackdrop />
        <button
          type="button"
          onClick={onBack}
          className="relative z-10 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/18 flex items-center justify-center cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative z-10 mt-5">
          <EkamWordmark light size="md" />
        </div>
      </div>

      <div className="-mt-5 mx-4 mb-6 flex-1 rounded-3xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n === step ? 'w-8 bg-[#D85D27]' : 'w-4 bg-slate-200 dark:bg-white/15'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Reset your password</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your email and we will send you a verification code.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full h-12 px-4 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
            <PremiumButton fullWidth onClick={() => setStep(2)}>
              Send code
            </PremiumButton>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Enter verification code</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check {email || 'your email'} for the 6-digit security code.
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full h-12 px-4 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm font-mono-tabular tracking-widest text-slate-900 dark:text-white"
            />
            <PremiumButton fullWidth onClick={() => setStep(3)}>
              Verify &amp; Reset
            </PremiumButton>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-4 space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Password updated</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">You can now sign in with your new credentials.</p>
            <PremiumButton fullWidth onClick={onBack}>
              Back to Sign In
            </PremiumButton>
          </div>
        )}
      </div>
    </div>
  );
}

const GUIDE_STEPS = [
  {
    icon: Home,
    title: 'Welcome to EKAM',
    body: 'Home shows your next chapter meeting, referral credits, and quick actions at a glance.',
  },
  {
    icon: Briefcase,
    title: 'Business',
    body: 'Pass referrals, track closed business, book one-to-one (P2P) meetings, and invite chapter visitors.',
  },
  {
    icon: Compass,
    title: 'Professional',
    body: 'Share updates with your professional network and connect with verified members across every region.',
  },
  {
    icon: Layers,
    title: 'Groups',
    body: 'Join focused interest circles, share insights, and invite fellow members.',
  },
  {
    icon: Star,
    title: 'Referral credits',
    body: 'Earn credits when someone you refer joins EKAM, then spend them on events opened by the EKAM team.',
  },
  {
    icon: User,
    title: 'Your profile',
    body: 'Tap your avatar on Home for profile strength, appearance settings, notifications, and replaying this guide.',
  },
];

export function AppGuideSheet({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = GUIDE_STEPS[step];
  const Icon = current.icon;

  return (
    <div className="absolute inset-0 z-50 bg-black/55 flex items-end justify-center">
      <div className="w-full rounded-t-3xl bg-white dark:bg-[#151519] border-t border-slate-200/80 dark:border-white/10 p-6 shadow-2xl space-y-5">
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto" />
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {step + 1} of {GUIDE_STEPS.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-[#D85D27] hover:text-[#BE4D14] cursor-pointer"
          >
            Skip
          </button>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D85D27]/15 to-[#D85D27]/5 border border-[#D85D27]/20 flex items-center justify-center text-[#D85D27]">
          <Icon className="w-6 h-6" />
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{current.title}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{current.body}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {GUIDE_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                idx === step ? 'w-7 bg-[#D85D27]' : 'w-2 bg-slate-200 dark:bg-white/15'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          {step > 0 && (
            <PremiumButton variant="secondary" fullWidth onClick={() => setStep((s) => s - 1)}>
              Back
            </PremiumButton>
          )}
          <PremiumButton
            fullWidth
            onClick={() => {
              if (step < GUIDE_STEPS.length - 1) setStep((s) => s + 1);
              else onClose();
            }}
          >
            {step === GUIDE_STEPS.length - 1 ? 'Get started' : 'Next'}
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
