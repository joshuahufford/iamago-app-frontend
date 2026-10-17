import { Alert, Button, Center, Container, Loader, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';

import { portalApi } from '@/api/portal';
import { useAuth } from '@/auth/useAuth';

/**
 * The portal needs more than a signed-in user: the account has to be linked to
 * a listing. That link is the authorisation — everything below is scoped to it
 * server-side — so an unlinked account gets an explanation rather than an
 * empty dashboard.
 */
export function PortalGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const listing = useQuery({
    queryKey: ['portal', 'listing'],
    queryFn: portalApi.listing,
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || (isAuthenticated && listing.isPending)) {
    return (
      <Center mih="60vh">
        <Loader />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (listing.isError) {
    return (
      <Container size="sm" py="xl">
        <Stack gap="md">
          <Alert color="yellow" variant="light" title="No listing linked to this account">
            <Text size="sm">
              This account is not linked to a practitioner listing yet. If you
              practise and would like to be listed, get in touch and we will set
              it up.
            </Text>
          </Alert>
          <Button component={Link} to="/" w="fit-content" variant="light">
            Back to iamago
          </Button>
        </Stack>
      </Container>
    );
  }

  return <Outlet />;
}
