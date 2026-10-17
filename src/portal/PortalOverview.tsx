import {
  Alert,
  Badge,
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { portalApi } from '@/api/portal';
import { TIER_COLOR, TIER_LABEL } from '@/theme';

const WINDOWS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
];

export function PortalOverview() {
  const [days, setDays] = useState('30');

  const stats = useQuery({
    queryKey: ['portal', 'stats', days],
    queryFn: () => portalApi.stats(Number(days)),
  });

  const listing = useQuery({
    queryKey: ['portal', 'listing'],
    queryFn: portalApi.listing,
  });

  const tier = listing.data?.tier;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={2}>
          <Group gap="xs">
            <Title order={2}>{listing.data?.display_name ?? 'Your listing'}</Title>
            {tier && TIER_LABEL[tier] && (
              <Badge color={TIER_COLOR[tier]} variant="filled">
                {TIER_LABEL[tier]}
              </Badge>
            )}
          </Group>
          <Text c="dimmed">How your listing performed.</Text>
        </Stack>

        <SegmentedControl value={days} onChange={setDays} data={WINDOWS} />
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Stat
          label="Shown in results"
          value={stats.data?.impressions}
          hint="Times you appeared as a recommendation"
        />
        <Stat
          label="Click-throughs"
          value={stats.data?.clicks}
          hint="Phone reveals and website opens"
        />
        <Stat
          label="Click rate"
          value={
            stats.data ? `${(stats.data.click_through_rate * 100).toFixed(1)}%` : undefined
          }
          hint="Clicks per time shown"
        />
        <Stat
          label="Enquiries"
          value={stats.data?.contact_requests}
          hint="People who asked you to get in touch"
          highlight={Boolean(stats.data?.new_contact_requests)}
          badge={
            stats.data?.new_contact_requests
              ? `${stats.data.new_contact_requests} new`
              : undefined
          }
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Stat label="Profile opened" value={stats.data?.profile_views} small />
        <Stat label="Phone revealed" value={stats.data?.phone_reveals} small />
        <Stat label="Website opened" value={stats.data?.website_clicks} small />
      </SimpleGrid>

      <Alert variant="light" color="gray" icon={<IconInfoCircle size={18} />}>
        <Text size="sm">
          These come from what we recorded when your listing was shown or clicked,
          not from anything reported by a browser. Enquiries are counted when
          someone asks you to contact them.
        </Text>
      </Alert>
    </Stack>
  );
}

function Stat({
  label,
  value,
  hint,
  badge,
  highlight = false,
  small = false,
}: {
  label: string;
  value: number | string | undefined;
  hint?: string;
  badge?: string;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <Card
      withBorder
      padding={small ? 'md' : 'lg'}
      radius="md"
      style={highlight ? { borderColor: 'var(--mantine-color-teal-6)' } : undefined}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        {badge && (
          <Badge color="teal" variant="light" size="sm">
            {badge}
          </Badge>
        )}
      </Group>
      <Text fw={650} fz={small ? 22 : 30} mt={4}>
        {value ?? '—'}
      </Text>
      {hint && (
        <Text size="xs" c="dimmed" mt={2}>
          {hint}
        </Text>
      )}
    </Card>
  );
}
