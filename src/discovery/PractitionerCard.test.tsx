import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { directoryApi } from '@/api/directory';
import { PractitionerCard } from '@/discovery/PractitionerCard';
import { mockPractitioner, mockRecommendation, renderWithProviders } from '@/test/utils';

describe('<PractitionerCard />', () => {
  it('shows the rank, name and credentials', () => {
    renderWithProviders(<PractitionerCard recommendation={mockRecommendation()} />);

    expect(screen.getByText('Maya Ellison')).toBeInTheDocument();
    expect(screen.getByText('LAc, DACM')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('lists every reason the engine returned', () => {
    renderWithProviders(
      <PractitionerCard
        recommendation={mockRecommendation({ reasons: ['A reason', 'Another reason'] })}
      />,
    );

    expect(screen.getByText('A reason')).toBeInTheDocument();
    expect(screen.getByText('Another reason')).toBeInTheDocument();
  });

  it('shows the location and telehealth availability', () => {
    renderWithProviders(
      <PractitionerCard recommendation={mockRecommendation({ distance_miles: 4.25 })} />,
    );

    expect(screen.getByText('Austin, TX')).toBeInTheDocument();
    expect(screen.getByText('Telehealth')).toBeInTheDocument();
  });

  it('leaves the distance to the reasons list rather than repeating it', () => {
    renderWithProviders(
      <PractitionerCard
        recommendation={mockRecommendation({ distance_miles: 4.25, reasons: ['4.3 mi away'] })}
      />,
    );

    expect(screen.getAllByText(/4\.3 mi/)).toHaveLength(1);
  });

  it('omits the telehealth marker when the practitioner does not offer it', () => {
    renderWithProviders(
      <PractitionerCard
        recommendation={mockRecommendation({
          practitioner: mockPractitioner({ offers_telehealth: false }),
        })}
      />,
    );

    expect(screen.queryByText('Telehealth')).not.toBeInTheDocument();
  });

  it('reports a website click, so partner referrals can be counted', async () => {
    const recordEvent = vi.spyOn(directoryApi, 'recordEvent').mockImplementation(() => {});
    renderWithProviders(
      <PractitionerCard recommendation={mockRecommendation()} requestId="req-1" />,
    );

    await userEvent.click(screen.getByRole('link', { name: /website/i }));

    expect(recordEvent).toHaveBeenCalledWith('prac-1', 'website', 'req-1');
  });

  it('reports a phone reveal', async () => {
    const recordEvent = vi.spyOn(directoryApi, 'recordEvent').mockImplementation(() => {});
    renderWithProviders(
      <PractitionerCard recommendation={mockRecommendation()} requestId="req-1" />,
    );

    await userEvent.click(screen.getByRole('link', { name: /512 555/ }));

    expect(recordEvent).toHaveBeenCalledWith('prac-1', 'phone', 'req-1');
  });

  it('reports hover so the map can highlight the matching pin', async () => {
    const onHover = vi.fn();
    renderWithProviders(
      <PractitionerCard recommendation={mockRecommendation()} onHover={onHover} />,
    );

    await userEvent.hover(screen.getByTestId('practitioner-card-prac-1'));

    expect(onHover).toHaveBeenCalledWith('prac-1');
  });
});
