import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Bookmark,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileText,
  Globe,
  Handshake,
  Heart,
  Layers,
  Lightbulb,
  Lock,
  MapPin,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Plus,
  Repeat2,
  RotateCcw,
  Search,
  Send,
  Trash2,
  Trophy,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { ConnectionMember, GroupItem, PostItem, ScreenId, UserProfile } from '../../types/ekam';
import { ConstellationBackdrop, EkamWordmark, EmptyStateView, PremiumButton, SectionHeader } from '../EkamBrand';
import { EditorialHeaderBackdrop } from '../EditorialHeaderBackdrop';
import {
  FeedListSkeleton,
  GroupsHubSkeleton,
  ProfessionalHubSkeleton,
  SkeletonCrossfade,
} from '../EkamSkeletons';
import { createSpringItemVariants, createStaggerListVariants } from '../motionPresets';
import { PullToRefreshContainer } from '../PullToRefresh';

export function ProfessionalHomeScreen({
  user,
  posts,
  members,
  onLikePost,
  onSavePost,
  onAddComment,
  onConnect,
  onNavigate,
  reducedMotion = false,
  isLoading = false,
  onRefresh,
}: {
  user: UserProfile;
  posts: PostItem[];
  members: ConnectionMember[];
  onLikePost: (id: string) => void;
  onSavePost: (id: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onConnect: (memberId: string) => void;
  onNavigate: (s: ScreenId) => void;
  reducedMotion?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
}) {
  const [section, setSection] = useState<'feed' | 'connections' | 'profile'>('feed');
  const [feedFilter, setFeedFilter] = useState<'all' | 'mine' | 'saved'>('all');
  const [connFilter, setConnFilter] = useState<'all' | 'request' | 'suggest' | 'pending'>('all');
  const [connQuery, setConnQuery] = useState('');
  const [commentOpen, setCommentOpen] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [showChapterBanner, setShowChapterBanner] = useState(true);
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(5);

  const profPosts = posts.filter((p) => p.scope === 'professional');
  const myPostsCount = profPosts.filter((p) => p.authorInitials === user.initials).length;
  const savedPostsCount = profPosts.filter((p) => p.saved).length;

  const connectedMembers = members.filter((m) => m.status === 'connected');
  const requestCount = members.filter((m) => m.status === 'received').length;
  const suggestedCount = members.filter((m) => m.status === 'suggested').length;
  const pendingCount = members.filter((m) => m.status === 'sent').length;

  const visiblePosts = profPosts.filter((p) => {
    if (feedFilter === 'mine') return p.authorInitials === user.initials;
    if (feedFilter === 'saved') return p.saved;
    return true;
  });

  const visibleMembers = members.filter((m) => {
    const q = connQuery.trim().toLowerCase();
    const matchesQ =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);
    if (!matchesQ) return false;
    if (connFilter === 'request') return m.status === 'received';
    if (connFilter === 'suggest') return m.status === 'suggested';
    if (connFilter === 'pending') return m.status === 'sent';
    return m.status === 'connected';
  });

  const firstName = user.fullName.trim().split(/\s+/)[0] || user.fullName;

  const profileFields = [
    Boolean(user.businessName.trim()),
    Boolean(user.businessCategory.trim()),
    Boolean(user.headquarters.trim()),
    Boolean(user.establishedYear.trim()),
    Boolean(user.companySize.trim()),
    Boolean(user.gstNumber.trim()),
  ];
  const completedCount = profileFields.filter(Boolean).length;
  const completionPct = Math.round((completedCount / profileFields.length) * 100);

  const sectionVariants = createStaggerListVariants(reducedMotion, 0.065, 0.03);
  const listVariants = createStaggerListVariants(reducedMotion, 0.065, 0.04);
  const fadeInUpVariants = createSpringItemVariants(reducedMotion, 18, 0.95);

  const totalEngagements = profPosts.reduce(
    (sum, p) => sum + p.likes + p.comments.length + p.reposts,
    0
  );

  // Derived 6-month activity series anchored cleanly to live network totals
  const monthlySeries = [
    { month: 'Jun', reach: 44, interactions: 30, linksCount: 3, postsCount: 14 },
    { month: 'Jul', reach: 66, interactions: 48, linksCount: 4, postsCount: 21 },
    { month: 'Aug', reach: 56, interactions: 64, linksCount: 4, postsCount: 27 },
    { month: 'Sep', reach: 52, interactions: 38, linksCount: 5, postsCount: 18 },
    { month: 'Oct', reach: 74, interactions: 46, linksCount: 5, postsCount: 24 },
    {
      month: 'Nov',
      reach: Math.min(94, 56 + connectedMembers.length * 5),
      interactions: Math.min(92, 36 + totalEngagements),
      linksCount: connectedMembers.length,
      postsCount: totalEngagements,
    },
  ];

  const chartBottomY = 96;
  const chartTopY = 14;
  const chartPlotH = chartBottomY - chartTopY;
  const buildSmoothPath = (pts: { x: number; y: number }[]) =>
    pts.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const midX = Number(((prev.x + pt.x) / 2).toFixed(1));
      return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');

  const linksPoints = monthlySeries.map((item, i) => ({
    x: Number((18 + (i / (monthlySeries.length - 1)) * 264).toFixed(1)),
    y: Number((chartBottomY - (item.reach / 100) * chartPlotH).toFixed(1)),
  }));
  const postsPoints = monthlySeries.map((item, i) => ({
    x: Number((18 + (i / (monthlySeries.length - 1)) * 264).toFixed(1)),
    y: Number((chartBottomY - (item.interactions / 100) * chartPlotH).toFixed(1)),
  }));

  const linksLinePath = buildSmoothPath(linksPoints);
  const linksAreaPath = `${linksLinePath} L ${linksPoints[linksPoints.length - 1].x} ${chartBottomY} L ${linksPoints[0].x} ${chartBottomY} Z`;
  const postsLinePath = buildSmoothPath(postsPoints);
  const postsAreaPath = `${postsLinePath} L ${postsPoints[postsPoints.length - 1].x} ${chartBottomY} L ${postsPoints[0].x} ${chartBottomY} Z`;
  const activeMonth = monthlySeries[activeMonthIdx] || monthlySeries[monthlySeries.length - 1];
  const activeLinksPt = linksPoints[activeMonthIdx] || linksPoints[linksPoints.length - 1];
  const activePostsPt = postsPoints[activeMonthIdx] || postsPoints[postsPoints.length - 1];

  const cardClass =
    'rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.09),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)]';

  return (
    <PullToRefreshContainer tone="dark" reducedMotion={reducedMotion} onRefresh={onRefresh}>
      <SkeletonCrossfade
        loading={isLoading}
        reducedMotion={reducedMotion}
        skeleton={<ProfessionalHubSkeleton reducedMotion={reducedMotion} />}
      >
        <div className="min-h-full bg-[#F5F6FA] dark:bg-[#0B0D14] pb-8">
      {/* Professional Screen Midnight Navy Header */}
      <div className="relative bg-gradient-to-b from-[#060F1E] via-[#091930] to-[#122338] px-4 pt-4 pb-4 text-white overflow-hidden">
        {/* Subtle ambient lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-2 -bottom-6 w-72 h-28 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.28)_0%,rgba(249,115,22,0.12)_50%,transparent_75%)] blur-xl"
        />

        {/* Editorial Abstract Waves & Light Beams Illustration (Right-Side Atmospheric Accent) */}
        <EditorialHeaderBackdrop reducedMotion={reducedMotion} />

        {/* TOP ROW: Chapter Location Left + Notification Bell Right */}
        <div className="relative z-20 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[13px] font-medium text-white/95 hover:text-white transition-colors cursor-pointer"
          >
            <span className="tracking-[-0.01em]">Hyderabad – Fortune Chapter</span>
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

        {/* MIDDLE ROW: Professional Heading & Subtitle Left + Warm Translucent Glass Plus Button Right */}
        <div className="relative z-20 mt-3 mb-5 flex items-center justify-between">
          <div className="max-w-[65%] pr-2">
            <h1 className="font-display text-[33px] font-extrabold tracking-[-0.02em] leading-[1.08] text-white">
              Professional
            </h1>
            <p className="mt-1.5 text-[13.5px] font-normal text-white/85 leading-snug whitespace-nowrap">
              Your network, your updates
            </p>
          </div>

          {/* Translucent Warm-Orange Glass Circle Plus Button on the Right */}
          <AnimatePresence initial={false}>
            {section === 'feed' && (
              <motion.button
                key="prof-create-fab"
                type="button"
                initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                whileHover={reducedMotion ? undefined : { scale: 1.05 }}
                whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                onClick={() => onNavigate('prof_write_post')}
                aria-label="Create professional post"
                className="relative z-30 w-[48px] h-[48px] rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,154,66,0.94)_0%,rgba(255,107,26,0.88)_55%,rgba(234,82,12,0.92)_100%)] backdrop-blur-md text-white border border-[#FFD1A8]/65 shadow-[0_6px_16px_rgba(0,0,0,0.28),inset_0_1px_3px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer shrink-0"
              >
                <Plus className="w-6 h-6 text-white" strokeWidth={2.2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM ROW: Full-Width Rounded Pill Glass Navigation Bar (Feed | Connections | Profile) */}
        <div className="relative z-20 rounded-full bg-[linear-gradient(90deg,rgba(26,38,58,0.76)_0%,rgba(44,50,68,0.68)_52%,rgba(68,54,62,0.66)_100%)] backdrop-blur-xl border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_8px_24px_rgba(0,0,0,0.35)] p-1.5 flex items-center">
          {(
            [
              { id: 'feed', label: 'Feed', flexClass: 'flex-[0.82_1_0%]' },
              { id: 'connections', label: 'Connections', flexClass: 'flex-[1.46_1_0%]' },
              { id: 'profile', label: 'Profile', flexClass: 'flex-[0.88_1_0%]' },
            ] as const
          ).map((item, index, arr) => {
            const active = section === item.id;
            const nextItem = arr[index + 1];
            const showDivider = index < arr.length - 1 && !active && (!nextItem || section !== nextItem.id);
            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`relative z-10 min-w-0 ${item.flexClass} min-h-[40px] rounded-full text-[12.5px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 px-3 ${
                    active ? 'text-[#101828] font-bold' : 'text-white/90 hover:text-white font-medium'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="profSectionGlassPill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                    />
                  )}

                  {/* Tab Icon matching reference */}
                  <span className="relative z-10 flex items-center justify-center shrink-0">
                    {item.id === 'feed' && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className={`w-[15px] h-[15px] ${active ? 'text-[#EA580C]' : 'text-white/85'}`}
                      >
                        <rect
                          x="2.5"
                          y="2.5"
                          width="15"
                          height="15"
                          rx="3.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                        />
                        <line
                          x1="6"
                          y1="7"
                          x2="14"
                          y2="7"
                          stroke="currentColor"
                          strokeWidth="1.65"
                          strokeLinecap="round"
                        />
                        <line
                          x1="6"
                          y1="10"
                          x2="14"
                          y2="10"
                          stroke="currentColor"
                          strokeWidth="1.65"
                          strokeLinecap="round"
                        />
                        <line
                          x1="6"
                          y1="13"
                          x2="11.5"
                          y2="13"
                          stroke="currentColor"
                          strokeWidth="1.65"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    {item.id === 'connections' && (
                      <Users
                        className={`w-[15px] h-[15px] ${active ? 'text-[#EA580C]' : 'text-white/85'}`}
                        strokeWidth={1.9}
                      />
                    )}
                    {item.id === 'profile' && (
                      <User
                        className={`w-[15px] h-[15px] ${active ? 'text-[#EA580C]' : 'text-white/85'}`}
                        strokeWidth={1.9}
                      />
                    )}
                  </span>

                  <span className="relative z-10 tracking-[-0.01em] whitespace-nowrap">{item.label}</span>
                </button>

                {/* Subtle vertical divider between inactive segments */}
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

      {/* SECTION 1: PROFESSIONAL FEED (Matching Reference Layout) */}
      {section === 'feed' && (
        <motion.div
          key="section-feed"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="px-4 pt-4 space-y-3.5"
        >
          {/* 1. Optional Dismissible Chapter Banner */}
          <AnimatePresence initial={false}>
            {showChapterBanner && (
              <motion.div
                key="chapter-banner"
                initial={reducedMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="rounded-2xl bg-[#FDECE3] dark:bg-[#1E191A] border border-[#FAD5C2] dark:border-white/10 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-[0_2px_10px_rgba(234,88,12,0.06)]"
              >
                <div className="flex items-center gap-2.5 min-w-0 text-[12.5px] text-slate-800 dark:text-slate-200">
                  <Globe className="w-4 h-4 text-[#EA580C] shrink-0" strokeWidth={2} />
                  <span className="truncate">
                    Showing posts from <strong className="font-bold text-slate-900 dark:text-white">Hyderabad – Fortune Chapter</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChapterBanner(false)}
                  aria-label="Dismiss chapter filter banner"
                  className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.2} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Filter Chips Row: All posts / My posts / Saved */}
          <motion.div variants={fadeInUpVariants} className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFeedFilter('all')}
              className={`h-9 px-4 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                feedFilter === 'all'
                  ? 'bg-gradient-to-b from-[#EA580C] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(234,88,12,0.3)]'
                  : 'bg-white dark:bg-[#161822] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              <span>All posts</span>
            </button>

            <button
              type="button"
              onClick={() => setFeedFilter('mine')}
              className={`h-9 px-4 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                feedFilter === 'mine'
                  ? 'bg-gradient-to-b from-[#EA580C] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(234,88,12,0.3)]'
                  : 'bg-white dark:bg-[#161822] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              <User className="w-3.5 h-3.5" strokeWidth={2} />
              <span>My posts{myPostsCount > 0 ? ` (${myPostsCount})` : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => setFeedFilter('saved')}
              className={`h-9 px-4 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                feedFilter === 'saved'
                  ? 'bg-gradient-to-b from-[#EA580C] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(234,88,12,0.3)]'
                  : 'bg-white dark:bg-[#161822] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Saved{savedPostsCount > 0 ? ` (${savedPostsCount})` : ''}</span>
            </button>
          </motion.div>

          {/* 3. Compact Composer Row (on All posts) */}
          {feedFilter === 'all' && (
            <motion.div
              variants={fadeInUpVariants}
              className={`${cardClass} p-2.5 flex items-center gap-2.5`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#245670] via-[#1E4B63] to-[#173E52] text-white font-display text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-slate-100 dark:ring-white/10">
                {user.initials}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('prof_write_post')}
                className="flex-1 h-10 rounded-full bg-[#F3F4F6] dark:bg-white/6 hover:bg-slate-200/70 dark:hover:bg-white/10 px-4 text-left text-[13px] text-slate-500 dark:text-slate-400 transition-colors cursor-pointer truncate"
              >
                What are you working on?
              </button>
              <button
                type="button"
                onClick={() => onNavigate('prof_write_post')}
                aria-label="Create post"
                className="w-10 h-10 rounded-full bg-[#FDECE3] dark:bg-[#EA580C]/20 text-[#EA580C] hover:bg-[#FBD8C5] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-5 h-5" strokeWidth={2.2} />
              </button>
            </motion.div>
          )}

          {/* 4. Professional Post Cards Stream */}
          <div className="space-y-3.5">
            {visiblePosts.length === 0 ? (
              <motion.div variants={fadeInUpVariants}>
                <EmptyStateView
                  kind="feed"
                  title={
                    feedFilter === 'saved'
                      ? 'No saved posts'
                      : feedFilter === 'mine'
                        ? 'No posts shared yet'
                        : 'No network updates yet'
                  }
                  description={
                    feedFilter === 'saved'
                      ? 'Bookmark posts in your feed to keep useful insights and introductions handy.'
                      : 'Share a project milestone, insight, or referral ask with fellow EKAM members.'
                  }
                  actionLabel={
                    feedFilter === 'all' || feedFilter === 'mine'
                      ? 'Write a post'
                      : 'Browse all posts'
                  }
                  onAction={() =>
                    feedFilter === 'saved' ? setFeedFilter('all') : onNavigate('prof_write_post')
                  }
                />
              </motion.div>
            ) : (
              <motion.div
                key={`feed-${feedFilter}`}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3.5"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {visiblePosts.map((post) => {
                    const isSelf = post.authorInitials === user.initials;
                    const isExpanded = Boolean(expandedPostIds[post.id]);
                    const shouldClamp = post.content.length > 135 && !isExpanded;
                    const displayedText = shouldClamp
                      ? `${post.content.slice(0, 132).trim()}...`
                      : post.content;

                    return (
                      <motion.article
                        key={post.id}
                        layout={reducedMotion ? false : 'position'}
                        variants={fadeInUpVariants}
                        exit="exit"
                        className={`${cardClass} p-4 space-y-3`}
                      >
                        {/* Post Author Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center font-display text-[13px] font-bold shrink-0 ${
                                isSelf
                                  ? 'bg-gradient-to-br from-[#245670] via-[#1E4B63] to-[#173E52] text-[#FFB057]'
                                  : 'bg-[#D6F3DF] text-[#156534] dark:bg-emerald-500/20 dark:text-emerald-300'
                              }`}
                            >
                              {post.authorInitials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white truncate">
                                  {post.authorName}
                                </h3>
                                {isSelf && (
                                  <span className="text-[11px] font-semibold text-[#EA580C] shrink-0">
                                    · You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {post.authorRole} · {post.timeLabel}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSavePost(post.id)}
                            aria-label="Post options"
                            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/8 text-slate-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                          >
                            <MoreHorizontal className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        {/* Editorial Body with Show More */}
                        <p className="text-[13.5px] text-slate-800 dark:text-slate-200 leading-[1.58] whitespace-pre-wrap break-words">
                          {displayedText}
                          {post.content.length > 135 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedPostIds((prev) => ({
                                  ...prev,
                                  [post.id]: !prev[post.id],
                                }))
                              }
                              className="ml-1.5 font-semibold text-[#EA580C] hover:underline cursor-pointer"
                            >
                              {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </p>

                        {/* Media Presentation */}
                        {post.hasMedia && (
                          <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-[#245670] via-[#1E4B63] to-[#F4A261]">
                            <div className="relative h-40 w-full p-4 flex flex-col justify-end text-white bg-[radial-gradient(circle_at_30%_35%,rgba(253,224,71,0.32),rgba(14,116,144,0.45)_55%,rgba(7,20,38,0.85)_100%)]">
                              <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-black/35 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-semibold text-amber-200 border border-white/15">
                                <Building2 className="w-3 h-3 text-[#FB923C]" />
                                <span>Featured Member Showcase</span>
                              </div>
                              {post.mediaCaption && (
                                <div className="mt-2 text-xs font-semibold text-white/95 drop-shadow-xs truncate">
                                  {post.mediaCaption}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Engagement Action Row: Heart / Comment / Repost / Bookmark */}
                        <div className="pt-2 border-t border-slate-100 dark:border-white/8 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-6">
                            <button
                              type="button"
                              onClick={() => onLikePost(post.id)}
                              className={`flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer ${
                                post.liked ? 'text-[#EA580C] font-semibold' : 'hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  post.liked ? 'fill-[#EA580C] text-[#EA580C]' : ''
                                }`}
                                strokeWidth={1.9}
                              />
                              <span className="tabular-nums">{post.likes}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setCommentOpen(commentOpen === post.id ? null : post.id)
                              }
                              className={`flex items-center gap-1.5 py-1.5 transition-colors cursor-pointer ${
                                commentOpen === post.id
                                  ? 'text-slate-900 dark:text-white font-semibold'
                                  : 'hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" strokeWidth={1.9} />
                              <span className="tabular-nums">{post.comments.length}</span>
                            </button>

                            <span className="flex items-center gap-1.5 py-1.5 text-slate-500 dark:text-slate-400">
                              <Repeat2 className="w-4 h-4" strokeWidth={1.9} />
                              <span className="tabular-nums">{post.reposts}</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSavePost(post.id)}
                            aria-label={post.saved ? 'Remove bookmark' : 'Bookmark post'}
                            className={`p-1.5 transition-colors cursor-pointer ${
                              post.saved
                                ? 'text-[#EA580C]'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Bookmark
                              className={`w-4 h-4 ${post.saved ? 'fill-[#EA580C]' : ''}`}
                              strokeWidth={1.9}
                            />
                          </button>
                        </div>

                        {/* Expandable Comment Drawer */}
                        <AnimatePresence initial={false}>
                          {commentOpen === post.id && (
                            <motion.div
                              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pt-2.5 border-t border-slate-100 dark:border-white/8 space-y-2.5">
                                {post.comments.length === 0 ? (
                                  <p className="text-[11.5px] text-slate-400 dark:text-slate-500 px-1">
                                    No replies yet. Start the discussion below.
                                  </p>
                                ) : (
                                  post.comments.map((cm) => (
                                    <div
                                      key={cm.id}
                                      className="text-xs bg-[#F6F7FB] dark:bg-[#0D1018] rounded-xl px-3.5 py-2.5 space-y-0.5"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                          {cm.author}
                                        </span>
                                        <span className="text-[10.5px] text-slate-400 tabular-nums">
                                          {cm.time}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {cm.text}
                                      </p>
                                    </div>
                                  ))
                                )}
                                <form
                                  className="flex items-center gap-2"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!commentDraft.trim()) return;
                                    onAddComment(post.id, commentDraft.trim());
                                    setCommentDraft('');
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={commentDraft}
                                    onChange={(e) => setCommentDraft(e.target.value)}
                                    placeholder="Add a thoughtful reply..."
                                    className="flex-1 h-9.5 px-3.5 rounded-xl bg-[#F6F7FB] dark:bg-[#0D1018] border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27]"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!commentDraft.trim()}
                                    aria-label="Send comment"
                                    className="w-9.5 h-9.5 rounded-xl bg-[#D85D27] hover:bg-[#BE4D14] disabled:opacity-45 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* SECTION 2: NETWORK STATISTIC & CONNECTIONS DIRECTORY (Pin Screen 2 + 3 Architecture) */}
      {section === 'connections' && (
        <motion.div
          key="section-connections"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="px-4 pt-5 space-y-4"
        >
          {/* Network Activity — Dual-Series Smooth Area & Spline Trend Graph */}
          <motion.div variants={fadeInUpVariants} className={`${cardClass} p-4 space-y-3`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Network Activity
                </div>
                <div className="mt-0.5 font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {connectedMembers.length + totalEngagements} Touchpoints
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 pt-0.5">
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1E4B63] dark:bg-sky-400" />
                    <span>Links</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D85D27]" />
                    <span>Posts</span>
                  </span>
                </div>
                <div className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="text-slate-800 dark:text-slate-200">{activeMonth.month}:</span>{' '}
                  <span className="text-[#1E4B63] dark:text-sky-400">{activeMonth.linksCount} links</span>
                  {' · '}
                  <span className="text-[#D85D27] dark:text-[#FF8A42]">{activeMonth.postsCount} posts</span>
                </div>
              </div>
            </div>

            {/* Dual Smooth Spline & Area Chart */}
            <div className="pt-1">
              <svg
                viewBox="0 0 300 104"
                className="w-full h-[108px] overflow-visible"
                role="img"
                aria-label="Network activity trend showing Links and Posts from June to November"
              >
                <defs>
                  <linearGradient id="ekamProfLinksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E4B63" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1E4B63" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="ekamProfPostsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EA580C" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal subtle gridlines */}
                {[26, 50, 74].map((y) => (
                  <line
                    key={y}
                    x1="12"
                    y1={y}
                    x2="288"
                    y2={y}
                    className="stroke-slate-200/80 dark:stroke-white/10"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                ))}
                <line
                  x1="12"
                  y1={chartBottomY}
                  x2="288"
                  y2={chartBottomY}
                  className="stroke-slate-200 dark:stroke-white/12"
                  strokeWidth="1"
                />

                {/* Soft area fills */}
                <path d={linksAreaPath} fill="url(#ekamProfLinksGrad)" />
                <path d={postsAreaPath} fill="url(#ekamProfPostsGrad)" />

                {/* Active vertical focus guide */}
                <line
                  x1={activeLinksPt.x}
                  y1={chartTopY - 4}
                  x2={activeLinksPt.x}
                  y2={chartBottomY}
                  className="stroke-slate-300 dark:stroke-white/20"
                  strokeWidth="1"
                  strokeDasharray="2.5 2.5"
                />

                {/* Smooth spline curves */}
                <path
                  d={linksLinePath}
                  fill="none"
                  className="stroke-[#1E4B63] dark:stroke-sky-400"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={postsLinePath}
                  fill="none"
                  className="stroke-[#D85D27] dark:stroke-[#FF8A42]"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data nodes & interactive hit zones */}
                {monthlySeries.map((item, idx) => {
                  const lp = linksPoints[idx];
                  const pp = postsPoints[idx];
                  const isActive = idx === activeMonthIdx;
                  return (
                    <g
                      key={item.month}
                      onClick={() => setActiveMonthIdx(idx)}
                      onMouseEnter={() => setActiveMonthIdx(idx)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={lp.x - 24}
                        y={0}
                        width={48}
                        height={104}
                        fill="transparent"
                      />
                      {isActive ? (
                        <>
                          <circle cx={lp.x} cy={lp.y} r="7" className="fill-[#1E4B63]/16 dark:fill-sky-400/20" />
                          <circle
                            cx={lp.x}
                            cy={lp.y}
                            r="3.8"
                            className="fill-[#1E4B63] dark:fill-sky-400 stroke-white dark:stroke-[#161822]"
                            strokeWidth="2"
                          />
                          <circle cx={pp.x} cy={pp.y} r="7" className="fill-[#D85D27]/18 dark:fill-[#FF8A42]/22" />
                          <circle
                            cx={pp.x}
                            cy={pp.y}
                            r="3.8"
                            className="fill-[#D85D27] dark:fill-[#FF8A42] stroke-white dark:stroke-[#161822]"
                            strokeWidth="2"
                          />
                        </>
                      ) : (
                        <>
                          <circle
                            cx={lp.x}
                            cy={lp.y}
                            r="2.4"
                            className="fill-white dark:fill-[#161822] stroke-[#1E4B63] dark:stroke-sky-400"
                            strokeWidth="1.6"
                          />
                          <circle
                            cx={pp.x}
                            cy={pp.y}
                            r="2.4"
                            className="fill-white dark:fill-[#161822] stroke-[#D85D27] dark:stroke-[#FF8A42]"
                            strokeWidth="1.6"
                          />
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Interactive Month Axis */}
              <div className="grid grid-cols-6 mt-1.5">
                {monthlySeries.map((item, idx) => {
                  const isActive = idx === activeMonthIdx;
                  return (
                    <button
                      key={item.month}
                      type="button"
                      onClick={() => setActiveMonthIdx(idx)}
                      className={`py-0.5 text-[10.5px] rounded-md transition-colors cursor-pointer ${
                        isActive
                          ? 'font-bold text-[#1E4B63] dark:text-white bg-slate-100/90 dark:bg-white/10'
                          : 'font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      {item.month}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Dual High-Contrast Gradient Stat Cards (Pin's Dark Card + Accent Card Signature) */}
          <motion.div variants={fadeInUpVariants} className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConnFilter('all')}
              className={`relative rounded-[22px] bg-gradient-to-br from-[#245670] via-[#1E4B63] to-[#173E52] border border-sky-200/25 p-4 text-left text-white overflow-hidden shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                connFilter === 'all' ? 'ring-2 ring-[#1E4B63] ring-offset-2 ring-offset-[#F5F6FA] dark:ring-offset-[#0B0D14]' : ''
              }`}
            >
              <ArrowDownRight
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -bottom-2 w-20 h-20 text-white/10"
                strokeWidth={2.2}
              />
              <div className="relative z-10 space-y-5">
                <div className="w-8 h-8 rounded-full bg-white text-[#1E4B63] flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" strokeWidth={2.1} />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-sky-100/85">Connected</div>
                  <div className="font-display text-lg font-bold tabular-nums mt-0.5">
                    {connectedMembers.length} Members
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setConnFilter('suggest')}
              className={`relative rounded-[22px] bg-gradient-to-br from-[#D85D27] to-[#BE4D14] p-4 text-left text-white overflow-hidden shadow-md shadow-[#D85D27]/20 active:scale-[0.98] transition-all cursor-pointer ${
                connFilter === 'suggest' ? 'ring-2 ring-[#D85D27] ring-offset-2 ring-offset-[#F5F6FA] dark:ring-offset-[#0B0D14]' : ''
              }`}
            >
              <ArrowUpRight
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -bottom-2 w-20 h-20 text-white/15"
                strokeWidth={2.2}
              />
              <div className="relative z-10 space-y-5">
                <div className="w-8 h-8 rounded-full bg-white text-[#D85D27] flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4" strokeWidth={2.1} />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-white/85">Discover</div>
                  <div className="font-display text-lg font-bold tabular-nums mt-0.5">
                    {suggestedCount} Peers
                  </div>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Search Contact Input (Pin Screen 3 Style) */}
          <motion.div variants={fadeInUpVariants} className="relative">
            <Search
              className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.85}
            />
            <input
              type="text"
              value={connQuery}
              onChange={(e) => setConnQuery(e.target.value)}
              placeholder="Search contact, company or category"
              className="w-full h-11.5 pl-10 pr-10 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 shadow-[0_6px_18px_-8px_rgba(18,49,66,0.08)] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/15 transition-all"
            />
            {connQuery && (
              <button
                type="button"
                onClick={() => setConnQuery('')}
                aria-label="Clear connection search"
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>

          {/* Connection Queue Tabs */}
          <motion.div
            variants={fadeInUpVariants}
            className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar"
          >
            {(
              [
                { id: 'all', label: 'Connected', count: connectedMembers.length },
                { id: 'suggest', label: 'Discover', count: suggestedCount },
                { id: 'pending', label: 'Sent', count: pendingCount },
                { id: 'request', label: 'Requests', count: requestCount },
              ] as const
            ).map((f) => {
              const selected = connFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setConnFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#1E4B63] text-white dark:bg-[#D85D27] dark:text-white shadow-xs'
                      : 'bg-white dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.1]'
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-[10.5px] font-mono-tabular ${
                      selected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Contact Directory Rows */}
          {visibleMembers.length === 0 ? (
            <motion.div variants={fadeInUpVariants}>
              <EmptyStateView
                kind="invites"
                title="No matching members"
                description={
                  connQuery
                    ? 'Try clearing your search or checking another tab.'
                    : 'No members in this connection queue right now.'
                }
                actionLabel={connFilter !== 'suggest' ? 'Discover members' : undefined}
                onAction={connFilter !== 'suggest' ? () => setConnFilter('suggest') : undefined}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`conn-${connFilter}`}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {visibleMembers.map((m) => (
                <motion.div
                  key={m.id}
                  variants={fadeInUpVariants}
                  className={`${cardClass} p-4 flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-xs font-bold shrink-0 ${m.avatarTone} ring-1 ring-black/5 dark:ring-white/10`}
                    >
                      {m.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-[14.5px] font-bold text-slate-900 dark:text-white truncate">
                        {m.name}
                      </div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate mt-0.5">
                        {m.company}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate tabular-nums">
                        {m.category} · {m.chapter} · {m.connectionsCount} links
                      </div>
                    </div>
                  </div>

                  {m.status === 'suggested' || m.status === 'received' ? (
                    <PremiumButton size="sm" onClick={() => onConnect(m.id)}>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{m.status === 'received' ? 'Accept' : 'Connect'}</span>
                    </PremiumButton>
                  ) : m.status === 'sent' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Sent</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate('messages')}
                      aria-label={`Message ${m.name}`}
                      className="w-9.5 h-9.5 rounded-xl bg-[#F4F5FA] dark:bg-white/[0.06] hover:bg-[#D85D27]/12 text-slate-500 hover:text-[#D85D27] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" strokeWidth={1.9} />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* SECTION 3: EXECUTIVE BENTO PROFILE PORTFOLIO */}
      {section === 'profile' && (
        <motion.div
          key="profile-bento"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="px-4 pt-5 space-y-3.5"
        >
          {/* Business Identity Bento Hero */}
          <motion.div variants={fadeInUpVariants} className={`${cardClass} p-4.5 space-y-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#245670] via-[#1E4B63] to-[#173E52] text-[#FFB057] flex items-center justify-center font-display text-lg font-bold shrink-0 shadow-sm">
                  {user.businessName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white truncate">
                    {user.businessName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user.fullName} · {user.designation}
                  </p>
                  <p className="text-[11.5px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {user.businessCategory} · {user.chapter} Chapter
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('edit_business')}
                aria-label="Edit business profile"
                className="w-9 h-9 rounded-xl bg-[#F4F5FA] dark:bg-white/[0.06] hover:bg-[#D85D27]/12 text-slate-500 hover:text-[#D85D27] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" strokeWidth={1.9} />
              </button>
            </div>

            {/* Profile Completeness Meter */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/8 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Business dossier readiness
                </span>
                <span className="font-semibold text-[#D85D27] tabular-nums">
                  {completedCount}/{profileFields.length} fields ({completionPct}%)
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D85D27] to-[#F38B1E] transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* 2-Column Dual-Contrast Bento Summary */}
          <motion.div variants={fadeInUpVariants} className="grid grid-cols-2 gap-3">
            <div className="relative rounded-[22px] bg-gradient-to-br from-[#245670] via-[#1E4B63] to-[#173E52] border border-sky-200/25 p-4 text-white overflow-hidden shadow-md">
              <MapPin
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -bottom-2 w-16 h-16 text-white/10"
                strokeWidth={1.8}
              />
              <div className="relative z-10 space-y-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#1E4B63] flex items-center justify-center">
                  <MapPin className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[11px] text-sky-100/85">Headquarters</div>
                  <div className="font-display text-sm font-bold truncate mt-0.5">
                    {user.headquarters || user.region}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-[22px] bg-gradient-to-br from-[#D85D27] to-[#BE4D14] p-4 text-white overflow-hidden shadow-md shadow-[#D85D27]/20">
              <Users
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -bottom-2 w-16 h-16 text-white/15"
                strokeWidth={1.8}
              />
              <div className="relative z-10 space-y-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#D85D27] flex items-center justify-center">
                  <Users className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[11px] text-white/85">Network reach</div>
                  <div className="font-display text-sm font-bold tabular-nums mt-0.5">
                    {connectedMembers.length} links · {myPostsCount} posts
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Business Dossier Ledger */}
          <motion.div
            variants={fadeInUpVariants}
            className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8 text-xs`}
          >
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">Sponsor</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {user.sponsorName || 'Chapter direct'}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">Company size</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {user.companySize || 'Not added yet'}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">Established</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                {user.establishedYear || 'Not added yet'}
              </span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">GST registration</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono-tabular">
                {user.gstNumber || 'Not added yet'}
              </span>
            </div>
          </motion.div>

          {/* Action Card */}
          <motion.div variants={fadeInUpVariants} className={`${cardClass} p-4 space-y-3`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center shrink-0">
                {completedCount === profileFields.length ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {completedCount === profileFields.length
                    ? 'Business profile complete'
                    : 'Complete your business dossier'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Keep your company size, founding year, and credentials current so members can refer clients with confidence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <PremiumButton
                variant="secondary"
                fullWidth
                size="sm"
                onClick={() => onNavigate('edit_personal')}
              >
                Personal info
              </PremiumButton>
              <PremiumButton fullWidth size="sm" onClick={() => onNavigate('edit_business')}>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit business</span>
              </PremiumButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
      </SkeletonCrossfade>
    </PullToRefreshContainer>
  );
}

const POST_FOCUS_OPTIONS = [
  {
    id: 'milestone',
    label: 'Milestone',
    flexClass: 'flex-[1.1]',
    icon: Trophy,
    placeholder: 'Share a recent client win, launch, or milestone with the EKAM network...',
    template:
      'Milestone update: Excited to share our latest client delivery at ',
  },
  {
    id: 'referral',
    label: 'Referral Ask',
    flexClass: 'flex-[1.45]',
    icon: Handshake,
    placeholder: 'Describe the type of client, partner, or introduction you are looking for...',
    template:
      'Looking for warm introductions to decision-makers in ',
  },
  {
    id: 'insight',
    label: 'Insight',
    flexClass: 'flex-[0.85]',
    icon: Lightbulb,
    placeholder: 'Share a practical takeaway, industry lesson, or playbook with fellow members...',
    template:
      'Key lesson from working with enterprise teams this quarter: ',
  },
  {
    id: 'update',
    label: 'Update',
    flexClass: 'flex-[0.9]',
    icon: Megaphone,
    placeholder: 'Share an upcoming event, announcement, or chapter update...',
    template:
      'Chapter & business update: ',
  },
] as const;

export function WritePostScreen({
  user,
  onPublish,
  onBack,
  reducedMotion = false,
}: {
  user: UserProfile;
  onPublish: (content: string) => void;
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const MAX_CHARS = 500;
  const [text, setText] = useState('');
  const [focusId, setFocusId] = useState<(typeof POST_FOCUS_OPTIONS)[number]['id']>('milestone');
  const [mode, setMode] = useState<'compose' | 'preview'>('compose');

  const activeFocus =
    POST_FOCUS_OPTIONS.find((item) => item.id === focusId) || POST_FOCUS_OPTIONS[0];
  const trimmed = text.trim();
  const charCount = text.length;
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const overLimit = charCount > MAX_CHARS;
  const nearLimit = charCount >= 430 && charCount <= MAX_CHARS;

  const cardClass =
    'rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] overflow-hidden';

  const applyStarterTemplate = () => {
    setMode('compose');
    setText((prev) => {
      if (!prev.trim()) return activeFocus.template;
      return prev.endsWith('\n') || prev.endsWith(' ')
        ? `${prev}${activeFocus.template}`
        : `${prev}\n\n${activeFocus.template}`;
    });
  };

  return (
    <div className="h-full bg-gradient-to-b from-[#ECEEF7]/85 via-[#F4F5FA] to-[#F8F9FC] dark:from-[#121622] dark:via-[#0B0D14] dark:to-[#0A0C12] flex flex-col relative overflow-hidden">
      {/* Minimal Centered Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0 z-20 bg-[#ECEEF7]/95 dark:bg-[#121622]/95">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/8 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-100" strokeWidth={1.85} />
        </button>
        <h1 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
          Create a Post
        </h1>
        <button
          type="button"
          onClick={() => setMode((m) => (m === 'compose' ? 'preview' : 'compose'))}
          disabled={!trimmed && mode === 'compose'}
          aria-label={mode === 'compose' ? 'Preview post' : 'Back to editor'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            mode === 'preview'
              ? 'bg-[#D85D27]/12 text-[#D85D27] cursor-pointer'
              : trimmed
                ? 'hover:bg-black/5 dark:hover:bg-white/8 text-slate-700 dark:text-slate-200 cursor-pointer'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {mode === 'preview' ? (
            <PenLine className="w-4.5 h-4.5" strokeWidth={1.9} />
          ) : (
            <Eye className="w-4.5 h-4.5" strokeWidth={1.9} />
          )}
        </button>
      </div>

      <form
        className="flex-1 flex flex-col min-h-0"
        onSubmit={(e) => {
          e.preventDefault();
          if (!trimmed || overLimit) return;
          onPublish(trimmed);
        }}
      >
        <div className="flex-1 overflow-y-auto ekam-scroll px-4 pt-2 pb-6 space-y-4">
          {/* Author & Audience Identity Card */}
          <div className={`${cardClass} p-4 flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#245670] via-[#1E4B63] to-[#173E52] text-[#FFB057] flex items-center justify-center font-display text-sm font-bold shadow-sm">
                  {user.initials}
                </div>
                <span
                  title="Visible to EKAM Network"
                  className="w-5 h-5 rounded-lg bg-white dark:bg-[#1E2130] border border-slate-200/80 dark:border-white/15 shadow-xs flex items-center justify-center absolute -bottom-1 -right-1 text-slate-500 dark:text-slate-300"
                >
                  <Globe className="w-2.5 h-2.5" strokeWidth={2.2} />
                </span>
              </div>

              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user.fullName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user.designation} · {user.businessName}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  <span>All EKAM regions</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{user.chapter}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Composer Card */}
          <div className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8`}>
            {/* Post Focus Segmented Selector */}
            <div className="p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2.5 px-0.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Post focus
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Guides prompt &amp; framing
                </span>
              </div>
              <div
                role="group"
                aria-label="Post focus"
                className="flex items-stretch gap-1 p-1 rounded-xl bg-[#F2F4F8] dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/8"
              >
                {POST_FOCUS_OPTIONS.map((option) => {
                  const selected = focusId === option.id;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFocusId(option.id)}
                      aria-pressed={selected}
                      className={`${option.flexClass} min-w-0 relative py-2 px-1.5 rounded-lg text-[11px] font-semibold transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        selected
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {selected && (
                        <motion.div
                          layoutId="write-post-focus"
                          transition={
                            reducedMotion
                              ? { duration: 0.1 }
                              : { type: 'spring', stiffness: 420, damping: 32 }
                          }
                          className="absolute inset-0 rounded-lg bg-white dark:bg-[#232636] shadow-sm border border-slate-200/60 dark:border-white/10"
                        />
                      )}
                      <Icon
                        className={`relative z-10 w-3.5 h-3.5 shrink-0 ${
                          selected ? 'text-[#D85D27]' : ''
                        }`}
                        strokeWidth={2}
                      />
                      <span className="relative z-10 whitespace-nowrap">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editor or Live Feed Preview */}
            <AnimatePresence mode="wait" initial={false}>
              {mode === 'compose' ? (
                <motion.div
                  key="compose-pane"
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="p-4 space-y-3"
                >
                  <textarea
                    rows={7}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={activeFocus.placeholder}
                    aria-label="Post message"
                    required
                    className="w-full p-3.5 rounded-xl bg-[#F6F7FB] dark:bg-[#0D1018] border border-slate-200/90 dark:border-white/10 text-[14px] leading-relaxed font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/15 transition-all resize-none"
                  />

                  {/* Helper Actions & Live Metrics */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={applyStarterTemplate}
                        className="h-8 px-2.5 rounded-lg bg-[#D85D27]/10 hover:bg-[#D85D27]/16 text-[#D85D27] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PenLine className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Insert starter</span>
                      </button>

                      {text.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setText('')}
                          aria-label="Clear post text"
                          className="h-8 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-500 dark:text-slate-400 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" strokeWidth={2} />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    <div
                      className={`text-[11px] font-medium tabular-nums ${
                        overLimit
                          ? 'text-rose-600 dark:text-rose-400 font-semibold'
                          : nearLimit
                            ? 'text-[#D85D27]'
                            : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount}/{MAX_CHARS}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview-pane"
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="p-4 space-y-3.5"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Feed preview</span>
                    <button
                      type="button"
                      onClick={() => setMode('compose')}
                      className="font-semibold text-[#D85D27] hover:text-[#BE4D14] cursor-pointer"
                    >
                      Edit text
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-display text-xs font-bold shrink-0">
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.designation} · Just now
                        </div>
                      </div>
                    </div>

                    <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                      {trimmed || 'Nothing written yet.'}
                    </p>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-white/8 grid grid-cols-4 text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                      <span className="flex items-center justify-center gap-1.5 py-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span>0</span>
                      </span>
                      <span className="flex items-center justify-center gap-1.5 py-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>0</span>
                      </span>
                      <span className="flex items-center justify-center gap-1.5 py-1">
                        <Repeat2 className="w-3.5 h-3.5" />
                        <span>0</span>
                      </span>
                      <span className="flex items-center justify-center py-1">
                        <Bookmark className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Anchored Bottom Action Bar */}
        <div className="shrink-0 px-4 pt-2.5 pb-5 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC]/95 to-transparent dark:from-[#0A0C12] dark:via-[#0A0C12]/95">
          <div className="grid grid-cols-[0.82fr_1.18fr] gap-2.5">
            <PremiumButton variant="secondary" fullWidth size="lg" className="!px-3.5" onClick={onBack}>
              Cancel
            </PremiumButton>
            <PremiumButton
              type="submit"
              fullWidth
              size="lg"
              className="!px-3.5"
              disabled={!trimmed || overLimit}
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Post to Network</span>
            </PremiumButton>
          </div>
        </div>
      </form>
    </div>
  );
}

export function GroupsHomeScreen({
  groups,
  onSelectGroup,
  onJoinGroup,
  onDeleteGroup,
  onNavigate,
  reducedMotion = false,
  isLoading = false,
  onRefresh,
}: {
  groups: GroupItem[];
  onSelectGroup: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onDeleteGroup?: (id: string) => void;
  onNavigate: (s: ScreenId) => void;
  reducedMotion?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<'my' | 'suggested' | 'invites'>('my');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [pendingDelete, setPendingDelete] = useState<GroupItem | null>(null);

  const listVariants = createStaggerListVariants(reducedMotion, 0.065, 0.04);
  const cardVariants = createSpringItemVariants(reducedMotion, 18, 0.93);

  const myCount = groups.filter((g) => g.joined).length;
  const suggestedCount = groups.filter((g) => !g.joined).length;
  const invitesCount = groups.filter((g) => Boolean(g.invited)).length;

  const categories = ['All', ...Array.from(new Set(groups.map((g) => g.category)))];

  const filtered = groups.filter((g) => {
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.location.toLowerCase().includes(q);
    if (!matchQ) return false;
    if (categoryFilter !== 'All' && g.category !== categoryFilter) return false;
    if (tab === 'my') return g.joined;
    if (tab === 'suggested') return !g.joined;
    return Boolean(g.invited);
  });

  const cardClass =
    'rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] transition-shadow hover:shadow-[0_18px_38px_-12px_rgba(18,49,66,0.16)]';

  return (
    <PullToRefreshContainer tone="dark" reducedMotion={reducedMotion} onRefresh={onRefresh}>
      <SkeletonCrossfade
        loading={isLoading}
        reducedMotion={reducedMotion}
        skeleton={<GroupsHubSkeleton reducedMotion={reducedMotion} />}
      >
        <div className="min-h-full bg-gradient-to-b from-[#ECEEF7]/85 via-[#F4F5FA] to-[#F8F9FC] dark:from-[#121622] dark:via-[#0B0D14] dark:to-[#0A0C12] pb-8">
      {/* Groups Screen Midnight Navy Editorial Header (Matching Business & Professional) */}
      <div className="relative bg-gradient-to-b from-[#060F1E] via-[#091930] to-[#122338] px-4 pt-4 pb-4 text-white overflow-hidden">
        {/* Subtle ambient warm-orange lighting */}
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
            <span className="tracking-[-0.01em]">Hyderabad – Fortune Chapter</span>
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

        {/* MIDDLE ROW: Groups Heading & Subtitle Left + Warm Glass Plus Button Right */}
        <div className="relative z-20 mt-3 mb-5 flex items-center justify-between gap-2">
          <div className="min-w-0 pr-2">
            <h1 className="font-display text-[33px] font-extrabold tracking-[-0.02em] leading-[1.08] text-white">
              Groups
            </h1>
            <p className="mt-1.5 text-[13px] font-normal text-white/85 leading-snug truncate">
              Circles beyond your chapter
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.94 }}
            onClick={() => onNavigate('group_create')}
            aria-label="Create group"
            className="relative z-30 w-[48px] h-[48px] rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,154,66,0.94)_0%,rgba(255,107,26,0.88)_55%,rgba(234,82,12,0.92)_100%)] backdrop-blur-md text-white border border-[#FFD1A8]/65 shadow-[0_6px_16px_rgba(0,0,0,0.28),inset_0_1px_3px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-pointer shrink-0"
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={2.2} />
          </motion.button>
        </div>

        {/* BOTTOM ROW: Full-Width Rounded Pill Glass Navigation Bar (My groups | Suggested | Invites) */}
        <div className="relative z-20 rounded-full bg-[linear-gradient(90deg,rgba(26,38,58,0.76)_0%,rgba(44,50,68,0.68)_52%,rgba(68,54,62,0.66)_100%)] backdrop-blur-xl border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.28),0_8px_24px_rgba(0,0,0,0.35)] p-1.5 flex items-center">
          {(
            [
              { id: 'my', label: 'My groups', count: myCount, icon: Layers, flexClass: 'flex-[1.15_1_0%]' },
              { id: 'suggested', label: 'Suggested', count: suggestedCount, icon: Globe, flexClass: 'flex-[1.15_1_0%]' },
              { id: 'invites', label: 'Invites', count: invitesCount, icon: UserPlus, flexClass: 'flex-[0.92_1_0%]' },
            ] as const
          ).map((t, index, arr) => {
            const active = tab === t.id;
            const Icon = t.icon;
            const nextItem = arr[index + 1];
            const showDivider = index < arr.length - 1 && !active && (!nextItem || tab !== nextItem.id);
            return (
              <React.Fragment key={t.id}>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative z-10 min-w-0 ${t.flexClass} min-h-[40px] rounded-full text-[11.5px] transition-colors cursor-pointer flex items-center justify-center gap-1 px-2 whitespace-nowrap ${
                    active ? 'text-[#101828] font-bold' : 'text-white/90 hover:text-white font-medium'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="groups-home-tab"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center shrink-0">
                    <Icon
                      className={`w-[13.5px] h-[13.5px] ${
                        active ? 'text-[#EA580C]' : 'text-white/85'
                      }`}
                      strokeWidth={1.9}
                    />
                  </span>
                  <span className="relative z-10 tracking-[-0.01em]">{t.label}</span>
                  <span
                    className={`relative z-10 text-[10px] font-mono-tabular ${
                      active ? 'text-[#EA580C] font-bold' : 'text-white/65'
                    }`}
                  >
                    {t.count}
                  </span>
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

      {/* Main Content */}
      <div className="px-4 pt-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.85}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'my' ? 'Search your groups' : 'Search groups and categories'}
            className="w-full h-11.5 pl-10 pr-10 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 shadow-[0_6px_18px_-8px_rgba(18,49,66,0.10)] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/15 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Strip */}
        {categories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {categories.map((cat) => {
              const selected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#123142] text-white dark:bg-[#D85D27] dark:text-white shadow-xs'
                      : 'bg-white/80 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.1]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Section Header */}
        <SectionHeader
          title={
            tab === 'my'
              ? 'Your active circles'
              : tab === 'suggested'
                ? 'Recommended circles'
                : 'Pending invitations'
          }
          actionLabel={tab === 'my' ? 'New group' : undefined}
          onAction={tab === 'my' ? () => onNavigate('group_create') : undefined}
        />

        {/* Group Cards */}
        {filtered.length === 0 ? (
          <EmptyStateView
            kind="invites"
            title={tab === 'invites' ? 'No invitations' : 'No groups found'}
            description={
              tab === 'invites'
                ? 'When someone invites you to a circle, it will appear here.'
                : 'Try adjusting your search or create a new interest circle.'
            }
          />
        ) : (
          <motion.div
            key={`${tab}-${categoryFilter}`}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3.5"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((g) => (
                <motion.article
                  key={g.id}
                  layout={reducedMotion ? false : 'position'}
                  variants={cardVariants}
                  exit="exit"
                  whileHover={
                    reducedMotion
                      ? undefined
                      : {
                          scale: 1.02,
                          transition: { type: 'spring', stiffness: 400, damping: 28 },
                        }
                  }
                  whileTap={
                    reducedMotion
                      ? undefined
                      : {
                          scale: 0.99,
                          transition: { duration: 0.1 },
                        }
                  }
                  className={`${cardClass} p-4 space-y-3.5 origin-center`}
                >
                {/* Top Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectGroup(g.id)}
                    className="flex items-start gap-3.5 min-w-0 flex-1 text-left cursor-pointer group"
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-13 h-13 rounded-2xl flex items-center justify-center font-display text-sm font-bold ${g.tone} ring-1 ring-black/5 dark:ring-white/10`}
                      >
                        {g.initials}
                      </div>
                      <span
                        title={g.privacy}
                        className="w-5 h-5 rounded-lg bg-white dark:bg-[#1E2130] border border-slate-200/80 dark:border-white/15 shadow-xs flex items-center justify-center absolute -bottom-1 -right-1 text-slate-500 dark:text-slate-300"
                      >
                        {g.privacy === 'Private' ? (
                          <Lock className="w-2.5 h-2.5" strokeWidth={2.2} />
                        ) : (
                          <Globe className="w-2.5 h-2.5" strokeWidth={2.2} />
                        )}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#D85D27] transition-colors">
                        {g.name}
                      </h3>
                      <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{g.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{g.location}</span>
                        {g.isOwner && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#D85D27]">Host</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  {g.joined && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      {g.isOwner && onDeleteGroup && (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(g)}
                          aria-label={`Delete ${g.name}`}
                          className="w-9 h-9 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/12 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.85} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectGroup(g.id)}
                        aria-label={`Open ${g.name}`}
                        className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Group Description */}
                {g.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {g.description}
                  </p>
                )}

                {/* Footer: Member Stack + Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {g.members.length > 0 && (
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        {g.members.slice(0, 3).map((m) => (
                          <span
                            key={m.id}
                            className="w-6.5 h-6.5 rounded-full bg-[#123142]/10 dark:bg-white/12 text-[#123142] dark:text-slate-200 ring-2 ring-white dark:ring-[#161822] flex items-center justify-center font-display text-[9.5px] font-bold"
                          >
                            {m.initials}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums truncate">
                      {g.membersCount} {g.membersCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  {g.joined ? (
                    <button
                      type="button"
                      onClick={() => onSelectGroup(g.id)}
                      className="text-xs font-semibold text-[#D85D27] hover:text-[#BE4D14] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <PremiumButton size="sm" onClick={() => onJoinGroup(g.id)}>
                      Join Circle
                    </PremiumButton>
                  )}
                </div>
              </motion.article>
              ))}
            </AnimatePresence>

            {tab === 'my' && (
              <motion.button
                type="button"
                variants={cardVariants}
                whileHover={
                  reducedMotion
                    ? undefined
                    : {
                        scale: 1.02,
                        transition: { type: 'spring', stiffness: 400, damping: 28 },
                      }
                }
                whileTap={
                  reducedMotion
                    ? undefined
                    : {
                        scale: 0.99,
                        transition: { duration: 0.1 },
                      }
                }
                onClick={() => onNavigate('group_create')}
                className="w-full rounded-[22px] border border-dashed border-slate-300/90 dark:border-white/15 bg-white/55 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] p-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer origin-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      Start a new circle
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Launch a focused group across chapters
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4"
            onClick={() => setPendingDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xs rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 p-5 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/12 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Delete group?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {pendingDelete.name}
                    </span>
                    ?
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <PremiumButton variant="secondary" fullWidth size="sm" onClick={() => setPendingDelete(null)}>
                  Cancel
                </PremiumButton>
                <PremiumButton
                  variant="danger"
                  fullWidth
                  size="sm"
                  onClick={() => {
                    onDeleteGroup?.(pendingDelete.id);
                    setPendingDelete(null);
                  }}
                >
                  Delete
                </PremiumButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
      </SkeletonCrossfade>
    </PullToRefreshContainer>
  );
}

export function CreateGroupScreen({
  onCreate,
  onBack,
}: {
  onCreate: (group: { name: string; privacy: 'Public' | 'Private'; category: string; location: string; description: string }) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<'Public' | 'Private'>('Public');
  const [category, setCategory] = useState('Business');
  const [location, setLocation] = useState('Hyderabad');
  const [description, setDescription] = useState('');

  const groupInitials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const cardClass =
    'rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] overflow-hidden';

  const inputClass =
    'w-full h-11.5 pl-10 pr-3.5 rounded-xl bg-[#F6F7FB] dark:bg-[#0D1018] border border-slate-200/90 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/15 transition-all';

  return (
    <div className="h-full bg-gradient-to-b from-[#ECEEF7]/85 via-[#F4F5FA] to-[#F8F9FC] dark:from-[#121622] dark:via-[#0B0D14] dark:to-[#0A0C12] flex flex-col relative overflow-hidden">
      {/* Minimal Centered Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0 z-20 bg-[#ECEEF7]/95 dark:bg-[#121622]/95">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/8 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-100" strokeWidth={1.85} />
        </button>
        <h1 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
          Create Group
        </h1>
        <span className="w-10" aria-hidden="true" />
      </div>

      <form
        className="flex-1 flex flex-col min-h-0"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate({ name: name.trim(), privacy, category, location, description });
        }}
      >
        <div className="flex-1 overflow-y-auto ekam-scroll px-4 pt-2 pb-6 space-y-4">
          {/* Live Group Preview Card */}
          <div className={`${cardClass} p-4 flex items-center gap-3.5`}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#173E52] text-[#F38B1E] flex items-center justify-center font-display text-sm font-bold shrink-0 shadow-sm">
              {groupInitials ? groupInitials : <Users className="w-5 h-5" strokeWidth={1.85} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                {name.trim() || 'Create Group'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                <span className="shrink-0">{privacy}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{category}</span>
                {location.trim() && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{location.trim()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8`}>
            <div className="p-4">
              <div className="relative">
                <Users
                  className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.85}
                />
                <input
                  type="text"
                  placeholder="Group name *"
                  aria-label="Group name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="p-4">
              <div
                role="group"
                aria-label="Privacy"
                className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#F2F4F8] dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/8"
              >
                {(['Public', 'Private'] as const).map((option) => {
                  const selected = privacy === option;
                  const Icon = option === 'Public' ? Globe : Lock;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPrivacy(option)}
                      aria-pressed={selected}
                      className={`relative py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        selected
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {selected && (
                        <motion.div
                          layoutId="create-group-privacy"
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-0 rounded-lg bg-white dark:bg-[#232636] shadow-sm border border-slate-200/60 dark:border-white/10"
                        />
                      )}
                      <Icon
                        className={`relative z-10 w-3.5 h-3.5 ${
                          selected ? 'text-[#D85D27]' : ''
                        }`}
                        strokeWidth={2}
                      />
                      <span className="relative z-10">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <Layers
                  className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.85}
                />
                <select
                  aria-label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${inputClass} pr-9 appearance-none cursor-pointer`}
                >
                  <option>Business</option>
                  <option>Technology</option>
                  <option>Leadership &amp; HR</option>
                  <option>Real Estate</option>
                </select>
                <ChevronDown
                  className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.85}
                />
              </div>

              <div className="relative">
                <MapPin
                  className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.85}
                />
                <input
                  type="text"
                  placeholder="Location"
                  aria-label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="relative">
                <FileText
                  className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5 pointer-events-none"
                  strokeWidth={1.85}
                />
                <textarea
                  rows={3}
                  placeholder="Description"
                  aria-label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#F6F7FB] dark:bg-[#0D1018] border border-slate-200/90 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/15 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Anchored Bottom Action Bar */}
        <div className="shrink-0 px-4 pt-2.5 pb-5 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC]/95 to-transparent dark:from-[#0A0C12] dark:via-[#0A0C12]/95">
          <div className="grid grid-cols-2 gap-2.5">
            <PremiumButton variant="secondary" fullWidth size="lg" onClick={onBack}>
              Cancel
            </PremiumButton>
            <PremiumButton type="submit" fullWidth size="lg" disabled={!name.trim()}>
              Submit
            </PremiumButton>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ViewGroupScreen({
  group,
  posts,
  onAddGroupPost,
  onDeleteGroup,
  onBack,
  reducedMotion = false,
  isLoading = false,
  onRefresh,
}: {
  group: GroupItem;
  posts: PostItem[];
  onAddGroupPost: (groupId: string, text: string) => void;
  onDeleteGroup?: (id: string) => void;
  onBack: () => void;
  reducedMotion?: boolean;
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<'feed' | 'members' | 'invites' | 'about'>('feed');
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const listVariants = createStaggerListVariants(reducedMotion, 0.06, 0.04);
  const itemVariants = createSpringItemVariants(reducedMotion, 18, 0.95);

  const groupPosts = posts.filter((p) => p.scope === 'group' && p.groupId === group.id);

  return (
    <PullToRefreshContainer tone="dark" reducedMotion={reducedMotion} onRefresh={onRefresh}>
      <SkeletonCrossfade
        loading={isLoading}
        reducedMotion={reducedMotion}
        skeleton={<FeedListSkeleton variant="group_view" reducedMotion={reducedMotion} />}
      >
        <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <div className="relative bg-gradient-to-br from-[#0D2331] to-[#173E52] px-4 pt-4 pb-6 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-display text-base font-bold">View Group</span>
          </div>
          {group.isOwner && onDeleteGroup && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete ${group.name}`}
              className="w-10 h-10 rounded-xl hover:bg-rose-500/20 text-white/80 hover:text-rose-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3.5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display text-lg font-bold shrink-0 bg-white text-slate-900`}>
            {group.initials}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold truncate">{group.name}</h1>
            <p className="text-xs text-slate-300">
              {group.privacy} group · {group.membersCount} members
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 grid grid-cols-4 text-center">
        {(
          [
            { id: 'feed', label: 'Feed' },
            { id: 'members', label: 'Members' },
            { id: 'invites', label: 'My Invites' },
            { id: 'about', label: 'About' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`py-3 text-xs font-semibold border-b-2 cursor-pointer ${
              tab === t.id
                ? 'border-[#D85D27] text-[#D85D27]'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {tab === 'feed' && (
          <>
            <form
              className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                onAddGroupPost(group.id, draft.trim());
                setDraft('');
              }}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share an update..."
                className="flex-1 h-10 px-3 rounded-xl bg-[#F4F5F7] dark:bg-[#0E1015] text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <PremiumButton type="submit" size="sm">
                Post
              </PremiumButton>
            </form>

            {groupPosts.length === 0 ? (
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <EmptyStateView
                  kind="feed"
                  title="No updates yet"
                  description="Kick off a conversation with group members."
                />
              </motion.div>
            ) : (
              <motion.div
                key="vg-feed"
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {groupPosts.map((p) => (
                    <motion.div
                      key={p.id}
                      layout={reducedMotion ? false : 'position'}
                      variants={itemVariants}
                      exit="exit"
                      className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-2 shadow-[0_10px_24px_-14px_rgba(18,49,66,0.12)]"
                    >
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-white">{p.authorName}</div>
                      <div className="text-[11px] text-slate-400">{p.timeLabel}</div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{p.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

        {tab === 'members' && (
          <motion.div
            key="vg-members"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2.5"
          >
            {group.members.map((m) => (
              <motion.div
                key={m.id}
                variants={itemVariants}
                className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#123142]/10 dark:bg-sky-500/15 text-[#123142] dark:text-sky-300 flex items-center justify-center font-display text-xs font-bold">
                    {m.initials}
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-slate-900 dark:text-white">{m.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {m.company} · {m.role}
                    </div>
                  </div>
                </div>
                {m.isAdmin && <span className="text-xs font-semibold text-[#D85D27]">Admin</span>}
              </motion.div>
            ))}
          </motion.div>
        )}

        {tab === 'invites' && (
          <div className="space-y-2.5">
            {group.invitesSent.length === 0 ? (
              <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <EmptyStateView
                  kind="invites"
                  title="No invites sent"
                  description="Invite fellow chapter members to collaborate in this circle."
                />
              </motion.div>
            ) : (
              <motion.div
                key="vg-invites"
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2.5"
              >
                {group.invitesSent.map((inv) => (
                  <motion.div
                    key={inv.id}
                    variants={itemVariants}
                    className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-display text-xs font-bold">
                      {inv.initials}
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-slate-900 dark:text-white">{inv.name}</div>
                      <div className="text-xs text-slate-500">{inv.email}</div>
                      <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {inv.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {tab === 'about' && (
          <motion.div
            key="vg-about"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-3 text-xs"
          >
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {group.description || 'No description provided for this group.'}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-white/8 flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-semibold text-slate-900 dark:text-white">{group.category}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/8 flex justify-between">
              <span className="text-slate-500">Privacy</span>
              <span className="font-semibold text-slate-900 dark:text-white">{group.privacy}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/8 flex justify-between">
              <span className="text-slate-500">Members</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{group.membersCount}</span>
            </div>
            {group.isOwner && onDeleteGroup && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/8">
                <PremiumButton variant="danger" fullWidth size="sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Group</span>
                </PremiumButton>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-xs rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/80 dark:border-white/10 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/12 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Delete group?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-200">{group.name}</span>?
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <PremiumButton variant="secondary" fullWidth size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </PremiumButton>
              <PremiumButton
                variant="danger"
                fullWidth
                size="sm"
                onClick={() => {
                  setConfirmDelete(false);
                  onDeleteGroup?.(group.id);
                }}
              >
                Delete
              </PremiumButton>
            </div>
          </div>
        </div>
      )}
    </div>
      </SkeletonCrossfade>
    </PullToRefreshContainer>
  );
}

export function ServiceLockedScreen({ onReturnHome }: { onReturnHome: () => void }) {
  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#123142]/10 dark:bg-sky-500/15 text-[#123142] dark:text-sky-300 flex items-center justify-center mb-4">
        <Lock className="w-7 h-7" />
      </div>
      <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        Social &amp; Service Module
      </h1>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        Social events, community donations, and volunteer drives are gated for Fortune chapter membership tier.
        Contact your chapter admin to unlock Service access.
      </p>
      <div className="mt-6">
        <PremiumButton onClick={onReturnHome}>Return to Dashboard</PremiumButton>
      </div>
    </div>
  );
}
