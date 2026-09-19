import {
  Alert,
  Anchor,
  Button,
  Card,
  Center,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { errorMessage, fieldErrors } from '@/api/client';
import { useAuth } from '@/auth/useAuth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirm: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
      password: (value) =>
        value.length >= 8 ? null : 'Password must be at least 8 characters',
      password_confirm: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setFormError(null);
    setSubmitting(true);
    try {
      await register(values);
      navigate('/', { replace: true });
    } catch (error) {
      form.setErrors(fieldErrors(error));
      setFormError(errorMessage(error, 'Could not create your account.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Center mih="100vh" px="md" py="xl">
      <Stack w="100%" maw={460} gap="lg">
        <Stack gap={4} align="center">
          <Title order={2}>Create your account</Title>
          <Text c="dimmed" size="sm">
            Get started with iamago
          </Text>
        </Stack>

        <Card withBorder padding="lg" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
            <Stack>
              {formError && (
                <Alert
                  color="red"
                  variant="light"
                  icon={<IconAlertCircle size={18} />}
                  title="Registration failed"
                >
                  {formError}
                </Alert>
              )}

              <Group grow>
                <TextInput
                  label="First name"
                  placeholder="Ada"
                  autoComplete="given-name"
                  {...form.getInputProps('first_name')}
                />
                <TextInput
                  label="Last name"
                  placeholder="Lovelace"
                  autoComplete="family-name"
                  {...form.getInputProps('last_name')}
                />
              </Group>

              <TextInput
                required
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...form.getInputProps('email')}
              />
              <PasswordInput
                required
                label="Password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...form.getInputProps('password')}
              />
              <PasswordInput
                required
                label="Confirm password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                {...form.getInputProps('password_confirm')}
              />

              <Button type="submit" loading={submitting} fullWidth mt="xs">
                Create account
              </Button>
            </Stack>
          </form>
        </Card>

        <Text size="sm" ta="center" c="dimmed">
          Already have an account?{' '}
          <Anchor component={Link} to="/login">
            Sign in
          </Anchor>
        </Text>
      </Stack>
    </Center>
  );
}
