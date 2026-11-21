import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RegisterPage from './RegisterPage.jsx';

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('RegisterPage', () => {
  it('requires matching passwords and shows password strength guidance', () => {
    const register = vi.fn();
    useAuth.mockReturnValue({ register });
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Client Test' } });
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'client@example.com' } });
    fireEvent.change(screen.getByLabelText('Téléphone'), { target: { value: '20123456' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'StrongPass1' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'DifferentPass1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    expect(screen.getByRole('meter', { name: 'Sécurité du mot de passe' })).toHaveAttribute('aria-valuetext', 'fort');
    expect(screen.getAllByText('Les mots de passe ne correspondent pas.')).toHaveLength(2);
    expect(screen.getByLabelText('Confirmer le mot de passe')).toHaveAttribute('aria-invalid', 'true');
    expect(register).not.toHaveBeenCalled();
  });

  it('creates an account without sending the confirmation field', async () => {
    const register = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ register });
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Client Test' } });
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'client@example.com' } });
    fireEvent.change(screen.getByLabelText('Téléphone'), { target: { value: '20123456' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'StrongPass1' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'StrongPass1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    expect(await screen.findByRole('button', { name: 'Créer le compte' })).toBeInTheDocument();
    expect(register).toHaveBeenCalledWith({
      nom: 'Client Test',
      email: 'client@example.com',
      telephone: '20123456',
      password: 'StrongPass1',
      adresse: '',
    });
  });
});
