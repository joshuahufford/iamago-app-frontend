import { Anchor, Box, Button, Container, Group } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/auth/useAuth';

/** Chrome for the pages a visitor can reach without an account. */
export function PublicLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <Box mih="100vh">
      <Box
        component="header"
        py="sm"
        style={{
          borderBottom: '1px solid var(--mantine-color-default-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--mantine-color-body)',
        }}
      >
        <Container size="lg">
          <Group justify="space-between">
            <Anchor component={Link} to="/" underline="never" c="inherit">
              <Logo height={34} />
            </Anchor>

            <Group gap="xs">
              <ColorSchemeToggle />
              {isAuthenticated ? (
                <Button component={Link} to="/dashboard" variant="subtle" color="gray">
                  My account
                </Button>
              ) : (
                <>
                  {/* Visitors here are patients, not customers: the account
                      links stay quiet rather than leading with a sign-up CTA. */}
                  <Button component={Link} to="/register" variant="subtle" color="gray" visibleFrom="xs">
                    For practitioners
                  </Button>
                  <Button component={Link} to="/login" variant="subtle" color="gray">
                    Sign in
                  </Button>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </Box>

      <Outlet />

      <Box
        component="footer"
        py="xl"
        mt="xl"
        style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
      >
        <Container size="lg">
          <Group justify="space-between" wrap="wrap">
            <Logo height={24} variant="mark" />
            <Group gap="lg">
              <Anchor component={Link} to="/" size="sm" c="dimmed">
                Find a practitioner
              </Anchor>
              <Anchor component={Link} to="/register" size="sm" c="dimmed">
                For practitioners
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
