import {
  Alert,
  Anchor,
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { errorMessage, fieldErrors } from '@/api/client';
import { useAuth } from '@/auth/useAuth';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setFormError(null);
    setSubmitting(true);
    try {
      await login(values);
      const destination = (location.state as LocationState | null)?.from?.pathname ?? '/';
      navigate(destination, { replace: true });
    } catch (error) {
      form.setErrors(fieldErrors(error));
      setFormError(errorMessage(error, 'Incorrect email or password.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Center mih="100vh" px="md">
      <Stack w="100%" maw={420} gap="lg">
        <Stack gap={4} align="center">
          <Title order={2}>Welcome back</Title>
          <Text c="dimmed" size="sm">
            Sign in to your iamago account
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
                  title="Sign in failed"
                >
                  {formError}
                </Alert>
              )}

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
                placeholder="Your password"
                autoComplete="current-password"
                {...form.getInputProps('password')}
              />

              <Button type="submit" loading={submitting} fullWidth mt="xs">
                Sign in
              </Button>
            </Stack>
          </form>
        </Card>

        <Text size="sm" ta="center" c="dimmed">
          Don&apos;t have an account?{' '}
          <Anchor component={Link} to="/register">
            Create one
          </Anchor>
        </Text>
      </Stack>
    </Center>
  );
}
