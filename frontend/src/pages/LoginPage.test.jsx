import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoginPage from './LoginPage.jsx';

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('shows and hides the password, then submits the trimmed email', async () => {
    const login = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ login });
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    const password = screen.getByLabelText('Mot de passe');
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Masquer le mot de passe' }));
    expect(password).toHaveAttribute('type', 'password');

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: '  client@example.com  ' } });
    fireEvent.change(password, { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith('client@example.com', 'secret123');
  });

  it('shows a clear error for invalid credentials', async () => {
    const login = vi.fn().mockRejectedValue(new Error('Unauthorized'));
    useAuth.mockReturnValue({ login });
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'client@example.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'wrong-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou mot de passe incorrect.');
  });
});
