import React, { useEffect, useRef, useState } from 'react';
import {
  INITIAL_CONNECTIONS,
  INITIAL_EVENTS,
  INITIAL_GROUPS,
  INITIAL_MEETINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_P2P_SESSIONS,
  INITIAL_POSTS,
  INITIAL_REFERRALS,
  INITIAL_TESTIMONIALS,
  INITIAL_THREADS,
  INITIAL_USER,
  INITIAL_VISITORS,
} from './data/ekamData';
import {
  ChatThread,
  ConnectionMember,
  EventItem,
  GroupItem,
  NotificationItem,
  P2PSession,
  PostItem,
  ReferralItem,
  ScreenId,
  StudioView,
  TestimonialItem,
  ThemeMode,
  UserProfile,
  VisitorItem,
} from './types/ekam';
import { EkamWordmark } from './components/EkamBrand';
import { EkamInteractiveApp } from './components/EkamInteractiveApp';
import { ThreeChapterNexus } from './components/ThreeChapterNexus';
import { ScreenAuditGallery } from './components/ScreenAuditGallery';
import { DesignSystemView } from './components/DesignSystemView';

export default function App() {
  const [studioView, setStudioView] = useState<StudioView>('workspace');
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Live EKAM application state
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [referrals, setReferrals] = useState<ReferralItem[]>(INITIAL_REFERRALS);
  const [members, setMembers] = useState<ConnectionMember[]>(INITIAL_CONNECTIONS);
  const [meetings] = useState(INITIAL_MEETINGS);
  const [p2pSessions, setP2pSessions] = useState<P2PSession[]>(INITIAL_P2P_SESSIONS);
  const [visitors, setVisitors] = useState<VisitorItem[]>(INITIAL_VISITORS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [groups, setGroups] = useState<GroupItem[]>(INITIAL_GROUPS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [creditsInr, setCreditsInr] = useState<number>(0);

  // Branded initial hydration & sign-in data-fetch loading state
  const [isBootLoading, setIsBootLoading] = useState<boolean>(true);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
  const fetchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const bootTimer = window.setTimeout(
      () => setIsBootLoading(false),
      reducedMotion ? 240 : 620
    );
    return () => window.clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    return () => {
      if (fetchTimerRef.current !== null) {
        window.clearTimeout(fetchTimerRef.current);
      }
    };
  }, []);

  const triggerDataFetch = (durationMs?: number) => {
    if (fetchTimerRef.current !== null) {
      window.clearTimeout(fetchTimerRef.current);
    }
    setIsFetchingData(true);
    const delay = durationMs ?? (reducedMotion ? 220 : 560);
    fetchTimerRef.current = window.setTimeout(() => {
      setIsFetchingData(false);
      fetchTimerRef.current = null;
    }, delay);
  };

  // Sync Tailwind v4 `.dark` class on <html>
  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => {
      if (dark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    if (theme === 'dark') {
      apply(true);
    } else if (theme === 'light') {
      apply(false);
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const handleUpdateUser = (patch: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      if (patch.fullName) {
        const parts = patch.fullName.trim().split(/\s+/);
        next.initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || prev.initials;
      }
      return next;
    });
  };

  const handleAddReferral = (item: Omit<ReferralItem, 'id'>) => {
    setReferrals((prev) => [{ ...item, id: `ref-${Date.now()}` }, ...prev]);
  };

  const handleToggleReferralStatus = (id: string) => {
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'Closed' ? 'In Progress' : 'Closed' } : r))
    );
  };

  const handleConnectMember = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'received' ? 'connected' : 'sent' }
          : m
      )
    );
  };

  const handleBookP2P = (s: Omit<P2PSession, 'id'>) => {
    setP2pSessions((prev) => [{ ...s, id: `p2p-${Date.now()}` }, ...prev]);
  };

  const handleAddVisitor = (v: Omit<VisitorItem, 'id'>) => {
    setVisitors((prev) => [{ ...v, id: `vis-${Date.now()}` }, ...prev]);
  };

  const handleToggleRsvp = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id
          ? { ...ev, rsvped: !ev.rsvped, attendees: ev.rsvped ? ev.attendees - 1 : ev.attendees + 1 }
          : ev
      )
    );
  };

  const handleToggleHideTestimonial = (id: string) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, hidden: !t.hidden } : t)));
  };

  const handleAddTestimonial = (t: Omit<TestimonialItem, 'id'>) => {
    setTestimonials((prev) => [{ ...t, id: `t-${Date.now()}` }, ...prev]);
  };

  const handleLikePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const handleSavePost = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
  };

  const handleAddComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...p.comments, { id: `cm-${Date.now()}`, author: user.fullName, text, time: 'Just now' }],
            }
          : p
      )
    );
  };

  const handleAddPost = (content: string, scope: 'professional' | 'chapter' | 'group', groupId?: string) => {
    setPosts((prev) => [
      {
        id: `p-${Date.now()}`,
        authorName: user.fullName,
        authorInitials: user.initials,
        authorRole: `${user.designation} · ${user.businessName}`,
        timeLabel: 'Just now',
        content,
        scope,
        groupId,
        likes: 0,
        liked: false,
        comments: [],
        reposts: 0,
        saved: false,
      },
      ...prev,
    ]);
  };

  const handleJoinGroup = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, joined: true, membersCount: g.membersCount + 1 } : g))
    );
  };

  const handleCreateGroup = (g: {
    name: string;
    privacy: 'Public' | 'Private';
    category: string;
    location: string;
    description: string;
  }) => {
    const initials = g.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'GR';
    setGroups((prev) => [
      {
        id: `g-${Date.now()}`,
        name: g.name,
        initials,
        privacy: g.privacy,
        category: g.category,
        location: g.location,
        description: g.description,
        membersCount: 1,
        joined: true,
        isOwner: true,
        tone: 'bg-[#D85D27]/15 text-[#D85D27]',
        members: [
          {
            id: 'gm-me',
            name: user.fullName,
            initials: user.initials,
            company: user.businessName,
            role: user.designation,
            isAdmin: true,
          },
        ],
        invitesSent: [],
      },
      ...prev,
    ]);
  };

  const handleDeleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setPosts((prev) => prev.filter((p) => p.groupId !== id));
  };

  const handleSendMessage = (threadId: string, text: string) => {
    setThreads((prev) =>
      prev.map((th) =>
        th.id === threadId
          ? {
              ...th,
              unread: 0,
              messages: [...th.messages, { id: `msg-${Date.now()}`, sender: 'me', text, time: 'Just now' }],
            }
          : th
      )
    );
  };

  const is3D = studioView === 'network3d';

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#0B0B0F] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract (no backdrop-filter when WebGL 3D view is active) */}
      <header
        className={`h-16 px-4 sm:px-6 border-b flex items-center justify-between gap-8 shrink-0 ${
          is3D
            ? 'bg-[#0B1620] border-white/10 text-white'
            : 'bg-white dark:bg-[#121318] border-slate-200/80 dark:border-white/10'
        }`}
      >
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            setStudioView('workspace');
            setActiveScreen('dashboard');
          }}
          className="flex items-center whitespace-nowrap shrink-0 cursor-pointer"
          aria-label="EKAM Home"
        >
          <EkamWordmark light={is3D || theme === 'dark'} size="sm" />
        </button>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {(
            [
              { id: 'workspace', label: 'Workspace' },
              { id: 'network3d', label: '3D Network' },
              { id: 'audit', label: 'Screen Audit' },
              { id: 'system', label: 'Design System' },
            ] as { id: StudioView; label: string }[]
          ).map((nav) => {
            const active = studioView === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setStudioView(nav.id)}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-[#D85D27] text-[#D85D27] font-semibold'
                    : is3D
                    ? 'border-transparent text-slate-300 hover:text-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {nav.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setStudioView('workspace');
              setActiveScreen('pass_referral');
            }}
            className="px-4 py-2 rounded-xl bg-[#D85D27] hover:bg-[#BE4D14] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pass Referral
          </button>
        </div>
      </header>

      {/* Mobile Secondary View Selector (for small screens where md:nav is hidden) */}
      <div
        className={`md:hidden px-4 py-2 border-b flex items-center gap-2 overflow-x-auto ${
          is3D
            ? 'bg-[#0B1620] border-white/10 text-white'
            : 'bg-white dark:bg-[#121318] border-slate-200/80 dark:border-white/10'
        }`}
      >
        {(
          [
            { id: 'workspace', label: 'Workspace' },
            { id: 'network3d', label: '3D Network' },
            { id: 'audit', label: 'Screen Audit' },
            { id: 'system', label: 'Design System' },
          ] as { id: StudioView; label: string }[]
        ).map((nav) => (
          <button
            key={nav.id}
            type="button"
            onClick={() => setStudioView(nav.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              studioView === nav.id
                ? 'bg-[#D85D27] text-white'
                : is3D
                ? 'text-slate-300'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {nav.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {studioView === 'workspace' && (
          <EkamInteractiveApp
            screen={activeScreen}
            onNavigate={setActiveScreen}
            user={user}
            onUpdateUser={handleUpdateUser}
            referrals={referrals}
            onAddReferral={handleAddReferral}
            onToggleReferralStatus={handleToggleReferralStatus}
            members={members}
            onConnectMember={handleConnectMember}
            meetings={meetings}
            p2pSessions={p2pSessions}
            onBookP2P={handleBookP2P}
            visitors={visitors}
            onAddVisitor={handleAddVisitor}
            events={events}
            onToggleRsvp={handleToggleRsvp}
            testimonials={testimonials}
            onToggleHideTestimonial={handleToggleHideTestimonial}
            onAddTestimonial={handleAddTestimonial}
            posts={posts}
            onLikePost={handleLikePost}
            onSavePost={handleSavePost}
            onAddComment={handleAddComment}
            onAddPost={handleAddPost}
            groups={groups}
            onJoinGroup={handleJoinGroup}
            onCreateGroup={handleCreateGroup}
            onDeleteGroup={handleDeleteGroup}
            notifications={notifications}
            onMarkAllNotificationsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
            onMarkNotificationRead={(id) =>
              setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
            }
            threads={threads}
            onSendMessage={handleSendMessage}
            creditsInr={creditsInr}
            onEarnCredit={() => setCreditsInr((c) => c + 500)}
            theme={theme}
            onChangeTheme={setTheme}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={() => setReducedMotion((r) => !r)}
            onOpen3D={() => setStudioView('network3d')}
            isAppLoading={isBootLoading || isFetchingData}
            onSignInLoad={() => triggerDataFetch()}
          />
        )}

        {studioView === 'network3d' && (
          <ThreeChapterNexus
            metrics={{
              connectionsCount: members.filter((m) => m.status === 'connected').length,
              referralsCount: referrals.length,
              meetingsCount: meetings.length + p2pSessions.length,
              groupsCount: groups.length,
              creditsInr,
            }}
            reducedMotion={reducedMotion}
            onNavigateScreen={(target) => {
              setActiveScreen(target);
              setStudioView('workspace');
            }}
          />
        )}

        {studioView === 'audit' && (
          <ScreenAuditGallery
            onOpenScreen={(target) => {
              setActiveScreen(target);
              setStudioView('workspace');
            }}
          />
        )}

        {studioView === 'system' && <DesignSystemView />}
      </main>
    </div>
  );
}
