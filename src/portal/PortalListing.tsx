import {
  Alert,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Loader,
  MultiSelect,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { directoryApi } from '@/api/directory';
import { errorMessage, fieldErrors } from '@/api/client';
import { portalApi } from '@/api/portal';
import type { PortalListingUpdate } from '@/api/types';

export function PortalListing() {
  const queryClient = useQueryClient();

  const listing = useQuery({ queryKey: ['portal', 'listing'], queryFn: portalApi.listing });
  const modalities = useQuery({ queryKey: ['modalities'], queryFn: directoryApi.modalities });
  const concerns = useQuery({ queryKey: ['concerns'], queryFn: directoryApi.concerns });

  const form = useForm<PortalListingUpdate>({ initialValues: {} });

  // Populate once the listing arrives; the form is the editable copy.
  useEffect(() => {
    if (!listing.data) return;
    form.setValues({
      display_name: listing.data.display_name,
      credentials: listing.data.credentials,
      practice_name: listing.data.practice_name,
      bio: listing.data.bio,
      website: listing.data.website,
      phone: listing.data.phone,
      email: listing.data.email,
      address_line1: listing.data.address_line1,
      city: listing.data.city,
      region: listing.data.region,
      postal_code: listing.data.postal_code,
      offers_telehealth: listing.data.offers_telehealth,
      accepting_new_patients: listing.data.accepting_new_patients,
      accepts_insurance: listing.data.accepts_insurance,
      modalities: listing.data.modalities.map((m) => m.id),
      concerns: listing.data.concerns.map((c) => c.id),
    });
    form.resetDirty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.data]);

  const save = useMutation({
    mutationFn: (values: PortalListingUpdate) => portalApi.updateListing(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['portal'] });
      notifications.show({ message: 'Listing updated.', color: 'green' });
    },
    onError: (error) => {
      form.setErrors(fieldErrors(error));
      notifications.show({ message: errorMessage(error), color: 'red' });
    },
  });

  if (listing.isPending) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg" maw={700}>
      <Stack gap={2}>
        <Title order={2}>My listing</Title>
        <Text c="dimmed">What patients see when you are recommended.</Text>
      </Stack>

      <Alert variant="light" color="gray" icon={<IconInfoCircle size={18} />}>
        <Text size="sm">
          Keeping <b>accepting new patients</b> accurate matters most — it is the
          first thing a patient acts on. Your tier and whether the listing is
          published are set by iamago, and your map position comes from your
          address, so ask us if you move.
        </Text>
      </Alert>

      <form onSubmit={form.onSubmit((values) => save.mutate(values))}>
        <Stack gap="md">
          <Card withBorder padding="lg" radius="md">
            <Stack gap="sm">
              <Group grow>
                <TextInput label="Display name" {...form.getInputProps('display_name')} />
                <TextInput
                  label="Credentials"
                  placeholder="LAc, ND, DC"
                  {...form.getInputProps('credentials')}
                />
              </Group>
              <TextInput label="Practice name" {...form.getInputProps('practice_name')} />
              <Textarea label="About you" autosize minRows={4} {...form.getInputProps('bio')} />
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Stack gap="sm">
              <MultiSelect
                label="Approaches you offer"
                data={(modalities.data ?? []).map((m) => ({ value: m.id, label: m.name }))}
                searchable
                {...form.getInputProps('modalities')}
              />
              <MultiSelect
                label="Concerns you treat"
                description="The strongest matching signal — the more accurate, the better your matches."
                data={(concerns.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
                searchable
                {...form.getInputProps('concerns')}
              />
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Stack gap="sm">
              <Checkbox
                label="Accepting new patients"
                {...form.getInputProps('accepting_new_patients', { type: 'checkbox' })}
              />
              <Checkbox
                label="I offer telehealth"
                {...form.getInputProps('offers_telehealth', { type: 'checkbox' })}
              />
              <Checkbox
                label="I accept insurance"
                {...form.getInputProps('accepts_insurance', { type: 'checkbox' })}
              />
            </Stack>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Stack gap="sm">
              <TextInput label="Address" {...form.getInputProps('address_line1')} />
              <Group grow>
                <TextInput label="City" {...form.getInputProps('city')} />
                <TextInput label="State" {...form.getInputProps('region')} />
                <TextInput label="Postal code" {...form.getInputProps('postal_code')} />
              </Group>
              <Group grow>
                <TextInput label="Phone" {...form.getInputProps('phone')} />
                <TextInput label="Email" {...form.getInputProps('email')} />
              </Group>
              <TextInput label="Website" {...form.getInputProps('website')} />
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button type="submit" loading={save.isPending}>
              Save changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
