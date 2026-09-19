import { Alert, Button, Group, Text } from '@mantine/core';
import { IconBookmark, IconCheck } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { patientsApi } from '@/api/patients';
import { useAuth } from '@/auth/useAuth';

interface SaveSearchButtonProps {
  searchId: string;
  token: string;
}

/**
 * Offers to attach an anonymous search to the signed-in account.
 *
 * The homepage works without an account by design, so most people's early
 * searches belong to nobody. This is how they end up on a dashboard.
 *
 * It is deliberately a button rather than an automatic claim: these links are
 * shareable, and silently filing someone else's search — and the health
 * concerns attached to it — under whoever opened it would be wrong.
 */
export function SaveSearchButton({ searchId, token }: SaveSearchButtonProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const saved = useQuery({
    queryKey: ['patient', 'searches'],
    queryFn: patientsApi.searches,
    enabled: isAuthenticated,
  });

  const claim = useMutation({
    mutationFn: () => patientsApi.claimSearch(searchId, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient'] }),
  });

  if (!isAuthenticated || saved.isPending) return null;

  const alreadyMine = saved.data?.results.some((search) => search.id === searchId);
  if (alreadyMine || claim.isSuccess) {
    return (
      <Alert variant="light" color="teal" p="xs" mb="md">
        <Group gap={6}>
          <IconCheck size={15} />
          <Text size="sm">Saved to your account.</Text>
        </Group>
      </Alert>
    );
  }

  return (
    <Group mb="md">
      <Button
        variant="light"
        leftSection={<IconBookmark size={16} />}
        loading={claim.isPending}
        onClick={() => claim.mutate()}
      >
        Save to my account
      </Button>
      {claim.isError && (
        <Text size="sm" c="red">
          That search is already saved to another account.
        </Text>
      )}
    </Group>
  );
}
