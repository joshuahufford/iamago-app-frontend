import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { directoryApi } from '@/api/directory';
import type { RecommendationPayload } from '@/api/types';

const STEPS = ['concerns', 'modalities', 'location'] as const;
type Step = (typeof STEPS)[number];

const RADIUS_OPTIONS = [
  { value: '10', label: 'Within 10 miles' },
  { value: '25', label: 'Within 25 miles' },
  { value: '50', label: 'Within 50 miles' },
  { value: '100', label: 'Within 100 miles' },
];

/**
 * Cycled over the answer chips so a filled-in question picks up the muted
 * multicolour of the logo mark. Outline chips colour only their border and
 * tick, so the label keeps full-contrast body colour in either theme.
 */
const ACCENTS = ['teal', 'plum', 'sky', 'coral', 'indigo', 'pink'] as const;

/**
 * Mantine's `dimmed` lands at 3.3:1 on white. That is fine for a caption but
 * not here, where the quiet copy is most of the page, so each scheme steps one
 * shade further from the background to clear AA without flattening the
 * hierarchy against the heading.
 */
const QUIET = 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1))';

interface DiscoveryQuizProps {
  onSubmit: (payload: RecommendationPayload) => void;
  isSubmitting: boolean;
  error?: string | null;
  /**
   * Set once the free daily allowance is spent. The email field only appears
   * then — the promise on the landing page is that you need no account, and
   * asking upfront would break it for the people it was made to.
   */
  requiresEmail?: boolean;
}

/**
 * Three short steps rather than one long form: concerns first because most
 * people know their problem but not the modality that treats it, then an
 * optional approach preference, then location.
 *
 * Rendered as the whole page rather than a card — the first question is the
 * homepage, so the question carries the page's typography.
 */
