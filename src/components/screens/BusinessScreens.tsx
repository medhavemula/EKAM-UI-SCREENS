import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Heart,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  ShieldBan,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  ConnectionMember,
  EventItem,
  MeetingItem,
  P2PSession,
  PostItem,
  ReferralItem,
  ScreenId,
  TestimonialItem,
  UserProfile,
  VisitorItem,
} from '../../types/ekam';
import { BusinessCoreStage3D } from '../BusinessCoreStage3D';
import { EditorialHeaderBackdrop } from '../EditorialHeaderBackdrop';
import { EmptyStateView, PremiumButton, SectionHeader } from '../EkamBrand';
import { BusinessHubSkeleton, FeedListSkeleton, SkeletonCrossfade } from '../EkamSkeletons';
import { createSpringItemVariants, createStaggerListVariants } from '../motionPresets';
import { PullToRefreshContainer } from '../PullToRefresh';

function SubHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3.5 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-2 sticky top-0 z-20">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
        </button>
        <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white truncate">{title}</h1>
      </div>
      {right}
    </div>
  );
}

const BUSINESS_SECTIONS = ['opportunities', 'network', 'chapter'] as const;
type BusinessSection = (typeof BUSINESS_SECTIONS)[number];

export function BusinessHomeScreen({
  user,
  referrals = [],
  members = [],
  visitors = [],
  meetings = [],
  p2pSessions = [],
  events = [],
  testimonials = [],
  posts = [],
  connectionsCount,
  visitorsCount,
  referralsCount,
  testimonialsCount,
  meetingsCount = 0,
  onToggleReferralStatus,
  onConnectMember,
  onStartChat,
  onAddVisitor,
  onBookP2P,
  onToggleRsvp,
  onLikePost,
  onSavePost,
  onAddPost,
  reducedMotion = false,
  isLoading = false,
  onRefresh,
  onNavigate,
}: {
  user?: UserProfile;
  referrals?: ReferralItem[];
  members?: ConnectionMember[];
  visitors?: VisitorItem[];
  meetings?: MeetingItem[];
  p2pSessions?: P2PSession[];
  events?: EventItem[];
  testimonials?: TestimonialItem[];
  posts?: PostItem[];
  connectionsCount: number;
  visitorsCount: number;
  referralsCount: number;
  testimonialsCount: number;
  meetingsCount?: number;
  onToggleReferralStatus?: (id: string) => void;
  onConnectMember?: (id: string) => void;
  onStartChat?: (member: ConnectionMember) => void;
  onAddVisitor?: (v: Omit<VisitorItem, 'id'>) => void;
  onBookP2P?: (session: Omit<P2PSession, 'id'>) => void;
  onToggleRsvp?: (id: string) => void;
  onLikePost?: (id: string) => void;
  onSavePost?: (id: string) => void;
  onAddPost?: (content: string, scope: 'chapter') => void;
  reducedMotion?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
  onNavigate: (s: ScreenId) => void;
}) {
  const [[section, direction], setSectionTuple] = useState<[BusinessSection, number]>([
    'opportunities',
    1,
  ]);
  const [pipelineFilter, setPipelineFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [networkTab, setNetworkTab] = useState<'connected' | 'sent' | 'received' | 'blocked'>('connected');
  const [networkQuery, setNetworkQuery] = useState('');
  const [showAddConnectionModal, setShowAddConnectionModal] = useState(false);
  const [addConnQuery, setAddConnQuery] = useState('');
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorCategory, setVisitorCategory] = useState('');
  const [showBookP2PModal, setShowBookP2PModal] = useState(false);
  const [p2pPartner, setP2pPartner] = useState(members[0]?.name || 'Akash Madicetty');
  const [p2pTopic, setP2pTopic] = useState('');
  const [p2pLocation, setP2pLocation] = useState('Jubilee Hills Roastery');
  const [attendanceCheckedIn, setAttendanceCheckedIn] = useState(false);
  const [chapterFeedDraft, setChapterFeedDraft] = useState('');
  const [show3DStageModal, setShow3DStageModal] = useState(false);

  const selectSection = (next: BusinessSection) => {
    if (next === section) return;
    const prevIdx = BUSINESS_SECTIONS.indexOf(section);
    const nextIdx = BUSINESS_SECTIONS.indexOf(next);
    setSectionTuple([next, nextIdx > prevIdx ? 1 : -1]);
  };

  // Opportunities Metrics
  const givenReferrals = referrals.filter((r) => r.direction === 'given');
  const receivedReferrals = referrals.filter((r) => r.direction === 'received');
  const closedReferrals = referrals.filter((r) => r.status === 'Closed');
  const activePipelineReferrals = referrals.filter((r) => r.status !== 'Closed');
  const totalPipelineInr = referrals.reduce((sum, r) => sum + r.valueInr, 0);
  const closedBusinessInr = closedReferrals.reduce((sum, r) => sum + r.valueInr, 0);
  const visiblePipeline = referrals.filter((r) => {
    if (pipelineFilter === 'active') return r.status !== 'Closed';
    if (pipelineFilter === 'closed') return r.status === 'Closed';
    return true;
  });

  // Network Metrics
  const connectedMembers = members.filter((m) => m.status === 'connected');
  const sentMembers = members.filter((m) => m.status === 'sent');
  const receivedMembers = members.filter((m) => m.status === 'received');
  const blockedMembers = members.filter((m) => m.status === 'blocked');
  const suggestedMembers = members.filter((m) => m.status === 'suggested');
  const filteredNetworkMembers = members.filter((m) => {
    const q = networkQuery.trim().toLowerCase();
    const matchQ =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);
    return m.status === networkTab && matchQ;
  });
  const filteredSuggested = suggestedMembers.filter((m) => {
    const q = addConnQuery.trim().toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  const visitorsAdded = visitors.filter((v) => v.stage === 'Added').length;
  const visitorsInvited = visitors.filter((v) => v.stage === 'Invited').length;
  const visitorsRegistered = visitors.filter((v) => v.stage === 'Registered').length;

  // Chapter Metrics
  const nextMeeting = meetings[0];
  const completedMeetingsCount = meetings.filter((m) => m.status === 'Completed').length;
  const attendancePct = meetings.length > 0
    ? Math.min(100, Math.round(((completedMeetingsCount + (attendanceCheckedIn ? 1 : 0)) / Math.max(1, meetings.length)) * 100))
    : 94;
  const chapterPosts = posts.filter((p) => p.scope === 'chapter');
  const receivedTestimonials = testimonials.filter((t) => t.type === 'received');
  const givenTestimonials = testimonials.filter((t) => t.type === 'given');
  const requestTestimonials = testimonials.filter((t) => t.type === 'request');

  const sectionSlideVariants = {
    enter: (dir: number) =>
      reducedMotion ? { opacity: 0 } : { opacity: 0, x: dir * 24 },
    center: {
      opacity: 1,
      x: 0,
      transition: reducedMotion
        ? { duration: 0.1 }
        : { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: (dir: number) =>
      reducedMotion
        ? { opacity: 0 }
        : {
            opacity: 0,
            x: dir * -20,
            transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const },
          },
  };

  const listVariants = createStaggerListVariants(reducedMotion, 0.055, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  const orangeHeroClass =
    'relative rounded-[24px] bg-gradient-to-br from-[#FF7A29] via-[#E55E22] to-[#BE4D14] p-5 text-white border border-[#FFC296]/45 shadow-[0_20px_42px_-12px_rgba(216,93,39,0.48),inset_0_1px_1px_rgba(255,255,255,0.42)] overflow-hidden';

  const navyHeroClass =
    'relative rounded-[24px] bg-gradient-to-br from-[#0B1D2C] via-[#123142] to-[#19455C] p-5 text-white border border-sky-300/20 shadow-[0_18px_38px_-12px_rgba(18,49,66,0.46),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden';

  const glassCardClass =
    'rounded-[22px] bg-white/88 dark:bg-[#131926]/88 backdrop-blur-md border border-[#D85D27]/20 dark:border-[#F38B1E]/22 shadow-[0_16px_36px_-12px_rgba(216,93,39,0.16),0_6px_16px_-6px_rgba(18,49,66,0.1),inset_0_1px_1px_rgba(255,255,255,0.85)] dark:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.72),0_0_24px_-8px_rgba(243,139,30,0.18),inset_0_1px_1px_rgba(255,255,255,0.08)]';

  const navyGlassCardClass =
    'rounded-[22px] bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(235,243,249,0.88)_100%)] dark:bg-[linear-gradient(145deg,rgba(18,38,54,0.86)_0%,rgba(13,22,36,0.92)_100%)] backdrop-blur-md border border-[#123142]/18 dark:border-sky-300/20 shadow-[0_16px_36px_-12px_rgba(18,49,66,0.18),inset_0_1px_1px_rgba(255,255,255,0.85)] dark:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.72),0_0_22px_-8px_rgba(56,189,248,0.18),inset_0_1px_1px_rgba(255,255,255,0.08)]';

  const copperGlassCardClass =
    'rounded-[22px] bg-[linear-gradient(145deg,rgba(255,251,247,0.95)_0%,rgba(253,234,220,0.84)_100%)] dark:bg-[linear-gradient(145deg,rgba(44,24,18,0.88)_0%,rgba(22,16,20,0.92)_100%)] backdrop-blur-md border border-[#D85D27]/28 dark:border-[#F38B1E]/28 shadow-[0_16px_36px_-12px_rgba(216,93,39,0.22),inset_0_1px_1px_rgba(255,255,255,0.85)] dark:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.72),0_0_24px_-8px_rgba(216,93,39,0.22),inset_0_1px_1px_rgba(255,255,255,0.08)]';

  const handleHeaderPrimaryAction = () => {
    if (section === 'opportunities') {
      onNavigate('pass_referral');
    } else if (section === 'network') {
      setShowAddVisitorModal(true);
    } else {
      setShowBookP2PModal(true);
    }
  };

  const headerSubtitle =
    section === 'opportunities'
      ? 'Referrals, closed business & deal pipeline'
      : section === 'network'
        ? 'Member connections & chapter visitors'
        : 'Meetings, events, proof & chapter feed';

  const reportBars = [
    Math.max(24, givenReferrals.length * 18),
    Math.max(30, receivedReferrals.length * 22),
    Math.max(36, closedReferrals.length * 28),
    Math.max(42, connectedMembers.length * 10),
    Math.max(28, p2pSessions.length * 22),
    Math.min(96, 44 + referralsCount * 12),
  ];

  return (
    <PullToRefreshContainer tone="dark" reducedMotion={reducedMotion} onRefresh={onRefresh}>
      <SkeletonCrossfade
        loading={isLoading}
        reducedMotion={reducedMotion}
        skeleton={<BusinessHubSkeleton reducedMotion={reducedMotion} />}
      >
        <div className="min-h-full bg-[#F2F5F9] dark:bg-[#080B12] pb-8 relative">
          {/* Midnight Navy Header + Segmented Glass Navigation Bar (Inspired by Professional Screen) */}
          <div className="relative bg-gradient-to-b from-[#060F1E] via-[#091930] to-[#122338] px-4 pt-4 pb-4 text-white overflow-hidden">
            {/* Subtle ambient warm-orange glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-2 -bottom-6 w-72 h-28 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.28)_0%,rgba(249,115,22,0.12)_50%,transparent_75%)] blur-xl"
            />

            {/* Editorial Abstract Waves & Light Beams Illustration */}
            <EditorialHeaderBackdrop reducedMotion={reducedMotion} />

            {/* TOP ROW: Chapter Location Left + Notification Bell Right */}
            <div className="relative z-20 flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-1.5 text-[13px] font-medium text-white/95 hover:text-white transition-colors cursor-pointer"
              >
                <span className="tracking-[-0.01em]">
                  {user?.region || 'Hyderabad'} – {user?.chapter || 'Fortune'} Chapter
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

            {/* MIDDLE ROW: Business Heading & Subtitle Left + Warm Glass Plus Action Right */}
            <div className="relative z-20 mt-3 mb-5 flex items-center justify-between gap-2">
              <div className="min-w-0 pr-2">
                <h1 className="font-display text-[33px] font-extrabold tracking-[-0.02em] leading-[1.08] text-white">
                  Business
                </h1>
                <p className="mt-1.5 text-[13px] font-normal text-white/85 leading-snug truncate">
                  {headerSubtitle}
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                onClick={handleHeaderPrimaryAction}
                aria-label={
                  section === 'opportunities'
                    ? 'Pass a referral'
                    : section === 'network'
                      ? 'Add visitor'
                      : 'Book one-to-one'
                }
                className="relative z-30 w-[48px] h-[48px] rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(238,150,98,0.78)_0%,rgba(190,96,48,0.72)_60%,rgba(142,68,32,0.82)_100%)] backdrop-blur-md text-white border border-[#F8C29B]/55 shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_1px_3px_rgba(255,255,255,0.38)] flex items-center justify-center cursor-pointer shrink-0"
              >
                <Plus className="w-6 h-6 text-white" strokeWidth={2} />
              </motion.button>
            </div>

            {/* BOTTOM ROW: Full-Width Rounded Pill Glass Navigation Bar (Opportunities | Network | Chapter) */}
            <div className="relative z-20 rounded-full bg-[linear-gradient(90deg,rgba(26,38,58,0.76)_0%,rgba(44,50,68,0.68)_52%,rgba(68,54,62,0.66)_100%)] backdrop-blur-xl border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_8px_24px_rgba(0,0,0,0.35)] p-1 flex items-center">
              {(
                [
                  { id: 'opportunities', label: 'Opportunities', icon: Briefcase, flexClass: 'flex-[1.34_1_0%]' },
                  { id: 'network', label: 'Network', icon: Users, flexClass: 'flex-[0.92_1_0%]' },
                  { id: 'chapter', label: 'Chapter', icon: Compass, flexClass: 'flex-[0.92_1_0%]' },
                ] as const
              ).map((item, index) => {
                const active = section === item.id;
                const Icon = item.icon;
                return (
                  <React.Fragment key={item.id}>
                    <button
                      type="button"
                      onClick={() => selectSection(item.id)}
                      className={`relative z-10 min-w-0 ${item.flexClass} min-h-[40px] rounded-full text-[11.5px] sm:text-[12.5px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 px-2.5 ${
                        active ? 'text-[#101828] font-bold' : 'text-white/90 hover:text-white font-medium'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="bizSectionGlassPill"
                          transition={
                            reducedMotion
                              ? { duration: 0.1 }
                              : { type: 'spring', stiffness: 400, damping: 32 }
                          }
                          className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                        />
                      )}

                      <span className="relative z-10 flex items-center justify-center shrink-0">
                        <Icon
                          className={`w-[14px] h-[14px] ${
                            active ? 'text-[#EA580C]' : 'text-white/85'
                          }`}
                          strokeWidth={1.9}
                        />
                      </span>

                      <span className="relative z-10 tracking-[-0.015em] whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>

                    {index < 2 && (
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

          {/* DIRECTIONAL SECTION BODY */}
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {/* ============================================================== */}
            {/* TAB 1: OPPORTUNITIES                                           */}
            {/* ============================================================== */}
            {section === 'opportunities' && (
              <motion.div
                key="biz-opportunities"
                custom={direction}
                variants={sectionSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="px-4 pt-4 space-y-4"
              >
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {/* 1. Business Opportunity Card (Matched to Dashboard Orange Palette) */}
                  <motion.div
                    variants={itemVariants}
                    className="relative rounded-[24px] bg-gradient-to-br from-[#FF782C] via-[#F26422] to-[#D85D27] p-5 text-white border border-[#FFC296]/45 shadow-[0_14px_30px_-10px_rgba(216,93,39,0.5),inset_0_1px_1px_rgba(255,255,255,0.42)] overflow-hidden"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-12 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(255,228,196,0.3)_0%,rgba(242,100,34,0.1)_55%,transparent_75%)]"
                    />

                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/95">
                          <Sparkles className="w-3.5 h-3.5 text-[#0E2434]" />
                          <span>Business Opportunity</span>
                        </div>
                        <div className="mt-2 font-display text-[30px] font-extrabold tracking-tight leading-none font-mono-tabular text-white drop-shadow-[0_2px_10px_rgba(11,29,44,0.22)]">
                          ₹{totalPipelineInr.toLocaleString('en-IN')}
                        </div>
                        <p className="mt-1.5 text-xs text-white/90">
                          Total chapter pipeline across {referralsCount} active referrals
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShow3DStageModal(true)}
                        title="Open 3D Business Nexus"
                        className="w-11 h-11 rounded-2xl bg-[#0E2434]/90 hover:bg-[#0B1D2C] border border-white/20 shadow-[0_8px_18px_-4px_rgba(11,29,44,0.45)] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        aria-label="Open 3D Business Stage"
                      >
                        <Compass className="w-5 h-5 text-[#F38B1E]" />
                      </button>
                    </div>

                    {/* Deep EKAM Navy Telemetry Strip inside Orange Hero */}
                    <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#0E2434]/92 backdrop-blur-md border border-white/15 p-2.5 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                      <div>
                        <div className="text-[10px] font-medium text-slate-300">Referrals</div>
                        <div className="font-display text-sm font-bold text-white tabular-nums mt-0.5">
                          {referralsCount}
                        </div>
                      </div>
                      <div className="border-x border-white/12">
                        <div className="text-[10px] font-medium text-slate-300">Business Closed</div>
                        <div className="font-display text-sm font-bold text-[#F38B1E] font-mono-tabular mt-0.5">
                          ₹{(closedBusinessInr / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium text-slate-300">Links</div>
                        <div className="font-display text-sm font-bold text-white tabular-nums mt-0.5">
                          {connectionsCount}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 mt-4 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => onNavigate('pass_referral')}
                        className="min-h-[42px] px-2.5 py-2 rounded-xl bg-[#0E2434] hover:bg-[#091926] text-[11.5px] sm:text-xs font-semibold text-white border border-white/15 shadow-[0_10px_20px_-6px_rgba(11,29,44,0.55)] transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#F38B1E] shrink-0" strokeWidth={2.4} />
                        <span>Pass a Referral</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('opportunity')}
                        className="min-h-[42px] px-2.5 py-2 rounded-xl bg-white hover:bg-orange-50 text-[11.5px] sm:text-xs font-bold text-[#123142] border border-white shadow-[0_10px_20px_-6px_rgba(11,29,44,0.28)] transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <span>Business Pipeline</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#D85D27] shrink-0" strokeWidth={2.4} />
                      </button>
                    </div>
                  </motion.div>

                  {/* 2. Referrals (Deep Navy) & Business Closed (Warm Copper-Glass) Bento Cards */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onNavigate('opportunity')}
                      className="relative text-left rounded-[22px] bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#1A465E] p-4 text-white border border-sky-300/20 shadow-[0_16px_34px_-12px_rgba(18,49,66,0.48),inset_0_1px_1px_rgba(255,255,255,0.22)] hover:shadow-[0_18px_38px_-10px_rgba(18,49,66,0.58)] active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[radial-gradient(circle,rgba(243,139,30,0.24)_0%,transparent_70%)]"
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#F38B1E] text-[#0B1D2C] shadow-[0_6px_14px_-3px_rgba(243,139,30,0.55)] flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/65" />
                      </div>
                      <div className="relative z-10 mt-3 font-display text-sm font-bold text-white">
                        Referrals
                      </div>
                      <div className="relative z-10 mt-0.5 text-xs text-slate-300 tabular-nums">
                        {givenReferrals.length} given · {receivedReferrals.length} received
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('opportunity')}
                      className={`text-left ${copperGlassCardClass} p-4 hover:border-[#D85D27]/50 active:scale-[0.98] transition-all cursor-pointer`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A29] to-[#D85D27] text-white shadow-[0_8px_18px_-4px_rgba(216,93,39,0.45)] flex items-center justify-center">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#D85D27]/70" />
                      </div>
                      <div className="mt-3 font-display text-sm font-bold text-[#123142] dark:text-white">
                        Business Closed
                      </div>
                      <div className="mt-0.5 text-xs font-mono-tabular font-bold text-[#D85D27] dark:text-[#F38B1E]">
                        ₹{closedBusinessInr.toLocaleString('en-IN')} ({closedReferrals.length})
                      </div>
                    </button>
                  </motion.div>

                  {/* 3. Interactive Business Pipeline Preview (Elevated Glass Card) */}
                  <motion.div variants={itemVariants} className={`${glassCardClass} p-4 space-y-3.5`}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h2 className="font-display text-sm font-bold text-[#123142] dark:text-white">
                          Business Pipeline
                        </h2>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                          Track deal progress &amp; close chapter referrals
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('opportunity')}
                        className="text-xs font-semibold text-[#D85D27] hover:underline cursor-pointer shrink-0"
                      >
                        See all
                      </button>
                    </div>

                    {/* Filter Segments */}
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#123142]/[0.06] dark:bg-white/[0.06]">
                      {(
                        [
                          { id: 'all', label: `All (${referrals.length})` },
                          { id: 'active', label: `Active (${activePipelineReferrals.length})` },
                          { id: 'closed', label: `Closed (${closedReferrals.length})` },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPipelineFilter(t.id)}
                          className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            pipelineFilter === t.id
                              ? 'bg-gradient-to-r from-[#FF7A29] to-[#D85D27] text-white shadow-[0_4px_12px_-2px_rgba(216,93,39,0.45)]'
                              : 'text-[#123142]/75 dark:text-slate-400 hover:text-[#123142] dark:hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {visiblePipeline.length === 0 ? (
                      <div className="py-5 text-center space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          No referrals in this pipeline stage yet.
                        </p>
                        <PremiumButton size="sm" onClick={() => onNavigate('pass_referral')}>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pass a Referral</span>
                        </PremiumButton>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {visiblePipeline.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            className={`rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.85)_0%,rgba(244,247,252,0.75)_100%)] dark:bg-white/[0.05] border border-[#123142]/12 dark:border-white/10 p-3.5 space-y-2 shadow-[0_4px_14px_-6px_rgba(18,49,66,0.1)] ${
                              r.direction === 'received'
                                ? 'transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.015] hover:border-[#F38B1E]/45 hover:shadow-[0_14px_30px_-10px_rgba(243,139,30,0.28),0_8px_20px_-8px_rgba(38,140,166,0.24)]'
                                : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-[11px] font-medium text-[#123142]/70 dark:text-slate-400">
                                  {r.direction === 'given' ? 'Given to' : 'From'} {r.memberName} · {r.warmth} · {r.status}
                                </div>
                                <h3 className="font-display text-[13.5px] font-bold text-[#123142] dark:text-white truncate mt-0.5">
                                  {r.topic}
                                </h3>
                              </div>
                              <span className="font-mono-tabular text-xs font-bold text-[#D85D27] dark:text-[#F38B1E] shrink-0">
                                ₹{r.valueInr.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#123142]/10 dark:border-white/10">
                              <span className="text-slate-500 dark:text-slate-400 truncate">
                                Contact: {r.contactName} · {r.date}
                              </span>
                              {onToggleReferralStatus && (
                                <button
                                  type="button"
                                  onClick={() => onToggleReferralStatus(r.id)}
                                  className="font-semibold text-[#D85D27] hover:text-[#BE4D14] dark:text-[#F38B1E] cursor-pointer shrink-0 ml-2"
                                >
                                  {r.status === 'Closed' ? 'Reopen' : 'Mark closed'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* 4. Links (Navy-Glass) & Reports (Copper-Glass) Bento Pair */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Links Card */}
                    <button
                      type="button"
                      onClick={() => onNavigate('connections')}
                      className={`text-left ${navyGlassCardClass} p-4 flex items-center justify-between gap-3 hover:border-[#123142]/45 active:scale-[0.98] transition-all cursor-pointer`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#123142] to-[#1A465E] text-[#F38B1E] shadow-[0_8px_16px_-4px_rgba(18,49,66,0.38)] flex items-center justify-center shrink-0">
                          <Link2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-bold text-[#123142] dark:text-white">
                            Links
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 tabular-nums truncate">
                            {connectionsCount} verified partner links
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#123142]/50 dark:text-slate-400 shrink-0" />
                    </button>

                    {/* Reports Card with Live EKAM Sparkline */}
                    <button
                      type="button"
                      onClick={() => onNavigate('reports')}
                      className={`text-left ${copperGlassCardClass} p-4 flex items-center justify-between gap-3 hover:border-[#D85D27]/50 active:scale-[0.98] transition-all cursor-pointer`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF7A29] to-[#D85D27] text-white shadow-[0_8px_18px_-4px_rgba(216,93,39,0.45)] flex items-center justify-center shrink-0">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-bold text-[#123142] dark:text-white">
                            Reports
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                            Chapter ROI &amp; trends
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end gap-1 h-8 shrink-0" aria-hidden="true">
                        {reportBars.map((pct, i) => (
                          <span
                            key={i}
                            className={`w-1.5 rounded-full ${
                              i === reportBars.length - 1
                                ? 'bg-[#D85D27]'
                                : 'bg-[#123142]/55 dark:bg-sky-300/55'
                            }`}
                            style={{ height: `${Math.max(25, Math.min(100, pct))}%` }}
                          />
                        ))}
                      </div>
                    </button>
                  </motion.div>

                  {/* 5. Deep EKAM Navy Quick Launch Banner */}
                  <motion.div
                    variants={itemVariants}
                    className={`${navyHeroClass} p-4 flex items-center justify-between gap-3`}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-6 -top-8 w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(243,139,30,0.28)_0%,transparent_70%)]"
                    />
                    <div className="relative z-10 min-w-0">
                      <div className="font-display text-sm font-bold text-white">
                        Ready to pass a warm introduction?
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Log a new referral for a Fortune chapter partner in seconds.
                      </p>
                    </div>
                    <PremiumButton size="sm" onClick={() => onNavigate('pass_referral')} className="relative z-10">
                      <span>Pass a Referral</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </PremiumButton>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: NETWORK                                                 */}
            {/* ============================================================== */}
            {section === 'network' && (
              <motion.div
                key="biz-network"
                custom={direction}
                variants={sectionSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="px-4 pt-4 space-y-4"
              >
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {/* 1. Member Discovery (Deep Navy) & Visitors (Bold EKAM Orange) Hero Pair */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onNavigate('connections')}
                      className="relative rounded-[24px] bg-gradient-to-br from-[#0B1D2C] via-[#123142] to-[#1A465E] p-4 text-left text-white border border-sky-300/20 overflow-hidden shadow-[0_18px_36px_-12px_rgba(18,49,66,0.48),inset_0_1px_1px_rgba(255,255,255,0.22)] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Users
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-2 -bottom-2 w-20 h-20 text-white/10"
                        strokeWidth={1.8}
                      />
                      <div className="relative z-10 space-y-4">
                        <div className="w-9.5 h-9.5 rounded-xl bg-[#F38B1E] text-[#0B1D2C] shadow-[0_6px_14px_-3px_rgba(243,139,30,0.55)] flex items-center justify-center">
                          <UserCheck className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="text-[11px] font-medium text-slate-300">Connections</div>
                          <div className="font-display text-lg font-bold tabular-nums mt-0.5">
                            {connectedMembers.length} Members
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddVisitorModal(true)}
                      className="relative rounded-[24px] bg-gradient-to-br from-[#FF7A29] via-[#E55E22] to-[#BE4D14] p-4 text-left text-white border border-[#FFC296]/45 overflow-hidden shadow-[0_18px_38px_-12px_rgba(216,93,39,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <UserPlus
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-2 -bottom-2 w-20 h-20 text-white/18"
                        strokeWidth={1.8}
                      />
                      <div className="relative z-10 space-y-4">
                        <div className="w-9.5 h-9.5 rounded-xl bg-[#0E2434] text-[#F38B1E] shadow-[0_6px_14px_-3px_rgba(11,29,44,0.45)] flex items-center justify-center">
                          <UserPlus className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="text-[11px] font-medium text-white/90">Visitors</div>
                          <div className="font-display text-lg font-bold tabular-nums mt-0.5">
                            {visitorsCount} Guests
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>

                  {/* 2. Quick Network Action Strip: Add Connection & Add Visitor */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowAddConnectionModal(true)}
                      className={`${navyGlassCardClass} px-3.5 py-3 flex items-center justify-center gap-2 text-xs font-bold text-[#123142] dark:text-white hover:border-[#123142]/45 active:scale-[0.98] transition-all cursor-pointer`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#123142] text-[#F38B1E] flex items-center justify-center shrink-0">
                        <UserPlus className="w-3.5 h-3.5" />
                      </span>
                      <span>Add Connection</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddVisitorModal(true)}
                      className={`${copperGlassCardClass} px-3.5 py-3 flex items-center justify-center gap-2 text-xs font-bold text-[#123142] dark:text-white hover:border-[#D85D27]/50 active:scale-[0.98] transition-all cursor-pointer`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#D85D27] text-white flex items-center justify-center shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                      <span>Add Visitor</span>
                    </button>
                  </motion.div>

                  {/* 3. Member Directory & Request Queues (Elevated Glass Card) */}
                  <motion.div variants={itemVariants} className={`${glassCardClass} p-4 space-y-3.5`}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h2 className="font-display text-sm font-bold text-[#123142] dark:text-white">
                          Member Connections
                        </h2>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                          Manage chapter links, requests &amp; blocked members
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('connections')}
                        className="text-xs font-semibold text-[#D85D27] hover:underline cursor-pointer shrink-0"
                      >
                        Full list
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#123142]/50 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={networkQuery}
                        onChange={(e) => setNetworkQuery(e.target.value)}
                        placeholder="Search member, company or category"
                        className="w-full h-10.5 pl-10 pr-9 rounded-xl bg-[#F4F6FA] dark:bg-[#0D1018] border border-[#123142]/12 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27]"
                      />
                      {networkQuery && (
                        <button
                          type="button"
                          onClick={() => setNetworkQuery('')}
                          aria-label="Clear member search"
                          className="w-7 h-7 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-400 flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 4 Exact Queues: Connections | Sent Requests | Received Requests | Blocked Members */}
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { id: 'connected', label: 'Connections', count: connectedMembers.length, icon: Users },
                          { id: 'sent', label: 'Sent Requests', count: sentMembers.length, icon: Clock },
                          { id: 'received', label: 'Received Requests', count: receivedMembers.length, icon: UserCheck },
                          { id: 'blocked', label: 'Blocked Members', count: blockedMembers.length, icon: ShieldBan },
                        ] as const
                      ).map((tab) => {
                        const active = networkTab === tab.id;
                        const TabIcon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setNetworkTab(tab.id)}
                            className={`rounded-2xl p-2.5 text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              active
                                ? 'bg-gradient-to-r from-[#FF7A29] to-[#D85D27] border-transparent text-white shadow-[0_8px_18px_-4px_rgba(216,93,39,0.45)]'
                                : 'bg-[#F4F6FA] dark:bg-white/[0.05] border-[#123142]/10 dark:border-white/10 text-[#123142] dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <TabIcon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  active ? 'text-[#0E2434]' : 'text-[#D85D27]'
                                }`}
                              />
                              <span className="text-[11px] font-semibold truncate">{tab.label}</span>
                            </div>
                            <span className="font-mono-tabular text-xs font-bold shrink-0">
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Filtered Member Rows */}
                    {filteredNetworkMembers.length === 0 ? (
                      <div className="py-5 text-center space-y-2.5">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {networkTab === 'blocked'
                            ? 'No blocked members.'
                            : networkTab === 'received'
                              ? 'No pending incoming connection requests.'
                              : networkTab === 'sent'
                                ? 'No outgoing connection requests awaiting reply.'
                                : 'No matching connections found.'}
                        </p>
                        {networkTab !== 'blocked' && (
                          <PremiumButton size="sm" onClick={() => setShowAddConnectionModal(true)}>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add Connection</span>
                          </PremiumButton>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredNetworkMembers.slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.85)_0%,rgba(244,247,252,0.75)_100%)] dark:bg-white/[0.05] border border-[#123142]/12 dark:border-white/10 p-3 flex items-center justify-between gap-3 shadow-[0_4px_14px_-6px_rgba(18,49,66,0.1)]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-display text-xs font-bold shrink-0 ${m.avatarTone}`}
                              >
                                {m.initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-display text-[13.5px] font-bold text-[#123142] dark:text-white truncate">
                                  {m.name}
                                </div>
                                <div className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate">
                                  {m.company} · {m.chapter}
                                </div>
                              </div>
                            </div>

                            {m.status === 'received' && onConnectMember ? (
                              <PremiumButton size="sm" onClick={() => onConnectMember(m.id)}>
                                Accept
                              </PremiumButton>
                            ) : m.status === 'sent' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 shrink-0">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Sent</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onStartChat ? onStartChat(m) : onNavigate('messages')
                                }
                                aria-label={`Message ${m.name}`}
                                className="w-9 h-9 rounded-xl bg-[#123142] hover:bg-[#0D2431] text-[#F38B1E] shadow-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* 4. Visitors Pipeline & Management (Elevated Navy-Glass Card) */}
                  <motion.div variants={itemVariants} className={`${navyGlassCardClass} p-4 space-y-3.5`}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h2 className="font-display text-sm font-bold text-[#123142] dark:text-white">
                          Visitors
                        </h2>
                        <p className="text-[11.5px] text-slate-600 dark:text-slate-300">
                          Track chapter guest invitations &amp; registrations
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('visitors')}
                        className="text-xs font-semibold text-[#D85D27] hover:underline cursor-pointer shrink-0"
                      >
                        Manage
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Added', count: visitorsAdded },
                        { label: 'Invited', count: visitorsInvited },
                        { label: 'Registered', count: visitorsRegistered },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-xl bg-white/85 dark:bg-white/[0.06] border border-[#D85D27]/20 dark:border-white/10 p-2.5 text-center shadow-2xs"
                        >
                          <div className="font-display text-lg font-bold text-[#123142] dark:text-white tabular-nums">
                            {stat.count}
                          </div>
                          <div className="text-[11px] text-[#D85D27] dark:text-[#F38B1E] font-medium">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {visitors.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#D85D27]/35 bg-white/60 dark:bg-white/[0.03] p-4 text-center space-y-2">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Invite a business owner to experience Thursday&apos;s Fortune chapter meeting.
                        </p>
                        <PremiumButton size="sm" onClick={() => setShowAddVisitorModal(true)}>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Visitor</span>
                        </PremiumButton>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {visitors.slice(0, 3).map((v) => (
                          <div
                            key={v.id}
                            className="rounded-2xl bg-white/85 dark:bg-white/[0.05] border border-[#123142]/12 dark:border-white/10 p-3 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="font-display text-xs font-bold text-[#123142] dark:text-white truncate">
                                {v.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {v.company} · {v.category}
                              </div>
                              <div className="text-[10.5px] text-slate-400 mt-0.5">{v.meetingDate}</div>
                            </div>
                            <span className="text-xs font-semibold text-[#D85D27] shrink-0">
                              {v.stage}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: CHAPTER                                                 */}
            {/* ============================================================== */}
            {section === 'chapter' && (
              <motion.div
                key="biz-chapter"
                custom={direction}
                variants={sectionSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="px-4 pt-4 space-y-4"
              >
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {/* 1. Meetings & P2P + Attendance Bold EKAM Orange Hero Card */}
                  <motion.div
                    variants={itemVariants}
                    className={`${orangeHeroClass} space-y-4`}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(255,228,196,0.34)_0%,transparent_72%)]"
                    />

                    <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold uppercase tracking-[0.12em] text-white/95">
                        Meetings &amp; P2P
                      </span>
                      <span className="text-white/90 font-medium tabular-nums">
                        {meetingsCount} chapter sessions
                      </span>
                    </div>

                    {nextMeeting && (
                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 rounded-xl overflow-hidden bg-white text-center shrink-0 shadow-[0_6px_14px_-3px_rgba(11,29,44,0.3)]">
                            <div className="bg-[#0E2434] text-[#F38B1E] text-[10px] font-bold py-0.5">
                              {nextMeeting.dayShort}
                            </div>
                            <div className="text-[#123142] font-display text-base font-bold py-1 tabular-nums">
                              {nextMeeting.dayNum}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h2 className="font-display text-lg font-bold truncate text-white">
                              {nextMeeting.weekday}
                            </h2>
                            <p className="text-xs text-white/90 truncate">
                              {nextMeeting.time} · {nextMeeting.format} · {nextMeeting.membersCount} members
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onNavigate('meetings')}
                          className="min-h-[38px] px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 border border-white text-xs font-bold text-[#123142] shadow-[0_8px_18px_-5px_rgba(11,29,44,0.3)] cursor-pointer shrink-0 transition-all active:scale-[0.98] whitespace-nowrap"
                        >
                          Schedule
                        </button>
                      </div>
                    )}

                    {/* Deep EKAM Navy Attendance Check-In Sub-Panel */}
                    <div className="relative z-10 rounded-2xl bg-[#0E2434]/92 backdrop-blur-md border border-white/15 p-3 flex items-center justify-between gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#F38B1E]">
                          Attendance
                        </div>
                        <div className="mt-0.5 text-xs text-white font-medium tabular-nums">
                          {attendancePct}% chapter presence · {completedMeetingsCount} meetings logged
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttendanceCheckedIn((v) => !v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                          attendanceCheckedIn
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#D85D27] hover:bg-[#BE4D14] text-white shadow-sm'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{attendanceCheckedIn ? 'Checked In' : 'Check In'}</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* 2. One-to-One (Copper-Glass) & Many To One (Deep Navy) Bento Pair */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                    <div className={`${copperGlassCardClass} p-4 flex flex-col justify-between gap-3`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A29] to-[#D85D27] text-white shadow-[0_8px_16px_-4px_rgba(216,93,39,0.45)] flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <span className="font-mono-tabular text-xs font-bold text-[#123142] dark:text-[#F38B1E]">
                            {p2pSessions.length}
                          </span>
                        </div>
                        <div className="mt-3 font-display text-sm font-bold text-[#123142] dark:text-white">
                          One-to-One
                        </div>
                        <div className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                          {p2pSessions[0] ? `Next: ${p2pSessions[0].partnerName}` : 'Book member P2P'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBookP2PModal(true)}
                          className="flex-1 py-1.5 rounded-xl bg-[#123142] hover:bg-[#0D2431] text-white text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Book P2P
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('meetings')}
                          aria-label="View all One-to-One sessions"
                          className="w-8 h-7 rounded-xl bg-white/80 dark:bg-white/10 text-[#123142] dark:text-white border border-[#123142]/15 flex items-center justify-center cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate('many_to_one')}
                      className={`text-left ${navyHeroClass} p-4 flex flex-col justify-between gap-3 hover:border-sky-300/40 active:scale-[0.98] transition-all cursor-pointer`}
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-5 -bottom-5 w-20 h-20 rounded-full bg-[radial-gradient(circle,rgba(243,139,30,0.25)_0%,transparent_70%)]"
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-[#F38B1E] text-[#0B1D2C] shadow-[0_6px_14px_-3px_rgba(243,139,30,0.5)] flex items-center justify-center">
                            <Users className="w-5 h-5" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/65" />
                        </div>
                        <div className="mt-3 font-display text-sm font-bold text-white">
                          Many To One
                        </div>
                        <div className="text-[11.5px] text-slate-300 mt-0.5">
                          Power-team M2O circles
                        </div>
                      </div>
                      <span className="relative z-10 text-[11px] font-semibold text-[#F38B1E]">
                        Propose or join M2O →
                      </span>
                    </button>
                  </motion.div>

                  {/* 3. Events Section (Elevated Navy-Glass Card) */}
                  <motion.div variants={itemVariants} className={`${navyGlassCardClass} p-4 space-y-3`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#123142] text-[#F38B1E] flex items-center justify-center">
                          <Ticket className="w-4 h-4" />
                        </span>
                        <h2 className="font-display text-sm font-bold text-[#123142] dark:text-white">
                          Events
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('events')}
                        className="text-xs font-semibold text-[#D85D27] hover:underline cursor-pointer"
                      >
                        All events ({events.length})
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {events.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="rounded-2xl bg-white/85 dark:bg-white/[0.05] border border-[#123142]/12 dark:border-white/10 p-3 flex items-center justify-between gap-3 shadow-[0_4px_14px_-6px_rgba(18,49,66,0.1)]"
                        >
                          <div className="min-w-0">
                            <div className="text-[10.5px] font-semibold text-[#D85D27] dark:text-[#F38B1E] truncate">
                              {ev.category} · {ev.attendees} going
                            </div>
                            <h3 className="font-display text-[13.5px] font-bold text-[#123142] dark:text-white truncate">
                              {ev.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {ev.dateLabel} · {ev.timeLabel}
                            </p>
                          </div>
                          {onToggleRsvp && (
                            <button
                              type="button"
                              onClick={() => onToggleRsvp(ev.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                                ev.rsvped
                                  ? 'bg-[#123142] text-white'
                                  : 'bg-[#D85D27] hover:bg-[#BE4D14] text-white shadow-[0_4px_12px_-2px_rgba(216,93,39,0.4)]'
                              }`}
                            >
                              {ev.rsvped ? 'Going' : 'RSVP'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* 4. Testimonials Highlight Card (Elevated Copper-Glass Card) */}
                  <motion.div
                    variants={itemVariants}
                    className={`${copperGlassCardClass} p-4 space-y-3`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#D85D27] text-white flex items-center justify-center">
                          <Star className="w-4 h-4 fill-white" />
                        </span>
                        <h2 className="font-display text-sm font-bold text-[#123142] dark:text-white">
                          Testimonials
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('testimonials')}
                        className="text-xs font-semibold text-[#D85D27] hover:underline cursor-pointer"
                      >
                        View all ({testimonialsCount})
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'Received', val: receivedTestimonials.length },
                        { label: 'Given', val: givenTestimonials.length },
                        { label: 'Requests', val: requestTestimonials.length },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl bg-[#0E2434] dark:bg-[#0E1826] border border-white/10 p-2.5 text-white"
                        >
                          <div className="font-display text-base font-bold text-[#F38B1E] tabular-nums">
                            {item.val}
                          </div>
                          <div className="text-[10.5px] text-slate-300">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {testimonials[0] && (
                      <button
                        type="button"
                        onClick={() => onNavigate('testimonials')}
                        className="w-full text-left rounded-2xl bg-white/88 dark:bg-[#191418]/90 border border-[#D85D27]/25 dark:border-[#F38B1E]/20 p-3 space-y-1 cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#D85D27] dark:text-[#F38B1E]">
                          <span>
                            {testimonials[0].authorName} · {testimonials[0].chapter}
                          </span>
                          <span>5.0 ★</span>
                        </div>
                        <p className="text-xs italic text-slate-700 dark:text-slate-300 line-clamp-2">
                          “{testimonials[0].quote}”
                        </p>
                      </button>
                    )}
                  </motion.div>

                  {/* 5. My Feed (Elevated Glass Card) */}
                  <motion.div variants={itemVariants} className={`${glassCardClass} p-4 space-y-3`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#123142] text-[#F38B1E] flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </span>
                        <h2 className="font-display text-sm font-bold text-[#123142] dark:text-white">
                          My Feed
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('chapter_feed')}
                        className="text-xs font-semibold text-[#D85D27] hover:underline cursor-pointer"
                      >
                        Open feed
                      </button>
                    </div>

                    {onAddPost && (
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!chapterFeedDraft.trim()) return;
                          onAddPost(chapterFeedDraft.trim(), 'chapter');
                          setChapterFeedDraft('');
                        }}
                      >
                        <input
                          type="text"
                          value={chapterFeedDraft}
                          onChange={(e) => setChapterFeedDraft(e.target.value)}
                          placeholder="Share a Fortune chapter milestone..."
                          className="flex-1 h-10 px-3 rounded-xl bg-[#F4F6FA] dark:bg-[#0D1018] border border-[#123142]/12 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27]"
                        />
                        <button
                          type="submit"
                          disabled={!chapterFeedDraft.trim()}
                          aria-label="Post to My Feed"
                          className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-[#FF7A29] to-[#D85D27] hover:from-[#F26B1D] hover:to-[#BE4D14] disabled:opacity-45 text-white text-xs font-semibold shadow-[0_6px_14px_-3px_rgba(216,93,39,0.45)] cursor-pointer inline-flex items-center gap-1 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Post</span>
                        </button>
                      </form>
                    )}

                    {chapterPosts.length === 0 ? (
                      <div className="rounded-2xl bg-[#F4F6FA] dark:bg-white/[0.04] border border-[#123142]/10 dark:border-white/8 p-4 text-center space-y-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          No Fortune chapter posts yet. Share an update above or open My Feed.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {chapterPosts.slice(0, 2).map((post) => (
                          <div
                            key={post.id}
                            className="rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.85)_0%,rgba(244,247,252,0.75)_100%)] dark:bg-white/[0.05] border border-[#123142]/12 dark:border-white/10 p-3 space-y-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#123142] text-[#F38B1E] flex items-center justify-center font-display text-[11px] font-bold">
                                {post.authorInitials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-display text-xs font-bold text-[#123142] dark:text-white truncate">
                                  {post.authorName}
                                </div>
                                <div className="text-[10.5px] text-slate-400">{post.timeLabel}</div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-4 pt-1 border-t border-[#123142]/10 dark:border-white/10 text-[11px] text-slate-500">
                              <button
                                type="button"
                                onClick={() => onLikePost?.(post.id)}
                                className={`inline-flex items-center gap-1 cursor-pointer ${
                                  post.liked ? 'text-[#D85D27] font-semibold' : ''
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${post.liked ? 'fill-[#D85D27]' : ''}`} />
                                <span>{post.likes}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onSavePost?.(post.id)}
                                className={`inline-flex items-center gap-1 cursor-pointer ${
                                  post.saved ? 'text-[#D85D27] font-semibold' : ''
                                }`}
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${post.saved ? 'fill-[#D85D27]' : ''}`} />
                                <span>{post.saved ? 'Saved' : 'Save'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================== */}
          {/* INLINE MODAL 1: ADD CONNECTION DISCOVERY SHEET                 */}
          {/* ============================================================== */}
          <AnimatePresence>
            {showAddConnectionModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={() => setShowAddConnectionModal(false)}
              >
                <motion.div
                  initial={reducedMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#151519] p-5 space-y-4 border-t sm:border border-slate-200 dark:border-white/10 max-h-[82vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                        Add Connection
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Discover verified EKAM members across chapters
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddConnectionModal(false)}
                      aria-label="Close Add Connection"
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={addConnQuery}
                      onChange={(e) => setAddConnQuery(e.target.value)}
                      placeholder="Filter suggested members..."
                      className="w-full h-10.5 pl-10 pr-4 rounded-xl bg-[#F4F5F7] dark:bg-[#0E1015] text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {filteredSuggested.length === 0 ? (
                    <div className="py-6 text-center space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        All suggested members have been invited!
                      </p>
                      <PremiumButton
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setShowAddConnectionModal(false);
                          onNavigate('search');
                        }}
                      >
                        Search All Members
                      </PremiumButton>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredSuggested.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-2xl bg-[#F7F8FB] dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/8 p-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-display text-xs font-bold shrink-0 ${m.avatarTone}`}
                            >
                              {m.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                                {m.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {m.company} · {m.chapter}
                              </div>
                            </div>
                          </div>
                          <PremiumButton
                            size="sm"
                            onClick={() => {
                              onConnectMember?.(m.id);
                            }}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Connect</span>
                          </PremiumButton>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================== */}
          {/* INLINE MODAL 2: ADD VISITOR SHEET                              */}
          {/* ============================================================== */}
          <AnimatePresence>
            {showAddVisitorModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={() => setShowAddVisitorModal(false)}
              >
                <motion.form
                  initial={reducedMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#151519] p-6 space-y-3.5 border-t sm:border border-slate-200 dark:border-white/10"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!visitorName.trim()) return;
                    onAddVisitor?.({
                      name: visitorName.trim(),
                      company: visitorCompany.trim() || 'Independent Founder',
                      phone: visitorPhone.trim() || '9800000000',
                      category: visitorCategory.trim() || 'Business Services',
                      meetingDate: 'Thu, 19 Nov · 07:30',
                      stage: 'Invited',
                    });
                    setVisitorName('');
                    setVisitorCompany('');
                    setVisitorPhone('');
                    setVisitorCategory('');
                    setShowAddVisitorModal(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Add Visitor
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowAddVisitorModal(false)}
                      aria-label="Close Add Visitor"
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/8 text-slate-500 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Visitor full name *"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Company name"
                    value={visitorCompany}
                    onChange={(e) => setVisitorCompany(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="tel"
                      placeholder="Mobile number"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Business category"
                      value={visitorCategory}
                      onChange={(e) => setVisitorCategory(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <PremiumButton
                      variant="secondary"
                      fullWidth
                      onClick={() => setShowAddVisitorModal(false)}
                    >
                      Cancel
                    </PremiumButton>
                    <PremiumButton type="submit" fullWidth>
                      Send Invitation
                    </PremiumButton>
                  </div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================== */}
          {/* INLINE MODAL 3: BOOK ONE-TO-ONE (P2P) SHEET                    */}
          {/* ============================================================== */}
          <AnimatePresence>
            {showBookP2PModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={() => setShowBookP2PModal(false)}
              >
                <motion.form
                  initial={reducedMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#151519] p-6 space-y-3.5 border-t sm:border border-slate-200 dark:border-white/10"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!p2pTopic.trim()) return;
                    const m = members.find((item) => item.name === p2pPartner);
                    onBookP2P?.({
                      partnerName: p2pPartner,
                      company: m?.company || 'Fortune Chapter',
                      date: '20 Nov 2026',
                      time: '09:30 AM',
                      location: p2pLocation.trim() || 'Fortune Lounge',
                      topic: p2pTopic.trim(),
                      status: 'Upcoming',
                    });
                    setP2pTopic('');
                    setShowBookP2PModal(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Book One-to-One (P2P)
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowBookP2PModal(false)}
                      aria-label="Close Book P2P"
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/8 text-slate-500 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <select
                    value={p2pPartner}
                    onChange={(e) => setP2pPartner(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} — {m.company}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Meeting topic *"
                    value={p2pTopic}
                    onChange={(e) => setP2pTopic(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={p2pLocation}
                    onChange={(e) => setP2pLocation(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
                  />
                  <div className="flex gap-2.5 pt-2">
                    <PremiumButton
                      variant="secondary"
                      fullWidth
                      onClick={() => setShowBookP2PModal(false)}
                    >
                      Cancel
                    </PremiumButton>
                    <PremiumButton type="submit" fullWidth>
                      Schedule P2P
                    </PremiumButton>
                  </div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================== */}
          {/* PRESERVED 3D BUSINESS STAGE DRAWER (Zero backdrop-filter)       */}
          {/* ============================================================== */}
          {show3DStageModal && (
            <div
              className="fixed inset-0 z-50 bg-[#050B12]/90 flex items-center justify-center p-3 sm:p-6"
              onClick={() => setShow3DStageModal(false)}
            >
              <div
                className="w-full max-w-md rounded-3xl overflow-hidden bg-[#0B1620] border border-white/15 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 text-white">
                  <span className="font-display text-sm font-bold">
                    3D Business Core Stage
                  </span>
                  <button
                    type="button"
                    onClick={() => setShow3DStageModal(false)}
                    aria-label="Close 3D Stage"
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <BusinessCoreStage3D
                  connectionsCount={connectionsCount}
                  visitorsCount={visitorsCount}
                  referralsCount={referralsCount}
                  meetingsCount={meetingsCount}
                  testimonialsCount={testimonialsCount}
                  reducedMotion={reducedMotion}
                  onNavigate={(target) => {
                    setShow3DStageModal(false);
                    onNavigate(target);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </SkeletonCrossfade>
    </PullToRefreshContainer>
  );
}

export function OpportunityScreen({
  referrals,
  onPassReferral,
  onToggleStatus,
  onBack,
  reducedMotion = false,
  isLoading = false,
  onRefresh,
}: {
  referrals: ReferralItem[];
  onPassReferral: () => void;
  onToggleStatus: (id: string) => void;
  onBack: () => void;
  reducedMotion?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<'given' | 'received'>('given');
  const [query, setQuery] = useState('');
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 18, 0.95);

  const list = referrals.filter(
    (r) =>
      r.direction === tab &&
      (r.topic.toLowerCase().includes(query.toLowerCase()) ||
        r.memberName.toLowerCase().includes(query.toLowerCase()) ||
        r.contactName.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <PullToRefreshContainer tone="light" reducedMotion={reducedMotion} onRefresh={onRefresh}>
      <SkeletonCrossfade
        loading={isLoading}
        reducedMotion={reducedMotion}
        skeleton={<FeedListSkeleton variant="opportunity" reducedMotion={reducedMotion} />}
      >
        <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <SubHeader
        title="Business Opportunity"
        onBack={onBack}
        right={
          <PremiumButton size="sm" onClick={onPassReferral}>
            <Plus className="w-3.5 h-3.5" />
            <span>Pass</span>
          </PremiumButton>
        }
      />

      <div className="p-4 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search referrals"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F4F5F7] dark:bg-[#0E1015] text-sm text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/6">
          {(['given', 'received'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`py-2 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                tab === t
                  ? 'bg-white dark:bg-[#1F2028] text-[#D85D27] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t} ({referrals.filter((r) => r.direction === t).length})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        {list.length === 0 ? (
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <EmptyStateView
              kind="referrals"
              title={`No referrals ${tab} yet`}
              description={
                tab === 'given'
                  ? 'Referrals you pass to other members will be tracked here.'
                  : 'Referrals passed to you by chapter members will appear here.'
              }
              actionLabel="Pass a referral"
              onAction={onPassReferral}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`opp-${tab}`}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((r) => (
                <motion.div
                  key={r.id}
                  layout={reducedMotion ? false : 'position'}
                  variants={itemVariants}
                  whileHover={
                    reducedMotion || r.direction !== 'received'
                      ? undefined
                      : {
                          scale: 1.015,
                          y: -2,
                          transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                        }
                  }
                  exit="exit"
                  className={`rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-2.5 shadow-[0_10px_24px_-14px_rgba(18,49,66,0.12)] ${
                    r.direction === 'received'
                      ? 'transition-all duration-200 hover:border-[#F38B1E]/45 hover:shadow-[0_14px_30px_-10px_rgba(243,139,30,0.28),0_8px_20px_-8px_rgba(38,140,166,0.24)]'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {r.date} · {r.warmth} lead · {r.status}
                      </div>
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white mt-0.5">{r.topic}</h3>
                    </div>
                    <span className="font-mono-tabular text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{r.valueInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{r.notes}</p>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/8 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">
                      {tab === 'given' ? 'To:' : 'From:'} <strong>{r.memberName}</strong> · Contact: {r.contactName}
                    </span>
                    {r.status !== 'Closed' && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(r.id)}
                        className="font-semibold text-[#D85D27] hover:text-[#BE4D14] cursor-pointer"
                      >
                        Mark closed
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
      </SkeletonCrossfade>
    </PullToRefreshContainer>
  );
}

export function PassReferralScreen({
  user,
  members,
  onSubmit,
  onBack,
}: {
  user: UserProfile;
  members: ConnectionMember[];
  onSubmit: (item: Omit<ReferralItem, 'id'>) => void;
  onBack: () => void;
}) {
  const [contactType, setContactType] = useState<'self' | 'others'>('self');
  const [memberName, setMemberName] = useState(members[0]?.name || 'Akash Madicetty');
  const [contactName, setContactName] = useState(user.fullName);
  const [contactPhone, setContactPhone] = useState(user.phone);
  const [contactEmail, setContactEmail] = useState(user.email);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [valueInr, setValueInr] = useState('75000');
  const [warmth, setWarmth] = useState<'Hot' | 'Warm' | 'Cold'>('Hot');

  const handleTypeChange = (next: 'self' | 'others') => {
    setContactType(next);
    if (next === 'self') {
      setContactName(user.fullName);
      setContactPhone(user.phone);
      setContactEmail(user.email);
    } else {
      setContactName('');
      setContactPhone('');
      setContactEmail('');
    }
  };

  const selectedMember = members.find((m) => m.name === memberName);

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <SubHeader title="Pass a referral" onBack={onBack} />

      <form
        className="p-4 space-y-5 flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!topic.trim() || !contactName.trim()) return;
          onSubmit({
            direction: 'given',
            memberName,
            company: selectedMember?.company || 'Fortune Chapter',
            contactName: contactName.trim(),
            contactPhone: contactPhone.trim() || '9800000000',
            contactEmail: contactEmail.trim(),
            topic: topic.trim(),
            notes: notes.trim() || 'Warm chapter referral introduction.',
            date: '14/11/2026',
            status: 'Open',
            valueInr: parseInt(valueInr, 10) || 50000,
            warmth,
          });
        }}
      >
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contact type</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['self', 'others'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    contactType === type
                      ? 'border-[#D85D27] bg-[#D85D27]/10 text-[#D85D27]'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Received by (member)
            </label>
            <select
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} — {m.company}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Contact name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Contact phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Topic / Requirement *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Commercial interior fit-out"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Est. Value (INR)
              </label>
              <input
                type="number"
                value={valueInr}
                onChange={(e) => setValueInr(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm font-mono-tabular text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Lead warmth</label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/6 h-11">
                {(['Hot', 'Warm', 'Cold'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWarmth(w)}
                    className={`rounded-lg text-xs font-semibold cursor-pointer ${
                      warmth === w
                        ? 'bg-[#D85D27] text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Looking for / Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share context so the member can follow up smoothly..."
              className="w-full p-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <PremiumButton type="submit" fullWidth size="lg" disabled={!topic.trim() || !contactName.trim()}>
          Submit Referral
        </PremiumButton>
      </form>
    </div>
  );
}

export function ConnectionsScreen({
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
  const [filter, setFilter] = useState<'connected' | 'sent' | 'received' | 'blocked'>('connected');
  const [query, setQuery] = useState('');
  const listVariants = createStaggerListVariants(reducedMotion, 0.055, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  const counts = {
    connected: members.filter((m) => m.status === 'connected').length,
    sent: members.filter((m) => m.status === 'sent').length,
    received: members.filter((m) => m.status === 'received').length,
    blocked: members.filter((m) => m.status === 'blocked').length,
  };

  const list = members.filter(
    (m) =>
      m.status === filter &&
      (m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.company.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <SubHeader title="My Connections" onBack={onBack} />

      <div className="p-4 space-y-3 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F4F5F7] dark:bg-[#0E1015] text-sm text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(
            [
              { id: 'connected', label: 'Connections', count: counts.connected },
              { id: 'sent', label: 'Sent', count: counts.sent },
              { id: 'received', label: 'Received', count: counts.received },
              { id: 'blocked', label: 'Blocked', count: counts.blocked },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-2xl p-2.5 text-left border transition-colors cursor-pointer ${
                filter === item.id
                  ? 'bg-[#D85D27] border-[#D85D27] text-white'
                  : 'bg-[#F4F5F7] dark:bg-white/5 border-transparent text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-[10px] font-medium opacity-85 truncate">{item.label}</div>
              <div className="font-display text-lg font-bold mt-0.5 tabular-nums">{item.count}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2.5 flex-1">
        {list.length === 0 ? (
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <EmptyStateView
              kind="requests"
              title={`No ${filter} entries`}
              description="Discover and connect with verified members across Fortune and regional chapters."
              actionLabel="Browse suggestions"
              onAction={() => {
                const suggested = members.find((m) => m.status === 'suggested');
                if (suggested) onConnect(suggested.id);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`conn-${filter}`}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2.5"
          >
            {list.map((m) => (
              <motion.div
                key={m.id}
                variants={itemVariants}
                className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center gap-3.5"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-sm font-bold shrink-0 ${m.avatarTone}`}>
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">{m.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{m.company}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{m.chapter}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-mono-tabular">
                      <Phone className="w-3 h-3" />
                      {m.phone}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onStartChat(m)}
                  aria-label={`Message ${m.name}`}
                  className="w-10 h-10 rounded-xl bg-[#D85D27]/12 hover:bg-[#D85D27]/20 text-[#D85D27] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function VisitorsScreen({
  visitors,
  onAddVisitor,
  onBack,
  reducedMotion = false,
}: {
  visitors: VisitorItem[];
  onAddVisitor: (v: Omit<VisitorItem, 'id'>) => void;
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  const added = visitors.filter((v) => v.stage === 'Added').length;
  const invited = visitors.filter((v) => v.stage === 'Invited').length;
  const registered = visitors.filter((v) => v.stage === 'Registered').length;

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col relative">
      <SubHeader
        title="Visitors"
        onBack={onBack}
        right={
          <PremiumButton size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add visitor</span>
          </PremiumButton>
        }
      />

      <div className="p-4 space-y-4 flex-1">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Added', count: added },
            { label: 'Invited', count: invited },
            { label: 'Registered', count: registered },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-3.5 text-center"
            >
              <div className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {stat.count}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {visitors.length === 0 ? (
          <EmptyStateView
            kind="visitors"
            title="No visitors yet"
            description="Guests you invite to a chapter meeting will be tracked here from invitation to registration."
            actionLabel="Add visitor"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2.5"
          >
            {visitors.map((v) => (
              <motion.div
                key={v.id}
                variants={itemVariants}
                className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{v.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {v.company} · {v.category}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {v.meetingDate} · {v.stage}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#D85D27]">{v.stage}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {showAdd && (
        <div className="absolute inset-0 z-40 bg-black/55 flex items-end justify-center">
          <form
            className="w-full rounded-t-3xl bg-white dark:bg-[#151519] p-6 space-y-3.5 border-t border-slate-200 dark:border-white/10"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              onAddVisitor({
                name: name.trim(),
                company: company.trim() || 'Independent Founder',
                phone: phone.trim() || '9800000000',
                category: category.trim() || 'Business Services',
                meetingDate: 'Thu, 19 Nov · 07:30',
                stage: 'Invited',
              });
              setName('');
              setCompany('');
              setPhone('');
              setCategory('');
              setShowAdd(false);
            }}
          >
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Invite a chapter visitor</h2>
            <input
              type="text"
              placeholder="Visitor full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="tel"
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Business category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2.5 pt-2">
              <PremiumButton variant="secondary" fullWidth onClick={() => setShowAdd(false)}>
                Cancel
              </PremiumButton>
              <PremiumButton type="submit" fullWidth>
                Send Invitation
              </PremiumButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function MeetingsScreen({
  meetings,
  p2pSessions,
  members,
  onBookP2P,
  onBack,
  reducedMotion = false,
}: {
  meetings: MeetingItem[];
  p2pSessions: P2PSession[];
  members: ConnectionMember[];
  onBookP2P: (session: Omit<P2PSession, 'id'>) => void;
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const [showBook, setShowBook] = useState(false);
  const [partner, setPartner] = useState(members[0]?.name || 'Akash Madicetty');
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('Jubilee Hills Roastery');
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.04);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  const next = meetings[0];

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col relative">
      <SubHeader
        title="Meetings & P2P"
        onBack={onBack}
        right={
          <PremiumButton size="sm" onClick={() => setShowBook(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Book P2P</span>
          </PremiumButton>
        }
      />

      <div className="p-4 space-y-5">
        {/* Next Meeting Dark Hero Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0F2634] to-[#173B4E] p-5 text-white border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-[#F59E0B]">Next Meeting</span>
            <span className="text-slate-300">In 6 days</span>
          </div>

          <div className="mt-3.5 flex items-center gap-3.5">
            <div className="w-12 rounded-xl overflow-hidden bg-white text-center shrink-0">
              <div className="bg-[#D85D27] text-white text-[10px] font-bold py-0.5">{next.dayShort}</div>
              <div className="text-slate-900 font-display text-base font-bold py-1 tabular-nums">{next.dayNum}</div>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">{next.weekday}</h2>
              <p className="text-xs text-slate-300">
                {next.time} · {next.format}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Members', val: next.membersCount },
              { label: 'Referrals', val: next.referralsCount },
              { label: 'Closed', val: `₹${next.closedInr.toLocaleString('en-IN')}` },
              { label: '1-to-1s', val: next.oneToOnes + p2pSessions.length },
              { label: 'Testimonials', val: next.testimonials },
              { label: 'Visitors', val: next.visitors },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-white/8 border border-white/8 p-2.5 text-center">
                <div className="font-display text-sm font-bold tabular-nums">{m.val}</div>
                <div className="text-[10px] text-slate-300 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* P2P 1-to-1s */}
        <div className="space-y-2.5">
          <SectionHeader title="One-to-One (P2P) Sessions" />
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {p2pSessions.map((p) => (
              <motion.div
                key={p.id}
                variants={itemVariants}
                className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-[#D85D27]">
                    {p.date} · {p.time} · {p.status}
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {p.partnerName} · {p.company}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {p.topic} · {p.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Chapter Timeline */}
        <div className="space-y-2.5">
          <SectionHeader title="Chapter Meetings" />
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {meetings.map((mt) => (
              <motion.div
                key={mt.id}
                variants={itemVariants}
                className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 text-center shrink-0">
                    <div className="bg-[#123142] text-white text-[9px] font-bold py-0.5">{mt.dayShort}</div>
                    <div className="font-display text-sm font-bold text-slate-900 dark:text-white py-1 tabular-nums">
                      {mt.dayNum}
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-slate-900 dark:text-white">{mt.weekday}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {mt.time} · {mt.format}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    mt.status === 'Draft' ? 'text-[#D85D27]' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {mt.status}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {showBook && (
        <div className="absolute inset-0 z-40 bg-black/55 flex items-end justify-center">
          <form
            className="w-full rounded-t-3xl bg-white dark:bg-[#151519] p-6 space-y-3.5 border-t border-slate-200 dark:border-white/10"
            onSubmit={(e) => {
              e.preventDefault();
              if (!topic.trim()) return;
              const member = members.find((m) => m.name === partner);
              onBookP2P({
                partnerName: partner,
                company: member?.company || 'Fortune Chapter',
                date: '20 Nov 2026',
                time: '09:30 AM',
                location: location.trim() || 'Fortune Lounge',
                topic: topic.trim(),
                status: 'Upcoming',
              });
              setTopic('');
              setShowBook(false);
            }}
          >
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Book a P2P 1-to-1</h2>
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} — {m.company}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Meeting topic *"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
            <div className="flex gap-2.5 pt-2">
              <PremiumButton variant="secondary" fullWidth onClick={() => setShowBook(false)}>
                Cancel
              </PremiumButton>
              <PremiumButton type="submit" fullWidth>
                Schedule P2P
              </PremiumButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function ManyToOneScreen({
  onBack,
  reducedMotion = false,
}: {
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const [sessions, setSessions] = useState<{ id: string; title: string; date: string; attendees: number }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col relative">
      <SubHeader
        title="Many To One"
        onBack={onBack}
        right={
          <PremiumButton size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Propose M2O</span>
          </PremiumButton>
        }
      />
      <div className="p-4 flex-1 space-y-3">
        {sessions.length === 0 ? (
          <EmptyStateView
            kind="m2o"
            title="No M2O sessions yet"
            description="Many-to-one chapter power-team sessions will be listed here."
            actionLabel="Propose M2O session"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {sessions.map((s) => (
              <motion.div
                key={s.id}
                variants={itemVariants}
                className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4"
              >
                <div className="text-xs font-medium text-[#D85D27]">{s.date}</div>
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white mt-0.5">{s.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.attendees} chapter seats</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      {showCreate && (
        <div className="absolute inset-0 z-40 bg-black/55 flex items-end justify-center">
          <form
            className="w-full rounded-t-3xl bg-white dark:bg-[#151519] p-6 space-y-3.5 border-t border-slate-200 dark:border-white/10"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              setSessions((prev) => [
                { id: `m2o-${Date.now()}`, title: title.trim(), date: '26 Nov 2026 · 08:30 AM', attendees: 6 },
                ...prev,
              ]);
              setTitle('');
              setShowCreate(false);
            }}
          >
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Propose Many-to-One</h2>
            <input
              type="text"
              placeholder="Power-team focus (e.g., Real Estate & Interiors)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
            <div className="flex gap-2.5">
              <PremiumButton variant="secondary" fullWidth onClick={() => setShowCreate(false)}>
                Cancel
              </PremiumButton>
              <PremiumButton type="submit" fullWidth>
                Create Session
              </PremiumButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function EventsScreen({
  events,
  onToggleRsvp,
  onBack,
  reducedMotion = false,
}: {
  events: EventItem[];
  onToggleRsvp: (id: string) => void;
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const [query, setQuery] = useState('');
  const filtered = events.filter((ev) => ev.title.toLowerCase().includes(query.toLowerCase()));
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <SubHeader title="Events" onBack={onBack} />
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 text-sm text-slate-900 dark:text-white"
          />
        </div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filtered.map((ev) => (
            <motion.div
              key={ev.id}
              variants={itemVariants}
              className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#123142] to-[#1C4962] text-white flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-[#D85D27]">
                    {ev.category} · {ev.attendees} going
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">{ev.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {ev.dateLabel} · {ev.timeLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleRsvp(ev.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                  ev.rsvped
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-[#D85D27] text-white hover:bg-[#BE4D14]'
                }`}
              >
                {ev.rsvped ? 'Going' : 'RSVP'}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function ReportsScreen({
  referrals,
  visitorsCount,
  p2pCount,
  onBack,
}: {
  referrals: ReferralItem[];
  visitorsCount: number;
  p2pCount: number;
  onBack: () => void;
}) {
  const [period, setPeriod] = useState<'month' | '6m' | 'fy'>('6m');
  const [emailSent, setEmailSent] = useState(false);

  const mult = period === 'month' ? 1 : period === '6m' ? 1 : 2;
  const received = referrals.filter((r) => r.direction === 'received').length * mult;
  const given = referrals.filter((r) => r.direction === 'given').length * mult;

  const bars = period === 'month' ? [2, 3, 1, 4] : period === '6m' ? [2, 4, 3, 5, 4, 6] : [4, 6, 5, 7, 8, 9];

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <SubHeader title="Reports" onBack={onBack} />
      <div className="px-4 pt-3 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 grid grid-cols-3 text-center">
        {(
          [
            { id: 'month', label: 'This month' },
            { id: '6m', label: '6 months' },
            { id: 'fy', label: 'This FY' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPeriod(t.id)}
            className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer ${
              period === t.id
                ? 'border-[#D85D27] text-[#D85D27]'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        <div className="text-xs text-slate-500 dark:text-slate-400">1 Jun – 14 Nov 2026 · Fortune Chapter (19 members)</div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Opportunities received', val: received },
            { label: 'Opportunities given', val: given },
            { label: 'Visitors', val: visitorsCount },
            { label: 'P2P meetings', val: p2pCount },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">{kpi.label}</div>
              <div className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums">
                {kpi.val}
              </div>
            </div>
          ))}
        </div>

        {/* Clean SVG Bar Chart */}
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">Chapter Activity Trend</h2>
            <span className="text-[11px] text-slate-400">Referrals + 1-to-1s</span>
          </div>
          <svg viewBox="0 0 280 90" className="w-full h-24" role="img" aria-label="Chapter activity trend">
            {bars.map((val, i) => {
              const barW = 24;
              const gap = (280 - bars.length * barW) / (bars.length + 1);
              const x = gap + i * (barW + gap);
              const h = Math.max(12, val * 8);
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={80 - h}
                    width={barW}
                    height={h}
                    rx={6}
                    fill={i === bars.length - 1 ? '#D85D27' : '#123142'}
                    opacity={i === bars.length - 1 ? 1 : 0.78}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Email Admin Support */}
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-3">
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">Numbers do not look right?</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Email the EKAM admin team directly. The figures on this page are attached to the message for you.
          </p>
          <PremiumButton
            variant="secondary"
            fullWidth
            onClick={() => setEmailSent(true)}
          >
            {emailSent ? <Check className="w-4 h-4 text-emerald-600" /> : <Mail className="w-4 h-4 text-[#D85D27]" />}
            <span>{emailSent ? 'Report Dispatched to Admin' : 'Email the admin team'}</span>
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsScreen({
  testimonials,
  members,
  onToggleHide,
  onAddTestimonial,
  onBack,
  reducedMotion = false,
}: {
  testimonials: TestimonialItem[];
  members: ConnectionMember[];
  onToggleHide: (id: string) => void;
  onAddTestimonial: (item: Omit<TestimonialItem, 'id'>) => void;
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const [tab, setTab] = useState<'received' | 'given' | 'request'>('received');
  const [showWrite, setShowWrite] = useState(false);
  const [targetMember, setTargetMember] = useState(members[0]?.name || 'Akash Madicetty');
  const [quote, setQuote] = useState('');
  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.03);
  const itemVariants = createSpringItemVariants(reducedMotion, 16, 0.96);

  const list = testimonials.filter((t) => t.type === tab);

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col relative">
      <SubHeader
        title="Testimonials"
        onBack={onBack}
        right={
          <PremiumButton size="sm" onClick={() => setShowWrite(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Write</span>
          </PremiumButton>
        }
      />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'received', label: 'Received' },
              { id: 'given', label: 'Given' },
              { id: 'request', label: 'Requests' },
            ] as const
          ).map((item) => {
            const count = testimonials.filter((t) => t.type === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-2xl p-3 text-left border transition-colors cursor-pointer ${
                  tab === item.id
                    ? 'bg-[#D85D27] border-[#D85D27] text-white'
                    : 'bg-white dark:bg-[#151519] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-[11px] opacity-85">{item.label}</div>
                <div className="font-display text-lg font-bold mt-0.5 tabular-nums">{count}</div>
              </button>
            );
          })}
        </div>

        {list.length === 0 ? (
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <EmptyStateView
              kind="requests"
              title="No testimonial requests"
              description="Request or write an endorsement for a Fortune chapter member."
              actionLabel="Write testimonial"
              onAction={() => setShowWrite(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`testimonials-${tab}`}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {list.map((t) => (
              <motion.div
                key={t.id}
                variants={itemVariants}
                className={`rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-2.5 ${
                  t.hidden ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-display text-xs font-bold">
                      {t.authorInitials}
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                        {t.authorName} · <span className="font-normal text-slate-500">{t.chapter}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[#D85D27] mt-0.5">
                        {Array.from({ length: t.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-[#D85D27]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  {tab === 'received' && (
                    <button
                      type="button"
                      onClick={() => onToggleHide(t.id)}
                      className="text-xs font-semibold text-[#D85D27] cursor-pointer"
                    >
                      {t.hidden ? 'Show' : 'Hide'}
                    </button>
                  )}
                </div>
                <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed">“{t.quote}”</p>
                <div className="text-[11px] text-slate-400">{t.dateLabel}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {showWrite && (
        <div className="absolute inset-0 z-40 bg-black/55 flex items-end justify-center">
          <form
            className="w-full rounded-t-3xl bg-white dark:bg-[#151519] p-6 space-y-3.5 border-t border-slate-200 dark:border-white/10"
            onSubmit={(e) => {
              e.preventDefault();
              if (!quote.trim()) return;
              const m = members.find((item) => item.name === targetMember);
              onAddTestimonial({
                type: 'given',
                authorName: targetMember,
                authorInitials: m?.initials || 'MB',
                chapter: m?.chapter || 'Fortune',
                rating: 5,
                quote: quote.trim(),
                dateLabel: 'Just now',
              });
              setQuote('');
              setShowWrite(false);
              setTab('given');
            }}
          >
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Give a Testimonial</h2>
            <select
              value={targetMember}
              onChange={(e) => setTargetMember(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} — {m.company}
                </option>
              ))}
            </select>
            <textarea
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Describe the collaboration and concrete business outcome..."
              required
              className="w-full p-3.5 rounded-xl bg-[#FAFAFC] dark:bg-[#0F0F13] border border-slate-200 dark:border-white/12 text-sm text-slate-900 dark:text-white"
            />
            <div className="flex gap-2.5">
              <PremiumButton variant="secondary" fullWidth onClick={() => setShowWrite(false)}>
                Cancel
              </PremiumButton>
              <PremiumButton type="submit" fullWidth>
                Publish Testimonial
              </PremiumButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function ChapterFeedScreen({
  posts,
  onLikePost,
  onSavePost,
  onAddPost,
  onBack,
  reducedMotion = false,
  isLoading = false,
  onRefresh,
}: {
  posts: PostItem[];
  onLikePost: (id: string) => void;
  onSavePost: (id: string) => void;
  onAddPost: (content: string, scope: 'chapter') => void;
  onBack: () => void;
  reducedMotion?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<'all' | 'mine' | 'saved'>('all');
  const [draft, setDraft] = useState('');
  const listVariants = createStaggerListVariants(reducedMotion, 0.065, 0.04);
  const itemVariants = createSpringItemVariants(reducedMotion, 18, 0.95);

  const chapterPosts = posts.filter((p) => p.scope === 'chapter');
  const filtered = chapterPosts.filter((p) => {
    if (tab === 'mine') return p.authorInitials === 'KM';
    if (tab === 'saved') return p.saved;
    return true;
  });

  return (
    <PullToRefreshContainer tone="light" reducedMotion={reducedMotion} onRefresh={onRefresh}>
      <SkeletonCrossfade
        loading={isLoading}
        reducedMotion={reducedMotion}
        skeleton={<FeedListSkeleton variant="chapter_feed" reducedMotion={reducedMotion} />}
      >
        <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <SubHeader title="Chapter feed" onBack={onBack} />
      <div className="px-4 pt-3 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 grid grid-cols-3 text-center">
        {(['all', 'mine', 'saved'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pb-3 text-xs font-semibold capitalize border-b-2 cursor-pointer ${
              tab === t
                ? 'border-[#D85D27] text-[#D85D27]'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        <form
          className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            onAddPost(draft.trim(), 'chapter');
            setDraft('');
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share a Fortune chapter update..."
            className="flex-1 h-10 px-3 rounded-xl bg-[#F4F5F7] dark:bg-[#0E1015] text-xs text-slate-900 dark:text-white focus:outline-none"
          />
          <PremiumButton type="submit" size="sm">
            Post
          </PremiumButton>
        </form>

        {filtered.length === 0 ? (
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <EmptyStateView
              kind="feed"
              title="No chapter posts yet"
              description="Share an announcement, referral win, or milestone with your Fortune chapter."
            />
          </motion.div>
        ) : (
          <motion.div
            key={`chap-${tab}`}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3.5"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((post) => (
                <motion.div
                  key={post.id}
                  layout={reducedMotion ? false : 'position'}
                  variants={itemVariants}
                  exit="exit"
                  className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-2.5 shadow-[0_10px_24px_-14px_rgba(18,49,66,0.12)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#D85D27]/15 text-[#D85D27] flex items-center justify-center font-display text-xs font-bold">
                      {post.authorInitials}
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-white">{post.authorName}</div>
                      <div className="text-[11px] text-slate-400">{post.timeLabel}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{post.content}</p>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/8 flex items-center gap-4 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => onLikePost(post.id)}
                      className={`inline-flex items-center gap-1 cursor-pointer ${post.liked ? 'text-[#D85D27] font-semibold' : ''}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.liked ? 'fill-[#D85D27]' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSavePost(post.id)}
                      className={`inline-flex items-center gap-1 cursor-pointer ${post.saved ? 'text-[#D85D27] font-semibold' : ''}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${post.saved ? 'fill-[#D85D27]' : ''}`} />
                      <span>{post.saved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
      </SkeletonCrossfade>
    </PullToRefreshContainer>
  );
}
