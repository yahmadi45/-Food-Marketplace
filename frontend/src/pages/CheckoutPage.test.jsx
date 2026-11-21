import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import CheckoutPage from './CheckoutPage.jsx';

vi.mock('../api.js', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: vi.fn() }));
vi.mock('../context/CartContext.jsx', () => ({ useCart: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CheckoutPage payment options', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { id: 1 } });
    useCart.mockReturnValue({
      restaurantId: 7,
      items: [{ plat_id: 3, nom: 'Pizza', prix: 12, quantite: 1 }],
      subtotal: 12,
      fraisLivraison: 2,
      total: 14,
      clear: vi.fn(),
    });
    api.get.mockResolvedValue({ data: {} });
  });

  it('only enables payment on delivery until online payments are available', () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

    expect(screen.getByRole('radio', { name: /Paiement à la livraison/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Carte bancaire/ })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Mobile money/ })).toBeDisabled();
    expect(screen.getByRole('note')).toHaveTextContent('Aucun montant ne sera débité');
  });

  it('submits the selected available payment method with the order', async () => {
    api.post.mockResolvedValue({ data: { commande: { id: 77, total: 14 } } });
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Adresse de livraison'), { target: { value: 'Rue de la Paix' } });
    fireEvent.change(screen.getByLabelText('Numéro de téléphone'), { target: { value: '20123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la commande' }));

    expect(await screen.findByRole('heading', { name: 'Commande enregistrée' })).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/commandes', expect.objectContaining({
      mode_paiement: 'livraison',
      adresse_livraison: 'Rue de la Paix',
      telephone_contact: '20123456',
    }));
  });
});
