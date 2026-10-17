import { Button, Group, Popover, Stack, Text, TextInput } from '@mantine/core';
import { IconCheck, IconMailForward } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { errorMessage } from '@/api/client';
import { outreachApi } from '@/api/outreach';

interface EmailMatchesButtonProps {
  requestId: string;
  token: string;
}

/**
 * Mail these matches to the visitor.
 *
 * The claim token is what authorises the send, so nobody can have someone
 * else's results mailed anywhere — and we do not keep the address afterwards.
 */
export function EmailMatchesButton({ requestId, token }: EmailMatchesButtonProps) {
  const [opened, setOpened] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: () => outreachApi.emailMatches(requestId, token, email.trim()),
    onError: (mutationError) => setError(errorMessage(mutationError)),
  });

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      width={300}
      withArrow
      trapFocus
    >
      <Popover.Target>
        <Button
          variant="default"
          leftSection={<IconMailForward size={16} />}
          onClick={() => setOpened((value) => !value)}
        >
          Email these to me
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        {send.isSuccess ? (
          <Group gap="xs">
            <IconCheck size={16} color="var(--mantine-color-teal-6)" />
            <Text size="sm">Sent. Check your inbox.</Text>
          </Group>
        ) : (
          <Stack gap="xs">
            <TextInput
              label="Where should we send them?"
              placeholder="you@example.com"
              type="email"
              value={email}
              error={error}
              onChange={(event) => {
                setEmail(event.currentTarget.value);
                setError(null);
              }}
            />
            <Button
              size="xs"
              loading={send.isPending}
              onClick={() => {
                if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
                  setError('Enter a valid email');
                  return;
                }
                send.mutate();
              }}
            >
              Send
            </Button>
          </Stack>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
