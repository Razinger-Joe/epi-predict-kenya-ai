import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Wrapper to provide router context
const renderWithRouter = (component: React.ReactNode) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('Header', () => {
    it('renders the logo', () => {
        renderWithRouter(<Header />);
        expect(screen.getByText('EpiPredict')).toBeInTheDocument();
    });

    it('renders navigation links on desktop', () => {
        renderWithRouter(<Header />);
        expect(screen.getByText('Features')).toBeInTheDocument();
        expect(screen.getByText('How It Works')).toBeInTheDocument();
        expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('renders login and signup buttons', () => {
        renderWithRouter(<Header />);
        expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /start free pilot/i })).toBeInTheDocument();
    });

    it('toggles mobile menu when hamburger is clicked', () => {
        renderWithRouter(<Header />);
        const menuButton = screen.getByRole('button', { name: /open menu/i });

        // Click to open
        fireEvent.click(menuButton);
        expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();

        // Click to close
        fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
        expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    it('has accessible menu button with aria attributes', () => {
        renderWithRouter(<Header />);
        const menuButton = screen.getByRole('button', { name: /open menu/i });
        expect(menuButton).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(menuButton);
        expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
    });
});
