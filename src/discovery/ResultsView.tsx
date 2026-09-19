import {
  Alert,
  Box,
  Button,
  CopyButton,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconCheck, IconLink, IconMoodSearch, IconRefresh } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { directoryApi } from '@/api/directory';
import type { RecommendationRequest } from '@/api/types';
import { PractitionerCard } from '@/discovery/PractitionerCard';
import { ResultsMap } from '@/discovery/ResultsMap';

interface ResultsViewProps {
  result: RecommendationRequest;
  onStartOver?: () => void;
  shareUrl?: string;
}

export function ResultsView({ result, onStartOver, shareUrl }: ResultsViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // The browser key lives on the backend so it can be rotated in one place.
  const mapConfig = useQuery({
    queryKey: ['map-config'],
    queryFn: directoryApi.mapConfig,
    staleTime: 60 * 60_000,
  });

  const { recommendations } = result;

  if (recommendations.length === 0) {
    return <NoMatches result={result} onStartOver={onStartOver} />;
  }

  const center = {
    lat: result.latitude ?? 0,
    lng: result.longitude ?? 0,
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={2}>
          <Title order={2}>
            {recommendations.length === 1
              ? 'Your match'
              : `Your top ${recommendations.length} matches`}
          </Title>
          <Text c="dimmed">
            Near {result.location_label} · chosen from practitioners who fit what
            you told us
          </Text>
        </Stack>

        <Group gap="xs">
          {shareUrl && (
            <CopyButton value={shareUrl} timeout={2000}>
              {({ copied, copy }) => (
                <Button
                  variant="default"
                  leftSection={
                    copied ? <IconCheck size={16} /> : <IconLink size={16} />
                  }
                  onClick={copy}
                >
                  {copied ? 'Link copied' : 'Copy link'}
                </Button>
              )}
            </CopyButton>
          )}
          {onStartOver && (
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={onStartOver}
            >
              Start over
            </Button>
          )}
        </Group>
      </Group>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            {recommendations.map((recommendation) => (
              <PractitionerCard
                key={recommendation.practitioner.id}
                recommendation={recommendation}
                active={activeId === recommendation.practitioner.id}
                onHover={setActiveId}
                requestId={result.id}
              />
            ))}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          {/* Sticky so the map stays beside the cards while they scroll. */}
          <Box style={{ position: 'sticky', top: 88 }}>
            <ResultsMap
              apiKey={mapConfig.data?.google_maps_api_key ?? ''}
              recommendations={recommendations}
              center={center}
              activeId={activeId}
              onSelect={setActiveId}
              height={480}
            />
          </Box>
        </Grid.Col>
      </Grid>

      <Alert variant="light" color="gray">
        <Text size="sm">
          iamago helps you find practitioners — it does not provide medical
          advice, diagnosis or treatment, and a listing is not an endorsement.
          Check credentials and licensing before booking care.
        </Text>
      </Alert>
    </Stack>
  );
}

function NoMatches({
  result,
  onStartOver,
}: {
  result: RecommendationRequest;
  onStartOver?: () => void;
}) {
  return (
    <Stack align="center" gap="sm" py="xl">
      <IconMoodSearch size={44} stroke={1.3} color="var(--mantine-color-dimmed)" />
      <Title order={3}>No matches near {result.location_label}</Title>
      <Text c="dimmed" ta="center" maw={440}>
        We could not find a practitioner matching what you are looking for within{' '}
        {result.radius_miles} miles. Try widening the search radius, including
        telehealth, or choosing a nearby city.
      </Text>
      {onStartOver && (
        <Button mt="sm" leftSection={<IconRefresh size={16} />} onClick={onStartOver}>
          Adjust my search
        </Button>
      )}
    </Stack>
  );
}
