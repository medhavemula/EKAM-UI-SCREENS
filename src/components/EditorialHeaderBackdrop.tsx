import React, { useId } from 'react';
import { motion } from 'motion/react';

export function EditorialHeaderBackdrop({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const beamCoolId = `beam-cool-${uid}`;
  const beamDeepId = `beam-deep-${uid}`;
  const beamWarmId = `beam-warm-${uid}`;
  const ribbonFill1Id = `ribbon-fill-1-${uid}`;
  const ribbonFill2Id = `ribbon-fill-2-${uid}`;
  const navyLineId = `navy-line-${uid}`;
  const orangeLineId = `orange-line-${uid}`;
  const amberAccentId = `amber-accent-${uid}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 bottom-0 w-[76%] z-10 select-none overflow-hidden"
    >
      <svg
        viewBox="0 0 320 210"
        preserveAspectRatio="xMaxYMid slice"
        className="w-full h-full overflow-visible"
        fill="none"
      >
        <defs>
          {/* Architectural Diagonal Light Beams */}
          <linearGradient id={beamCoolId} x1="78%" y1="0%" x2="36%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#1E4E8C" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#060F1E" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={beamDeepId} x1="94%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#123142" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#060F1E" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={beamWarmId} x1="92%" y1="22%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.14" />
            <stop offset="45%" stopColor="#EA580C" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#091930" stopOpacity="0" />
          </linearGradient>

          {/* Translucent Ribbon Wave Fills */}
          <linearGradient id={ribbonFill1Id} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0B2240" stopOpacity="0" />
            <stop offset="45%" stopColor="#1E4E8C" stopOpacity="0.22" />
            <stop offset="85%" stopColor="#38BDF8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={ribbonFill2Id} x1="10%" y1="100%" x2="100%" y2="15%">
            <stop offset="0%" stopColor="#08172D" stopOpacity="0" />
            <stop offset="50%" stopColor="#183F70" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0.08" />
          </linearGradient>

          {/* Crisp Subtle Navy & Sapphire Linework */}
          <linearGradient id={navyLineId} x1="0%" y1="80%" x2="100%" y2="10%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="35%" stopColor="#60A5FA" stopOpacity="0.26" />
            <stop offset="75%" stopColor="#93C5FD" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.04" />
          </linearGradient>

          {/* Restrained EKAM Warm Orange Linework */}
          <linearGradient id={orangeLineId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0" />
            <stop offset="32%" stopColor="#EA580C" stopOpacity="0.52" />
            <stop offset="68%" stopColor="#FDBA74" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id={amberAccentId} x1="10%" y1="90%" x2="95%" y2="20%">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0" />
            <stop offset="48%" stopColor="#FB923C" stopOpacity="0.38" />
            <stop offset="88%" stopColor="#FDBA74" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Layer 1: Architectural Light Beams (CSS Keyframe Slow Ambient Drift) */}
        <g className={reducedMotion ? undefined : 'animate-header-beam-slow'}>
          <polygon points="188,-12 246,-12 132,222 64,222" fill={`url(#${beamCoolId})`} />
          <polygon points="256,-12 318,-12 214,222 152,222" fill={`url(#${beamDeepId})`} />
        </g>
        <g className={reducedMotion ? undefined : 'animate-header-beam-counter'}>
          <polygon points="274,24 334,24 236,222 184,222" fill={`url(#${beamWarmId})`} />
        </g>

        {/* Layer 2: Flowing Navy Silk Ribbon Waves */}
        <motion.g
          animate={
            reducedMotion
              ? undefined
              : {
                  x: [0, 5, 0],
                  y: [0, -4, 0],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M 42 186 C 108 164, 154 98, 224 72 C 266 56, 298 54, 330 42 L 330 132 C 282 136, 232 146, 178 178 C 132 204, 86 212, 42 186 Z"
            fill={`url(#${ribbonFill1Id})`}
          />
          <path
            d="M 78 214 C 138 178, 186 128, 252 104 C 286 92, 310 88, 332 76 L 332 178 C 280 176, 226 184, 168 216 Z"
            fill={`url(#${ribbonFill2Id})`}
          />

          {/* Subtle Navy Contour Wave Lines */}
          <path
            d="M 38 172 C 98 156, 148 86, 222 58 C 264 42, 298 38, 330 24"
            stroke={`url(#${navyLineId})`}
            strokeWidth="1.15"
            strokeLinecap="round"
          />
          <path
            d="M 52 186 C 114 168, 164 102, 234 74 C 274 58, 304 54, 330 42"
            stroke={`url(#${navyLineId})`}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M 68 202 C 132 182, 182 120, 248 92 C 284 78, 310 74, 332 62"
            stroke={`url(#${navyLineId})`}
            strokeWidth="0.85"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Layer 3: Restrained EKAM Warm Orange Editorial Accent Curves */}
        <motion.g
          animate={
            reducedMotion
              ? undefined
              : {
                  x: [0, -5, 0],
                  y: [0, 3, 0],
                  opacity: [0.88, 1, 0.88],
                }
          }
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M 64 194 C 122 168, 168 108, 240 82 C 276 68, 304 66, 330 52"
            stroke={`url(#${orangeLineId})`}
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <path
            d="M 96 208 C 154 184, 196 136, 258 112 C 288 100, 312 96, 332 86"
            stroke={`url(#${amberAccentId})`}
            strokeWidth="1.05"
            strokeLinecap="round"
          />
        </motion.g>
      </svg>

      {/* Soft Left-Edge Navy Scrim so Title & Subtitle Stay Crisp Over Unobstructed Navy */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#071324] via-[#071324]/70 to-transparent" />
    </div>
  );
}
