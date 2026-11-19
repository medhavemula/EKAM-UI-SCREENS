import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bookmark,
  Briefcase,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Droplets,
  Heart,
  IndianRupee,
  MapPin,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  ChatThread,
  ConnectionMember,
  ScreenId,
  ServiceEventItem,
  UserProfile,
} from '../../types/ekam';
import { EditorialHeaderBackdrop } from '../EditorialHeaderBackdrop';
import {
  BusinessHubSkeleton,
  SkeletonCrossfade,
} from '../EkamSkeletons';
import {
  createSpringItemVariants,
  createStaggerListVariants,
} from '../motionPresets';
import { PullToRefreshContainer } from '../PullToRefresh';

type ServiceTab = 'activities' | 'events' | 'connections' | 'messages';

function buildSmoothPath(pts: { x: number; y: number }[]) {
  return pts.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const midX = Number(((prev.x + pt.x) / 2).toFixed(1));
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');
}

function BloodDonationArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-orange-50/70 to-amber-50/60 dark:from-rose-950/40 dark:via-orange-950/30 dark:to-slate-900 ${
        compact ? 'p-2' : 'p-6'
      }`}
    >
      <div
        className={`rounded-2xl bg-white/90 dark:bg-white/10 border border-rose-200/80 dark:border-rose-400/20 shadow-sm flex items-center justify-center ${
          compact ? 'w-12 h-12' : 'w-20 h-20'
        }`}
      >
        <Droplets
          className={`text-[#D85D27] dark:text-[#FF8A42] fill-[#D85D27]/20 ${
            compact ? 'w-6 h-6' : 'w-10 h-10'
          }`}
          strokeWidth={1.9}
        />
      </div>
      {!compact && (
        <span className="mt-2.5 text-[11px] font-semibold tracking-wide uppercase text-rose-700/80 dark:text-rose-300/90">
          Blood Donation Drive
        </span>
      )}
    </div>
  );
}

function TrendAreaCard({
  title,
  subtitle,
  badgeText,
  series,
  colorHex,
  gradientId,
  darkStrokeClass,
  darkDotClass,
  valuePrefix = '',
}: {
  title: string;
  subtitle?: string;
  badgeText: string;
  series: { label: string; value: number }[];
  colorHex: string;
  gradientId: string;
  darkStrokeClass: string;
  darkDotClass: string;
  valuePrefix?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(series.length - 1);
  const maxVal = Math.max(1, ...series.map((s) => s.value));
  const topY = 14;
  const bottomY = 78;
  const plotH = bottomY - topY;

  const pts = series.map((s, i) => ({
    x: Number((16 + (i / Math.max(1, series.length - 1)) * 268).toFixed(1)),
    y: Number((bottomY - (s.value / (maxVal * 1.15)) * plotH).toFixed(1)),
  }));
  const linePath = buildSmoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`;
  const activeItem = series[activeIdx] || series[series.length - 1];
  const activePt = pts[activeIdx] || pts[pts.length - 1];

  return (
    <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/75 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.09),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-sm font-bold text-slate-900 dark:text-white tabular-nums">
            {badgeText}
          </div>
          <div className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {activeItem.label}: {valuePrefix}
            {activeItem.value.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 300 86"
        className="w-full h-[88px] overflow-visible"
        role="img"
        aria-label={`${title} trend chart`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorHex} stopOpacity="0.26" />
            <stop offset="100%" stopColor={colorHex} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[24, 46, 68].map((y) => (
          <line
            key={y}
            x1="12"
            y1={y}
            x2="288"
            y2={y}
            className="stroke-slate-200/75 dark:stroke-white/10"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        ))}
        <line
          x1="12"
          y1={bottomY}
          x2="288"
          y2={bottomY}
          className="stroke-slate-200 dark:stroke-white/12"
          strokeWidth="1"
        />

        <path d={areaPath} fill={`url(#${gradientId})`} />

        <line
          x1={activePt.x}
          y1={topY - 4}
          x2={activePt.x}
          y2={bottomY}
          className="stroke-slate-300 dark:stroke-white/20"
          strokeWidth="1"
          strokeDasharray="2.5 2.5"
        />

        <path
          d={linePath}
          fill="none"
          stroke={colorHex}
          className={darkStrokeClass}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {series.map((item, idx) => {
          const p = pts[idx];
          const isActive = idx === activeIdx;
          return (
            <g
              key={item.label}
              onClick={() => setActiveIdx(idx)}
              onMouseEnter={() => setActiveIdx(idx)}
              className="cursor-pointer"
            >
              <rect x={p.x - 24} y={0} width={48} height={86} fill="transparent" />
              {isActive ? (
                <>
                  <circle cx={p.x} cy={p.y} r="7" fill={colorHex} fillOpacity="0.18" />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3.8"
                    fill={colorHex}
                    className={`${darkDotClass} stroke-white dark:stroke-[#161822]`}
                    strokeWidth="2"
                  />
                </>
              ) : (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="2.4"
                  stroke={colorHex}
                  className={`fill-white dark:fill-[#161822] ${darkStrokeClass}`}
                  strokeWidth="1.6"
                />
              )}
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-6 gap-1">
        {series.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`py-0.5 text-[10px] rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'font-bold text-[#1E4B63] dark:text-white bg-slate-100 dark:bg-white/10'
                  : 'font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ServiceClubScreen({
  user,
  events,
  connections,
  threads,
  initialTab = 'activities',
  onSelectEvent,
  onOpenChatThread,
  onConnectMember,
  onStartServiceChat,
  onNavigate,
  reducedMotion = false,
  isLoading = false,
  onRefresh,
}: {
  user: UserProfile;
  events: ServiceEventItem[];
  connections: ConnectionMember[];
  threads: ChatThread[];
  initialTab?: ServiceTab;
  onSelectEvent: (eventId: string) => void;
  onOpenChatThread: (threadId: string) => void;
  onConnectMember: (memberId: string) => void;
  onStartServiceChat: (member: ConnectionMember) => string;
  onNavigate: (s: ScreenId) => void;
  reducedMotion?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
}) {
  const [activeTab, setActiveTab] = useState<ServiceTab>(initialTab);
  const [activityRange, setActivityRange] = useState<'all' | '6m' | 'month'>('all');
  const [showActivityFilter, setShowActivityFilter] = useState(false);

  const [eventFilter, setEventFilter] = useState<'all' | 'mine' | 'upcoming'>('all');
  const [eventQuery, setEventQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [showEventTypeFilter, setShowEventTypeFilter] = useState(false);

  const [connFilter, setConnFilter] = useState<'all' | 'request' | 'suggest' | 'pending'>('all');
  const [connQuery, setConnQuery] = useState('');

  const [msgQuery, setMsgQuery] = useState('');

  const listVariants = createStaggerListVariants(reducedMotion, 0.055, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  const attendedCount = events.filter((e) => e.checkedIn).length;
  const upcomingCount = events.filter((e) => e.isUpcoming).length;
  const totalDonatedInr = events.reduce(
    (sum, ev) => sum + ev.donations.reduce((s, d) => s + d.amountInr, 0),
    0
  );
  const totalUniqueMembers = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => ev.members.forEach((m) => set.add(m.name)));
    return Math.max(3, set.size);
  }, [events]);

  const scaleFactor = activityRange === 'month' ? 0.55 : activityRange === '6m' ? 0.85 : 1;
  const memberSeries = [
    { label: 'Jun', value: Math.max(1, Math.round(totalUniqueMembers * 0.45 * scaleFactor)) },
    { label: 'Jul', value: Math.max(1, Math.round(totalUniqueMembers * 0.55 * scaleFactor)) },
    { label: 'Aug', value: Math.max(2, Math.round(totalUniqueMembers * 0.7 * scaleFactor)) },
    { label: 'Sep', value: Math.max(2, Math.round(totalUniqueMembers * 0.78 * scaleFactor)) },
    { label: 'Oct', value: Math.max(2, Math.round(totalUniqueMembers * 0.9 * scaleFactor)) },
    { label: 'Nov', value: totalUniqueMembers },
  ];

  const attendeeSeries = [
    { label: 'Jun', value: 1 },
    { label: 'Jul', value: 2 },
    { label: 'Aug', value: 2 },
    { label: 'Sep', value: 3 },
    { label: 'Oct', value: Math.max(2, attendedCount + 2) },
    { label: 'Nov', value: Math.max(3, attendedCount + 3) },
  ];

  const donationSeries = [
    { label: 'Jun', value: 1500 },
    { label: 'Jul', value: 2000 },
    { label: 'Aug', value: 3200 },
    { label: 'Sep', value: 4500 },
    { label: 'Oct', value: Math.max(5000, Math.round(totalDonatedInr * 0.8)) },
    { label: 'Nov', value: totalDonatedInr },
  ];

  const eventTypes = ['All', ...Array.from(new Set(events.map((e) => e.eventType)))];
  const filteredEvents = events.filter((ev) => {
    const q = eventQuery.trim().toLowerCase();
    const matchQ =
      !q ||
      ev.title.toLowerCase().includes(q) ||
      ev.region.toLowerCase().includes(q) ||
      ev.eventType.toLowerCase().includes(q) ||
      ev.category.toLowerCase().includes(q);
    if (!matchQ) return false;
    if (eventTypeFilter !== 'All' && ev.eventType !== eventTypeFilter) return false;
    if (eventFilter === 'mine') return ev.isMine;
    if (eventFilter === 'upcoming') return ev.isUpcoming;
    return true;
  });

  const filteredConnections = connections.filter((m) => {
    const q = connQuery.trim().toLowerCase();
    const matchQ =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.chapter.toLowerCase().includes(q);
    if (!matchQ) return false;
    if (connFilter === 'request') return m.status === 'received';
    if (connFilter === 'suggest') return m.status === 'suggested';
    if (connFilter === 'pending') return m.status === 'sent';
    return m.status === 'connected';
  });

  const filteredThreads = threads.filter((t) => {
    const q = msgQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      t.memberName.toLowerCase().includes(q) ||
      t.company.toLowerCase().includes(q) ||
      t.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  });

  const cardClass =
    'rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/75 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.09),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)]';

  const handleOpenChatForMember = (member: ConnectionMember) => {
    const threadId = onStartServiceChat(member);
    onOpenChatThread(threadId);
  };

  return (
    <PullToRefreshContainer tone="dark" reducedMotion={reducedMotion} onRefresh={onRefresh}>
      <SkeletonCrossfade
        loading={isLoading}
        reducedMotion={reducedMotion}
        skeleton={<BusinessHubSkeleton reducedMotion={reducedMotion} />}
      >
        <div className="min-h-full bg-[#F4F6FA] dark:bg-[#0B0D14] pb-8 flex flex-col">
          {/* Unified Midnight Navy Editorial Header (Matching Business, Professional & Groups) */}
          <div className="relative bg-gradient-to-b from-[#060F1E] via-[#091930] to-[#122338] px-4 pt-4 pb-4 text-white overflow-hidden shrink-0">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-2 -bottom-6 w-72 h-28 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.28)_0%,rgba(249,115,22,0.12)_50%,transparent_75%)] blur-xl"
            />
            <EditorialHeaderBackdrop reducedMotion={reducedMotion} />

            {/* TOP ROW: Chapter Location + Notification Bell */}
            <div className="relative z-20 flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-1.5 text-[13px] font-medium text-white/95 hover:text-white transition-colors cursor-pointer"
              >
                <span className="tracking-[-0.01em]">
                  {user.region || 'Hyderabad'} – {user.chapter || 'Fortune'} Chapter
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('notifications')}
                aria-label="Notifications"
                className="relative p-1 -mr-1 text-white/95 hover:text-white transition-colors cursor-pointer"
              >
                <Bell className="w-[21px] h-[21px]" strokeWidth={1.9} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF7A2F] ring-1 ring-[#060F1E]" />
              </button>
            </div>

            {/* MIDDLE ROW: Service Club Title & Subtitle + Bright Orange Circular Glass + Button */}
            <div className="relative z-20 mt-3 mb-5 flex items-center justify-between gap-2">
              <div className="min-w-0 pr-2">
                <h1 className="font-display text-[33px] font-extrabold tracking-[-0.02em] leading-[1.08] text-white">
                  Service Club
                </h1>
                <p className="mt-1.5 text-[13px] font-normal text-white/85 leading-snug truncate">
                  Community &amp; connections
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                onClick={() => onNavigate('service_add_event')}
                aria-label="Add service event"
                className="relative z-30 w-[48px] h-[48px] rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,154,66,0.94)_0%,rgba(255,107,26,0.88)_55%,rgba(234,82,12,0.92)_100%)] backdrop-blur-md text-white border border-[#FFD1A8]/65 shadow-[0_6px_16px_rgba(0,0,0,0.28),inset_0_1px_3px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer shrink-0"
              >
                <Plus className="w-6 h-6 text-white" strokeWidth={2.2} />
              </motion.button>
            </div>

            {/* BOTTOM ROW: Full-Width Zero-Truncation 4-Tab Glass Pill Navigation Bar */}
            <div className="relative z-20 -mx-1 rounded-full bg-[linear-gradient(90deg,rgba(26,38,58,0.78)_0%,rgba(44,50,68,0.7)_52%,rgba(68,54,62,0.68)_100%)] backdrop-blur-xl border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_8px_24px_rgba(0,0,0,0.35)] p-1 flex items-center">
              {(
                [
                  { id: 'activities', label: 'Activities', flexClass: 'flex-[1.05_1_0%]' },
                  { id: 'events', label: 'Events', flexClass: 'flex-[0.84_1_0%]' },
                  { id: 'connections', label: 'Connections', flexClass: 'flex-[1.22_1_0%]' },
                  { id: 'messages', label: 'Messages', flexClass: 'flex-[1.04_1_0%]' },
                ] as const
              ).map((item, index, arr) => {
                const active = activeTab === item.id;
                const nextItem = arr[index + 1];
                const showDivider =
                  index < arr.length - 1 && !active && (!nextItem || activeTab !== nextItem.id);
                return (
                  <React.Fragment key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`relative z-10 min-w-0 ${item.flexClass} min-h-[40px] rounded-full text-[11px] transition-colors cursor-pointer flex items-center justify-center px-2 whitespace-nowrap ${
                        active ? 'text-[#101828] font-bold' : 'text-white/90 hover:text-white font-medium'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="serviceSectionGlassPill"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                        />
                      )}
                      <span className="relative z-10 tracking-[-0.015em]">{item.label}</span>
                    </button>

                    {showDivider && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none h-4 w-px bg-white/22 shrink-0"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ================================================================ */}
          {/* TAB 1: ACTIVITIES                                                */}
          {/* ================================================================ */}
          {activeTab === 'activities' && (
            <motion.div
              key="service-tab-activities"
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="px-4 pt-4 space-y-4"
            >
              <motion.div variants={itemVariants} className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Your activity
                  </h2>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                    {activityRange === 'all'
                      ? 'All chapter service drives & contributions'
                      : activityRange === '6m'
                        ? 'Last 6 months service summary'
                        : 'Current month chapter activity'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowActivityFilter((v) => !v)}
                  aria-label="Filter activity timeframe"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                    showActivityFilter
                      ? 'bg-[#1E4B63] text-white border-[#1E4B63]'
                      : 'bg-white dark:bg-[#161822] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </motion.div>

              {showActivityFilter && (
                <div className="flex items-center gap-2">
                  {(
                    [
                      { id: 'all', label: 'All time' },
                      { id: '6m', label: 'Last 6 months' },
                      { id: 'month', label: 'This month' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setActivityRange(opt.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        activityRange === opt.id
                          ? 'bg-[#1E4B63] text-white'
                          : 'bg-white dark:bg-[#161822] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* 2x2 Unified Activity Summary Matrix */}
              <motion.div
                variants={itemVariants}
                className={`${cardClass} grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-white/8 overflow-hidden`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className="p-4 flex flex-col items-center text-center gap-1.5 hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <span className="w-10 h-10 rounded-full bg-[#1E4B63]/10 dark:bg-sky-400/15 text-[#1E4B63] dark:text-sky-300 flex items-center justify-center">
                    <Calendar className="w-4.5 h-4.5" strokeWidth={1.9} />
                  </span>
                  <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {events.length}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Events
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className="p-4 flex flex-col items-center text-center gap-1.5 hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <span className="w-10 h-10 rounded-full bg-emerald-500/12 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Check className="w-4.5 h-4.5" strokeWidth={2.2} />
                  </span>
                  <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {attendedCount}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Attended
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (events[0]) onSelectEvent(events[0].id);
                  }}
                  className="p-4 flex flex-col items-center text-center gap-1.5 hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <span className="w-10 h-10 rounded-full bg-[#D85D27]/12 dark:bg-[#FF8A42]/20 text-[#D85D27] dark:text-[#FF8A42] flex items-center justify-center">
                    <Heart className="w-4.5 h-4.5" strokeWidth={1.9} />
                  </span>
                  <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    ₹{totalDonatedInr.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Donated
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEventFilter('upcoming');
                    setActiveTab('events');
                  }}
                  className="p-4 flex flex-col items-center text-center gap-1.5 hover:bg-slate-50/70 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <span className="w-10 h-10 rounded-full bg-amber-500/14 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5" strokeWidth={1.9} />
                  </span>
                  <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-0.5">
                    {upcomingCount}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Upcoming
                  </div>
                </button>
              </motion.div>

              {/* 3 Interactive Smooth Spline Area Trend Cards */}
              <motion.div variants={itemVariants}>
                <TrendAreaCard
                  title="Total Chapter Members"
                  badgeText={`${totalUniqueMembers} active`}
                  series={memberSeries}
                  colorHex="#D85D27"
                  gradientId="serviceMembersGrad"
                  darkStrokeClass="dark:stroke-[#FF8A42]"
                  darkDotClass="dark:fill-[#FF8A42]"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TrendAreaCard
                  title="Total Attendees"
                  badgeText={`${attendedCount + 3} check-ins`}
                  series={attendeeSeries}
                  colorHex="#1E4B63"
                  gradientId="serviceAttendeesGrad"
                  darkStrokeClass="dark:stroke-sky-400"
                  darkDotClass="dark:fill-sky-400"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TrendAreaCard
                  title="Total Funds Donated"
                  subtitle="As reported by members"
                  badgeText={`₹${totalDonatedInr.toLocaleString('en-IN')}`}
                  series={donationSeries}
                  colorHex="#059669"
                  gradientId="serviceFundsGrad"
                  darkStrokeClass="dark:stroke-emerald-400"
                  darkDotClass="dark:fill-emerald-400"
                  valuePrefix="₹"
                />
              </motion.div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: EVENTS                                                    */}
          {/* ================================================================ */}
          {activeTab === 'events' && (
            <motion.div
              key="service-tab-events"
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="px-4 pt-4 space-y-3.5"
            >
              {/* Filter Pills: All Events | My Events | Upcoming */}
              <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-0.5">
                {(
                  [
                    { id: 'all', label: 'All Events' },
                    { id: 'mine', label: 'My Events' },
                    { id: 'upcoming', label: 'Upcoming' },
                  ] as const
                ).map((f) => {
                  const active = eventFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEventFilter(f.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#1E4B63] text-white shadow-sm'
                          : 'bg-white dark:bg-[#161822] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-[#D85D27]/40'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </motion.div>

              {/* Search Bar + Type Filter Trigger */}
              <motion.div variants={itemVariants} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    type="text"
                    value={eventQuery}
                    onChange={(e) => setEventQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27]"
                  />
                  {eventQuery && (
                    <button
                      type="button"
                      onClick={() => setEventQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowEventTypeFilter((v) => !v)}
                  aria-label="Filter by event type"
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    showEventTypeFilter || eventTypeFilter !== 'All'
                      ? 'bg-[#1E4B63] text-white border-[#1E4B63]'
                      : 'bg-white dark:bg-[#161822] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </motion.div>

              {showEventTypeFilter && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {eventTypes.map((typeName) => (
                    <button
                      key={typeName}
                      type="button"
                      onClick={() => setEventTypeFilter(typeName)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                        eventTypeFilter === typeName
                          ? 'bg-[#D85D27] text-white'
                          : 'bg-white dark:bg-[#161822] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10'
                      }`}
                    >
                      {typeName}
                    </button>
                  ))}
                </div>
              )}

              {/* Event Cards List */}
              {filteredEvents.length === 0 ? (
                <div className={`${cardClass} p-8 text-center space-y-3`}>
                  <div className="w-12 h-12 rounded-2xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    No matching service events
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('service_add_event')}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF7A29] to-[#D85D27] text-white text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    + Add Event
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((ev) => (
                    <motion.button
                      key={ev.id}
                      type="button"
                      variants={itemVariants}
                      onClick={() => onSelectEvent(ev.id)}
                      className={`${cardClass} w-full text-left overflow-hidden flex items-stretch hover:border-[#D85D27]/45 active:scale-[0.99] transition-all cursor-pointer`}
                    >
                      {/* Left Visual Panel */}
                      <div className="w-[92px] shrink-0 border-r border-slate-100 dark:border-white/8 overflow-hidden">
                        {ev.photoDataUrl ? (
                          <img
                            src={ev.photoDataUrl}
                            alt={ev.title}
                            className="w-full h-full object-cover"
                          />
                        ) : ev.visualKind === 'blood_donation' ? (
                          <BloodDonationArtwork compact />
                        ) : (
                          <div className="w-full h-full bg-[#FDEEE6] dark:bg-[#D85D27]/18 flex flex-col items-center justify-center px-2 py-4">
                            <span className="font-display text-2xl font-extrabold text-[#D85D27] dark:text-[#FF8A42] leading-none tabular-nums">
                              {ev.dayNum}
                            </span>
                            <span className="mt-1 text-[11px] font-bold tracking-wider uppercase text-[#D85D27]/90 dark:text-[#FF8A42]">
                              {ev.monthShort}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Content */}
                      <div className="flex-1 min-w-0 p-3.5 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white truncate">
                            {ev.title}
                          </h3>
                          {ev.checkedIn && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/12 px-2 py-0.5 rounded-full shrink-0">
                              <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                              <span>Checked in</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate tabular-nums">{ev.dateLabel}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Compass className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {ev.country} | {ev.region}
                          </span>
                        </div>

                        <div className="pt-0.5 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#D85D27] dark:text-[#FF8A42]">
                            <Bookmark className="w-3 h-3" strokeWidth={2.1} />
                            <span>{ev.eventType}</span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: CONNECTIONS                                               */}
          {/* ================================================================ */}
          {activeTab === 'connections' && (
            <motion.div
              key="service-tab-connections"
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="px-4 pt-4 space-y-3.5"
            >
              {/* Filter Pills: All | Request | Suggest | Pending */}
              <motion.div variants={itemVariants} className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    {
                      id: 'all',
                      label: 'All',
                      count: connections.filter((c) => c.status === 'connected').length,
                    },
                    {
                      id: 'request',
                      label: 'Request',
                      count: connections.filter((c) => c.status === 'received').length,
                    },
                    {
                      id: 'suggest',
                      label: 'Suggest',
                      count: connections.filter((c) => c.status === 'suggested').length,
                    },
                    {
                      id: 'pending',
                      label: 'Pending',
                      count: connections.filter((c) => c.status === 'sent').length,
                    },
                  ] as const
                ).map((f) => {
                  const active = connFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setConnFilter(f.id)}
                      className={`py-2 px-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                        active
                          ? 'bg-[#1E4B63] text-white shadow-sm'
                          : 'bg-white dark:bg-[#161822] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span
                        className={`text-[10px] font-mono-tabular ${
                          active ? 'text-sky-200' : 'text-slate-400'
                        }`}
                      >
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </motion.div>

              {/* Search Bar */}
              <motion.div variants={itemVariants} className="relative">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.85}
                />
                <input
                  type="text"
                  value={connQuery}
                  onChange={(e) => setConnQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27]"
                />
                {connQuery && (
                  <button
                    type="button"
                    onClick={() => setConnQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>

              {/* Connection Member Cards */}
              {filteredConnections.length === 0 ? (
                <div className={`${cardClass} p-8 text-center space-y-2`}>
                  <Users className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No members in this queue.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredConnections.map((m) => (
                    <motion.div
                      key={m.id}
                      variants={itemVariants}
                      className={`${cardClass} p-4 space-y-3`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-sm font-bold shrink-0 border border-[#D85D27]/25 ${m.avatarTone}`}
                        >
                          {m.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white leading-snug truncate">
                              {m.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/8 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
                              {m.connectionsCount}+
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#D85D27] dark:text-[#FF8A42] truncate">
                            <Briefcase className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{m.company}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {m.chapter} chapter · {m.category}
                          </div>
                        </div>
                      </div>

                      {/* Consistent Action Pill Buttons */}
                      {m.status === 'connected' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenChatForMember(m)}
                          className="w-full py-2.5 rounded-full bg-emerald-500/12 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        >
                          Message
                        </button>
                      ) : m.status === 'sent' ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-full bg-red-500/12 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/25 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onConnectMember(m.id)}
                          className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#FF7A29] to-[#D85D27] hover:from-[#F26B1D] hover:to-[#BE4D14] active:scale-[0.98] text-white text-xs font-bold shadow-[0_6px_16px_-4px_rgba(216,93,39,0.42)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{m.status === 'received' ? 'Accept Request' : 'Connect'}</span>
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: MESSAGES (OPENS FULL-SCREEN CHAT THREAD)                  */}
          {/* ================================================================ */}
          {activeTab === 'messages' && (
            <div className="flex-1 flex flex-col px-4 pt-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    type="text"
                    value={msgQuery}
                    onChange={(e) => setMsgQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27]"
                  />
                </div>

                <div className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8 overflow-hidden`}>
                  {filteredThreads.map((t) => {
                    const lastMsg = t.messages[t.messages.length - 1];
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onOpenChatThread(t.id)}
                        className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/10 text-[#1E4B63] dark:text-sky-300 font-display text-xs font-bold flex items-center justify-center shrink-0">
                          {t.memberInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                              {t.memberName}
                            </span>
                            <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                              {t.id === 'st-1' ? '21 Oct' : lastMsg?.time || 'Today'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {lastMsg?.text || 'Start a conversation'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </SkeletonCrossfade>
    </PullToRefreshContainer>
  );
}

/* ========================================================================== */
/* FULL-SCREEN SERVICE CHAT SCREEN (08-chat-thread)                           */
/* ========================================================================== */

export function ServiceChatScreen({
  thread,
  onSendMessage,
  onBack,
}: {
  thread: ChatThread;
  onSendMessage: (threadId: string, text: string) => void;
  onBack: () => void;
}) {
  const [chatDraft, setChatDraft] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDraft.trim()) return;
    onSendMessage(thread.id, chatDraft.trim());
    setChatDraft('');
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFBFE] dark:bg-[#0B0D14]">
      {/* Full-Screen Conversation Header */}
      <div className="px-4 py-3.5 bg-white dark:bg-[#151720] border-b border-slate-200/80 dark:border-white/10 flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to messages"
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/8 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200/80 dark:hover:bg-white/14 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/10 text-[#1E4B63] dark:text-sky-300 font-display text-xs font-bold flex items-center justify-center shrink-0">
          {thread.memberInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] font-bold text-slate-900 dark:text-white truncate">
            {thread.memberName}
          </div>
          <div className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate">
            {thread.memberId === 'sc-km' ? 'Offline' : `${thread.company} · ${thread.chapter}`}
          </div>
        </div>
      </div>

      {/* Full-Height Message Stream */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto ekam-scroll">
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-slate-200/70 dark:bg-white/10 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300">
            21 Oct
          </span>
        </div>

        {thread.messages.length === 0 ? (
          <div className="pt-12 text-center text-xs text-slate-400 dark:text-slate-500">
            Start your conversation with {thread.memberName}
          </div>
        ) : (
          thread.messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-snug ${
                    isMe
                      ? 'rounded-2xl rounded-br-sm bg-gradient-to-br from-[#EA580C] to-[#D85D27] text-white shadow-sm'
                      : 'rounded-2xl rounded-bl-sm bg-white dark:bg-[#1C1F2B] text-slate-800 dark:text-slate-100 border border-slate-200/75 dark:border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="mt-1 text-[10px] text-slate-400 tabular-nums">
                  {msg.time}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Pinned Full-Screen Composer */}
      <form
        onSubmit={handleSendChat}
        className="p-3.5 bg-white dark:bg-[#151720] border-t border-slate-200/80 dark:border-white/10 flex items-center gap-2.5 shrink-0"
      >
        <button
          type="button"
          onClick={() => setChatDraft((d) => (d ? `${d} [Photo]` : 'Shared event photo'))}
          aria-label="Attach photo"
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-300 hover:text-[#D85D27] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
        >
          <Camera className="w-4.5 h-4.5" />
        </button>
        <input
          type="text"
          value={chatDraft}
          onChange={(e) => setChatDraft(e.target.value)}
          placeholder="Write a message"
          className="flex-1 min-w-0 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-white/6 border border-slate-200/80 dark:border-white/10 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27]"
        />
        <button
          type="submit"
          disabled={!chatDraft.trim()}
          aria-label="Send message"
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF7A29] to-[#D85D27] disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

/* ========================================================================== */
/* SERVICE EVENT DETAIL SCREEN (06-event-detail)                              */
/* ========================================================================== */

export function ServiceEventDetailScreen({
  event,
  user,
  onToggleCheckIn,
  onToggleVolunteer,
  onAddDonation,
  onBack,
}: {
  event: ServiceEventItem;
  user: UserProfile;
  onToggleCheckIn: (eventId: string) => void;
  onToggleVolunteer: (eventId: string) => void;
  onAddDonation: (eventId: string, amountInr: number, note: string) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'details' | 'members' | 'volunteers' | 'donations'>('details');
  const [reportNotice, setReportNotice] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationNote, setDonationNote] = useState('');

  const isVolunteer = event.volunteers.some((v) => v.name === user.fullName);
  const totalEventDonations = event.donations.reduce((s, d) => s + d.amountInr, 0);

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(donationAmount.replace(/[^0-9]/g, ''));
    if (!numeric || numeric <= 0) return;
    onAddDonation(event.id, numeric, donationNote.trim() || 'Member contribution');
    setDonationAmount('');
    setDonationNote('');
  };

  return (
    <div className="min-h-full bg-[#F4F6FA] dark:bg-[#0B0D14] pb-8 flex flex-col">
      {/* Clean SubHeader */}
      <div className="sticky top-0 z-20 px-4 py-3.5 bg-white/95 dark:bg-[#151720]/95 backdrop-blur-md border-b border-slate-200/75 dark:border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Service Club"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/8 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <h1 className="font-display text-base font-bold text-slate-900 dark:text-white truncate">
            View Events
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setReportNotice((v) => !v)}
          aria-label="Report issue with event"
          className="w-9 h-9 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 flex items-center justify-center cursor-pointer transition-colors"
        >
          <AlertTriangle className="w-4.5 h-4.5" />
        </button>
      </div>

      {reportNotice && (
        <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-400/25 flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <span>Issue flagged for chapter service coordinators.</span>
          <button
            type="button"
            onClick={() => setReportNotice(false)}
            className="text-amber-700 dark:text-amber-300 font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Sub-Tabs: Details | Members | Volunteers | Donations */}
      <div className="px-4 pt-3.5">
        <div className="p-1 rounded-2xl bg-slate-200/65 dark:bg-white/8 flex items-center">
          {(
            [
              { id: 'details', label: 'Details' },
              { id: 'members', label: 'Members' },
              { id: 'volunteers', label: 'Volunteers' },
              { id: 'donations', label: 'Donations' },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-[#1E4B63] text-[#D85D27] dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="px-4 pt-4 space-y-4 flex-1">
        {tab === 'details' && (
          <>
            {/* Event Hero Banner */}
            <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-[#D85D27]/45 dark:border-[#FF8A42]/35 overflow-hidden h-44 flex items-center justify-center shadow-sm">
              {event.photoDataUrl ? (
                <img
                  src={event.photoDataUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : event.visualKind === 'blood_donation' ? (
                <BloodDonationArtwork />
              ) : (
                <span className="font-display text-4xl font-extrabold text-[#D85D27] dark:text-[#FF8A42]">
                  {event.monogram}
                </span>
              )}
            </div>

            {/* Event Title & Schedule Summary */}
            <div className="space-y-1">
              <h2 className="font-display text-xl font-extrabold text-[#D85D27] dark:text-[#FF8A42]">
                {event.title}
              </h2>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {event.startDate} {event.startTime} – {event.endDate} {event.endTime}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">{event.chapter}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D85D27]" />
                <span>
                  {event.country} | {event.region}
                </span>
              </p>
            </div>

            {/* Structured Event Details Card */}
            <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-gradient-to-r from-[#EA580C] to-[#D85D27] text-white font-display text-sm font-bold">
                Event Details
              </div>
              <div className="p-4 divide-y divide-slate-100 dark:divide-white/8 text-xs">
                {[
                  { label: 'Event Type', value: event.eventType },
                  { label: 'Category', value: event.category },
                  { label: 'Mode', value: event.mode },
                  { label: 'Type', value: event.mode === 'In Person' ? 'In-Person' : 'Virtual' },
                  { label: 'Country', value: event.country },
                  { label: 'Region', value: event.region },
                  { label: 'Contact Person', value: event.contactPerson || 'Chapter Lead' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="py-2.5 first:pt-0 last:pb-0 grid grid-cols-[112px_1fr] items-center gap-2"
                  >
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {row.label}
                    </span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      : {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clean Non-Overlapping Check-In Action */}
            <button
              type="button"
              onClick={() => onToggleCheckIn(event.id)}
              className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                event.checkedIn
                  ? 'bg-emerald-500/14 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-[#FF7A29] to-[#D85D27] hover:from-[#F26B1D] hover:to-[#BE4D14] text-white shadow-[0_10px_24px_-6px_rgba(216,93,39,0.48)]'
              }`}
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>{event.checkedIn ? 'Checked in' : 'Check In to Event'}</span>
            </button>
          </>
        )}

        {tab === 'members' && (
          <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/8 overflow-hidden">
            {event.members.map((m) => (
              <div key={m.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#1E4B63]/10 dark:bg-sky-400/15 text-[#1E4B63] dark:text-sky-300 font-display text-xs font-bold flex items-center justify-center shrink-0">
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {m.company}
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/8 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'volunteers' && (
          <div className="space-y-3">
            <div className="rounded-[22px] bg-gradient-to-br from-[#245670] via-[#1E4B63] to-[#173E52] p-4 text-white flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-sm font-bold">Volunteer Squad</div>
                <div className="text-xs text-sky-100/80 mt-0.5">
                  {event.volunteers.length} active volunteers helping coordinate
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleVolunteer(event.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isVolunteer
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-[#1E4B63] hover:bg-sky-50'
                }`}
              >
                {isVolunteer ? 'Volunteering ✓' : '+ Volunteer'}
              </button>
            </div>

            <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/8 overflow-hidden">
              {event.volunteers.map((v) => (
                <div key={v.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#D85D27]/12 text-[#D85D27] dark:text-[#FF8A42] font-display text-xs font-bold flex items-center justify-center shrink-0">
                      {v.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                        {v.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {v.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'donations' && (
          <div className="space-y-3.5">
            <div className="rounded-[22px] bg-gradient-to-br from-[#FF7A29] via-[#E55E22] to-[#BE4D14] p-4 text-white flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium text-white/85">Total Reported Funds</div>
                <div className="font-display text-2xl font-extrabold tabular-nums mt-0.5">
                  ₹{totalEventDonations.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="w-10 h-10 rounded-2xl bg-white/18 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </span>
            </div>

            <form
              onSubmit={handleDonationSubmit}
              className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 p-4 space-y-3"
            >
              <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Report a Donation
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <input
                  type="number"
                  min={1}
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Amount ₹"
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/6 border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D85D27]"
                />
                <input
                  type="text"
                  value={donationNote}
                  onChange={(e) => setDonationNote(e.target.value)}
                  placeholder="Purpose / note (optional)"
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/6 border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D85D27]"
                />
              </div>
              <button
                type="submit"
                disabled={!donationAmount}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#FF7A29] to-[#D85D27] disabled:opacity-45 text-white text-xs font-bold cursor-pointer transition-opacity"
              >
                Log Contribution
              </button>
            </form>

            <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/8 overflow-hidden">
              {event.donations.map((d) => (
                <div key={d.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 font-display text-xs font-bold flex items-center justify-center shrink-0">
                      {d.donorInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                        {d.donorName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {d.note || d.dateLabel}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                    ₹{d.amountInr.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* ADD SERVICE EVENT SCREEN (07-add-event)                                    */
/* ========================================================================== */

export function ServiceAddEventScreen({
  user,
  onCreateEvent,
  onBack,
}: {
  user: UserProfile;
  onCreateEvent: (event: Omit<ServiceEventItem, 'id'>) => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('2026-11-28');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('2026-11-28');
  const [endTime, setEndTime] = useState('13:00');
  const [eventType, setEventType] = useState('Donation');
  const [category, setCategory] = useState('Networking events');
  const [mode, setMode] = useState<'In Person' | 'Virtual'>('In Person');
  const [contactPerson, setContactPerson] = useState(user.fullName);
  const [photoName, setPhotoName] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatDisplayDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const mIdx = Math.max(0, Math.min(11, Number(m) - 1));
    const monthTitle = months[mIdx].charAt(0) + months[mIdx].slice(1).toLowerCase();
    return {
      dayNum: d || '28',
      monthShort: months[mIdx] || 'NOV',
      dateLabel: `${d || '28'} ${monthTitle} ${y || '2026'}`,
      slashDate: `${d || '28'}/${m || '11'}/${y || '2026'}`,
    };
  };

  const formatTime12h = (t: string) => {
    const [hh, mm] = t.split(':');
    const hNum = Number(hh || 10);
    const suffix = hNum >= 12 ? 'PM' : 'AM';
    const h12 = hNum % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${mm || '00'}${suffix}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime || !eventType) {
      setErrorMsg('Please fill in Title, Start Date, Start Time, and Event type.');
      return;
    }
    const startFmt = formatDisplayDate(startDate);
    const endFmt = formatDisplayDate(endDate || startDate);
    const monogram =
      title
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('') || 'SE';

    onCreateEvent({
      title: title.trim(),
      dayNum: startFmt.dayNum,
      monthShort: startFmt.monthShort,
      dateLabel: startFmt.dateLabel,
      startDate: startFmt.slashDate,
      startTime: formatTime12h(startTime),
      endDate: endFmt.slashDate,
      endTime: formatTime12h(endTime || startTime),
      chapter: user.chapter || 'Fortune',
      country: user.country || 'India',
      region: user.region || 'Hyderabad',
      eventType,
      category,
      mode,
      contactPerson: contactPerson.trim() || user.fullName,
      checkedIn: false,
      isMine: true,
      isUpcoming: true,
      monogram,
      visualKind: category === 'Blood Donation' ? 'blood_donation' : 'monogram',
      photoDataUrl,
      members: [
        {
          id: `sm-host-${Date.now()}`,
          name: user.fullName,
          initials: user.initials,
          company: user.businessName,
          role: 'Host',
        },
      ],
      volunteers: [],
      donations: [],
    });
  };

  const fieldClass =
    'w-full px-3.5 py-3 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/85 dark:border-white/12 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27] transition-colors';

  return (
    <div className="min-h-full bg-[#F4F6FA] dark:bg-[#0B0D14] pb-8">
      {/* Clean SubHeader */}
      <div className="sticky top-0 z-20 px-4 py-3.5 bg-white/95 dark:bg-[#151720]/95 backdrop-blur-md border-b border-slate-200/75 dark:border-white/10 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Service Club"
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/8 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <h1 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Add Event
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-3.5">
        {errorMsg && (
          <div className="px-3.5 py-2.5 rounded-2xl bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-400/25 text-xs text-red-700 dark:text-red-300 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
            Title <span className="text-[#D85D27]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrorMsg('');
            }}
            placeholder="e.g., Community Blood Donation Camp"
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
              Start Date <span className="text-[#D85D27]">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
              Start Time <span className="text-[#D85D27]">*</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
            Event type <span className="text-[#D85D27]">*</span>
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className={fieldClass}
          >
            <option value="Donation">Donation</option>
            <option value="Community Drive">Community Drive</option>
            <option value="Health Camp">Health Camp</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={fieldClass}
          >
            <option value="Networking events">Networking events</option>
            <option value="Blood Donation">Blood Donation</option>
            <option value="Social Impact">Social Impact</option>
            <option value="Fundraiser">Fundraiser</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
            Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['In Person', 'Virtual'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                  mode === m
                    ? 'bg-[#1E4B63] text-white border-[#1E4B63]'
                    : 'bg-white dark:bg-[#161822] text-slate-600 dark:text-slate-300 border-slate-200/85 dark:border-white/12'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
            Contact Person
          </label>
          <input
            type="text"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Contact Person"
            className={fieldClass}
          />
        </div>

        {/* Event Photo Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-1">
            Event photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3.5 py-3 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/85 dark:border-white/12 flex items-center gap-3 text-left hover:border-[#D85D27]/50 transition-colors cursor-pointer"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D85D27]/12 text-[#D85D27] dark:text-[#FF8A42] text-xs font-bold shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose File</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {photoName || 'No file chosen'}
            </span>
          </button>
          {photoDataUrl && (
            <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 h-32">
              <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF7A29] to-[#D85D27] hover:from-[#F26B1D] hover:to-[#BE4D14] active:scale-[0.98] text-white text-sm font-bold shadow-[0_12px_24px_-6px_rgba(216,93,39,0.48)] transition-all cursor-pointer mt-2"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
