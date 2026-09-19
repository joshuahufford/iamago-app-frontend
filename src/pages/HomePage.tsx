import { Container } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <Container size="lg" py="xl">
        <ResultsView result={result} onStartOver={() => setResult(null)} />
      </Container>
    );
  }

  return (
    <Container size="sm" px="md" py={{ base: 56, sm: 88, md: 112 }}>
      <DiscoveryQuiz
        onSubmit={(payload) => recommend.mutate(payload)}
        isSubmitting={recommend.isPending}
        error={recommend.isError ? errorMessage(recommend.error) : null}
      />
    </Container>
  );
}
