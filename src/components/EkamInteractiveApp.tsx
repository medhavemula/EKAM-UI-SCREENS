import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Briefcase,
  Compass,
  Eye,
  HeartHandshake,
  Home,
  Layers,
  Monitor,
  Plus,
  Smartphone,
  Star,
  UserPlus,
  X,
} from 'lucide-react';
import { ScreenSkeletonRouter, SkeletonCrossfade } from './EkamSkeletons';
import {
  AppTab,
  ChatThread,
  ConnectionMember,
  EventItem,
  GroupItem,
  MeetingItem,
  NotificationItem,
  P2PSession,
  PostItem,
  ReferralItem,
  ScreenId,
  ServiceEventItem,
  TestimonialItem,
  ThemeMode,
  UserProfile,
  ViewportMode,
  VisitorItem,
} from '../types/ekam';
import { AppGuideSheet, ForgotPasswordScreen, LoginScreen, RegisterScreen, SplashScreen } from './screens/AuthScreens';
import { EkamOnboardingCarousel } from './EkamOnboardingCarousel';
import { DashboardScreen, MessagesScreen, NotificationsScreen, SearchMembersScreen } from './screens/DashboardScreens';
import {
  BusinessHomeScreen,
  ChapterFeedScreen,
  ConnectionsScreen,
  EventsScreen,
  ManyToOneScreen,
  MeetingsScreen,
  OpportunityScreen,
  PassReferralScreen,
  ReportsScreen,
  TestimonialsScreen,
  VisitorsScreen,
} from './screens/BusinessScreens';
import {
  CreateGroupScreen,
  GroupsHomeScreen,
  ProfessionalHomeScreen,
  ViewGroupScreen,
  WritePostScreen,
} from './screens/CommunityScreens';
import {
  ServiceAddEventScreen,
  ServiceChatScreen,
  ServiceClubScreen,
  ServiceEventDetailScreen,
} from './screens/ServiceScreens';
import {
  AppearanceSettingsScreen,
  DeleteAccountScreen,
  EditBusinessScreen,
  EditPersonalScreen,
  NotificationSettingsScreen,
  ProfileScreen,
  ReferralCreditsScreen,
  TermsPrivacyScreen,
} from './screens/AccountSettingsScreens';

