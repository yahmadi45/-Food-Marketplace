import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../api.js';
import MyOrdersPage from './MyOrdersPage.jsx';

vi.mock('../api.js', () => ({ default: { get: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderOrders() {
  return render(<MemoryRouter><MyOrdersPage /></MemoryRouter>);
}

describe('MyOrdersPage', () => {
  it('shows order history and the current delivery step', async () => {
    api.get.mockResolvedValue({
      data: [{
        id: 42,
        restaurant_id: 7,
        restaurant_nom: 'La Table du Jardin',
        date: '2026-11-21T12:30:00Z',
        total: '42.500',
        statut_livraison: 'en_preparation',
        mode_paiement: 'livraison',
      }],
    });

    renderOrders();

    expect(await screen.findByRole('heading', { name: 'La Table du Jardin' })).toBeInTheDocument();
    expect(screen.getByText('Commande #42')).toBeInTheDocument();
    expect(screen.getByText('42.500 TND')).toBeInTheDocument();
    expect(screen.getByText('En préparation', { selector: '.order-status' })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Progression de la commande' }))
      .getByRole('listitem', { current: 'step' })).toHaveTextContent('Préparation');
    expect(screen.getByRole('link', { name: /Voir le restaurant/ })).toHaveAttribute('href', '/restaurant/7');
    expect(api.get).toHaveBeenCalledWith('/commandes/mine');
  });

  it('shows cancelled orders without a delivery progress timeline', async () => {
    api.get.mockResolvedValue({
      data: [{
        id: 9,
        restaurant_id: 3,
        restaurant_nom: 'Grill Station',
        date: '2026-11-20T18:00:00Z',
        total: '18.000',
        statut_livraison: 'annulee',
        mode_paiement: 'carte',
      }],
    });

    renderOrders();

    expect(await screen.findByRole('status')).toHaveTextContent('Cette commande a été annulée');
    expect(screen.queryByRole('list', { name: 'Progression de la commande' })).not.toBeInTheDocument();
  });

  it('lets the customer retry when the order history cannot be loaded', async () => {
    api.get
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ data: [] });

    renderOrders();

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger vos commandes');
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByRole('heading', { name: 'Aucune commande pour le moment' })).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
