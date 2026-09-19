import {
  Alert,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconInfoCircle } from '@tabler/icons-react';

import { api } from '@/api/client';
import { useAuth } from '@/auth/useAuth';

interface HealthResponse {
  status: string;
  database: string;
}

export function DashboardPage() {
  const { user } = useAuth();

  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>('/health/');
      return data;
    },
    refetchInterval: 30_000,
  });

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2}>Dashboard</Title>
        <Text c="dimmed">
          Signed in as {user?.email}. This is the app shell — replace it with your
          first real feature.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <Card withBorder padding="lg" radius="md">
          <Text size="sm" c="dimmed">
            API status
          </Text>
          <Group gap="xs" mt="xs">
            <Badge color={health.data?.status === 'ok' ? 'green' : 'red'} variant="light">
              {health.isPending ? 'checking…' : (health.data?.status ?? 'unreachable')}
            </Badge>
          </Group>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Text size="sm" c="dimmed">
            Database
          </Text>
          <Group gap="xs" mt="xs">
            <Badge color={health.data?.database === 'ok' ? 'green' : 'red'} variant="light">
              {health.isPending ? 'checking…' : (health.data?.database ?? 'unreachable')}
            </Badge>
          </Group>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Text size="sm" c="dimmed">
            Member since
          </Text>
          <Text fw={600} size="lg" mt="xs">
            {user ? new Date(user.date_joined).toLocaleDateString() : '—'}
          </Text>
        </Card>
      </SimpleGrid>

      <Alert
        variant="light"
        color="blue"
        icon={<IconInfoCircle size={18} />}
        title="Next steps"
      >
        Add your domain models in the backend under <code>apps/</code>, expose them
        through DRF, then add a page here and a query in{' '}
        <code>src/api/</code> to render them.
      </Alert>
    </Stack>
  );
}
