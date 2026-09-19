import {
  Alert,
  Button,
  Card,
  Checkbox,
  Chip,
  Group,
  Loader,
  Progress,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { directoryApi } from '@/api/directory';
import type { RecommendationPayload } from '@/api/types';

const STEPS = ['concerns', 'modalities', 'location'] as const;
type Step = (typeof STEPS)[number];

const RADIUS_OPTIONS = [
  { value: '15', label: 'Within 15 km' },
  { value: '40', label: 'Within 40 km' },
  { value: '80', label: 'Within 80 km' },
  { value: '160', label: 'Within 160 km' },
];

interface DiscoveryQuizProps {
  onSubmit: (payload: RecommendationPayload) => void;
  isSubmitting: boolean;
  error?: string | null;
}

/**
 * Three short steps rather than one long form: concerns first because most
 * people know their problem but not the modality that treats it, then an
 * optional approach preference, then location.
 */
export function DiscoveryQuiz({ onSubmit, isSubmitting, error }: DiscoveryQuizProps) {
  const [step, setStep] = useState<Step>('concerns');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('40');
  const [includeTelehealth, setIncludeTelehealth] = useState(true);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const concernsQuery = useQuery({
    queryKey: ['concerns'],
    queryFn: directoryApi.concerns,
    staleTime: 5 * 60_000,
  });
  const modalitiesQuery = useQuery({
    queryKey: ['modalities'],
    queryFn: directoryApi.modalities,
    staleTime: 5 * 60_000,
  });

  const stepIndex = STEPS.indexOf(step);

  function handleNext() {
    if (step === 'concerns') setStep('modalities');
    else if (step === 'modalities') setStep('location');
  }

  function handleBack() {
    if (step === 'location') setStep('modalities');
    else if (step === 'modalities') setStep('concerns');
  }

  function handleSubmit() {
    if (!location.trim()) {
      setLocationError('Enter a city or postal code.');
      return;
    }
    setLocationError(null);
    onSubmit({
      concerns,
      modalities,
      location_label: location.trim(),
      radius_km: Number(radius),
      include_telehealth: includeTelehealth,
      accepting_new_patients_only: acceptingOnly,
    });
  }

  const canAdvance = step === 'concerns' ? concerns.length > 0 : true;

  return (
    <Card withBorder padding="xl" radius="lg" shadow="sm">
      <Stack gap="lg">
        <Progress
          value={((stepIndex + 1) / STEPS.length) * 100}
          size="sm"
          radius="xl"
          aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}
        />

        {error && (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
            {error}
          </Alert>
        )}

        {step === 'concerns' && (
          <Stack gap="md">
            <Stack gap={2}>
              <Title order={3}>What brings you here?</Title>
              <Text c="dimmed" size="sm">
                Pick everything that applies. This matters most to your matches.
              </Text>
            </Stack>

            {concernsQuery.isPending ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : (
              <Chip.Group multiple value={concerns} onChange={setConcerns}>
                <Group gap="xs">
                  {concernsQuery.data?.map((concern) => (
                    <Chip key={concern.id} value={concern.id} variant="outline" size="md">
                      {concern.name}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            )}
          </Stack>
        )}

        {step === 'modalities' && (
          <Stack gap="md">
            <Stack gap={2}>
              <Title order={3}>Any approach in mind?</Title>
              <Text c="dimmed" size="sm">
                Optional — skip this and we will suggest approaches that suit
                what you told us.
              </Text>
            </Stack>

            {modalitiesQuery.isPending ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : (
              <Chip.Group multiple value={modalities} onChange={setModalities}>
                <Group gap="xs">
                  {modalitiesQuery.data?.map((modality) => (
                    <Chip key={modality.id} value={modality.id} variant="outline" size="md">
                      {modality.name}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            )}
          </Stack>
        )}

        {step === 'location' && (
          <Stack gap="md">
            <Stack gap={2}>
              <Title order={3}>Where are you looking?</Title>
              <Text c="dimmed" size="sm">
                A city or postal code is enough.
              </Text>
            </Stack>

            <TextInput
              label="Location"
              placeholder="Austin, TX"
              size="md"
              value={location}
              error={locationError}
              onChange={(event) => {
                setLocation(event.currentTarget.value);
                setLocationError(null);
              }}
              onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
              leftSection={<IconSearch size={16} />}
            />

            <Select
              label="Search radius"
              data={RADIUS_OPTIONS}
              value={radius}
              onChange={(value) => setRadius(value ?? '40')}
              allowDeselect={false}
              size="md"
            />

            <Checkbox
              label="Include practitioners who offer telehealth"
              checked={includeTelehealth}
              onChange={(event) => setIncludeTelehealth(event.currentTarget.checked)}
            />
            <Checkbox
              label="Only show practitioners accepting new patients"
              checked={acceptingOnly}
              onChange={(event) => setAcceptingOnly(event.currentTarget.checked)}
            />
          </Stack>
        )}

        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
            disabled={stepIndex === 0}
          >
            Back
          </Button>

          {step === 'location' ? (
            <Button size="md" onClick={handleSubmit} loading={isSubmitting}>
              Find my matches
            </Button>
          ) : (
            <Button size="md" onClick={handleNext} disabled={!canAdvance}>
              {step === 'modalities' && modalities.length === 0 ? 'Skip' : 'Continue'}
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
