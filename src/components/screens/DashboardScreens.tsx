import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  Layers,
  MessageSquare,
  Plus,
  Search,
  Send,
  Settings,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  ChatThread,
  ConnectionMember,
  MeetingItem,
  NotificationItem,
  ReferralItem,
  ScreenId,
  UserProfile,
} from '../../types/ekam';
import { AnimatedCounter, DashboardFlankCurves, EkamWordmark, SectionHeader } from '../EkamBrand';
import { DashboardSkeleton, SkeletonCrossfade } from '../EkamSkeletons';
import { createSpringItemVariants, createStaggerListVariants } from '../motionPresets';
import { PullToRefreshContainer } from '../PullToRefresh';

export function DashboardScreen({
  user,
  nextMeeting,
  referrals,
  connectionsCount,
  visitorsCount,
  unreadNotifications,
  unreadMessages,
  creditsInr,
  reducedMotion,
  isLoading = false,
  onRefresh,
  onNavigate,
}: {
  user: UserProfile;
  nextMeeting: MeetingItem;
  referrals: ReferralItem[];
  connectionsCount: number;
  visitorsCount: number;
  unreadNotifications: number;
  unreadMessages: number;
  creditsInr: number;
  reducedMotion: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
  onNavigate: (s: ScreenId) => void;
  onOpen3D?: () => void;
}) {
  // Real ticking countdown (seeded at 5d 19h 38m like the real capture)
  const [secondsLeft, setSecondsLeft] = useState(5 * 86400 + 19 * 3600 + 38 * 60);
  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const mins = Math.floor((secondsLeft % 3600) / 60);

  const closedValue = referrals
    .filter((r) => r.status === 'Closed')
    .reduce((sum, r) => sum + r.valueInr, 0);

  const receivedReferrals = referrals.filter((r) => r.direction === 'received');
  const receivedValue = receivedReferrals.reduce((sum, r) => sum + r.valueInr, 0);

  const hourNow = new Date().getHours();
  const greeting = hourNow < 12 ? 'Good morning' : hourNow < 17 ? 'Good afternoon' : 'Good evening';

  const containerVariants = createStaggerListVariants(reducedMotion, 0.06, 0.04);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  const initialFirst = user.initials.slice(0, 1);
  const initialRest = user.initials.slice(1) || 'K';

  const quickCircleItems = [
    {
      id: 'refer',
      label: 'Pass referral',
      icon: Briefcase,
      toneClass:
        'bg-gradient-to-br from-[#FFF3EA] to-[#FFE2CC] dark:from-[#3A2115] dark:to-[#2B170E] border-[#F7B68A]/75 dark:border-[#F38B1E]/35 text-[#D85D27] dark:text-[#FF954D] shadow-[0_8px_18px_-6px_rgba(216,93,39,0.34)] hover:border-[#D85D27]/60',
      onClick: () => onNavigate('pass_referral'),
    },
    {
      id: 'meet',
      label: 'Meetings & P2P',
      icon: Calendar,
      toneClass:
        'bg-gradient-to-br from-[#ECF9FC] to-[#D4F0F7] dark:from-[#12303B] dark:to-[#0C222B] border-[#7DC5D8]/70 dark:border-sky-400/30 text-[#16748D] dark:text-[#4CC9E6] shadow-[0_8px_18px_-6px_rgba(22,116,141,0.32)] hover:border-[#16748D]/60',
      onClick: () => onNavigate('meetings'),
    },
    {
      id: 'visit',
      label: 'Invite visitor',
      icon: UserPlus,
      toneClass:
        'bg-gradient-to-br from-[#FFF1F3] to-[#FFE0E6] dark:from-[#381B24] dark:to-[#281219] border-[#F7A8B8]/70 dark:border-rose-400/30 text-[#D9385A] dark:text-[#FB7185] shadow-[0_8px_18px_-6px_rgba(217,56,90,0.3)] hover:border-[#D9385A]/60',
      onClick: () => onNavigate('visitors'),
    },
    {
      id: 'links',
      label: 'Connections',
      icon: Users,
      toneClass:
        'bg-gradient-to-br from-[#EEF2FF] to-[#DDE5FF] dark:from-[#1C2444] dark:to-[#141A33] border-[#99ADFF]/70 dark:border-indigo-400/30 text-[#3B5BDB] dark:text-[#819CFF] shadow-[0_8px_18px_-6px_rgba(59,91,219,0.3)] hover:border-[#3B5BDB]/60',
      onClick: () => onNavigate('connections'),
    },
    {
      id: 'reviews',
      label: 'Testimonials',
      icon: Star,
      toneClass:
        'bg-gradient-to-br from-[#FFF9E6] to-[#FFEDC2] dark:from-[#382B11] dark:to-[#281E0B] border-[#F6C86E]/75 dark:border-amber-400/35 text-[#C97A00] dark:text-[#FBBF24] shadow-[0_8px_18px_-6px_rgba(201,122,0,0.3)] hover:border-[#C97A00]/60',
      onClick: () => onNavigate('testimonials'),
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Settings,
      toneClass:
        'bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] dark:from-[#113327] dark:to-[#0C241B] border-[#6EE7B7]/70 dark:border-emerald-400/30 text-[#0E8A5D] dark:text-[#34D399] shadow-[0_8px_18px_-6px_rgba(14,138,93,0.3)] hover:border-[#0E8A5D]/60',
      onClick: () => onNavigate('settings_appearance'),
    },
  ] as const;

  return (
    <PullToRefreshContainer tone="light" reducedMotion={reducedMotion} onRefresh={onRefresh}>
      <SkeletonCrossfade
        loading={isLoading}
        reducedMotion={reducedMotion}
        skeleton={<DashboardSkeleton reducedMotion={reducedMotion} />}
      >
        <div className="min-h-full bg-[#F6F7FB] dark:bg-[#0B0D14] pb-8 relative overflow-hidden">
          <DashboardFlankCurves />

      {/* Top Navigation Header Row with Centered EKAM Logo */}
      <div className="relative z-10 px-4 pt-4 pb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="justify-self-start">
          <button
            type="button"
            onClick={() => onNavigate('search')}
            aria-label="Search members"
            className="w-10 h-10 rounded-full bg-white dark:bg-[#161822] border border-slate-200/75 dark:border-white/10 shadow-[0_6px_18px_-6px_rgba(18,49,66,0.14)] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#D85D27] transition-colors cursor-pointer"
          >
            <Search className="w-4.5 h-4.5" strokeWidth={1.9} />
          </button>
        </div>

        <div className="justify-self-center flex items-center justify-center">
          <EkamWordmark size="sm" />
        </div>

        <div className="justify-self-end flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('messages')}
            aria-label="Direct messages"
            className="relative w-10 h-10 rounded-full bg-white dark:bg-[#161822] border border-slate-200/75 dark:border-white/10 shadow-[0_6px_18px_-6px_rgba(18,49,66,0.14)] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#D85D27] transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4.5 h-4.5" strokeWidth={1.9} />
            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#123142] dark:bg-sky-500 text-white text-[9.5px] font-bold flex items-center justify-center tabular-nums">
                {unreadMessages}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('notifications')}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full bg-white dark:bg-[#161822] border border-slate-200/75 dark:border-white/10 shadow-[0_6px_18px_-6px_rgba(18,49,66,0.14)] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#D85D27] transition-colors cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" strokeWidth={1.9} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#D85D27] text-white text-[9.5px] font-bold flex items-center justify-center tabular-nums">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Centered Identity Hub (Circular Two-Tone Monogram, Verified Name, Tagline, Circular Quick Links) */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 px-4 pt-1 pb-5 text-center"
      >
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          aria-label="Open profile"
          className="mx-auto w-20 h-20 rounded-full bg-white dark:bg-[#161822] border border-slate-100 dark:border-white/12 shadow-[0_14px_32px_-8px_rgba(18,49,66,0.2)] dark:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.75)] flex items-center justify-center hover:scale-[1.04] active:scale-95 transition-transform cursor-pointer"
        >
          <span className="font-display text-[26px] font-extrabold tracking-tight leading-none">
            <span className="text-[#0E3648] dark:text-white">{initialFirst}</span>
            <span className="text-[#F26422]">{initialRest}</span>
          </span>
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5">
          <h1 className="font-display text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">
            {user.fullName}
          </h1>
          <span
            title="Verified Chapter Member"
            aria-label="Verified Chapter Member"
            className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white inline-flex items-center justify-center shadow-xs shrink-0"
          >
            <Check className="w-3 h-3" strokeWidth={3} />
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px] mx-auto">
          {greeting} · {user.chapter} Chapter
          <br />
          <span className="font-medium text-slate-600 dark:text-slate-300">{user.businessName}</span>
        </p>

        {/* Row of 6 Circular Action Badges */}
        <div className="mt-4 flex items-center justify-center gap-2.5">
          {quickCircleItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={reducedMotion ? undefined : { y: -2, scale: 1.08 }}
                whileTap={reducedMotion ? undefined : { scale: 0.92 }}
                onClick={item.onClick}
                aria-label={item.label}
                title={item.label}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${item.toneClass}`}
              >
                <Icon className="w-[17px] h-[17px]" strokeWidth={2.05} />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Signature Bento Stack */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-4 space-y-3"
      >
        {/* 1. Full-Width Vibrant Copper-Orange Focal Card (Next Chapter Meeting + Live Countdown) */}
        <motion.button
          variants={itemVariants}
          whileHover={reducedMotion ? undefined : { scale: 1.01 }}
          whileTap={reducedMotion ? undefined : { scale: 0.985 }}
          type="button"
          onClick={() => onNavigate('meetings')}
          className="w-full text-left rounded-[22px] bg-gradient-to-r from-[#FF782C] via-[#F26422] to-[#D85D27] p-4 text-white shadow-[0_14px_30px_-10px_rgba(216,93,39,0.5)] flex items-center justify-between gap-3.5 cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#D85D27] flex flex-col items-center justify-center shrink-0 shadow-xs">
              <span className="text-[9px] font-bold uppercase tracking-wider leading-none text-slate-400">
                {nextMeeting.dayShort}
              </span>
              <span className="font-display text-lg font-extrabold leading-tight tabular-nums text-[#D85D27]">
                {nextMeeting.dayNum}
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-display text-[15px] font-bold leading-snug truncate">
                Next Meeting · {nextMeeting.weekday}
              </div>
              <div className="mt-0.5 text-xs text-white/90 tabular-nums truncate">
                {nextMeeting.time} · Starts in {String(days).padStart(2, '0')}d {String(hours).padStart(2, '0')}h{' '}
                {String(mins).padStart(2, '0')}m
              </div>
            </div>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-white/85 shrink-0" />
        </motion.button>

        {/* 2. Dual Row 1: Softer Slate Teal (Business Closed) + Softer Ocean Navy (Business Received) */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { y: -2, scale: 1.015 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => onNavigate('reports')}
            className="text-left rounded-[22px] bg-gradient-to-br from-[#2C8CA6] via-[#22748B] to-[#1A5D72] p-4 text-white border border-white/15 shadow-[0_14px_28px_-12px_rgba(34,116,139,0.38)] flex flex-col justify-between min-h-[126px] cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-white text-[#1A6B82] flex items-center justify-center shadow-xs shrink-0">
                <BarChart3 className="w-5 h-5" strokeWidth={2} />
              </div>
              <ChevronRight className="w-4 h-4 text-white/80 mt-1 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="font-display text-[14.5px] font-bold leading-snug">Business Closed</div>
              <div className="mt-0.5 text-xs text-white/90 tabular-nums truncate">
                <AnimatedCounter value={closedValue} prefix="₹" reducedMotion={reducedMotion} /> · {referrals.length} deals
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={
              reducedMotion
                ? undefined
                : {
                    y: -3,
                    scale: 1.022,
                    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                  }
            }
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => onNavigate('opportunity')}
            className="group relative overflow-hidden text-left rounded-[22px] bg-gradient-to-br from-[#245670] via-[#1B465D] to-[#15394D] p-4 text-white border border-white/15 hover:border-[#F38B1E]/50 shadow-[0_14px_28px_-12px_rgba(21,57,77,0.42)] hover:shadow-[0_18px_38px_-10px_rgba(243,139,30,0.34),0_10px_26px_-8px_rgba(38,140,166,0.42)] transition-all duration-200 flex flex-col justify-between min-h-[126px] cursor-pointer"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[radial-gradient(circle_at_85%_15%,rgba(243,139,30,0.22)_0%,rgba(44,140,166,0.12)_48%,transparent_78%)]"
            />
            <div className="relative z-10 flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-white text-[#1B465D] flex items-center justify-center shadow-xs shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Briefcase className="w-5 h-5" strokeWidth={2} />
              </div>
              <ChevronRight className="w-4 h-4 text-white/80 mt-1 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
            <div className="relative z-10 mt-3">
              <div className="font-display text-[14.5px] font-bold leading-snug">Business Received</div>
              <div className="mt-0.5 text-xs text-slate-200 tabular-nums truncate">
                <AnimatedCounter value={receivedValue} prefix="₹" reducedMotion={reducedMotion} /> ·{' '}
                {receivedReferrals.length} {receivedReferrals.length === 1 ? 'lead' : 'leads'}
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* 3. Dual Row 2: Vibrant Copper (Invite Visitor) + Clean Light Card (Referral Credits) */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { y: -2, scale: 1.015 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => onNavigate('visitors')}
            className="text-left rounded-[22px] bg-gradient-to-br from-[#FF782C] via-[#F26422] to-[#D85D27] p-4 text-white shadow-[0_14px_28px_-12px_rgba(216,93,39,0.46)] flex flex-col justify-between min-h-[122px] cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-white text-[#D85D27] flex items-center justify-center shadow-xs shrink-0">
                <UserPlus className="w-5 h-5" strokeWidth={2} />
              </div>
              <ChevronRight className="w-4 h-4 text-white/80 mt-1 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="font-display text-[14.5px] font-bold leading-snug">Invite a Visitor</div>
              <div className="mt-0.5 text-xs text-white/90 tabular-nums truncate">
                <AnimatedCounter value={visitorsCount} reducedMotion={reducedMotion} /> guests invited
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { y: -2, scale: 1.015 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => onNavigate('referral_credits')}
            className="text-left rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/75 dark:border-white/10 p-4 shadow-[0_12px_28px_-12px_rgba(18,49,66,0.12)] dark:shadow-[0_18px_36px_-12px_rgba(0,0,0,0.68)] flex flex-col justify-between min-h-[122px] hover:border-[#D85D27]/45 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" strokeWidth={2} />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
            </div>
            <div className="mt-3">
              <div className="font-display text-[14.5px] font-bold text-slate-900 dark:text-white leading-snug">
                Referral Credits
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular truncate">
                Rs. {creditsInr.toLocaleString('en-IN')} earned
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* 4. Full-Width Clean Light Strip Card (Pass a Referral CTA) */}
        <motion.button
          variants={itemVariants}
          whileHover={reducedMotion ? undefined : { scale: 1.01 }}
          whileTap={reducedMotion ? undefined : { scale: 0.99 }}
          type="button"
          onClick={() => onNavigate('pass_referral')}
          className="w-full text-left rounded-[20px] bg-white dark:bg-[#161822] border border-slate-200/75 dark:border-white/10 p-3.5 shadow-[0_12px_28px_-12px_rgba(18,49,66,0.1)] dark:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.65)] flex items-center justify-between gap-3 hover:border-[#D85D27]/45 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center shrink-0">
              <Send className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                Pass a Business Referral
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Send a trusted warm intro across chapters
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </motion.button>

        {/* 5. Featured Softer Ocean Navy Chapter Network Showcase Card */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-[24px] bg-gradient-to-br from-[#1E4B63] via-[#173B4F] to-[#122F40] p-4.5 text-white overflow-hidden shadow-[0_18px_36px_-12px_rgba(18,47,64,0.45)] border border-white/15"
        >
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="text-[11px] font-semibold text-[#FF782C]">Chapter Network</div>
              <h2 className="font-display text-[17px] font-bold leading-snug">
                Connect with Fortune Peers
              </h2>
              <p className="text-[11.5px] text-slate-200 leading-relaxed tabular-nums">
                {connectionsCount} active partners &amp; {referrals.length} chapter referrals across EKAM.
              </p>
              <motion.button
                type="button"
                whileHover={reducedMotion ? undefined : { scale: 1.03 }}
                whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                onClick={() => onNavigate('connections')}
                className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-[#0D2331] hover:bg-orange-50 text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <span>Explore Network</span>
                <Users className="w-3.5 h-3.5 text-[#D85D27]" strokeWidth={2.2} />
              </motion.button>
            </div>

            {/* Tilted Mini Chapter Directory Preview Card */}
            <div
              onClick={() => onNavigate('connections')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate('connections');
                }
              }}
              aria-label="Open Chapter Member Directory"
              className="w-[114px] h-[136px] rounded-[18px] bg-gradient-to-br from-[#1E5874] via-[#143E54] to-[#0D2938] border border-white/15 p-3 flex flex-col justify-between shadow-xl rotate-[-5deg] hover:rotate-[-2deg] transition-transform shrink-0 cursor-pointer"
            >
              <div className="scale-[0.94] origin-top-left">
                <EkamWordmark light size="sm" />
              </div>
              <div className="space-y-1.5">
                <div className="text-[11.5px] font-bold leading-snug text-white/95">
                  Member Directory
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF782C] to-[#D85D27] text-[10px] font-bold text-white shadow-xs">
                  <span>Browse</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 6. Recent Referrals Ledger */}
        <motion.div variants={itemVariants} className="space-y-2.5 pt-1">
          <SectionHeader title="Recent referrals" actionLabel="See all" onAction={() => onNavigate('opportunity')} />
          <div className="rounded-[22px] bg-white/95 dark:bg-[#161822] border border-[#123142]/12 dark:border-white/10 shadow-[0_14px_30px_-14px_rgba(18,49,66,0.12)] divide-y divide-slate-100 dark:divide-white/8 overflow-hidden">
            {referrals.slice(0, 2).map((ref) => {
              const isReceived = ref.direction === 'received';
              const isClosed = ref.status === 'Closed';
              return (
                <button
                  key={ref.id}
                  type="button"
                  onClick={() => onNavigate('opportunity')}
                  className="group w-full text-left p-4 flex flex-col gap-2.5 hover:bg-[#F5F9FC] dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  {/* Tier 1: Direction icon + metadata + full-width title & company */}
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105 ${
                        isReceived
                          ? 'bg-emerald-500/12 dark:bg-emerald-500/15 border-emerald-500/25 dark:border-emerald-400/25 text-emerald-700 dark:text-emerald-300'
                          : 'bg-[#D85D27]/10 dark:bg-[#F38B1E]/15 border-[#D85D27]/20 dark:border-[#F38B1E]/25 text-[#D85D27] dark:text-[#FF954D]'
                      }`}
                    >
                      {isReceived ? (
                        <ArrowDownLeft className="w-4.5 h-4.5" strokeWidth={2.2} />
                      ) : (
                        <ArrowUpRight className="w-4.5 h-4.5" strokeWidth={2.2} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] text-slate-500 dark:text-slate-400">
                        <span
                          className={`font-semibold capitalize ${
                            isReceived ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#D85D27] dark:text-[#FF954D]'
                          }`}
                        >
                          {ref.direction}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ref.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ref.warmth}</span>
                      </div>
                      <div className="font-display text-[14px] font-bold text-[#123142] dark:text-white leading-snug mt-1">
                        {ref.topic}
                      </div>
                      <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                        {ref.memberName} · {ref.company}
                      </div>
                    </div>
                  </div>

                  {/* Tier 2: Aligned footer telemetry */}
                  <div className="w-full flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-white/8 pl-[52px]">
                    <span
                      className={`text-[11.5px] font-semibold ${
                        isClosed
                          ? 'text-[#16748D] dark:text-[#4CC9E6]'
                          : 'text-[#D85D27] dark:text-[#F38B1E]'
                      }`}
                    >
                      {ref.status}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono-tabular text-[13.5px] font-bold text-[#123142] dark:text-white">
                        ₹{ref.valueInr.toLocaleString('en-IN')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Subtle Chapter Sign-off */}
        <div className="pt-1 pb-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          {user.chapter} Chapter · EKAM Business Network
        </div>
      </motion.div>
    </div>
      </SkeletonCrossfade>
    </PullToRefreshContainer>
  );
}

