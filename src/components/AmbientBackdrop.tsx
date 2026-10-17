import { Box } from '@mantine/core';

interface AmbientBackdropProps {
  /**
   * 'full' is the homepage: colour fields plus the arc nests. 'subtle' drops
   * the arcs and softens the fields, for content-dense pages that only need
   * enough atmosphere to feel like the same site.
   */
  variant?: 'full' | 'subtle';
}

/**
 * The page's ground: soft colour fields, and nests of concentric arcs anchored
 * past two corners.
 *
 * An earlier attempt stamped the logo mark itself behind the heading, which
 * read as a smudge. This borrows the mark's *language* instead — fine, broken
 * concentric line work — at a scale where the curvature still reads. It is
 * decorative throughout and hidden from assistive tech.
 */
export function AmbientBackdrop({ variant = 'full' }: AmbientBackdropProps) {
  const subtle = variant === 'subtle';
  return (
    <Box
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <Box
        style={{ position: 'absolute', inset: 0, background: WASHES, opacity: subtle ? 0.55 : 1 }}
      />

      {!subtle && (
        <Box
          component="svg"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <g className="ambient-arcs" fill="none" strokeWidth={1.3} strokeLinecap="round">
            {/* A nest of rings centred just past the lower-left corner. The radii
                stay near the viewport's own scale: any larger and the curvature
                flattens into straight diagonals and stops reading as the mark.
                Gaps are spread across each full ring, since a pattern that is all
                gap over the on-screen arc renders nothing at all. */}
            <circle cx={60} cy={840} r={170} pathLength={100}
              strokeDasharray="22 6 18 8 30 16" strokeDashoffset={0}
              stroke="var(--mantine-color-teal-6)" />
            <circle cx={60} cy={840} r={236} pathLength={100}
              strokeDasharray="16 8 26 7 24 19" strokeDashoffset={14}
              stroke="var(--mantine-color-sky-6)" />
            <circle cx={60} cy={840} r={302} pathLength={100}
              strokeDasharray="30 7 14 9 22 18" strokeDashoffset={29}
              stroke="var(--mantine-color-plum-6)" />
            <circle cx={60} cy={840} r={368} pathLength={100}
              strokeDasharray="20 9 24 6 28 13" strokeDashoffset={43}
              stroke="var(--mantine-color-coral-6)" />
            <circle cx={60} cy={840} r={434} pathLength={100}
              strokeDasharray="26 8 16 10 24 16" strokeDashoffset={61}
              stroke="var(--mantine-color-indigo-6)" />
            <circle cx={60} cy={840} r={500} pathLength={100}
              strokeDasharray="18 6 30 8 20 18" strokeDashoffset={76}
              stroke="var(--mantine-color-pink-6)" />
            <circle cx={60} cy={840} r={566} pathLength={100}
              strokeDasharray="24 7 20 9 26 14" strokeDashoffset={88}
              stroke="var(--mantine-color-teal-6)" />


            {/* A smaller, quieter nest past the top-right corner, purely to keep
                the composition from listing to one side. */}

            <circle cx={1190} cy={-40} r={150} pathLength={100}
              strokeDasharray="20 9 24 6 28 13" strokeDashoffset={8}
              stroke="var(--mantine-color-pink-6)" />
            <circle cx={1190} cy={-40} r={212} pathLength={100}
              strokeDasharray="26 8 16 10 24 16" strokeDashoffset={35}
              stroke="var(--mantine-color-indigo-6)" />
            <circle cx={1190} cy={-40} r={274} pathLength={100}
              strokeDasharray="18 6 30 8 20 18" strokeDashoffset={62}
              stroke="var(--mantine-color-teal-6)" />
            <circle cx={1190} cy={-40} r={336} pathLength={100}
              strokeDasharray="24 7 20 9 26 14" strokeDashoffset={81}
              stroke="var(--mantine-color-sky-6)" />
          </g>
        </Box>
      )}
    </Box>
  );
}

/**
 * Kept far below the threshold where they could affect text contrast — the
 * quiet copy on this page is already the tightest ratio we have.
 */
const WASHES = [
  'radial-gradient(58rem 40rem at 8% -6%, light-dark(color-mix(in oklab, var(--mantine-color-teal-6) 13%, transparent), color-mix(in oklab, var(--mantine-color-teal-6) 10%, transparent)), transparent 62%)',
  'radial-gradient(46rem 34rem at 96% 4%, light-dark(color-mix(in oklab, var(--mantine-color-pink-6) 9%, transparent), color-mix(in oklab, var(--mantine-color-pink-6) 8%, transparent)), transparent 62%)',
  'radial-gradient(52rem 38rem at 78% 98%, light-dark(color-mix(in oklab, var(--mantine-color-sky-6) 11%, transparent), color-mix(in oklab, var(--mantine-color-sky-6) 9%, transparent)), transparent 62%)',
].join(', ');

