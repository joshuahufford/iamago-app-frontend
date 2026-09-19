import {
  Anchor,
  Avatar,
  Badge,
  Box,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconCheck,
  IconMapPin,
  IconPhone,
  IconVideo,
  IconWorld,
} from '@tabler/icons-react';

import type { Recommendation } from '@/api/types';
import { TIER_COLOR, TIER_LABEL } from '@/theme';

interface PractitionerCardProps {
  recommendation: Recommendation;
  active?: boolean;
  onHover?: (practitionerId: string | null) => void;
  onSelect?: (practitionerId: string) => void;
}

export function PractitionerCard({
  recommendation,
  active = false,
  onHover,
  onSelect,
}: PractitionerCardProps) {
  const { practitioner, rank, reasons } = recommendation;
  const tierLabel = TIER_LABEL[practitioner.tier];

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      data-testid={`practitioner-card-${practitioner.id}`}
      onMouseEnter={() => onHover?.(practitioner.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(practitioner.id)}
      style={{
        cursor: onSelect ? 'pointer' : undefined,
        borderColor: active ? 'var(--mantine-color-teal-6)' : undefined,
        borderWidth: active ? 2 : 1,
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap="sm" wrap="nowrap">
            <Avatar
              src={practitioner.photo_url || undefined}
              size={52}
              radius="md"
              color="teal"
            >
              {initials(practitioner.display_name)}
            </Avatar>
            <Box>
              <Group gap={6} align="baseline">
                <Title order={4}>{practitioner.display_name}</Title>
                {practitioner.credentials && (
                  <Text size="sm" c="dimmed">
                    {practitioner.credentials}
                  </Text>
                )}
              </Group>
              {practitioner.practice_name && (
                <Text size="sm" c="dimmed">
                  {practitioner.practice_name}
                </Text>
              )}
            </Box>
          </Group>

          <Badge variant="light" color="gray" size="lg">
            #{rank}
          </Badge>
        </Group>

        <Group gap="xs">
          {tierLabel && (
            <Badge color={TIER_COLOR[practitioner.tier]} variant="filled">
              {tierLabel}
            </Badge>
          )}
          {practitioner.modalities.slice(0, 3).map((modality) => (
            <Badge key={modality.id} variant="light" color="gray">
              {modality.name}
            </Badge>
          ))}
        </Group>

        <Stack gap={4}>
          {reasons.map((reason) => (
            <Group key={reason} gap={6} wrap="nowrap">
              <ThemeIcon size={16} radius="xl" color="teal" variant="light">
                <IconCheck size={11} stroke={3} />
              </ThemeIcon>
              <Text size="sm">{reason}</Text>
            </Group>
          ))}
        </Stack>

        <Group gap="lg" c="dimmed">
          {practitioner.city && (
            <Group gap={4} wrap="nowrap">
              <IconMapPin size={15} stroke={1.6} />
              <Text size="sm">
                {[practitioner.city, practitioner.region].filter(Boolean).join(', ')}
              </Text>
            </Group>
          )}
          {practitioner.offers_telehealth && (
            <Group gap={4} wrap="nowrap">
              <IconVideo size={15} stroke={1.6} />
              <Text size="sm">Telehealth</Text>
            </Group>
          )}
        </Group>

        <Group gap="lg">
          {practitioner.phone && (
            <Anchor href={`tel:${practitioner.phone}`} size="sm" onClick={stop}>
              <Group gap={4} wrap="nowrap">
                <IconPhone size={15} stroke={1.6} />
                {practitioner.phone}
              </Group>
            </Anchor>
          )}
          {practitioner.website && (
            <Anchor
              href={practitioner.website}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              onClick={stop}
            >
              <Group gap={4} wrap="nowrap">
                <IconWorld size={15} stroke={1.6} />
                Website
              </Group>
            </Anchor>
          )}
        </Group>
      </Stack>
    </Card>
  );
}

function stop(event: React.MouseEvent) {
  event.stopPropagation();
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}
