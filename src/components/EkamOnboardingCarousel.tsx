import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Compass, Globe, ShieldCheck, Sparkles, Users, Briefcase } from 'lucide-react';
import { EkamWordmark, PremiumButton } from './EkamBrand';
import { ScreenId } from '../types/ekam';

interface EkamOnboardingCarouselProps {
  onLogin: () => void;
  onCreateAccount: () => void;
  reducedMotion?: boolean;
}

const ONBOARDING_SLIDES = [
  {
    id: 'slide-1',
    title: 'One World, Infinite Connections',
    subtitle: "Uniting founders, MSMEs, and business owners into one trusted global referral ecosystem.",
    bgGradient: 'from-[#123142] via-[#1A465C] to-[#0A1D29]',
    accentColor: '#268BFF',
    waveColor: '#123142',
    icon: Globe,
  },
  {
    id: 'slide-2',
    title: 'Verified Business Chapters',
    subtitle: 'Collaborate locally and internationally to pass verified referrals and close high-value deals.',
    bgGradient: 'from-[#D85D27] via-[#E67E48] to-[#BE4D14]',
    accentColor: '#FFB45C',
    waveColor: '#D85D27',
    icon: ShieldCheck,
  },
  {
    id: 'slide-3',
    title: 'Global Enterprise Scale',
    subtitle: 'Schedule P2P meetings, showcase products, and expand your market footprint across regions.',
    bgGradient: 'from-[#07212D] via-[#0D3A4C] to-[#14566E]',
    accentColor: '#F38B1E',
    waveColor: '#07212D',
    icon: Users,
  },
];

export function EkamOnboardingCarousel({
  onLogin,
  onCreateAccount,
  reducedMotion = false,
}: EkamOnboardingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[currentIndex];
  const IconComponent = slide.icon;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onLogin();
    }
  };

  return (
    <div className={`min-h-full bg-gradient-to-br ${slide.bgGradient} text-white flex flex-col justify-between relative overflow-hidden select-none transition-colors duration-700`}>
      {/* Organic Curved Sloping Wave Header Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 375 812"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-35"
          fill="none"
        >
          <path
            d="M0 0H375V340C375 340 280 440 187.5 440C95 440 0 340 0 340V0Z"
            fill="currentColor"
            className="text-white/10"
          />
        </svg>
        <div className="absolute top-12 right-12 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-black/20 blur-3xl" />
      </div>

      {/* Top Header / Wordmark */}
      <div className="relative z-20 px-6 pt-6 flex items-center justify-between">
        <EkamWordmark light size="md" animated={!reducedMotion} reducedMotion={reducedMotion} />
        <button
          type="button"
          onClick={onLogin}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white backdrop-blur-md transition-colors cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Center Illustration & Content Card (Slick Carousel Slide) */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="flex flex-col items-center max-w-sm w-full"
          >
            {/* Illustration Graphic Badge */}
            <div className="w-32 h-32 rounded-3xl bg-white/12 backdrop-blur-xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-center mb-8 relative">
              <div
                className="absolute inset-0 rounded-3xl opacity-30 blur-xl"
                style={{ backgroundColor: slide.accentColor }}
              />
              <IconComponent className="w-16 h-16 text-white relative z-10" strokeWidth={1.75} />
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl font-bold tracking-tight text-white leading-snug">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-sm text-white/85 leading-relaxed font-medium">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions & Pagination Dots */}
      <div className="relative z-20 px-6 pb-8 space-y-6">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {ONBOARDING_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons: Log in & Create account */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
          <button
            type="button"
            onClick={onLogin}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm transition-all cursor-pointer backdrop-blur-md active:scale-98"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={onCreateAccount}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm shadow-xl hover:bg-slate-100 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
          >
            <span>Create account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