export function NotificationsScreen({
  notifications,
  onMarkAllRead,
  onSelectNotification,
  onOpenSettings,
  onBack,
  reducedMotion = false,
}: {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectNotification: (n: NotificationItem) => void;
  onOpenSettings: () => void;
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const listVariants = createStaggerListVariants(reducedMotion, 0.05, 0.02);
  const itemVariants = createSpringItemVariants(reducedMotion, 14, 0.97);

  const filtered = notifications.filter((n) => {
    if (filter === 'read') return n.read;
    if (filter === 'unread') return !n.read;
    return true;
  });

  const iconFor = (cat: NotificationItem['category']) => {
    if (cat === 'testimonial') return Star;
    if (cat === 'group') return Layers;
    if (cat === 'meeting') return Calendar;
    return Briefcase;
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-[#ECEEF7]/85 via-[#F4F5FA] to-[#F8F9FC] dark:from-[#121622] dark:via-[#0B0D14] dark:to-[#0A0C12] flex flex-col">
      {/* Minimal Centered Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-20 bg-[#ECEEF7]/75 dark:bg-[#121622]/85 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/8 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-100" strokeWidth={1.85} />
        </button>
        <h1 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
          Notifications
        </h1>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Notification settings"
          className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/8 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Settings className="w-4.5 h-4.5" strokeWidth={1.85} />
        </button>
      </div>

      {/* Filter Tabs & Mark All Read Bar */}
      <div className="px-4 pt-1 pb-3 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-white/6 border border-slate-200/70 dark:border-white/10 shadow-2xs">
          {(['all', 'read', 'unread'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#123142] dark:bg-[#D85D27] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D85D27] hover:text-[#BE4D14] transition-colors cursor-pointer px-2 py-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Grouped White Elevated Notification Card */}
      <div className="px-4 pb-6">
        <motion.div
          key={`notif-${filter}`}
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] divide-y divide-slate-100 dark:divide-white/8 overflow-hidden"
        >
          {filtered.map((item) => {
            const Icon = iconFor(item.category);
            return (
              <motion.button
                key={item.id}
                variants={itemVariants}
                type="button"
                onClick={() => onSelectNotification(item)}
                className={`w-full text-left px-4 py-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                  item.read
                    ? 'hover:bg-slate-50/80 dark:hover:bg-white/[0.02]'
                    : 'bg-[#D85D27]/[0.035] dark:bg-[#D85D27]/[0.08] hover:bg-[#D85D27]/[0.06]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.read
                      ? 'bg-slate-100/90 dark:bg-white/8 text-[#123142]/70 dark:text-slate-400'
                      : 'bg-[#D85D27]/12 text-[#D85D27]'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!item.read && (
                        <span
                          aria-hidden="true"
                          className="w-1.5 h-1.5 rounded-full bg-[#D85D27] shrink-0"
                        />
                      )}
                      <h2 className="font-display text-[13.5px] font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono-tabular shrink-0">
                      {item.date}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export function SearchMembersScreen({
  members,
  onStartChat,
  onConnect,
  onBack,
  reducedMotion = false,
}: {
  members: ConnectionMember[];
  onStartChat: (member: ConnectionMember) => void;
  onConnect: (memberId: string) => void;
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const [scope, setScope] = useState<'global' | 'region'>('global');
  const [query, setQuery] = useState('');
  const listVariants = createStaggerListVariants(reducedMotion, 0.05, 0.02);
  const itemVariants = createSpringItemVariants(reducedMotion, 14, 0.97);

  const filtered = members.filter((m) => {
    const matchesScope = scope === 'global' || m.chapter === 'Fortune' || m.chapter === 'Hyderabad';
    const q = query.trim().toLowerCase();
    if (!q) return matchesScope;
    return (
      matchesScope &&
      (m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.chapter.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <div className="px-4 py-3.5 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 flex items-center justify-center cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
        </button>
        <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">Search members</h1>
      </div>

      <div className="p-4 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, company, category or chapter"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F4F5F7] dark:bg-[#0E1015] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D85D27]/30"
          />
        </div>
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/6">
          {(['global', 'region'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setScope(tab)}
              className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                scope === tab
                  ? 'bg-white dark:bg-[#1F2028] text-[#D85D27] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab === 'global' ? 'Global' : 'My Region'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          {filtered.length} members shown · 209 total in network
        </div>
        <motion.div
          key={`search-${scope}`}
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/8 overflow-hidden"
        >
          {filtered.map((m) => (
            <motion.div key={m.id} variants={itemVariants} className="p-3.5 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-display text-xs font-bold shrink-0 ${m.avatarTone}`}>
                {m.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-slate-900 dark:text-white truncate">{m.name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {m.category} · {m.company}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{m.chapter} chapter</div>
              </div>
              {m.status === 'connected' ? (
                <button
                  type="button"
                  onClick={() => onStartChat(m)}
                  className="px-3 py-1.5 rounded-lg bg-[#D85D27]/12 text-[#D85D27] text-xs font-semibold hover:bg-[#D85D27]/20 cursor-pointer shrink-0"
                >
                  Message
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onConnect(m.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/8 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-white/14 cursor-pointer shrink-0"
                >
                  {m.status === 'sent' ? 'Pending' : 'Connect'}
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function MessagesScreen({
  threads,
  activeThreadId,
  onSelectThread,
  onSendMessage,
  onBack,
}: {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string | null) => void;
  onSendMessage: (threadId: string, text: string) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState('');
  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  if (activeThread) {
    return (
      <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
        <div className="px-4 py-3 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectThread(null)}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 flex items-center justify-center cursor-pointer"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-[#123142]/10 dark:bg-sky-500/15 text-[#123142] dark:text-sky-300 flex items-center justify-center font-display text-xs font-bold">
            {activeThread.memberInitials}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeThread.memberName}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {activeThread.company} · {activeThread.chapter}
            </p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto ekam-scroll">
          {activeThread.messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.sender === 'me'
                    ? 'bg-[#D85D27] text-white rounded-br-sm'
                    : 'bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        <form
          className="p-3 bg-white dark:bg-[#151519] border-t border-slate-200/80 dark:border-white/10 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            onSendMessage(activeThread.id, draft.trim());
            setDraft('');
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 h-11 px-4 rounded-xl bg-[#F4F5F7] dark:bg-[#0E1015] text-sm text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="w-11 h-11 rounded-xl bg-[#D85D27] hover:bg-[#BE4D14] text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <div className="px-4 py-3.5 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 flex items-center justify-center cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
          </button>
          <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">Messages</h1>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{threads.length} threads</span>
      </div>

      <div className="p-4 space-y-2.5">
        {threads.map((th) => {
          const last = th.messages[th.messages.length - 1];
          return (
            <button
              key={th.id}
              type="button"
              onClick={() => onSelectThread(th.id)}
              className="w-full text-left rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center gap-3.5 hover:border-[#D85D27]/40 transition-colors cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#123142]/10 dark:bg-sky-500/15 text-[#123142] dark:text-sky-300 flex items-center justify-center font-display text-xs font-bold shrink-0">
                {th.memberInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {th.memberName}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0">{last?.time}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{last?.text}</p>
              </div>
              {th.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D85D27] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {th.unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
