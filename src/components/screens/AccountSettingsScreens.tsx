import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  FileText,
  Gift,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Moon,
  RotateCcw,
  Sparkles,
  Star,
  Sun,
  User,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { ScreenId, ThemeMode, UserProfile } from '../../types/ekam';
import { ConstellationBackdrop, PremiumButton, SectionHeader } from '../EkamBrand';

function SettingsHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="px-4 py-3.5 bg-white dark:bg-[#151519] border-b border-slate-200/80 dark:border-white/10 flex items-center gap-2.5 sticky top-0 z-20">
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 flex items-center justify-center cursor-pointer"
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-slate-200" />
      </button>
      <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
    </div>
  );
}

export function ProfileScreen({
  user,
  connectionsCount,
  postsCount,
  onNavigate,
  onReplayGuide,
  onLogout,
  onBack,
  scrollContainerRef,
  reducedMotion = false,
}: {
  user: UserProfile;
  connectionsCount: number;
  postsCount: number;
  onNavigate: (s: ScreenId) => void;
  onReplayGuide: () => void;
  onLogout: () => void;
  onBack: () => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  reducedMotion?: boolean;
}) {
  const [bizExpanded, setBizExpanded] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { scrollY } = useScroll(
    scrollContainerRef ? { container: scrollContainerRef } : undefined
  );
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 260,
    damping: 28,
    mass: 0.6,
  });
  const avatarScale = useTransform(smoothScrollY, [0, 150], [1, 0.78]);
  const avatarOpacity = useTransform(smoothScrollY, [0, 150], [1, 0.2]);
  const avatarY = useTransform(smoothScrollY, [0, 150], [0, -14]);
  const backdropY = useTransform(smoothScrollY, [0, 180], [0, 24]);
  const backdropOpacity = useTransform(smoothScrollY, [0, 180], [1, 0.45]);

  // Calculate live Profile Strength
  const checks = [
    user.hasPhoto,
    Boolean(user.dob),
    Boolean(user.establishedYear),
    Boolean(user.companySize),
    Boolean(user.gstNumber),
    Boolean(user.fullName),
    Boolean(user.businessName),
    Boolean(user.designation),
  ];
  const strengthPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] pb-10 relative">
      <div className="relative bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#173E52] px-4 pt-4 pb-12 text-white overflow-hidden">
        <motion.div
          style={
            reducedMotion
              ? undefined
              : {
                  y: backdropY,
                  opacity: backdropOpacity,
                }
          }
          className="pointer-events-none absolute inset-0"
        >
          <ConstellationBackdrop />
        </motion.div>
        <div className="relative z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold">My profile</h1>
        </div>
      </div>

      <div className="-mt-7 px-4 space-y-4 relative z-10">
        {/* Identity Card */}
        <div className="rounded-3xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-5 text-center shadow-sm">
          <motion.div
            style={
              reducedMotion
                ? undefined
                : {
                    scale: avatarScale,
                    opacity: avatarOpacity,
                    y: avatarY,
                  }
            }
            className="relative w-18 h-18 mx-auto origin-center will-change-transform"
          >
            <div className="w-full h-full rounded-full border-2 border-[#D85D27] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-display text-xl font-bold">
              {user.initials}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('edit_personal')}
              aria-label="Update photo"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#D85D27] text-white flex items-center justify-center shadow cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          <h2 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
          <p className="mt-1 text-xs font-medium text-[#D85D27]">
            {user.businessCategory} · {user.businessName}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {user.chapter} · {user.region} · +91 {user.phone}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/8 grid grid-cols-2 divide-x divide-slate-100 dark:divide-white/8">
            <button
              type="button"
              onClick={() => onNavigate('connections')}
              className="cursor-pointer"
            >
              <div className="font-display text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {connectionsCount}
              </div>
              <div className="text-xs font-medium text-[#D85D27]">Connections ›</div>
            </button>
            <div>
              <div className="font-display text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {postsCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Posts</div>
            </div>
          </div>
        </div>

        {/* Profile Strength */}
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-slate-900 dark:text-white">Profile strength</span>
            <span className="font-display text-sm font-bold text-[#D85D27] tabular-nums">{strengthPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#D85D27]/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#D85D27] transition-all duration-300"
              style={{ width: `${strengthPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Complete your founding year, company size, and personal details so members know who to refer to you.
          </p>
          <PremiumButton size="sm" onClick={() => onNavigate('edit_business')}>
            Complete Business Details
          </PremiumButton>
        </div>

        {/* Business / Personal / Professional */}
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setBizExpanded((v) => !v)}
              className="flex items-center gap-3 text-left flex-1 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-slate-900 dark:text-white">Business</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user.businessName}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('edit_business')}
              className="text-xs font-semibold text-[#D85D27] cursor-pointer px-2 py-1"
            >
              Edit
            </button>
          </div>
          {bizExpanded && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-white/8 text-xs space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">{user.businessName}</div>
              <div className="text-slate-500 dark:text-slate-400">{user.businessCategory}</div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onNavigate('edit_personal')}
          className="w-full text-left rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-slate-900 dark:text-white">Personal</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {user.dob ? '4 of 5 filled' : '3 of 5 filled'}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#D85D27]">Edit ›</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('prof_home')}
          className="w-full text-left rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-slate-900 dark:text-white">Professional</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user.designation}</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('referral_credits')}
          className="w-full text-left rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-[#D85D27]" />
            <span className="font-display text-sm font-bold text-slate-900 dark:text-white">Referral credits</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* SETTINGS */}
        <SectionHeader title="Settings" />
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/8">
          {[
            { label: 'Appearance', icon: Sun, action: () => onNavigate('settings_appearance') },
            { label: 'Notifications', icon: Bell, action: () => onNavigate('settings_notifications') },
            { label: 'Terms & Privacy', icon: FileText, action: () => onNavigate('settings_terms') },
            { label: 'Replay app guide', icon: Compass, action: onReplayGuide },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.label}
                type="button"
                onClick={row.action}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-white/[0.02] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{row.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            );
          })}
        </div>

        {/* ACCOUNT */}
        <SectionHeader title="Account" />
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/8">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 dark:hover:bg-white/[0.02] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Log out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings_delete')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/40 dark:hover:bg-rose-500/5 cursor-pointer"
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Delete account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Log Out Sheet */}
      {showLogoutModal && (
        <div className="absolute inset-0 z-50 bg-black/55 flex items-end justify-center">
          <div className="w-full rounded-t-3xl bg-white dark:bg-[#151519] p-6 text-center space-y-4 border-t border-slate-200 dark:border-white/10">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto" />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Log out?</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                You can sign back in anytime with your email and password.
              </p>
            </div>
            <div className="space-y-2.5 pt-1">
              <PremiumButton fullWidth onClick={onLogout}>
                Log out
              </PremiumButton>
              <PremiumButton variant="secondary" fullWidth onClick={() => setShowLogoutModal(false)}>
                Cancel
              </PremiumButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EditBusinessScreen({
  user,
  onSave,
  onBack,
}: {
  user: UserProfile;
  onSave: (patch: Partial<UserProfile>) => void;
  onBack: () => void;
}) {
  const [businessName, setBusinessName] = useState(user.businessName);
  const [businessCategory, setBusinessCategory] = useState(user.businessCategory);
  const [establishedYear, setEstablishedYear] = useState(user.establishedYear);
  const [headquarters, setHeadquarters] = useState(user.headquarters);
  const [designation, setDesignation] = useState(user.designation);
  const [companySize, setCompanySize] = useState(user.companySize);
  const [gstNumber, setGstNumber] = useState(user.gstNumber);

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
          Update Business Details
        </h1>
        <span className="w-10" aria-hidden="true" />
      </div>

      <form
        className="flex-1 flex flex-col min-h-0"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            businessName,
            businessCategory,
            establishedYear,
            headquarters,
            designation,
            companySize,
            gstNumber,
          });
        }}
      >
        <div className="flex-1 overflow-y-auto ekam-scroll px-4 pt-2 pb-6 space-y-5">
          {/* Live Business Summary Card */}
          <div className={`${cardClass} p-4 flex items-center gap-3.5`}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#173E52] text-[#F38B1E] flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5.5 h-5.5" strokeWidth={1.85} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                {businessName.trim() || 'Your business name'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                <span className="truncate">{businessCategory}</span>
                {headquarters.trim() && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{headquarters.trim()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Company Profile */}
          <section className="space-y-2.5">
            <SectionHeader title="Company profile" />
            <div className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8`}>
              <div className="p-4 space-y-1.5">
                <label
                  htmlFor="edit-business-name"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Business Name *
                </label>
                <div className="relative">
                  <Building2
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    id="edit-business-name"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    placeholder="Enter business name"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <label
                  htmlFor="edit-business-category"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Business Category
                </label>
                <div className="relative">
                  <Layers
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <select
                    id="edit-business-category"
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className={`${inputClass} pr-9 appearance-none cursor-pointer`}
                  >
                    <option>Digital &amp; Marketing</option>
                    <option>Infrastructure &amp; Real Estate</option>
                    <option>Wealth &amp; Advisory</option>
                    <option>Architecture &amp; Interiors</option>
                  </select>
                  <ChevronDown
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-business-year"
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Established Year
                  </label>
                  <div className="relative">
                    <Calendar
                      className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.85}
                    />
                    <input
                      id="edit-business-year"
                      type="text"
                      placeholder="e.g., 2021"
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value)}
                      className={`${inputClass} font-mono-tabular`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-business-size"
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Company Size
                  </label>
                  <div className="relative">
                    <Users
                      className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.85}
                    />
                    <select
                      id="edit-business-size"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className={`${inputClass} pr-8 appearance-none cursor-pointer`}
                    >
                      <option value="">Select</option>
                      <option>1–10</option>
                      <option>11–50</option>
                      <option>51–200</option>
                    </select>
                    <ChevronDown
                      className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      strokeWidth={1.85}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Operations & Registration */}
          <section className="space-y-2.5">
            <SectionHeader title="Operations & registration" />
            <div className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8`}>
              <div className="p-4 space-y-1.5">
                <label
                  htmlFor="edit-business-hq"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Headquarters Location *
                </label>
                <div className="relative">
                  <MapPin
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    id="edit-business-hq"
                    type="text"
                    value={headquarters}
                    onChange={(e) => setHeadquarters(e.target.value)}
                    placeholder="City, State"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <label
                  htmlFor="edit-business-designation"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Designation *
                </label>
                <div className="relative">
                  <Briefcase
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    id="edit-business-designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g., Founder & Director"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <label
                  htmlFor="edit-business-gst"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  GST Number
                </label>
                <div className="relative">
                  <FileText
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    id="edit-business-gst"
                    type="text"
                    placeholder="Optional"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className={`${inputClass} font-mono-tabular uppercase`}
                  />
                </div>
              </div>

              <div className="px-4 py-3.5 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Sponsor
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user.sponsorName}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Anchored Bottom Save Bar */}
        <div className="shrink-0 px-4 pt-2.5 pb-5 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC]/95 to-transparent dark:from-[#0A0C12] dark:via-[#0A0C12]/95">
          <PremiumButton type="submit" fullWidth size="lg">
            <Check className="w-4 h-4 shrink-0" strokeWidth={2.25} />
            <span>Save Business Details</span>
          </PremiumButton>
        </div>
      </form>
    </div>
  );
}

export function EditPersonalScreen({
  user,
  onSave,
  onBack,
}: {
  user: UserProfile;
  onSave: (patch: Partial<UserProfile>) => void;
  onBack: () => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [gender, setGender] = useState(user.gender);
  const [dob, setDob] = useState(user.dob);

  const liveInitials =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || user.initials;

  const cardClass =
    'rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] overflow-hidden';

  const genderOptions: UserProfile['gender'][] = ['Male', 'Female', 'Prefer not to say'];

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
          Update Personal Details
        </h1>
        <span className="w-10" aria-hidden="true" />
      </div>

      <form
        className="flex-1 flex flex-col min-h-0"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ fullName, gender, dob });
        }}
      >
        <div className="flex-1 overflow-y-auto ekam-scroll px-4 pt-2 pb-6 space-y-5">
          {/* Live Identity Summary Card */}
          <div className={`${cardClass} p-4 flex items-center gap-3.5`}>
            <div className="w-13 h-13 rounded-full border-2 border-[#D85D27] bg-[#D85D27]/8 text-[#123142] dark:text-[#F38B1E] flex items-center justify-center font-display text-base font-bold shrink-0">
              {liveInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                {fullName.trim() || 'Your full name'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                <span className="truncate">{user.email}</span>
                {user.chapter && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0">{user.chapter}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Identity & Contact */}
          <section className="space-y-2.5">
            <SectionHeader title="Identity & contact" />
            <div className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8`}>
              <div className="p-4 space-y-1.5">
                <label
                  htmlFor="edit-personal-name"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Your full name *
                </label>
                <div className="relative">
                  <User
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    id="edit-personal-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full h-11.5 pl-10 pr-3.5 rounded-xl bg-[#F6F7FB] dark:bg-[#0D1018] border border-slate-200/90 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/15 transition-all"
                  />
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <label
                  htmlFor="edit-personal-email"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    id="edit-personal-email"
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-11.5 pl-10 pr-10 rounded-xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/8 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <Lock
                    className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                  Your sign-in email cannot be changed here.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Personal Details */}
          <section className="space-y-2.5">
            <SectionHeader title="Personal details" />
            <div className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8`}>
              <div className="p-4 space-y-2">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Gender
                </span>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2F4F8] dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/8">
                  {genderOptions.map((option) => {
                    const selected = gender === option;
                    const widthClass =
                      option === 'Prefer not to say' ? 'flex-[1.6] px-2.5' : 'flex-1 px-2';
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setGender(option)}
                        aria-pressed={selected}
                        className={`relative py-2 ${widthClass} rounded-lg text-[11.5px] font-semibold transition-colors whitespace-nowrap text-center cursor-pointer ${
                          selected
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {selected && (
                          <motion.div
                            layoutId="edit-personal-gender"
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 rounded-lg bg-white dark:bg-[#232636] shadow-sm border border-slate-200/60 dark:border-white/10"
                          />
                        )}
                        <span className="relative z-10">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <label
                  htmlFor="edit-personal-dob"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Date of birth
                </label>
                <div className="relative">
                  <Calendar
                    className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    strokeWidth={1.85}
                  />
                  <input
                    id="edit-personal-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-11.5 pl-10 pr-3.5 rounded-xl bg-[#F6F7FB] dark:bg-[#0D1018] border border-slate-200/90 dark:border-white/10 text-sm font-mono-tabular text-slate-900 dark:text-white focus:outline-none focus:border-[#D85D27] focus:ring-2 focus:ring-[#D85D27]/15 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Anchored Bottom Save Bar */}
        <div className="shrink-0 px-4 pt-2.5 pb-5 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC]/95 to-transparent dark:from-[#0A0C12] dark:via-[#0A0C12]/95">
          <PremiumButton type="submit" fullWidth size="lg">
            <Check className="w-4 h-4 shrink-0" strokeWidth={2.25} />
            <span>Save Personal Details</span>
          </PremiumButton>
        </div>
      </form>
    </div>
  );
}

