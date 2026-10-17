import {
  Button,
  Card,
  Divider,
  Group,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth';
import { errorMessage, fieldErrors } from '@/api/client';
import type { UpdateProfilePayload } from '@/api/types';
import { useAuth } from '@/auth/useAuth';

export function ProfilePage() {
  const { user, setUser } = useAuth();

  const profileForm = useForm({
    initialValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      bio: user?.profile.bio ?? '',
      timezone: user?.profile.timezone ?? 'UTC',
      theme: user?.profile.theme ?? 'auto',
    },
  });

  const passwordForm = useForm({
    initialValues: { current_password: '', new_password: '', confirm_password: '' },
    validate: {
      new_password: (value) =>
        value.length >= 8 ? null : 'Password must be at least 8 characters',
      confirm_password: (value, values) =>
        value === values.new_password ? null : 'Passwords do not match',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateMe(payload),
    onSuccess: (updated) => {
      setUser(updated);
      notifications.show({ message: 'Profile updated.', color: 'green' });
    },
    onError: (error) => reportError(error, profileForm.setErrors),
  });

  const changePassword = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      passwordForm.reset();
      notifications.show({ message: 'Password changed.', color: 'green' });
    },
    onError: (error) => reportError(error, passwordForm.setErrors),
  });

  return (
    <Stack gap="lg" maw={640}>
      <Stack gap={4}>
        <Title order={2}>Profile</Title>
        <Text c="dimmed">Manage your account details and password.</Text>
      </Stack>

      <Card withBorder padding="lg" radius="md">
        <form
          onSubmit={profileForm.onSubmit((values) =>
            updateProfile.mutate({
              first_name: values.first_name,
              last_name: values.last_name,
              profile: {
                bio: values.bio,
                timezone: values.timezone,
                theme: values.theme as 'light' | 'dark' | 'auto',
              },
            }),
          )}
        >
          <Stack>
            <TextInput label="Email" value={user?.email ?? ''} disabled />
            <Group grow>
              <TextInput label="First name" {...profileForm.getInputProps('first_name')} />
              <TextInput label="Last name" {...profileForm.getInputProps('last_name')} />
            </Group>
            <Textarea
              label="Bio"
              autosize
              minRows={3}
              {...profileForm.getInputProps('bio')}
            />
            <Group grow>
              <TextInput label="Timezone" {...profileForm.getInputProps('timezone')} />
              <Select
                label="Preferred theme"
                data={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
                allowDeselect={false}
                {...profileForm.getInputProps('theme')}
              />
            </Group>
            <Group justify="flex-end">
              <Button type="submit" loading={updateProfile.isPending}>
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Title order={4}>Change password</Title>
        <Divider my="md" />
        <form
          onSubmit={passwordForm.onSubmit((values) =>
            changePassword.mutate({
              current_password: values.current_password,
              new_password: values.new_password,
            }),
          )}
        >
          <Stack>
            <PasswordInput
              required
              label="Current password"
              autoComplete="current-password"
              {...passwordForm.getInputProps('current_password')}
            />
            <PasswordInput
              required
              label="New password"
              autoComplete="new-password"
              {...passwordForm.getInputProps('new_password')}
            />
            <PasswordInput
              required
              label="Confirm new password"
              autoComplete="new-password"
              {...passwordForm.getInputProps('confirm_password')}
            />
            <Group justify="flex-end">
              <Button type="submit" loading={changePassword.isPending}>
                Update password
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}

/**
 * Puts field-level errors on the inputs that caused them, and only falls back
 * to a toast when the failure has nothing to attach to (auth, network, 500s).
 */
function reportError(error: unknown, setErrors: (errors: Record<string, string>) => void) {
  const fields = fieldErrors(error);
  setErrors(fields);
  if (Object.keys(fields).length === 0) {
    notifications.show({ message: errorMessage(error), color: 'red' });
  }
}