interface EkamInteractiveAppProps {
  screen: ScreenId;
  onNavigate: (s: ScreenId) => void;
  user: UserProfile;
  onUpdateUser: (patch: Partial<UserProfile>) => void;
  referrals: ReferralItem[];
  onAddReferral: (r: Omit<ReferralItem, 'id'>) => void;
  onToggleReferralStatus: (id: string) => void;
  members: ConnectionMember[];
  onConnectMember: (id: string) => void;
  meetings: MeetingItem[];
  p2pSessions: P2PSession[];
  onBookP2P: (s: Omit<P2PSession, 'id'>) => void;
  visitors: VisitorItem[];
  onAddVisitor: (v: Omit<VisitorItem, 'id'>) => void;
  events: EventItem[];
  onToggleRsvp: (id: string) => void;
  testimonials: TestimonialItem[];
  onToggleHideTestimonial: (id: string) => void;
  onAddTestimonial: (t: Omit<TestimonialItem, 'id'>) => void;
  posts: PostItem[];
  onLikePost: (id: string) => void;
  onSavePost: (id: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onAddPost: (content: string, scope: 'professional' | 'chapter' | 'group', groupId?: string) => void;
  groups: GroupItem[];
  onJoinGroup: (id: string) => void;
  onCreateGroup: (g: { name: string; privacy: 'Public' | 'Private'; category: string; location: string; description: string }) => void;
  onDeleteGroup: (id: string) => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationRead: (id: string) => void;
  threads: ChatThread[];
  onSendMessage: (threadId: string, text: string) => void;
  serviceEvents: ServiceEventItem[];
  onCreateServiceEvent: (ev: Omit<ServiceEventItem, 'id'>) => void;
  onToggleServiceCheckIn: (eventId: string) => void;
  onToggleServiceVolunteer: (eventId: string) => void;
  onAddServiceDonation: (eventId: string, amountInr: number, note: string) => void;
  serviceConnections: ConnectionMember[];
  onConnectServiceMember: (memberId: string) => void;
  serviceThreads: ChatThread[];
  onSendServiceMessage: (threadId: string, text: string) => void;
  onStartServiceChat: (member: ConnectionMember) => string;
  creditsInr: number;
  onEarnCredit: () => void;
  theme: ThemeMode;
  onChangeTheme: (t: ThemeMode) => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onOpen3D: () => void;
  isAppLoading?: boolean;
  onSignInLoad?: () => void;
}

const TAB_ROOTS: Record<AppTab, ScreenId> = {
  business: 'business_home',
  professional: 'prof_home',
  home: 'dashboard',
  service: 'service_home',
  groups: 'groups_home',
};

function activeTabForScreen(screen: ScreenId): AppTab {
  if (
    [
      'business_home',
      'opportunity',
      'pass_referral',
      'connections',
      'visitors',
      'meetings',
      'many_to_one',
      'events',
      'reports',
      'testimonials',
      'chapter_feed',
    ].includes(screen)
  ) {
    return 'business';
  }
  if (['prof_home', 'prof_write_post'].includes(screen)) return 'professional';
  if (['groups_home', 'group_create', 'group_view'].includes(screen)) return 'groups';
  if (['service_home', 'service_event_detail', 'service_add_event', 'service_chat', 'service_locked'].includes(screen)) {
    return 'service';
  }
  return 'home';
}

const SHOW_BOTTOM_BAR_SCREENS: ScreenId[] = [
  'dashboard',
  'business_home',
  'prof_home',
  'groups_home',
  'service_home',
  'service_locked',
];

const INTERNAL_SKELETON_SCREENS: ScreenId[] = [
  'dashboard',
  'business_home',
  'opportunity',
  'chapter_feed',
  'prof_home',
  'groups_home',
  'group_view',
  'service_home',
];

const SCREEN_GROUPS: { title: string; items: { id: ScreenId; label: string }[] }[] = [
  {
    title: 'Home & Core',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'search', label: 'Search Members' },
      { id: 'messages', label: 'Chat Threads' },
    ],
  },
  {
    title: 'Business Suite',
    items: [
      { id: 'business_home', label: 'Business Hub' },
      { id: 'opportunity', label: 'Opportunities' },
      { id: 'pass_referral', label: 'Pass Referral' },
      { id: 'connections', label: 'Connections' },
      { id: 'visitors', label: 'Visitors' },
      { id: 'meetings', label: 'Meetings & P2P' },
      { id: 'many_to_one', label: 'Many To One' },
      { id: 'events', label: 'Events' },
      { id: 'reports', label: 'Reports' },
      { id: 'testimonials', label: 'Testimonials' },
      { id: 'chapter_feed', label: 'Chapter Feed' },
    ],
  },
  {
    title: 'Professional, Service & Groups',
    items: [
      { id: 'prof_home', label: 'Professional' },
      { id: 'prof_write_post', label: 'Write Post' },
      { id: 'service_home', label: 'Service Club' },
      { id: 'service_event_detail', label: 'View Service Event' },
      { id: 'service_add_event', label: 'Add Service Event' },
      { id: 'groups_home', label: 'Groups' },
      { id: 'group_create', label: 'Create Group' },
    ],
  },
  {
    title: 'Profile, Auth & Settings',
    items: [
      { id: 'profile', label: 'My Profile' },
      { id: 'edit_business', label: 'Edit Business' },
      { id: 'edit_personal', label: 'Edit Personal' },
      { id: 'referral_credits', label: 'Referral Credits' },
      { id: 'settings_appearance', label: 'Appearance' },
      { id: 'settings_notifications', label: 'Notif. Prefs' },
      { id: 'splash', label: 'Splash Intro' },
      { id: 'login', label: 'Login & Terms' },
      { id: 'register', label: 'Register (3-step)' },
    ],
  },
];