export function ReferralCreditsScreen({
  creditsInr,
  onEarnDemoCredit,
  onNavigate,
  onBack,
}: {
  creditsInr: number;
  onEarnDemoCredit: () => void;
  onNavigate: (s: ScreenId) => void;
  onBack: () => void;
}) {
  const [justCredited, setJustCredited] = useState(false);
  const creditTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (creditTimerRef.current !== null) {
        window.clearTimeout(creditTimerRef.current);
      }
    };
  }, []);

  const handleEarnClick = () => {
    onEarnDemoCredit();
    setJustCredited(true);
    if (creditTimerRef.current !== null) {
      window.clearTimeout(creditTimerRef.current);
    }
    creditTimerRef.current = window.setTimeout(() => setJustCredited(false), 1400);
  };

  const cardClass =
    'rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] overflow-hidden';

  return (
    <div className="min-h-full bg-gradient-to-b from-[#ECEEF7]/85 via-[#F4F5FA] to-[#F8F9FC] dark:from-[#121622] dark:via-[#0B0D14] dark:to-[#0A0C12] flex flex-col">
      <SettingsHeader title="Referral credits" onBack={onBack} />
      <div className="p-4 pb-8 space-y-5">
        {/* Architectural Balance Ledger Card */}
        <div className="relative rounded-[24px] bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#173E52] text-white p-5 shadow-[0_20px_42px_-16px_rgba(18,49,66,0.52)] overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(243,139,30,0.28)_0%,rgba(216,93,39,0.08)_48%,transparent_72%)]"
          />
          <ConstellationBackdrop />

          <div className="relative z-10 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-slate-300 tracking-wide">
                  Available to spend
                </div>
                <div className="mt-1.5 flex items-baseline gap-2.5">
                  <motion.div
                    key={creditsInr}
                    initial={{ opacity: 0.65, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-[34px] leading-none font-bold tracking-tight font-mono-tabular text-white"
                  >
                    Rs. {creditsInr.toLocaleString('en-IN')}
                  </motion.div>
                  <AnimatePresence>
                    {justCredited && (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="text-xs font-semibold font-mono-tabular text-[#F38B1E]"
                      >
                        +Rs. 500
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-[#F38B1E] flex items-center justify-center shrink-0">
                <Wallet className="w-4.5 h-4.5" strokeWidth={1.85} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/12">
              <div>
                <div className="text-[11px] text-slate-300/85">Held for requests</div>
                <div className="text-sm font-bold text-white font-mono-tabular mt-0.5">
                  Rs. 0
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-300/85">Earned all time</div>
                <div className="text-sm font-bold text-white font-mono-tabular mt-0.5">
                  Rs. {creditsInr.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <section className="space-y-2.5">
          <SectionHeader title="Actions" />
          <div className={`${cardClass} p-4 space-y-2.5`}>
            <PremiumButton fullWidth size="lg" onClick={handleEarnClick}>
              <Gift className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>Refer someone (+Rs. 500 member credit)</span>
            </PremiumButton>
            <PremiumButton variant="secondary" fullWidth size="lg" onClick={() => onNavigate('events')}>
              <Calendar className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>Spend credits on an event</span>
            </PremiumButton>
          </div>
        </section>

        {/* How Credits Work */}
        <section className="space-y-2.5">
          <SectionHeader title="How credits work" />
          <div className={`${cardClass} divide-y divide-slate-100 dark:divide-white/8`}>
            <div className="px-4 py-3.5 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#D85D27]/10 text-[#D85D27] flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" strokeWidth={1.85} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  Earn Rs. 500 per member referral
                </div>
                <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Credits unlock automatically when your invited guest joins EKAM.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-[#123142] dark:text-[#F38B1E] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" strokeWidth={1.85} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                    Redeem toward chapter events
                  </div>
                  <div className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Browse upcoming summits, mixers, and member meetups.
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AppearanceSettingsScreen({
  theme,
  onChangeTheme,
  reducedMotion,
  onToggleReducedMotion,
  onBack,
}: {
  theme: ThemeMode;
  onChangeTheme: (t: ThemeMode) => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onBack: () => void;
}) {
  const spring = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 28 };

  const themeOptions: {
    id: ThemeMode;
    label: string;
    Icon: typeof Sun;
  }[] = [
    { id: 'light', label: 'Light', Icon: Sun },
    { id: 'dark', label: 'Dark', Icon: Moon },
    { id: 'system', label: 'System', Icon: Monitor },
  ];

  const cardClass =
    'rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] divide-y divide-slate-100 dark:divide-white/8 overflow-hidden';

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
          Appearance
        </h1>
        <span className="w-10" aria-hidden="true" />
      </div>

      {/* Scrollable Uniform Card Sections */}
      <div className="flex-1 overflow-y-auto ekam-scroll px-4 pt-2 pb-8 space-y-5">
        {/* Section 1: Display Theme */}
        <section className="space-y-2.5">
          <SectionHeader title="Display theme" />
          <div className={cardClass}>
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Theme
                </h2>
                <span className="text-xs font-semibold capitalize text-[#D85D27]">
                  {theme}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Choose how EKAM looks on this device. Your choice is saved across sessions.
              </p>
            </div>

            <div className="p-4 grid grid-cols-3 gap-2.5">
              {themeOptions.map(({ id, label, Icon }) => {
                const active = theme === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                    onClick={() => onChangeTheme(id)}
                    aria-pressed={active}
                    className="group relative flex flex-col items-center text-center focus-visible:outline-none cursor-pointer"
                  >
                    <div
                      className={`relative w-full aspect-[4/4.4] rounded-2xl p-1.5 transition-colors overflow-hidden ${
                        active
                          ? 'bg-[#D85D27]/8 dark:bg-[#D85D27]/12'
                          : 'bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.07]'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="appearance-theme-ring"
                          transition={spring}
                          className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[#D85D27] shadow-[0_4px_14px_-4px_rgba(216,93,39,0.35)]"
                        />
                      )}

                      {id === 'light' && (
                        <div className="w-full h-full rounded-[10px] bg-[#FAFAFC] border border-slate-200/80 p-2 flex flex-col justify-between overflow-hidden">
                          <div className="h-2.5 w-full rounded bg-[#123142] flex items-center px-1 gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#F38B1E]" />
                            <span className="h-0.5 w-4 rounded-full bg-white/70" />
                          </div>
                          <div className="rounded-md bg-white border border-slate-200/80 p-1.5 space-y-1 shadow-2xs">
                            <div className="h-1 w-3/4 rounded-full bg-slate-800/75" />
                            <div className="h-1 w-1/2 rounded-full bg-slate-300" />
                          </div>
                          <div className="h-2 w-full rounded-full bg-[#D85D27]" />
                        </div>
                      )}

                      {id === 'dark' && (
                        <div className="w-full h-full rounded-[10px] bg-[#0B0D14] border border-white/10 p-2 flex flex-col justify-between overflow-hidden">
                          <div className="h-2.5 w-full rounded bg-[#162736] flex items-center px-1 gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-[#F38B1E]" />
                            <span className="h-0.5 w-4 rounded-full bg-white/70" />
                          </div>
                          <div className="rounded-md bg-[#161822] border border-white/10 p-1.5 space-y-1">
                            <div className="h-1 w-3/4 rounded-full bg-slate-200/85" />
                            <div className="h-1 w-1/2 rounded-full bg-slate-500/70" />
                          </div>
                          <div className="h-2 w-full rounded-full bg-[#D85D27]" />
                        </div>
                      )}

                      {id === 'system' && (
                        <div className="w-full h-full rounded-[10px] border border-slate-200/80 dark:border-white/15 overflow-hidden relative flex">
                          <div className="w-1/2 h-full bg-[#FAFAFC] p-1.5 pr-0.5 flex flex-col justify-between">
                            <div className="h-2.5 w-full rounded-l bg-[#123142]" />
                            <div className="rounded-l-md bg-white border-y border-l border-slate-200/80 p-1 space-y-1">
                              <div className="h-1 w-full rounded-full bg-slate-800/70" />
                              <div className="h-1 w-2/3 rounded-full bg-slate-300" />
                            </div>
                            <div className="h-2 w-full rounded-l-full bg-[#D85D27]" />
                          </div>
                          <div className="w-1/2 h-full bg-[#0B0D14] p-1.5 pl-0.5 flex flex-col justify-between">
                            <div className="h-2.5 w-full rounded-r bg-[#162736]" />
                            <div className="rounded-r-md bg-[#161822] border-y border-r border-white/10 p-1 space-y-1">
                              <div className="h-1 w-full rounded-full bg-slate-200/80" />
                              <div className="h-1 w-2/3 rounded-full bg-slate-600" />
                            </div>
                            <div className="h-2 w-full rounded-r-full bg-[#D85D27]" />
                          </div>
                        </div>
                      )}

                      {active && (
                        <motion.span
                          initial={reducedMotion ? false : { scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={spring}
                          className="absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full bg-[#D85D27] text-white flex items-center justify-center shadow-sm"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </motion.span>
                      )}
                    </div>

                    <div className="mt-2 inline-flex items-center gap-1">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          active ? 'text-[#D85D27]' : 'text-slate-400 dark:text-slate-500'
                        }`}
                        strokeWidth={2}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          active ? 'text-[#D85D27]' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Motion & Accessibility */}
        <section className="space-y-2.5">
          <SectionHeader title="Motion & accessibility" />
          <div className={cardClass}>
            <div className="p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#D85D27]/12 text-[#D85D27] flex items-center justify-center shrink-0 relative overflow-hidden">
                <motion.div
                  animate={
                    reducedMotion
                      ? { rotate: 0, scale: 1 }
                      : { rotate: 360, scale: [1, 1.08, 1] }
                  }
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : {
                          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                          scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
                        }
                  }
                >
                  <Sparkles className="w-4.5 h-4.5" strokeWidth={1.85} />
                </motion.div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Motion
                  </h2>
                  <span className="text-xs font-semibold text-[#D85D27]">
                    {reducedMotion ? 'Reduced' : 'Full'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {reducedMotion
                    ? 'Reduced motion is active across transitions and 3D orbits.'
                    : 'Smooth spring transitions and 3D animations are active.'}
                </p>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#F2F4F8] dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/8">
                {(
                  [
                    { value: false, label: 'Full motion' },
                    { value: true, label: 'Reduced motion' },
                  ] as const
                ).map((opt) => {
                  const selected = reducedMotion === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        if (!selected) onToggleReducedMotion();
                      }}
                      className={`relative py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selected
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {selected && (
                        <motion.div
                          layoutId="appearance-motion-pill"
                          transition={spring}
                          className="absolute inset-0 rounded-lg bg-white dark:bg-[#232636] shadow-sm border border-slate-200/60 dark:border-white/10"
                        />
                      )}
                      <span className="relative z-10">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function NotificationSettingsScreen({
  onBack,
  reducedMotion = false,
}: {
  onBack: () => void;
  reducedMotion?: boolean;
}) {
  const [master, setMaster] = useState(true);
  const [prefs, setPrefs] = useState({
    all: true,
    events: true,
    groups: true,
    feed: true,
    meetings: true,
    quiet: false,
  });
  const [showUpdatedSheet, setShowUpdatedSheet] = useState(false);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setShowUpdatedSheet(true);
  };

  const toggleMaster = () => {
    setMaster((m) => !m);
    setShowUpdatedSheet(true);
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
          Notifications
        </h1>
        <span className="w-10" aria-hidden="true" />
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto ekam-scroll px-4 pt-2 pb-6 space-y-5">
        <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Notifications on this device
            </h2>
            <span className={`text-xs font-semibold ${master ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {master ? 'On' : 'Off'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Get alerts about messages, meetings, approvals and more — even when the app is closed.
          </p>
          <PremiumButton size="sm" variant="secondary" onClick={toggleMaster} className="!rounded-full">
            {master ? 'Turn off' : 'Turn on'}
          </PremiumButton>
        </div>

        <div className="rounded-[22px] bg-white dark:bg-[#161822] border border-slate-200/70 dark:border-white/10 shadow-[0_14px_34px_-12px_rgba(18,49,66,0.10),0_3px_10px_-3px_rgba(18,49,66,0.04)] dark:shadow-[0_18px_38px_-12px_rgba(0,0,0,0.68)] divide-y divide-slate-100 dark:divide-white/8 overflow-hidden">
          {(
            [
              { key: 'all', label: 'All notifications', Icon: Bell },
              { key: 'events', label: 'Events', Icon: Calendar },
              { key: 'groups', label: 'Groups', Icon: Layers },
              { key: 'feed', label: 'Feed', Icon: Compass },
              { key: 'meetings', label: 'Meetings', Icon: Briefcase },
              { key: 'quiet', label: 'Quiet hours', Icon: Moon },
            ] as const
          ).map(({ key, label, Icon }) => (
            <div key={key} className="px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4.5 h-4.5 text-[#123142]/75 dark:text-[#F38B1E]/90 shrink-0" strokeWidth={1.75} />
                <span className="text-[13.5px] font-medium text-slate-900 dark:text-white truncate">{label}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                aria-label={label}
                onClick={() => toggle(key)}
                className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 cursor-pointer ${
                  prefs[key] ? 'bg-[#D85D27]' : 'bg-slate-200 dark:bg-white/15'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    prefs[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Updated! Bottom Sheet */}
      <AnimatePresence>
        {showUpdatedSheet && (
          <motion.div
            key="notif-settings-updated-backdrop"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
            onClick={() => setShowUpdatedSheet(false)}
            className="absolute inset-0 z-50 overflow-hidden bg-slate-950/55 flex flex-col justify-end"
          >
            <motion.div
              initial={reducedMotion ? { y: 0, opacity: 1 } : { y: '100%' }}
              animate={{ y: 0, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { y: '100%' }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 360, damping: 34, mass: 0.9 }
              }
              onClick={(e) => e.stopPropagation()}
              className="relative w-full rounded-t-[28px] bg-white dark:bg-[#161822] border-t border-slate-200/80 dark:border-white/10 px-6 pt-9 pb-8 text-center shadow-[0_-18px_45px_-12px_rgba(18,49,66,0.28)]"
            >
              {/* Floating Circular Close Button on Top-Right Edge */}
              <button
                type="button"
                onClick={() => setShowUpdatedSheet(false)}
                aria-label="Close"
                className="absolute -top-5 right-5 w-10 h-10 rounded-full bg-white dark:bg-[#232636] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/15 shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center transition-transform cursor-pointer"
              >
                <X className="w-4.5 h-4.5" strokeWidth={2} />
              </button>

              {/* Circular Stacked Notification Card Illustration */}
              <div className="w-24 h-24 mx-auto rounded-full bg-[#EEF0FA] dark:bg-[#D85D27]/12 flex items-center justify-center mb-5">
                <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none" aria-hidden="true">
                  {/* Back cards */}
                  <rect
                    x="18"
                    y="43"
                    width="44"
                    height="18"
                    rx="4"
                    className="fill-white/75 dark:fill-white/10 stroke-slate-200/80 dark:stroke-white/10"
                    strokeWidth="1"
                  />
                  <rect
                    x="16"
                    y="30"
                    width="48"
                    height="20"
                    rx="4"
                    className="fill-white/90 dark:fill-white/15 stroke-slate-200/90 dark:stroke-white/12"
                    strokeWidth="1"
                  />
                  {/* Front elevated card */}
                  <rect
                    x="13"
                    y="16"
                    width="54"
                    height="24"
                    rx="5"
                    className="fill-white dark:fill-[#1F2333] stroke-slate-200 dark:stroke-white/15"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="19"
                    y="22"
                    width="12"
                    height="12"
                    rx="3"
                    className="fill-[#D85D27]/20 dark:fill-[#D85D27]/35"
                  />
                  <rect
                    x="36"
                    y="24"
                    width="24"
                    height="3.5"
                    rx="1.75"
                    className="fill-slate-300/80 dark:fill-white/25"
                  />
                  <rect
                    x="36"
                    y="30.5"
                    width="16"
                    height="2.5"
                    rx="1.25"
                    className="fill-slate-200 dark:fill-white/15"
                  />
                </svg>
              </div>

              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Settings Updated!
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                Your changes will be reflected real time after the changes, you can adjust it later.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TermsPrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <SettingsHeader title="Terms & Privacy" onBack={onBack} />
      <div className="p-4 space-y-4">
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Terms of Use</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            By using EKAM, you agree to participate in good faith in the referral-network activities the platform
            supports — including business opportunity referrals, testimonials, visitor and meeting tracking, and
            community features.
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            EKAM collects and stores profile details, referral and testimonial activity, and applicable verification data
            to operate chapter networking features. Your information is never sold to third parties.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DeleteAccountScreen({ onBack }: { onBack: () => void }) {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleted, setDeleted] = useState(false);

  const canDelete = c1 && c2 && confirmText === 'DELETE';

  return (
    <div className="min-h-full bg-[#FAFAFC] dark:bg-[#0B0B0F] flex flex-col">
      <SettingsHeader title="Delete Account" onBack={onBack} />
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">Delete your account?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">This is permanent. There is no recycle bin.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            This permanently deletes
          </div>
          <p>• Profile, login and all your details</p>
          <p>• Posts, comments and reactions</p>
          <p>• Connections, referrals, 1-2-1s, M2O and chapter attendance</p>
          <p>• Messages, chat threads and notifications</p>
        </div>

        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/40 p-4 space-y-3">
          <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={c1} onChange={(e) => setC1(e.target.checked)} className="mt-0.5 w-4 h-4 accent-rose-600" />
            <span>I understand my account will be permanently deleted.</span>
          </label>
          <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={c2} onChange={(e) => setC2(e.target.checked)} className="mt-0.5 w-4 h-4 accent-rose-600" />
            <span>I understand this cannot be recovered afterward.</span>
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0F0F13] border border-rose-200 dark:border-rose-900/40 text-sm text-slate-900 dark:text-white"
          />
          <PremiumButton variant="danger" fullWidth disabled={!canDelete} onClick={() => setDeleted(true)}>
            {deleted ? 'Account Deletion Requested' : 'Delete my account'}
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
