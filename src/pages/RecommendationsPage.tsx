import { Alert, Button, Center, Container, Loader, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { SaveSearchButton } from '@/discovery/SaveSearchButton';
import { AmbientBackdrop } from '@/components/AmbientBackdrop';
import { directoryApi } from '@/api/directory';
import type { RecommendationRequest } from '@/api/types';
import { ResultsView } from '@/discovery/ResultsView';

/**
 * A shareable, bookmarkable view of one set of recommendations. Access is by
 * claim token rather than by account, so the link works before sign-up — and
 * an id alone is not enough to read someone else's results.
 */
export function RecommendationsPage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const location = useLocation();

  // Skip the round-trip when we arrived straight from the quiz.
  const preloaded = (location.state as { result?: RecommendationRequest } | null)?.result;

  const query = useQuery({
    queryKey: ['recommendation', id, token],
    queryFn: () => directoryApi.getRecommendation(id, token),
    enabled: Boolean(id && token) && !preloaded,
    initialData: preloaded?.id === id ? preloaded : undefined,
    retry: false,
  });

  // A disabled query stays "pending" forever, so a link with no token has to
  // be handled before that check or the page just spins.
  const hasCredentials = Boolean(id && token);

  if (hasCredentials && query.isPending) {
    return (
      <Center mih="50vh">
        <Loader />
      </Center>
    );
  }

  if (!hasCredentials || query.isError || !query.data) {
    return (
      <Container size="sm" py="xl">
        <Stack gap="md">
          <Alert color="red" variant="light" title="We could not open those results">
            <Text size="sm">
              This link is missing its access token or has expired. Run the
              search again to get a fresh set of recommendations.
            </Text>
          </Alert>
          <Button component={Link} to="/" w="fit-content">
            Start a new search
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      {/* Enough atmosphere to match the homepage; the arcs stay off because the
          cards and map already carry plenty of detail. */}
      <AmbientBackdrop variant="subtle" />
      <Container size="lg" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        <SaveSearchButton searchId={query.data.id} token={token} />
        <ResultsView
          result={query.data}
          onStartOver={() => navigate('/')}
          shareUrl={window.location.href}
        />
      </Container>
    </>
  );
}
