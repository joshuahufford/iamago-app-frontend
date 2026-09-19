import { Alert, Box, Card, Group, Stack, Text } from '@mantine/core';
import { AdvancedMarker, APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { IconMapPin } from '@tabler/icons-react';
import { useEffect } from 'react';

import type { Recommendation } from '@/api/types';

interface ResultsMapProps {
  apiKey: string;
  recommendations: Recommendation[];
  center: { lat: number; lng: number };
  activeId: string | null;
  onSelect: (practitionerId: string) => void;
  height?: number | string;
}

/**
 * Airbnb-style result map: it plots only the practitioners we actually
 * recommended, never the whole directory, so the map never implies choices the
 * flow did not make.
 */
export function ResultsMap({
  apiKey,
  recommendations,
  center,
  activeId,
  onSelect,
  height = 420,
}: ResultsMapProps) {
  const pins = recommendations.filter(
    (r) => r.practitioner.latitude !== null && r.practitioner.longitude !== null,
  );

  if (!apiKey) {
    return <MapUnavailable count={pins.length} height={height} />;
  }

  return (
    <Box h={height} style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={11}
          mapId="iamago-results"
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        >
          <FitToPins pins={pins} center={center} />
          {pins.map((recommendation) => (
            <AdvancedMarker
              key={recommendation.practitioner.id}
              position={{
                lat: recommendation.practitioner.latitude as number,
                lng: recommendation.practitioner.longitude as number,
              }}
              onClick={() => onSelect(recommendation.practitioner.id)}
              title={recommendation.practitioner.display_name}
            >
              <PriceStylePin
                label={`#${recommendation.rank}`}
                name={recommendation.practitioner.display_name}
                active={activeId === recommendation.practitioner.id}
                preferred={recommendation.practitioner.is_preferred}
              />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </Box>
  );
}

/** Frames the map on the recommendations rather than a guessed zoom level. */
function FitToPins({
  pins,
  center,
}: {
  pins: Recommendation[];
  center: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || pins.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(center);
    pins.forEach((recommendation) =>
      bounds.extend({
        lat: recommendation.practitioner.latitude as number,
        lng: recommendation.practitioner.longitude as number,
      }),
    );
    map.fitBounds(bounds, 64);
  }, [map, pins, center]);

  return null;
}

/** A compact label pin, closer to Airbnb's than to a default map marker. */
function PriceStylePin({
  label,
  name,
  active,
  preferred,
}: {
  label: string;
  name: string;
  active: boolean;
  preferred: boolean;
}) {
  return (
    <Box
      px={10}
      py={4}
      style={{
        background: active
          ? 'var(--mantine-color-teal-6)'
          : 'var(--mantine-color-body)',
        color: active ? '#fff' : 'var(--mantine-color-text)',
        border: `2px solid ${
          preferred ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-default-border)'
        }`,
        borderRadius: 999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transform: active ? 'scale(1.06)' : undefined,
        transition: 'transform 120ms ease',
      }}
    >
      {label} · {name.split(' ')[0]}
    </Box>
  );
}

/**
 * Shown when no browser Maps key is configured. The results themselves are
 * unaffected — only the map is missing — so this states that plainly rather
 * than looking like a failure.
 */
function MapUnavailable({ count, height }: { count: number; height: number | string }) {
  return (
    <Card withBorder padding="lg" radius="md" h={height}>
      <Stack justify="center" align="center" h="100%" gap="xs">
        <IconMapPin size={28} stroke={1.5} color="var(--mantine-color-dimmed)" />
        <Text fw={600}>Map view unavailable</Text>
        <Text size="sm" c="dimmed" ta="center" maw={320}>
          Add a Google Maps browser key to see your{' '}
          {count === 1 ? 'match' : `${count} matches`} plotted here. Your
          recommendations are listed in full either way.
        </Text>
        <Alert variant="light" color="gray" mt="sm" p="xs">
          <Group gap={6} wrap="nowrap">
            <Text size="xs" c="dimmed">
              Set <code>GOOGLE_MAPS_BROWSER_KEY</code> on the backend.
            </Text>
          </Group>
        </Alert>
      </Stack>
    </Card>
  );
}
