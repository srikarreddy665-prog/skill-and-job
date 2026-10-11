import confetti from 'canvas-confetti';

/**
 * Fires festive confetti bursts across the screen for milestones, completions, and mastery!
 */
export function triggerCelebration(variant: 'burst' | 'cannons' | 'stars' | 'subtle' = 'burst') {
  try {
    if (typeof window === 'undefined') return;

    if (variant === 'burst') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
      });
    } else if (variant === 'cannons') {
      const end = Date.now() + 1.2 * 1000;
      const colors = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } else if (variant === 'stars') {
      confetti({
        particleCount: 40,
        spread: 90,
        shapes: ['circle'],
        scalar: 1.2,
        colors: ['#fbbf24', '#f59e0b', '#10b981', '#818cf8'],
      });
    } else {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981'],
      });
    }
  } catch (err) {
    console.debug('Confetti triggered in environment without canvas:', err);
  }
}
