export type ThemeMode = 'light' | 'dark' | 'system';

export type StudioView = 'workspace' | 'network3d' | 'audit' | 'system';

export type ViewportMode = 'split' | 'responsive';

export type AppTab = 'business' | 'professional' | 'home' | 'service' | 'groups';

export type ScreenId =
  | 'splash'
  | 'login'
  | 'onboarding'
  | 'register'
  | 'forgot_password'
  | 'dashboard'
  | 'notifications'
  | 'search'
  | 'messages'
  | 'profile'
  | 'edit_business'
  | 'edit_personal'
  | 'referral_credits'
  | 'settings_appearance'
  | 'settings_notifications'
  | 'settings_terms'
  | 'settings_delete'
  | 'business_home'
  | 'opportunity'
  | 'pass_referral'
  | 'connections'
  | 'visitors'
  | 'meetings'
  | 'many_to_one'
  | 'events'
  | 'reports'
  | 'testimonials'
  | 'chapter_feed'
  | 'prof_home'
  | 'prof_write_post'
  | 'groups_home'
  | 'group_create'
  | 'group_view'
  | 'service_locked';

export interface UserProfile {
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Prefer not to say';
  dob: string;
  country: string;
  region: string;
  chapter: string;
  designation: string;
  businessName: string;
  businessCategory: string;
  establishedYear: string;
  headquarters: string;
  companySize: string;
  sponsorName: string;
  gstNumber: string;
  hasPhoto: boolean;
}

export interface ReferralItem {
  id: string;
  direction: 'given' | 'received';
  memberName: string;
  company: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  topic: string;
  notes: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Closed';
  valueInr: number;
  warmth: 'Hot' | 'Warm' | 'Cold';
}

export interface ConnectionMember {
  id: string;
  name: string;
  initials: string;
  company: string;
  chapter: string;
  category: string;
  phone: string;
  connectionsCount: number;
  status: 'connected' | 'sent' | 'received' | 'suggested' | 'pending' | 'blocked';
  avatarTone: string;
}

export interface MeetingItem {
  id: string;
  monthLabel: string;
  dayShort: string;
  monthShort: string;
  dayNum: string;
  weekday: string;
  time: string;
  format: 'In Person' | 'Virtual';
  cycle: string;
  status: 'Draft' | 'Completed' | 'Scheduled';
  membersCount: number;
  referralsCount: number;
  closedInr: number;
  oneToOnes: number;
  testimonials: number;
  visitors: number;
}

export interface P2PSession {
  id: string;
  partnerName: string;
  company: string;
  date: string;
  time: string;
  location: string;
  topic: string;
  status: 'Upcoming' | 'Completed';
}

export interface VisitorItem {
  id: string;
  name: string;
  company: string;
  phone: string;
  category: string;
  meetingDate: string;
  stage: 'Added' | 'Invited' | 'Registered';
}

export interface EventItem {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  category: string;
  attendees: number;
  rsvped: boolean;
  creditsEligible?: boolean;
}

export interface TestimonialItem {
  id: string;
  type: 'received' | 'given' | 'request';
  authorName: string;
  authorInitials: string;
  chapter: string;
  rating: number;
  quote: string;
  dateLabel: string;
  hidden?: boolean;
}

export interface PostItem {
  id: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  timeLabel: string;
  edited?: boolean;
  content: string;
  scope: 'professional' | 'chapter' | 'group';
  groupId?: string;
  likes: number;
  liked: boolean;
  comments: { id: string; author: string; text: string; time: string }[];
  reposts: number;
  saved: boolean;
  hasMedia?: boolean;
  mediaCaption?: string;
}

export interface GroupItem {
  id: string;
  name: string;
  initials: string;
  privacy: 'Public' | 'Private';
  category: string;
  location: string;
  description: string;
  membersCount: number;
  joined: boolean;
  invited?: boolean;
  isOwner?: boolean;
  tone: string;
  members: { id: string; name: string; initials: string; company: string; role: string; isAdmin?: boolean }[];
  invitesSent: { id: string; name: string; initials: string; email: string; status: 'Accepted invite' | 'Pending' }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  category: 'testimonial' | 'group' | 'meeting' | 'referral';
  targetScreen?: ScreenId;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export interface ChatThread {
  id: string;
  memberId: string;
  memberName: string;
  memberInitials: string;
  company: string;
  chapter: string;
  unread: number;
  messages: ChatMessage[];
}

export interface AuditScreenRecord {
  id: string;
  title: string;
  module: 'Auth & Guide' | 'Dashboard' | 'Business' | 'Professional' | 'Groups' | 'Profile & Settings';
  imagePath: string;
  screenTarget: ScreenId;
  auditFindings: string[];
  redesignHighlights: string[];
}
