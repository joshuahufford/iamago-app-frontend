import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { DiscoveryQuiz } from '@/discovery/DiscoveryQuiz';
import { mockConcern, mockModality, renderWithProviders } from '@/test/utils';

const CONCERNS = [
  mockConcern({ id: 'con-pain', name: 'Chronic pain' }),
  mockConcern({ id: 'con-sleep', name: 'Sleep problems', slug: 'sleep' }),
];
const MODALITIES = [
  mockModality({ id: 'mod-acu', name: 'Acupuncture' }),
  mockModality({ id: 'mod-chiro', name: 'Chiropractic', slug: 'chiropractic' }),
];

function mockOptions() {
  vi.spyOn(api, 'get').mockImplementation((url: string) =>
    Promise.resolve({
      data: url === '/directory/concerns/' ? CONCERNS : MODALITIES,
    }),
  );
}

async function goToLocationStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('checkbox', { name: 'Chronic pain' }));
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await screen.findByRole('heading', { name: /any approach in mind/i });
  await user.click(screen.getByRole('button', { name: /skip|continue/i }));
  await screen.findByRole('heading', { name: /where are you looking/i });
}

describe('<DiscoveryQuiz />', () => {
  beforeEach(mockOptions);

  it('starts on the concerns step', async () => {
    renderWithProviders(<DiscoveryQuiz onSubmit={vi.fn()} isSubmitting={false} />);

    expect(
      await screen.findByRole('heading', { name: /what brings you here/i }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('checkbox', { name: 'Chronic pain' })).toBeInTheDocument();
    // Nothing to go back to yet, so the first question offers no way back.
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('will not advance until a concern is chosen', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DiscoveryQuiz onSubmit={vi.fn()} isSubmitting={false} />);

    await screen.findByRole('checkbox', { name: 'Chronic pain' });
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'Chronic pain' }));

    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
  });

  it('lets the visitor skip the optional modality step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DiscoveryQuiz onSubmit={vi.fn()} isSubmitting={false} />);

    await user.click(await screen.findByRole('checkbox', { name: 'Chronic pain' }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(
      await screen.findByRole('heading', { name: /any approach in mind/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('can go back to a previous step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DiscoveryQuiz onSubmit={vi.fn()} isSubmitting={false} />);

    await user.click(await screen.findByRole('checkbox', { name: 'Chronic pain' }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await screen.findByRole('heading', { name: /any approach in mind/i });

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(
      await screen.findByRole('heading', { name: /what brings you here/i }),
    ).toBeInTheDocument();
  });

  it('requires a location before submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<DiscoveryQuiz onSubmit={onSubmit} isSubmitting={false} />);

    await goToLocationStep(user);
    await user.click(screen.getByRole('button', { name: /find my matches/i }));

    expect(await screen.findByText('Enter a city or postal code.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the collected answers', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<DiscoveryQuiz onSubmit={onSubmit} isSubmitting={false} />);

    await goToLocationStep(user);
    await user.type(screen.getByLabelText('Location'), 'Austin, TX');
    await user.click(screen.getByRole('button', { name: /find my matches/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      concerns: ['con-pain'],
      modalities: [],
      location_label: 'Austin, TX',
      radius_km: 40,
      include_telehealth: true,
      accepting_new_patients_only: false,
    });
  });

  it('carries a modality preference through to the payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<DiscoveryQuiz onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(await screen.findByRole('checkbox', { name: 'Chronic pain' }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(await screen.findByRole('checkbox', { name: 'Acupuncture' }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.type(await screen.findByLabelText('Location'), 'Austin');
    await user.click(screen.getByRole('button', { name: /find my matches/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].modalities).toEqual(['mod-acu']);
  });

  it('surfaces a submission error', async () => {
    renderWithProviders(
      <DiscoveryQuiz onSubmit={vi.fn()} isSubmitting={false} error="Something broke." />,
    );

    expect(await screen.findByText('Something broke.')).toBeInTheDocument();
  });
});
