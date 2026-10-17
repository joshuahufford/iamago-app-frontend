import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInbox, IconMail, IconPhone } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { errorMessage } from '@/api/client';
import { portalApi } from '@/api/portal';
import type { ContactRequestStatus, PortalContactRequest } from '@/api/types';

const STATUS_COLOR: Record<ContactRequestStatus, string> = {
  new: 'teal',
  viewed: 'blue',
  responded: 'green',
  closed: 'gray',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'responded', label: 'Responded' },
  { value: 'closed', label: 'Closed' },
];

export function PortalEnquiries() {
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const enquiries = useQuery({
    queryKey: ['portal', 'enquiries', filter],
    queryFn: () => portalApi.contactRequests(filter === 'all' ? undefined : filter),
  });

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={2}>
          <Title order={2}>Enquiries</Title>
          <Text c="dimmed">People who asked you to get in touch.</Text>
        </Stack>
        <SegmentedControl value={filter} onChange={setFilter} data={FILTERS} />
      </Group>

      {enquiries.isPending ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : enquiries.data?.results.length ? (
        <Stack gap="sm">
          {enquiries.data.results.map((enquiry) => (
            <EnquiryRow key={enquiry.id} enquiry={enquiry} onOpen={() => setOpenId(enquiry.id)} />
          ))}
        </Stack>
      ) : (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" gap="xs">
            <IconInbox size={30} stroke={1.3} color="var(--mantine-color-dimmed)" />
            <Text fw={600}>Nothing here yet</Text>
            <Text size="sm" c="dimmed" ta="center" maw={380}>
              When someone asks you to contact them, it will appear here and we
              will email you straight away.
            </Text>
          </Stack>
        </Card>
      )}

      <EnquiryModal id={openId} onClose={() => setOpenId(null)} />
    </Stack>
  );
}

function EnquiryRow({
  enquiry,
  onOpen,
}: {
  enquiry: PortalContactRequest;
  onOpen: () => void;
}) {
  return (
    <Card withBorder padding="md" radius="md" style={{ cursor: 'pointer' }} onClick={onOpen}>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4}>
          <Group gap="xs">
            <Text fw={600}>{enquiry.name}</Text>
            <Badge color={STATUS_COLOR[enquiry.status]} variant="light" size="sm">
              {enquiry.status}
            </Badge>
          </Group>
          {enquiry.message && (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {enquiry.message}
            </Text>
          )}
          <Group gap="lg" c="dimmed">
            <Group gap={4} wrap="nowrap">
              <IconMail size={14} stroke={1.6} />
              <Text size="xs">{enquiry.email}</Text>
            </Group>
            {enquiry.phone && (
              <Group gap={4} wrap="nowrap">
                <IconPhone size={14} stroke={1.6} />
                <Text size="xs">{enquiry.phone}</Text>
              </Group>
            )}
          </Group>
        </Stack>
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          {new Date(enquiry.created_at).toLocaleDateString()}
        </Text>
      </Group>
    </Card>
  );
}

function EnquiryModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  // Fetching the detail is what records the access server-side, so it only
  // happens when a practitioner actually opens one.
  const enquiry = useQuery({
    queryKey: ['portal', 'enquiry', id],
    queryFn: () => portalApi.contactRequest(id as string),
    enabled: id !== null,
  });

  const update = useMutation({
    mutationFn: (payload: { status?: string; practitioner_note?: string }) =>
      portalApi.updateContactRequest(id as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['portal'] });
      notifications.show({ message: 'Enquiry updated.', color: 'green' });
      onClose();
    },
    onError: (error) =>
      notifications.show({ message: errorMessage(error), color: 'red' }),
  });

  const data = enquiry.data;

  return (
    <Modal opened={id !== null} onClose={onClose} title="Enquiry" centered radius="lg" size="md">
      {enquiry.isPending || !data ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <Stack gap="sm">
          <Group gap="xs">
            <Text fw={650} fz="lg">
              {data.name}
            </Text>
            <Badge color={STATUS_COLOR[data.status]} variant="light">
              {data.status}
            </Badge>
          </Group>

          <Stack gap={2}>
            <Text size="sm">{data.email}</Text>
            {data.phone && <Text size="sm">{data.phone}</Text>}
            {data.search_location && (
              <Text size="sm" c="dimmed">
                Searching near {data.search_location}
              </Text>
            )}
          </Stack>

          {data.message && (
            <Card withBorder padding="sm" radius="md">
              <Text size="sm">{data.message}</Text>
            </Card>
          )}

          {data.share_concerns && data.concerns.length > 0 && (
            <Group gap="xs">
              {data.concerns.map((concern) => (
                <Badge key={concern.id} variant="light" color="gray">
                  {concern.name}
                </Badge>
              ))}
            </Group>
          )}

          {!data.share_concerns && (
            <Alert variant="light" color="gray" p="xs">
              <Text size="xs">
                This person chose not to share what they are seeking care for.
              </Text>
            </Alert>
          )}

          <Textarea
            label="Private note"
            placeholder="Only you see this."
            autosize
            minRows={2}
            value={note || data.practitioner_note}
            onChange={(event) => setNote(event.currentTarget.value)}
          />

          <Group justify="space-between" mt="xs">
            <Button
              variant="subtle"
              color="gray"
              loading={update.isPending}
              onClick={() =>
                update.mutate({ status: 'closed', practitioner_note: note || data.practitioner_note })
              }
            >
              Close enquiry
            </Button>
            <Button
              loading={update.isPending}
              onClick={() =>
                update.mutate({
                  status: 'responded',
                  practitioner_note: note || data.practitioner_note,
                })
              }
            >
              Mark as responded
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
