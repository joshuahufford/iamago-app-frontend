import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArrowRight,
  IconMailForward,
  IconSearch,
  IconSparkles,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { patientsApi } from '@/api/patients';
import type { ContactRequestStatus, SavedEnquiry, SavedSearch } from '@/api/types';
import { useAuth } from '@/auth/useAuth';

const ENQUIRY_STATUS: Record<ContactRequestStatus, { label: string; color: string }> = {
  new: { label: 'Sent', color: 'blue' },
  viewed: { label: 'Seen by them', color: 'teal' },
  responded: { label: 'They replied', color: 'green' },
  closed: { label: 'Closed', color: 'gray' },
};

/**
 * What a signed-in patient came back for: the searches they have run and the
 * practitioners they have asked to get in touch.
 */
export function DashboardPage() {
  const { user } = useAuth();

  const searches = useQuery({
    queryKey: ['patient', 'searches'],
    queryFn: patientsApi.searches,
  });
  const enquiries = useQuery({
    queryKey: ['patient', 'enquiries'],
    queryFn: patientsApi.enquiries,
  });

  const searchCount = searches.data?.count ?? 0;
  const enquiryCount = enquiries.data?.count ?? 0;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={2}>
          <Title order={2}>
            {user?.first_name ? `Welcome back, ${user.first_name}` : 'Your account'}
          </Title>
          <Text c="dimmed">Everything you have looked for, in one place.</Text>
        </Stack>
        <Button component={Link} to="/" leftSection={<IconSearch size={16} />}>
          New search
        </Button>
      </Group>

      <Tabs defaultValue="searches" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab
            value="searches"
            leftSection={<IconSparkles size={15} />}
            rightSection={
              searchCount ? (
                <Badge size="sm" variant="light" circle>
                  {searchCount}
                </Badge>
              ) : null
            }
          >
            Past searches
          </Tabs.Tab>
          <Tabs.Tab
            value="enquiries"
            leftSection={<IconMailForward size={15} />}
            rightSection={
              enquiryCount ? (
                <Badge size="sm" variant="light" circle>
                  {enquiryCount}
                </Badge>
              ) : null
            }
          >
            Practitioners I contacted
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="searches">
          {searches.isPending ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : searchCount ? (
            <Stack gap="sm">
              {searches.data?.results.map((search) => (
                <SearchRow key={search.id} search={search} />
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="No saved searches yet"
              body="Searches you run while signed in are saved here automatically. If you searched before signing up, open that link again and save it to your account."
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="enquiries">
          {enquiries.isPending ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : enquiryCount ? (
            <Stack gap="sm">
              {enquiries.data?.results.map((enquiry) => (
                <EnquiryRow key={enquiry.id} enquiry={enquiry} />
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="You have not contacted anyone yet"
              body="When you ask a practitioner to get in touch, you will be able to follow it here — including whether they have seen it."
            />
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function SearchRow({ search }: { search: SavedSearch }) {
  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={6}>
          <Group gap="xs">
            <Text fw={600}>{search.location_label || 'Somewhere'}</Text>
            <Text size="sm" c="dimmed">
              within {search.radius_miles} miles
            </Text>
          </Group>

          <Group gap={6}>
            {search.concerns.map((concern) => (
              <Badge key={concern.id} variant="light" color="gray" size="sm">
                {concern.name}
              </Badge>
            ))}
          </Group>

          <Text size="sm" c="dimmed">
            {search.result_count
              ? search.practitioner_names.join(' · ')
              : 'No matches at the time'}
          </Text>
        </Stack>

        <Stack gap={6} align="flex-end">
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            {new Date(search.created_at).toLocaleDateString()}
          </Text>
          {search.result_count > 0 && (
            <Button
              component={Link}
              to={`/recommendations/${search.id}?token=${encodeURIComponent(search.claim_token)}`}
              size="xs"
              variant="light"
              rightSection={<IconArrowRight size={14} />}
            >
              View
            </Button>
          )}
        </Stack>
      </Group>
    </Card>
  );
}

function EnquiryRow({ enquiry }: { enquiry: SavedEnquiry }) {
  const status = ENQUIRY_STATUS[enquiry.status];

  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={6}>
          <Group gap="xs">
            <Text fw={600}>{enquiry.practitioner_name}</Text>
            <Badge color={status.color} variant="light" size="sm">
              {status.label}
            </Badge>
          </Group>
          {enquiry.message && (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {enquiry.message}
            </Text>
          )}
          {/* What they agreed to, in the words they were shown. */}
          <Text size="xs" c="dimmed">
            You shared: {enquiry.share_concerns
              ? 'your contact details and the concerns you selected'
              : 'your contact details'}
          </Text>
        </Stack>
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          {new Date(enquiry.created_at).toLocaleDateString()}
        </Text>
      </Group>
    </Card>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card withBorder padding="xl" radius="md">
      <Stack align="center" gap="xs">
        <IconSearch size={30} stroke={1.3} color="var(--mantine-color-dimmed)" />
        <Text fw={600}>{title}</Text>
        <Text size="sm" c="dimmed" ta="center" maw={440}>
          {body}
        </Text>
        <Button component={Link} to="/" mt="sm" variant="light">
          Start a search
        </Button>
      </Stack>
    </Card>
  );
}
