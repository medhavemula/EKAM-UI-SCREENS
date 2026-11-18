import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Eye, X } from 'lucide-react';
import { AUDIT_SCREENS } from '../data/ekamData';
import { AuditScreenRecord, ScreenId } from '../types/ekam';

export function ScreenAuditGallery({ onOpenScreen }: { onOpenScreen: (s: ScreenId) => void }) {
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [inspected, setInspected] = useState<AuditScreenRecord | null>(null);

  const categories = ['All', 'Auth & Guide', 'Dashboard', 'Business', 'Professional', 'Groups', 'Profile & Settings'];
  const filtered = AUDIT_SCREENS.filter((s) => moduleFilter === 'All' || s.module === moduleFilter);

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Before &amp; After Screen Audit
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Live device captures from the original EKAM build paired with the specific UX audit findings and design upgrades implemented in this transformation.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setModuleFilter(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              moduleFilter === cat
                ? 'bg-[#D85D27] text-white'
                : 'bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#D85D27]/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Audit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white dark:bg-[#151519] border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative bg-slate-100 dark:bg-[#0D0E12] p-4 flex justify-center border-b border-slate-200/70 dark:border-white/8">
                <img
                  src={item.imagePath}
                  alt={`Original EKAM ${item.title} screen capture`}
                  referrerPolicy="no-referrer"
                  className="h-64 w-auto rounded-2xl shadow-md object-contain"
                />
                <button
                  type="button"
                  onClick={() => setInspected(item)}
                  aria-label={`Inspect ${item.title}`}
                  className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-[#1E1F26]/90 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#D85D27] cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div className="text-xs font-medium text-[#D85D27]">{item.module}</div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">{item.title}</h2>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Issues Identified
                  </div>
                  {item.auditFindings.map((f, idx) => (
                    <p key={idx} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      • {f}
                    </p>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/8">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Transformation Applied
                  </div>
                  {item.redesignHighlights.map((h, idx) => (
                    <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => onOpenScreen(item.screenTarget)}
                className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[#123142] hover:bg-[#0D2431] dark:bg-[#1E475E] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Open Redesigned Screen</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {inspected && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setInspected(null)}
        >
          <div
            className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#151519] border border-slate-200 dark:border-white/10 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{inspected.title}</h3>
              <button
                type="button"
                onClick={() => setInspected(null)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center bg-slate-100 dark:bg-[#0B0B0F] rounded-2xl p-4">
              <img
                src={inspected.imagePath}
                alt={inspected.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