export function EkamInteractiveApp(props: EkamInteractiveAppProps) {
  const {
    screen,
    onNavigate,
    user,
    onUpdateUser,
    referrals,
    onAddReferral,
    onToggleReferralStatus,
    members,
    onConnectMember,
    meetings,
    p2pSessions,
    onBookP2P,
    visitors,
    onAddVisitor,
    events,
    onToggleRsvp,
    testimonials,
    onToggleHideTestimonial,
    onAddTestimonial,
    posts,
    onLikePost,
    onSavePost,
    onAddComment,
    onAddPost,
    groups,
    onJoinGroup,
    onCreateGroup,
    onDeleteGroup,
    notifications,
    onMarkAllNotificationsRead,
    onMarkNotificationRead,
    threads,
    onSendMessage,
    serviceEvents,
    onCreateServiceEvent,
    onToggleServiceCheckIn,
    onToggleServiceVolunteer,
    onAddServiceDonation,
    serviceConnections,
    onConnectServiceMember,
    serviceThreads,
    onSendServiceMessage,
    onStartServiceChat,
    creditsInr,
    onEarnCredit,
    theme,
    onChangeTheme,
    reducedMotion,
    onToggleReducedMotion,
    onOpen3D,
    isAppLoading = false,
    onSignInLoad,
  } = props;

  const [viewportMode, setViewportMode] = useState<ViewportMode>('split');
  const [fabOpen, setFabOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id || 'g-1');
  const [activeServiceEventId, setActiveServiceEventId] = useState<string>(serviceEvents[0]?.id || 'sev-1');
  const [activeServiceThreadId, setActiveServiceThreadId] = useState<string>(serviceThreads[0]?.id || 'st-1');
  const [serviceInitialTab, setServiceInitialTab] = useState<
    'activities' | 'events' | 'connections' | 'messages'
  >('activities');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const effectiveLoading = isAppLoading || previewLoading || isRefreshing;

  const handleScreenRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, reducedMotion ? 320 : 800)
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [screen]);

  const currentTab = activeTabForScreen(screen);
  const showBottomBar = SHOW_BOTTOM_BAR_SCREENS.includes(screen);
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const unreadMsgs = threads.reduce((sum, t) => sum + t.unread, 0);
  const connectedCount = members.filter((m) => m.status === 'connected').length;

  const startChatWithMember = (member: ConnectionMember) => {
    const existing = threads.find((t) => t.memberId === member.id);
    if (existing) {
      setActiveThreadId(existing.id);
    } else {
      setActiveThreadId(threads[0]?.id || null);
    }
    onNavigate('messages');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return (
          <SplashScreen
            theme={theme}
            onToggleTheme={() => onChangeTheme(theme === 'dark' ? 'light' : 'dark')}
            reducedMotion={reducedMotion}
            onFinish={() => onNavigate('login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            theme={theme}
            onToggleTheme={() => onChangeTheme(theme === 'dark' ? 'light' : 'dark')}
            reducedMotion={reducedMotion}
            onReplaySplash={() => onNavigate('splash')}
            onSignIn={() => {
              onSignInLoad?.();
              onNavigate('dashboard');
            }}
            onNavigate={onNavigate}
          />
        );
      case 'onboarding':
        return (
          <EkamOnboardingCarousel
            onLogin={() => onNavigate('login')}
            onCreateAccount={() => onNavigate('register')}
            reducedMotion={reducedMotion}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            theme={theme}
            onToggleTheme={() => onChangeTheme(theme === 'dark' ? 'light' : 'dark')}
            reducedMotion={reducedMotion}
            onBack={() => onNavigate('login')}
            onComplete={() => onNavigate('login')}
          />
        );
      case 'forgot_password':
        return <ForgotPasswordScreen onBack={() => onNavigate('login')} />;
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            nextMeeting={meetings[0]}
            referrals={referrals}
            connectionsCount={connectedCount}
            visitorsCount={visitors.length}
            unreadNotifications={unreadNotifs}
            unreadMessages={unreadMsgs}
            creditsInr={creditsInr}
            reducedMotion={reducedMotion}
            isLoading={effectiveLoading}
            onRefresh={handleScreenRefresh}
            onNavigate={onNavigate}
            onOpen3D={onOpen3D}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            notifications={notifications}
            onMarkAllRead={onMarkAllNotificationsRead}
            onSelectNotification={(n) => {
              onMarkNotificationRead(n.id);
              if (n.targetScreen) onNavigate(n.targetScreen);
            }}
            onOpenSettings={() => onNavigate('settings_notifications')}
            onBack={() => onNavigate('dashboard')}
            reducedMotion={reducedMotion}
          />
        );
      case 'search':
        return (
          <SearchMembersScreen
            members={members}
            onStartChat={startChatWithMember}
            onConnect={onConnectMember}
            onBack={() => onNavigate('dashboard')}
            reducedMotion={reducedMotion}
          />
        );
      case 'messages':
        return (
          <MessagesScreen
            threads={threads}
            activeThreadId={activeThreadId}
            onSelectThread={setActiveThreadId}
            onSendMessage={onSendMessage}
            onBack={() => onNavigate('dashboard')}
          />
        );
      case 'business_home':
        return (
          <BusinessHomeScreen
            user={user}
            referrals={referrals}
            members={members}
            visitors={visitors}
            meetings={meetings}
            p2pSessions={p2pSessions}
            events={events}
            testimonials={testimonials}
            posts={posts}
            connectionsCount={connectedCount}
            visitorsCount={visitors.length}
            referralsCount={referrals.length}
            testimonialsCount={testimonials.length}
            meetingsCount={meetings.length + p2pSessions.length}
            onToggleReferralStatus={onToggleReferralStatus}
            onConnectMember={onConnectMember}
            onStartChat={startChatWithMember}
            onAddVisitor={onAddVisitor}
            onBookP2P={onBookP2P}
            onToggleRsvp={onToggleRsvp}
            onLikePost={onLikePost}
            onSavePost={onSavePost}
            onAddPost={(content, scope) => onAddPost(content, scope)}
            reducedMotion={reducedMotion}
            isLoading={effectiveLoading}
            onRefresh={handleScreenRefresh}
            onNavigate={onNavigate}
          />
        );
      case 'opportunity':
        return (
          <OpportunityScreen
            referrals={referrals}
            onPassReferral={() => onNavigate('pass_referral')}
            onToggleStatus={onToggleReferralStatus}
            onBack={() => onNavigate('business_home')}
            reducedMotion={reducedMotion}
            isLoading={effectiveLoading}
            onRefresh={handleScreenRefresh}
          />
        );
      case 'pass_referral':
        return (
          <PassReferralScreen
            user={user}
            members={members}
            onSubmit={(item) => {
              onAddReferral(item);
              onNavigate('opportunity');
            }}
            onBack={() => onNavigate('business_home')}
          />
        );
      case 'connections':
        return (
          <ConnectionsScreen
            members={members}
            onStartChat={startChatWithMember}
            onConnect={onConnectMember}
            onBack={() => onNavigate('business_home')}
            reducedMotion={reducedMotion}
          />
        );
      case 'visitors':
        return (
          <VisitorsScreen
            visitors={visitors}
            onAddVisitor={onAddVisitor}
            onBack={() => onNavigate('business_home')}
            reducedMotion={reducedMotion}
          />
        );
      case 'meetings':
        return (
          <MeetingsScreen
            meetings={meetings}
            p2pSessions={p2pSessions}
            members={members}
            onBookP2P={onBookP2P}
            onBack={() => onNavigate('business_home')}
            reducedMotion={reducedMotion}
          />
        );
      case 'many_to_one':
        return <ManyToOneScreen onBack={() => onNavigate('business_home')} reducedMotion={reducedMotion} />;
      case 'events':
        return (
          <EventsScreen
            events={events}
            onToggleRsvp={onToggleRsvp}
            onBack={() => onNavigate('business_home')}
            reducedMotion={reducedMotion}
          />
        );
      case 'reports':
        return (
          <ReportsScreen
            referrals={referrals}
            visitorsCount={visitors.length}
            p2pCount={p2pSessions.length}
            onBack={() => onNavigate('business_home')}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsScreen
            testimonials={testimonials}
            members={members}
            onToggleHide={onToggleHideTestimonial}
            onAddTestimonial={onAddTestimonial}
            onBack={() => onNavigate('business_home')}
            reducedMotion={reducedMotion}
          />
        );
      case 'chapter_feed':
        return (
          <ChapterFeedScreen
            posts={posts}
            onLikePost={onLikePost}
            onSavePost={onSavePost}
            onAddPost={(content, scope) => onAddPost(content, scope)}
            onBack={() => onNavigate('business_home')}
            reducedMotion={reducedMotion}
            isLoading={effectiveLoading}
            onRefresh={handleScreenRefresh}
          />
        );
      case 'prof_home':
        return (
          <ProfessionalHomeScreen
            user={user}
            posts={posts}
            members={members}
            onLikePost={onLikePost}
            onSavePost={onSavePost}
            onAddComment={onAddComment}
            onConnect={onConnectMember}
            onNavigate={onNavigate}
            reducedMotion={reducedMotion}
            isLoading={effectiveLoading}
            onRefresh={handleScreenRefresh}
          />
        );
      case 'prof_write_post':
        return (
          <WritePostScreen
            user={user}
            onPublish={(content) => {
              onAddPost(content, 'professional');
              onNavigate('prof_home');
            }}
            onBack={() => onNavigate('prof_home')}
            reducedMotion={reducedMotion}
          />
        );
      case 'groups_home':
        return (
          <GroupsHomeScreen
            groups={groups}
            onSelectGroup={(id) => {
              setActiveGroupId(id);
              onNavigate('group_view');
            }}
            onJoinGroup={onJoinGroup}
            onDeleteGroup={onDeleteGroup}
            onNavigate={onNavigate}
            reducedMotion={reducedMotion}
            isLoading={effectiveLoading}
            onRefresh={handleScreenRefresh}
          />
        );
      case 'group_create':
        return (
          <CreateGroupScreen
            onCreate={(g) => {
              onCreateGroup(g);
              onNavigate('groups_home');
            }}
            onBack={() => onNavigate('groups_home')}
          />
        );
      case 'group_view': {
        const g = groups.find((item) => item.id === activeGroupId) || groups[0];
        if (!g) {
          return (
            <GroupsHomeScreen
              groups={groups}
              onSelectGroup={(id) => {
                setActiveGroupId(id);
                onNavigate('group_view');
              }}
              onJoinGroup={onJoinGroup}
              onDeleteGroup={onDeleteGroup}
              onNavigate={onNavigate}
              reducedMotion={reducedMotion}
              isLoading={effectiveLoading}
              onRefresh={handleScreenRefresh}
            />
          );
        }
        return (
          <ViewGroupScreen
            group={g}
            posts={posts}
            onAddGroupPost={(gid, text) => onAddPost(text, 'group', gid)}
            onDeleteGroup={(id) => {
              onDeleteGroup(id);
              onNavigate('groups_home');
            }}
            onBack={() => onNavigate('groups_home')}
            reducedMotion={reducedMotion}
            isLoading={effectiveLoading}
            onRefresh={handleScreenRefresh}
          />
        );
      }
      case 'service_home':
      case 'service_locked':
        return (
          <ServiceClubScreen
            key={serviceInitialTab}
            user={user}
            events={serviceEvents}
            connections={serviceConnections}
            threads={serviceThreads}
            initialTab={serviceInitialTab}
            onSelectEvent={(eventId) => {
              setActiveServiceEventId(eventId);
              onNavigate('service_event_detail');
            }}
            onOpenChatThread={(threadId) => {
              setActiveServiceThreadId(threadId);
              onNavigate('service_chat');
            }}
            onConnectMember={onConnectServiceMember}
            onStartServiceChat={onStartServiceChat}
            onNavigate={onNavigate}
            reducedMotion={reducedMotion}
            isLoading={effectiveLoading}
            onRefresh={handleScreenRefresh}
          />
        );
      case 'service_chat': {
        const activeServiceThread =
          serviceThreads.find((t) => t.id === activeServiceThreadId) || serviceThreads[0];
        if (!activeServiceThread) {
          return (
            <ServiceClubScreen
              user={user}
              events={serviceEvents}
              connections={serviceConnections}
              threads={serviceThreads}
              initialTab="messages"
              onSelectEvent={(eventId) => {
                setActiveServiceEventId(eventId);
                onNavigate('service_event_detail');
              }}
              onOpenChatThread={(threadId) => {
                setActiveServiceThreadId(threadId);
                onNavigate('service_chat');
              }}
              onConnectMember={onConnectServiceMember}
              onStartServiceChat={onStartServiceChat}
              onNavigate={onNavigate}
              reducedMotion={reducedMotion}
              isLoading={effectiveLoading}
              onRefresh={handleScreenRefresh}
            />
          );
        }
        return (
          <ServiceChatScreen
            thread={activeServiceThread}
            onSendMessage={onSendServiceMessage}
            onBack={() => {
              setServiceInitialTab('messages');
              onNavigate('service_home');
            }}
          />
        );
      }
      case 'service_event_detail': {
        const selectedEvent =
          serviceEvents.find((ev) => ev.id === activeServiceEventId) || serviceEvents[0];
        if (!selectedEvent) {
          return (
            <ServiceClubScreen
              user={user}
              events={serviceEvents}
              connections={serviceConnections}
              threads={serviceThreads}
              initialTab="events"
              onSelectEvent={(eventId) => {
                setActiveServiceEventId(eventId);
                onNavigate('service_event_detail');
              }}
              onOpenChatThread={(threadId) => {
                setActiveServiceThreadId(threadId);
                onNavigate('service_chat');
              }}
              onConnectMember={onConnectServiceMember}
              onStartServiceChat={onStartServiceChat}
              onNavigate={onNavigate}
              reducedMotion={reducedMotion}
              isLoading={effectiveLoading}
              onRefresh={handleScreenRefresh}
            />
          );
        }
        return (
          <ServiceEventDetailScreen
            event={selectedEvent}
            user={user}
            onToggleCheckIn={onToggleServiceCheckIn}
            onToggleVolunteer={onToggleServiceVolunteer}
            onAddDonation={onAddServiceDonation}
            onBack={() => {
              setServiceInitialTab('events');
              onNavigate('service_home');
            }}
          />
        );
      }
      case 'service_add_event':
        return (
          <ServiceAddEventScreen
            user={user}
            onCreateEvent={(ev) => {
              onCreateServiceEvent(ev);
              setServiceInitialTab('events');
              onNavigate('service_home');
            }}
            onBack={() => {
              setServiceInitialTab('events');
              onNavigate('service_home');
            }}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            connectionsCount={connectedCount}
            postsCount={posts.filter((p) => p.authorInitials === user.initials).length}
            onNavigate={onNavigate}
            onReplayGuide={() => {
              onNavigate('dashboard');
              setShowGuide(true);
            }}
            onLogout={() => onNavigate('login')}
            onBack={() => onNavigate('dashboard')}
            scrollContainerRef={scrollContainerRef}
            reducedMotion={reducedMotion}
          />
        );
      case 'edit_business':
        return (
          <EditBusinessScreen
            user={user}
            onSave={(patch) => {
              onUpdateUser(patch);
              onNavigate('profile');
            }}
            onBack={() => onNavigate('profile')}
          />
        );
      case 'edit_personal':
        return (
          <EditPersonalScreen
            user={user}
            onSave={(patch) => {
              onUpdateUser(patch);
              onNavigate('profile');
            }}
            onBack={() => onNavigate('profile')}
          />
        );
      case 'referral_credits':
        return (
          <ReferralCreditsScreen
            creditsInr={creditsInr}
            onEarnDemoCredit={onEarnCredit}
            onNavigate={onNavigate}
            onBack={() => onNavigate('profile')}
          />
        );
      case 'settings_appearance':
        return (
          <AppearanceSettingsScreen
            theme={theme}
            onChangeTheme={onChangeTheme}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={onToggleReducedMotion}
            onBack={() => onNavigate('profile')}
          />
        );
      case 'settings_notifications':
        return (
          <NotificationSettingsScreen
            reducedMotion={reducedMotion}
            onBack={() => onNavigate('profile')}
          />
        );
      case 'settings_terms':
        return <TermsPrivacyScreen onBack={() => onNavigate('profile')} />;
      case 'settings_delete':
        return <DeleteAccountScreen onBack={() => onNavigate('profile')} />;
    }
  };

  const FOOTER_TABS = [
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'professional', label: 'Professional', icon: Compass },
    { id: 'home', label: currentTab === 'home' ? 'Actions' : 'Home', icon: Home },
    { id: 'service', label: 'Service', icon: HeartHandshake },
    { id: 'groups', label: 'Groups', icon: Layers },
  ] as const;

  const activeTabIndex = Math.max(
    0,
    FOOTER_TABS.findIndex((t) => t.id === currentTab)
  );
  const notchShiftPct = `${-(45 - activeTabIndex * 10)}%`;
  const activeTabMeta = FOOTER_TABS[activeTabIndex];
  const ActiveOrbIcon = activeTabMeta.icon;

  const appSurface = (
    <div className="relative flex flex-col h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] overflow-hidden">
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto ekam-scroll ${showBottomBar ? 'pb-22' : ''}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={
              reducedMotion
                ? { duration: 0.1 }
                : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
            }
            className={showBottomBar ? 'min-h-full' : 'h-full'}
          >
            {INTERNAL_SKELETON_SCREENS.includes(screen) ? (
              renderScreen()
            ) : (
              <SkeletonCrossfade
                loading={effectiveLoading && screen !== 'splash'}
                reducedMotion={reducedMotion}
                skeleton={<ScreenSkeletonRouter screen={screen} reducedMotion={reducedMotion} />}
                className={showBottomBar ? 'min-h-full' : 'h-full'}
              >
                {renderScreen()}
              </SkeletonCrossfade>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Center FAB Quick Action Overlay */}
      <AnimatePresence>
        {fabOpen && showBottomBar && (
          <motion.div
            key="fab-quick-overlay"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="absolute inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px] flex items-end justify-center pb-24"
            onClick={() => setFabOpen(false)}
          >
            <div className="flex items-end gap-4 px-4" onClick={(e) => e.stopPropagation()}>
              {[
                { label: 'Referral', icon: Briefcase, screen: 'pass_referral' as ScreenId },
                { label: 'Testimonial', icon: Star, screen: 'testimonials' as ScreenId },
                { label: 'Visitor', icon: UserPlus, screen: 'visitors' as ScreenId },
              ].map((item, idx) => {
                const Icon = item.icon;
                const restY = idx === 1 ? -24 : 0;
                const fanOffsetX = (1 - idx) * 24;
                return (
                  <motion.button
                    key={item.label}
                    type="button"
                    initial={
                      reducedMotion
                        ? { opacity: 1, scale: 1, y: restY, x: 0 }
                        : { opacity: 0, scale: 0.45, y: 40, x: fanOffsetX }
                    }
                    animate={{ opacity: 1, scale: 1, y: restY, x: 0 }}
                    exit={
                      reducedMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            scale: 0.5,
                            y: 34,
                            x: fanOffsetX * 0.7,
                            transition: {
                              duration: 0.16,
                              delay: (2 - idx) * 0.03,
                              ease: [0.4, 0, 1, 1],
                            },
                          }
                    }
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : {
                            type: 'spring',
                            stiffness: 430,
                            damping: 17,
                            mass: 0.8,
                            delay: idx * 0.065,
                          }
                    }
                    whileHover={reducedMotion ? undefined : { scale: 1.06, y: restY - 3 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                    onClick={() => {
                      setFabOpen(false);
                      onNavigate(item.screen);
                    }}
                    className="flex flex-col items-center gap-2 cursor-pointer focus-visible:outline-none"
                  >
                    <div className="w-13 h-13 rounded-full bg-white dark:bg-[#1E1F26] text-[#D85D27] shadow-xl flex items-center justify-center border border-slate-200 dark:border-white/10">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#123142] text-white text-[11px] font-semibold shadow">
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liquid-Notch Curved Animated Footer (Pinterest Reference Design) */}
      {showBottomBar && (
        <div className="absolute bottom-0 left-0 right-0 z-40 h-[78px] pointer-events-none select-none">
          {/* Smooth Gliding Concave Cutout Track */}
          <div className="absolute inset-0 overflow-hidden drop-shadow-[0_-10px_24px_rgba(15,23,42,0.12)] dark:drop-shadow-[0_-12px_28px_rgba(0,0,0,0.65)]">
            <motion.svg
              viewBox="0 0 1000 78"
              preserveAspectRatio="none"
              animate={{ x: notchShiftPct }}
              transition={
                reducedMotion
                  ? { duration: 0.1 }
                  : { type: 'spring', stiffness: 360, damping: 28, mass: 0.9 }
              }
              className="w-[200%] h-full block"
            >
              <path
                d="M 0 22 L 418 22 C 454 22, 460 56, 500 56 C 540 56, 546 22, 582 22 L 1000 22 L 1000 78 L 0 78 Z"
                className="fill-white dark:fill-[#16171F]"
              />
              <path
                d="M 0 22 L 418 22 C 454 22, 460 56, 500 56 C 540 56, 546 22, 582 22 L 1000 22"
                fill="none"
                strokeWidth="1.2"
                className="stroke-slate-200/80 dark:stroke-white/12"
              />
            </motion.svg>
          </div>

          {/* Floating Gliding Circular Active Orb Rising Inside the Concave Cutout */}
          <motion.div
            animate={{ left: `${activeTabIndex * 20 + 10}%` }}
            transition={
              reducedMotion
                ? { duration: 0.1 }
                : { type: 'spring', stiffness: 360, damping: 26, mass: 0.85 }
            }
            className="absolute top-[2px] -translate-x-1/2 z-20 pointer-events-auto"
          >
            <motion.button
              type="button"
              whileHover={reducedMotion ? undefined : { scale: 1.06 }}
              whileTap={reducedMotion ? undefined : { scale: 0.92 }}
              onClick={() => {
                if (currentTab === 'home') {
                  setFabOpen((f) => !f);
                } else {
                  setFabOpen(false);
                  scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              aria-label={
                currentTab === 'home'
                  ? fabOpen
                    ? 'Close quick actions'
                    : 'Open quick actions'
                  : `${activeTabMeta.label} active`
              }
              className="w-11.5 h-11.5 rounded-full bg-gradient-to-br from-[#F38B1E] via-[#D85D27] to-[#BE4D14] text-white shadow-[0_10px_24px_-4px_rgba(216,93,39,0.58)] ring-[3px] ring-white/25 dark:ring-white/15 flex items-center justify-center cursor-pointer"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${currentTab}-${fabOpen ? 'open' : 'closed'}`}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.65, rotate: -18 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.65, rotate: 18 }}
                  transition={reducedMotion ? { duration: 0.08 } : { duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center justify-center"
                >
                  {currentTab === 'home' ? (
                    fabOpen ? (
                      <X className="w-5 h-5" strokeWidth={2.2} />
                    ) : (
                      <Plus className="w-5.5 h-5.5" strokeWidth={2.2} />
                    )
                  ) : (
                    <ActiveOrbIcon className="w-5 h-5" strokeWidth={2.1} />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* 5 Interactive Tab Targets Along the Curved Bar */}
          <div className="relative z-10 grid grid-cols-5 h-full pt-[22px] pb-1 pointer-events-auto">
            {FOOTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'home' && currentTab === 'home') {
                      setFabOpen((f) => !f);
                    } else {
                      setFabOpen(false);
                      onNavigate(TAB_ROOTS[tab.id]);
                    }
                  }}
                  className={`flex flex-col items-center justify-end pb-1 cursor-pointer transition-colors ${
                    isActive
                      ? 'text-[#D85D27]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <motion.div
                    animate={
                      isActive
                        ? { opacity: 0, y: -12, scale: 0.6 }
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    transition={
                      reducedMotion
                        ? { duration: 0.08 }
                        : { type: 'spring', stiffness: 380, damping: 26 }
                    }
                    className="relative mb-0.5"
                  >
                    <Icon className="w-4.5 h-4.5" strokeWidth={1.85} />
                  </motion.div>
                  <span
                    className={`text-[10px] leading-tight whitespace-nowrap tracking-[-0.015em] transition-colors ${
                      isActive
                        ? 'font-semibold text-[#D85D27]'
                        : 'font-medium text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6-Step App Guide Sheet */}
      {showGuide && <AppGuideSheet onClose={() => setShowGuide(false)} />}
    </div>
  );

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-6">
      {/* Compact Workspace Toolbar (below Top Bar) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            EKAM Interactive Redesign Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Live interactive flows across Business, Professional, Service Club, Groups, Messaging, Auth &amp; Settings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/8">
            <button
              type="button"
              onClick={() => setViewportMode('split')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewportMode === 'split'
                  ? 'bg-white dark:bg-[#1E1F26] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('responsive')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewportMode === 'responsive'
                  ? 'bg-white dark:bg-[#1E1F26] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expanded View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPreviewLoading((v) => !v)}
            aria-pressed={previewLoading}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              previewLoading
                ? 'border-[#D85D27] bg-[#D85D27] text-white shadow-sm'
                : 'border-slate-200 dark:border-white/12 bg-white dark:bg-[#151519] text-slate-700 dark:text-slate-200 hover:border-[#D85D27]/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewLoading ? 'Exit Skeletons' : 'Preview Loading'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFabOpen(false);
              setPreviewLoading(false);
              onNavigate('splash');
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/12 bg-white dark:bg-[#151519] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#D85D27]/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Preview Splash
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate('dashboard');
              setShowGuide(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/12 bg-white dark:bg-[#151519] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#D85D27]/50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Replay 6-Step Guide
          </button>
        </div>
      </div>

      {viewportMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Mobile Device Canvas */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[392px] h-[790px] rounded-[44px] p-2.5 bg-slate-900 dark:bg-[#1C1D24] shadow-2xl border border-slate-800 dark:border-white/15">
              <div className="w-full h-full rounded-[34px] overflow-hidden bg-[#FAFAFC] dark:bg-[#0B0B0F] relative">
                {appSurface}
              </div>
            </div>
          </div>

          {/* Right Screen Navigator & Live Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Module &amp; Screen Navigator
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Jump directly to any redesigned EKAM screen or interact inside the mobile canvas.
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/6">
                  {(['light', 'dark'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChangeTheme(m)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                        theme === m
                          ? 'bg-white dark:bg-[#23242D] text-[#D85D27] shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {SCREEN_GROUPS.map((grp) => (
                  <div key={grp.title}>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      {grp.title}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {grp.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setFabOpen(false);
                            onNavigate(item.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            screen === item.id
                              ? 'bg-[#D85D27] text-white'
                              : 'bg-slate-100 dark:bg-white/6 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/12'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chapter Telemetry Summary */}
            <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Referrals</div>
                <div className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {referrals.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Connections</div>
                <div className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {connectedCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Groups Joined</div>
                <div className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {groups.filter((g) => g.joined).length}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Unread Alerts</div>
                <div className="font-display text-2xl font-bold text-[#D85D27] mt-1 tabular-nums">
                  {unreadNotifs}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto h-[780px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-xl">
          {appSurface}
        </div>
      )}
    </div>
  );
}
