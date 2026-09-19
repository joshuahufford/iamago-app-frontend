import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Center mih="60vh">
      <Stack align="center" gap="xs">
        <Text size="4rem" fw={700} c="dimmed">
          404
        </Text>
        <Title order={3}>Page not found</Title>
        <Text c="dimmed" ta="center" maw={360}>
          The page you are looking for doesn&apos;t exist or has moved.
        </Text>
        <Button component={Link} to="/" mt="md">
          Back to dashboard
        </Button>
      </Stack>
    </Center>
  );
}
