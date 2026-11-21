import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../api.js';
import HomePage from './HomePage.jsx';

vi.mock('../api.js', () => ({ default: { get: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderHome() {
  return render(<MemoryRouter><HomePage /></MemoryRouter>);
}

describe('HomePage', () => {
  it('lists restaurants returned by the API', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/restaurants/cuisine-types') return Promise.resolve({ data: ['Japonaise'] });
      return Promise.resolve({ data: [{ id: 1, nom: 'Sushi Zen', description: 'Sushis frais', image: '', type_cuisine: 'Japonaise', note_moyenne: 4.8, adresse: 'La Marsa', temps_livraison_estime: 25 }] });
    });

    renderHome();

    expect(await screen.findByRole('heading', { name: 'Sushi Zen' })).toBeInTheDocument();
    expect(screen.getByText('1 restaurant disponible')).toBeInTheDocument();
    expect(screen.getByLabelText('Type de cuisine')).toHaveTextContent('Japonaise');
  });

  it('sends search and filter values to the restaurants API', async () => {
    api.get.mockImplementation((url) => url === '/restaurants/cuisine-types'
      ? Promise.resolve({ data: ['Japonaise'] })
      : Promise.resolve({ data: [] }));

    renderHome();
    await screen.findByText('Aucun restaurant trouvé');
    fireEvent.change(screen.getByLabelText('Rechercher un restaurant'), { target: { value: ' sushi ' } });
    fireEvent.change(screen.getByLabelText('Type de cuisine'), { target: { value: 'Japonaise' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith(expect.stringContaining('q=sushi&cuisine=Japonaise'), expect.objectContaining({ signal: expect.any(AbortSignal) }));
    });
  });

  it('shows a retryable-friendly message when the API is unavailable', async () => {
    api.get.mockImplementation((url) => url === '/restaurants/cuisine-types'
      ? Promise.resolve({ data: [] })
      : Promise.reject(new Error('network error')));

    renderHome();

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger les restaurants');
  });
});