export function DiscoveryQuiz({
  onSubmit,
  isSubmitting,
  error,
  requiresEmail = false,
}: DiscoveryQuizProps) {
  const [step, setStep] = useState<Step>('concerns');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('25');
  const [includeTelehealth, setIncludeTelehealth] = useState(true);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

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

  // Each step swaps the page's only heading, so send focus there once the
  // visitor has moved — never on load, where it would skip past the header.
  useEffect(() => {
    if (hasMoved) headingRef.current?.focus();
  }, [step, hasMoved]);

  function handleNext() {
    setHasMoved(true);
    if (step === 'concerns') setStep('modalities');
    else if (step === 'modalities') setStep('location');
  }

  function handleBack() {
    setHasMoved(true);
    if (step === 'location') setStep('modalities');
    else if (step === 'modalities') setStep('concerns');
  }

  function handleSubmit() {
    if (!location.trim()) {
      setLocationError('Enter a city or postal code.');
      return;
    }
    if (requiresEmail && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError('Enter a valid email to keep searching.');
      return;
    }
    setLocationError(null);
    setEmailError(null);
    onSubmit({
      concerns,
      modalities,
      location_label: location.trim(),
      radius_miles: Number(radius),
      include_telehealth: includeTelehealth,
      accepting_new_patients_only: acceptingOnly,
      ...(requiresEmail ? { email: email.trim() } : {}),
    });
  }

  const canAdvance = step === 'concerns' ? concerns.length > 0 : true;
  const heading =
    step === 'concerns'
      ? 'What brings you here?'
      : step === 'modalities'
        ? 'Any approach in mind?'
        : 'Where are you looking?';
  const subheading =
    step === 'concerns'
      ? 'Pick anything that applies. You will get up to three integrative practitioners near you, and the reason each one came up.'
      : step === 'modalities'
        ? 'Optional. Skip it and we will suggest approaches that suit what you told us.'
        : 'A city or postal code is enough.';

  return (
    <Stack gap={44} align="center" w="100%">
      {error && (
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertCircle size={18} />}
          w="100%"
          maw={520}
        >
          {error}
        </Alert>
      )}

      <Stack gap="sm" align="center">
        <Title
          ref={headingRef}
          tabIndex={-1}
          order={1}
          ta="center"
          fw={560}
          fz={{ base: 30, sm: 38, md: 42 }}
          lh={1.15}
          style={{ letterSpacing: '-0.025em', outlineOffset: 8 }}
        >
          {heading}
        </Title>
        <Text c={QUIET} ta="center" maw={460} fz={{ base: 'sm', sm: 'md' }}>
          {subheading}
        </Text>
      </Stack>

      {step === 'concerns' &&
        (concernsQuery.isPending ? (
          <Loader my="xl" />
        ) : (
          <Chip.Group multiple value={concerns} onChange={setConcerns}>
            <Group gap="xs" justify="center">
              {concernsQuery.data?.map((concern, index) => (
                <Chip
                  key={concern.id}
                  value={concern.id}
                  variant="outline"
                  size="md"
                  color={ACCENTS[index % ACCENTS.length]}
                >
                  {concern.name}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        ))}

      {step === 'modalities' &&
        (modalitiesQuery.isPending ? (
          <Loader my="xl" />
        ) : (
          <Chip.Group multiple value={modalities} onChange={setModalities}>
            <Group gap="xs" justify="center">
              {modalitiesQuery.data?.map((modality, index) => (
                <Chip
                  key={modality.id}
                  value={modality.id}
                  variant="outline"
                  size="md"
                  color={ACCENTS[index % ACCENTS.length]}
                >
                  {modality.name}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        ))}

      {step === 'location' && (
        <Stack gap="md" w="100%" maw={380}>
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
            leftSection={<IconSearch size={16} stroke={1.6} />}
          />

          <Select
            label="Search radius"
            data={RADIUS_OPTIONS}
            value={radius}
            onChange={(value) => setRadius(value ?? '25')}
            allowDeselect={false}
            size="md"
          />

          {requiresEmail && (
            <TextInput
              required
              label="Your email"
              type="email"
              placeholder="you@example.com"
              size="md"
              value={email}
              error={emailError}
              description="You have used today's free searches. Add an email to keep going."
              onChange={(event) => {
                setEmail(event.currentTarget.value);
                setEmailError(null);
              }}
            />
          )}

          <Stack gap="xs" mt={4}>
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
        </Stack>
      )}

      <Stack gap={28} align="center">
        <Group gap="xs" justify="center">
          {stepIndex > 0 && (
            <Button
              variant="subtle"
              color="gray"
              radius="xl"
              size="md"
              leftSection={<IconArrowLeft size={16} stroke={1.6} />}
              onClick={handleBack}
            >
              Back
            </Button>
          )}

          {step === 'location' ? (
            <Button size="md" radius="xl" px={28} onClick={handleSubmit} loading={isSubmitting}>
              Find my matches
            </Button>
          ) : (
            <Button size="md" radius="xl" px={28} onClick={handleNext} disabled={!canAdvance}>
              {step === 'modalities' && modalities.length === 0 ? 'Skip' : 'Continue'}
            </Button>
          )}
        </Group>

        {step === 'location' && (
          <Text size="xs" c={QUIET} ta="center" maw={420}>
            {requiresEmail
              ? // Claiming "no account needed" while asking for an email would
                // be a lie, so say what the email is actually for.
                'We use this to keep the directory from being scraped. Still no account, and your matches keep their own link.'
              : 'No account needed. Your matches get their own link to keep or pass on.'}
          </Text>
        )}

        <Group
          gap={6}
          justify="center"
          role="progressbar"
          aria-label="Question progress"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={stepIndex + 1}
          aria-valuetext={`Question ${stepIndex + 1} of ${STEPS.length}`}
        >
          {STEPS.map((name, index) => (
            <Box
              key={name}
              w={index === stepIndex ? 28 : 16}
              h={2}
              bg={
                index <= stepIndex
                  ? 'var(--mantine-color-teal-filled)'
                  : 'var(--mantine-color-default-border)'
              }
              style={{ borderRadius: 2, transition: 'width 150ms ease' }}
            />
          ))}
        </Group>
      </Stack>

      {/* Shown instead of a benefits list: the directory's real coverage, so a
          visitor can judge it rather than take a claim on trust. */}
      {step === 'concerns' && modalitiesQuery.data && modalitiesQuery.data.length > 0 && (
        <Stack gap={6} align="center" maw={580} mt={28}>
          <Divider w={48} mb="md" />
          <Text size="xs" c={QUIET} ta="center">
            Practitioners in the directory work in
          </Text>
          <Text size="sm" c={QUIET} ta="center" lh={1.8}>
            {modalitiesQuery.data.map((modality) => modality.name).join(' · ')}
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
