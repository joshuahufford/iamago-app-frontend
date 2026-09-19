import {
  Box,
  Container,
  Grid,
  Group,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconMapPin, IconShieldCheck, IconSparkles } from '@tabler/icons-react';
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
    <Box>
      <Container size="lg" py={{ base: 'xl', md: 64 }}>
        <Grid gap={48} align="center">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="lg">
              <Title order={1} fz={{ base: 34, md: 46 }} lh={1.1}>
                Find the right{' '}
                <Text
                  span
                  inherit
                  variant="gradient"
                  gradient={{ from: 'teal', to: 'sky', deg: 45 }}
                >
                  integrative practitioner
                </Text>{' '}
                for you
              </Title>

              <Text size="lg" c="dimmed">
                Answer three short questions. We will suggest up to three
                practitioners near you — and tell you exactly why we picked each
                one.
              </Text>

              <List spacing="sm" size="sm" center>
                <List.Item
                  icon={
                    <ThemeIcon color="teal" size={26} radius="xl" variant="light">
                      <IconSparkles size={15} stroke={1.8} />
                    </ThemeIcon>
                  }
                >
                  Matched on your concerns, not just a keyword search
                </List.Item>
                <List.Item
                  icon={
                    <ThemeIcon color="indigo" size={26} radius="xl" variant="light">
                      <IconShieldCheck size={15} stroke={1.8} />
                    </ThemeIcon>
                  }
                >
                  Verified and partner practitioners are clearly badged
                </List.Item>
                <List.Item
                  icon={
                    <ThemeIcon color="plum" size={26} radius="xl" variant="light">
                      <IconMapPin size={15} stroke={1.8} />
                    </ThemeIcon>
                  }
                >
                  See them on a map before you reach out
                </List.Item>
              </List>

              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  No account needed.
                </Text>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <DiscoveryQuiz
              onSubmit={(payload) => recommend.mutate(payload)}
              isSubmitting={recommend.isPending}
              error={recommend.isError ? errorMessage(recommend.error) : null}
            />
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
