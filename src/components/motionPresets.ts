import type { Variants } from 'motion/react';

export function createStaggerListVariants(
  reducedMotion = false,
  staggerChildren = 0.06,
  delayChildren = 0.04
): Variants {
  return {
    hidden: { opacity: reducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: reducedMotion
        ? { duration: 0.12 }
        : {
            staggerChildren,
            delayChildren,
          },
    },
  };
}

export function createSpringItemVariants(
  reducedMotion = false,
  yOffset = 18,
  scaleFrom = 0.95
): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.14 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };
  }

  return {
    hidden: { opacity: 0, y: yOffset, scale: scaleFrom },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 320,
        damping: 24,
        mass: 0.85,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.96,
      transition: {
        duration: 0.16,
        ease: [0.4, 0, 1, 1],
      },
    },
  };
}
