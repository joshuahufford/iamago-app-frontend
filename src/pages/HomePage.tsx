import { Box, Container } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AmbientBackdrop } from '@/components/AmbientBackdrop';
import { directoryApi } from '@/api/directory';
import { errorMessage } from '@/api/client';
import type { RecommendationPayload, RecommendationRequest } from '@/api/types';
import { DiscoveryQuiz } from '@/discovery/DiscoveryQuiz';
import { ResultsView } from '@/discovery/ResultsView';

/**
 * The public front door. Deliberately not behind a login wall: a visitor can
 * run the whole flow and see their matches before they ever make an account.
 *
 * There is no pitch above the quiz on purpose. The first question is the page,
 * so someone landing here is already answering rather than being sold to.
 */
export function HomePage() {
  const [result, setResult] = useState<RecommendationRequest | null>(null);
  const navigate = useNavigate();

  const recommend = useMutation({
    mutationFn: (payload: RecommendationPayload) => directoryApi.recommend(payload),
    onSuccess: (data) => {
      setResult(data);
      // Give the results a real URL so they can be bookmarked or shared.
      navigate(`/recommendations/${data.id}?token=${encodeURIComponent(data.claim_token)}`, {
        state: { result: data },
      });
    },
  });

  if (result) {
    return (
      <>
        <AmbientBackdrop variant="subtle" />
        <Container size="lg" py="xl" style={{ position: 'relative', zIndex: 1 }}>
          <ResultsView result={result} onStartOver={() => setResult(null)} />
        </Container>
      </>
    );
  }

  return (
    <>
      <AmbientBackdrop />
      <Container
        size="sm"
        px="md"
        py={{ base: 40, sm: 64, md: 80 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* A raised surface rather than a form card: it restores the
            foreground/background separation the old hero got from its card,
            without the pitch that used to sit beside it. */}
        <Box
          px={{ base: 'md', sm: 40 }}
          py={{ base: 36, sm: 52 }}
          style={{
            borderRadius: 32,
            background: SURFACE,
            border: `1px solid ${SURFACE_BORDER}`,
            boxShadow: SURFACE_SHADOW,
            backdropFilter: 'blur(14px)',
          }}
        >
          <DiscoveryQuiz
            onSubmit={(payload) => recommend.mutate(payload)}
            isSubmitting={recommend.isPending}
            error={recommend.isError ? errorMessage(recommend.error) : null}
          />
        </Box>
      </Container>
    </>
  );
}

// Translucent so the ambient wash and arcs read through the surface, which is
// what makes it sit *above* the page rather than replace it.
const SURFACE = 'light-dark(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.035))';
const SURFACE_BORDER = 'light-dark(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.07))';
const SURFACE_SHADOW =
  'light-dark(0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 2px rgba(0, 0, 0, 0.2)), ' +
  'light-dark(0 24px 48px -24px rgba(16, 24, 40, 0.18), 0 24px 48px -24px rgba(0, 0, 0, 0.5))';
