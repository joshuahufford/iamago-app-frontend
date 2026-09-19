import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { api } from '@/api/client';
import { ContactRequestModal } from '@/discovery/ContactRequestModal';
import { mockPractitioner, renderWithProviders } from '@/test/utils';

function open(props: Partial<Parameters<typeof ContactRequestModal>[0]> = {}) {
  return renderWithProviders(
    <ContactRequestModal
      practitioner={mockPractitioner()}
      requestId="req-1"
      hasConcerns
      onClose={vi.fn()}
      {...props}
    />,
  );
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/your name/i), 'Ada Lovelace');
  await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
}

describe('<ContactRequestModal />', () => {
  it('will not send without consent', async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(api, 'post');
    open();

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /send request/i }));

    expect(
      await screen.findByText(/we can only pass your details on if you agree/i),
    ).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('sends the enquiry once consent is given', async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(api, 'post').mockResolvedValue({
      data: { id: 'c1', practitioner_name: 'Maya Ellison', created_at: '' },
    });
    open();

    await fillRequired(user);
    await user.click(screen.getByRole('checkbox', { name: /i agree that iamago may share/i }));
    await user.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => expect(post).toHaveBeenCalled());
    const [, payload] = post.mock.calls[0];
    expect(payload).toMatchObject({
      practitioner: 'prac-1',
      recommendation_request: 'req-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      consent: true,
    });
  });

  it('does not share health concerns unless asked to', async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(api, 'post').mockResolvedValue({
      data: { id: 'c1', practitioner_name: 'Maya Ellison', created_at: '' },
    });
    open();

    await fillRequired(user);
    await user.click(screen.getByRole('checkbox', { name: /i agree that iamago may share/i }));
    await user.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => expect(post).toHaveBeenCalled());
    expect(post.mock.calls[0][1]).toMatchObject({ share_concerns: false });
  });

  it('widens the consent wording when concerns will be shared', async () => {
    const user = userEvent.setup();
    open();

    expect(
      screen.getByRole('checkbox', { name: /share my name and contact details/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /share the concerns i selected/i }));

    expect(
      await screen.findByRole('checkbox', {
        name: /name, contact details and the health concerns/i,
      }),
    ).toBeInTheDocument();
  });

  it('offers no concern-sharing option when the search had none', () => {
    open({ hasConcerns: false });

    expect(
      screen.queryByRole('checkbox', { name: /share the concerns/i }),
    ).not.toBeInTheDocument();
  });

  it('confirms once sent', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'post').mockResolvedValue({
      data: { id: 'c1', practitioner_name: 'Maya Ellison', created_at: '' },
    });
    open();

    await fillRequired(user);
    await user.click(screen.getByRole('checkbox', { name: /i agree that iamago may share/i }));
    await user.click(screen.getByRole('button', { name: /send request/i }));

    expect(await screen.findByText(/we have passed your details on/i)).toBeInTheDocument();
  });

  it('surfaces a refusal from the server', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'post').mockRejectedValue(
      Object.assign(new Error('Request failed'), {
        isAxiosError: true,
        response: {
          status: 429,
          data: { detail: 'You have sent as many enquiries as we allow in a day.', errors: {} },
        },
      }),
    );
    open();

    await fillRequired(user);
    await user.click(screen.getByRole('checkbox', { name: /i agree that iamago may share/i }));
    await user.click(screen.getByRole('button', { name: /send request/i }));

    expect(await screen.findByText(/as many enquiries as we allow/i)).toBeInTheDocument();
  });
});
