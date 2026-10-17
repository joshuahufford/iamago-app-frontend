import {
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { errorMessage, fieldErrors } from '@/api/client';
import { outreachApi } from '@/api/outreach';
import type { ContactRequestPayload, Practitioner } from '@/api/types';

interface ContactRequestModalProps {
  practitioner: Practitioner | null;
  requestId?: string;
  hasConcerns: boolean;
  onClose: () => void;
}

/**
 * Asking a practitioner to get in touch.
 *
 * Sharing the health concerns from the search is opt-in and off by default:
 * the patient's contact details are what the practitioner needs to reply, and
 * why someone is seeking care is theirs to volunteer.
 */
export function ContactRequestModal({
  practitioner,
  requestId,
  hasConcerns,
  onClose,
}: ContactRequestModalProps) {
  const [sent, setSent] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      share_concerns: false,
      consent: false,
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Tell them who is asking'),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
      consent: (value) => (value ? null : 'We can only pass your details on if you agree'),
    },
  });

  const send = useMutation({
    mutationFn: (payload: ContactRequestPayload) => outreachApi.requestContact(payload),
    onSuccess: () => setSent(true),
    onError: (error) => form.setErrors(fieldErrors(error)),
  });

  function handleClose() {
    onClose();
    // Reset after the modal has closed, so the content does not flicker.
    setTimeout(() => {
      setSent(false);
      form.reset();
      send.reset();
    }, 200);
  }

  const consentLabel = form.values.share_concerns
    ? `I agree that iamago may share my name, contact details and the health concerns I selected with ${practitioner?.display_name ?? 'this practitioner'}.`
    : `I agree that iamago may share my name and contact details with ${practitioner?.display_name ?? 'this practitioner'}.`;

  return (
    <Modal
      opened={practitioner !== null}
      onClose={handleClose}
      title={sent ? 'Request sent' : `Ask ${practitioner?.display_name ?? ''} to get in touch`}
      centered
      radius="lg"
      size="md"
    >
      {sent ? (
        <Stack gap="md">
          <Alert color="teal" variant="light" icon={<IconCheck size={18} />}>
            We have passed your details on. {practitioner?.display_name} should
            contact you directly, and we have emailed you a copy of what we shared.
          </Alert>
          <Button onClick={handleClose}>Done</Button>
        </Stack>
      ) : (
        <form
          onSubmit={form.onSubmit((values) =>
            send.mutate({
              practitioner: practitioner!.id,
              recommendation_request: requestId ?? null,
              name: values.name.trim(),
              email: values.email.trim(),
              phone: values.phone.trim(),
              message: values.message.trim(),
              share_concerns: values.share_concerns,
              consent: values.consent,
            }),
          )}
        >
          <Stack gap="sm">
            {send.isError && (
              <Alert color="red" variant="light">
                {errorMessage(send.error, 'We could not send that just now.')}
              </Alert>
            )}

            <TextInput required label="Your name" {...form.getInputProps('name')} />
            <TextInput
              required
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Phone"
              description="Optional — only if you would rather be called."
              {...form.getInputProps('phone')}
            />
            <Textarea
              label="Anything you want them to know"
              autosize
              minRows={3}
              {...form.getInputProps('message')}
            />

            {hasConcerns && (
              <Checkbox
                label="Share the concerns I selected"
                description="Off by default. They can still help without it."
                {...form.getInputProps('share_concerns', { type: 'checkbox' })}
              />
            )}

            <Checkbox
              label={consentLabel}
              {...form.getInputProps('consent', { type: 'checkbox' })}
            />

            <Text size="xs" c="dimmed">
              We keep a record of exactly what you agreed to here.
            </Text>

            <Group justify="flex-end" mt="xs">
              <Button variant="subtle" color="gray" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={send.isPending}>
                Send request
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
