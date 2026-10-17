import { Anchor, Box, Container, Group, NavLink } from '@mantine/core';
import { IconChartBar, IconInbox, IconUserEdit } from '@tabler/icons-react';
import { Link, NavLink as RouterNavLink, Outlet } from 'react-router-dom';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/auth/useAuth';

const TABS = [
  { label: 'Overview', to: '/portal', icon: IconChartBar, end: true },
  { label: 'Enquiries', to: '/portal/enquiries', icon: IconInbox, end: false },
  { label: 'My listing', to: '/portal/listing', icon: IconUserEdit, end: false },
];

export function PortalLayout() {
  const { logout } = useAuth();

  return (
    <Box mih="100vh">
      <Box
        component="header"
        py="sm"
        style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
      >
        <Container size="lg">
          <Group justify="space-between">
            <Group gap="md">
              <Anchor component={Link} to="/" underline="never" c="inherit">
                <Logo height={30} />
              </Anchor>
              <Box
                px={8}
                py={2}
                style={{
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'var(--mantine-color-teal-light)',
                  color: 'var(--mantine-color-teal-filled)',
                }}
              >
                Practitioner portal
              </Box>
            </Group>
            <Group gap="xs">
              <ColorSchemeToggle />
              <Anchor component="button" type="button" size="sm" c="dimmed" onClick={logout}>
                Sign out
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>

      <Container size="lg" py="lg">
        <Group gap="xs" mb="lg">
          {TABS.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              component={RouterNavLink}
              to={to}
              end={end}
              label={label}
              leftSection={<Icon size={16} stroke={1.6} />}
              w="auto"
              style={{ borderRadius: 999 }}
            />
          ))}
        </Group>

        <Outlet />
      </Container>
    </Box>
  );
}
