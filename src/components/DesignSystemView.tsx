import React from 'react';
import { Briefcase, Calendar, Compass, Layers, MessageSquare, ShieldCheck, Star, Users } from 'lucide-react';
import { EkamWordmark, PremiumButton } from './EkamBrand';

export function DesignSystemView() {
  const palette = [
    { name: 'EKAM Primary Orange', hex: '#D85D27', role: 'Primary CTAs, active tabs & focal accents' },
    { name: 'Deep Copper Orange', hex: '#BE4D14', role: 'Pressed states & high-contrast hover' },
    { name: 'Chapter Petrol Navy', hex: '#123142', role: 'Hero surfaces, calendar headers & authority cards' },
    { name: 'Electric Indigo', hex: '#3B2CFF', role: 'Complementary unread & event highlights' },
    { name: 'Light Canvas', hex: '#FAFAFC', role: 'Primary light background (60% neutral budget)' },
    { name: 'Dark Obsidian', hex: '#0B0B0F', role: 'Primary dark background with elevated #151519 surfaces' },
  ];

  const icons = [
    { label: 'Business', Icon: Briefcase },
    { label: 'Professional', Icon: Compass },
    { label: 'Groups', Icon: Layers },
    { label: 'Connections', Icon: Users },
    { label: 'Meetings', Icon: Calendar },
    { label: 'Testimonials', Icon: Star },
    { label: 'Messaging', Icon: MessageSquare },
    { label: 'Trust & Terms', Icon: ShieldCheck },
  ];

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pb-5 border-b border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            EKAM Visual Design System
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Unified tokens, typography scale, custom iconography, and reusable component primitives across light and dark modes.
          </p>
        </div>
        <div className="px-4 py-2.5 rounded-2xl bg-[#123142] text-white">
          <EkamWordmark light size="sm" />
        </div>
      </div>

      {/* Color System */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Color Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {palette.map((c) => (
            <div
              key={c.hex}
              className="rounded-2xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-4 flex items-center gap-4"
            >
              <div
                className="w-14 h-14 rounded-xl border border-black/10 shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-slate-900 dark:text-white">{c.name}</div>
                <div className="font-mono-tabular text-xs text-[#D85D27] mt-0.5">{c.hex}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography & Component Primitives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-3xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Typography Pairing (2+1)</h2>
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/8">
            <div className="pt-1">
              <div className="text-xs text-slate-400">Display · Plus Jakarta Sans</div>
              <div className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Fortune Chapter · Referral Momentum
              </div>
            </div>
            <div className="pt-3">
              <div className="text-xs text-slate-400">Body · DM Sans</div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Clean, legible geometric prose calibrated for both outdoor mobile daylight and dark mode comfort.
              </div>
            </div>
            <div className="pt-3">
              <div className="text-xs text-slate-400">Metrics · JetBrains Mono (Tabular)</div>
              <div className="font-mono-tabular text-xl font-semibold text-[#D85D27] mt-1">
                05d : 19h : 38m · ₹1,20,000
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Interactive Primitives &amp; Icons</h2>
          <div className="flex flex-wrap gap-2.5">
            <PremiumButton variant="primary">Primary Action</PremiumButton>
            <PremiumButton variant="navy">Chapter Navy</PremiumButton>
            <PremiumButton variant="secondary">Secondary</PremiumButton>
            <PremiumButton variant="ghost">Ghost</PremiumButton>
          </div>
          <div className="grid grid-cols-4 gap-3 pt-2">
            {icons.map(({ label, Icon }) => (
              <div
                key={label}
                className="rounded-2xl bg-[#FAFAFC] dark:bg-[#0E1015] border border-slate-200/70 dark:border-white/8 p-3 flex flex-col items-center gap-1.5 text-center"
              >
                <Icon className="w-5 h-5 text-[#D85D27]" />
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
