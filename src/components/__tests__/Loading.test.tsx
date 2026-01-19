import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingOverlay, SkeletonCard } from '../ui/loading';

describe('LoadingSpinner', () => {
    it('renders with default size', () => {
        render(<LoadingSpinner />);
        const spinner = screen.getByLabelText('Loading...');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('h-6', 'w-6'); // md size
    });

    it('renders with small size', () => {
        render(<LoadingSpinner size="sm" />);
        const spinner = screen.getByLabelText('Loading...');
        expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('renders with large size', () => {
        render(<LoadingSpinner size="lg" />);
        const spinner = screen.getByLabelText('Loading...');
        expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('accepts custom className', () => {
        render(<LoadingSpinner className="custom-class" />);
        const spinner = screen.getByLabelText('Loading...');
        expect(spinner).toHaveClass('custom-class');
    });
});

describe('LoadingOverlay', () => {
    it('renders with default message', () => {
        render(<LoadingOverlay />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
        render(<LoadingOverlay message="Please wait..." />);
        expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
});

describe('SkeletonCard', () => {
    it('renders with default 3 lines', () => {
        const { container } = render(<SkeletonCard />);
        const skeletons = container.querySelectorAll('.skeleton');
        expect(skeletons.length).toBe(4); // 1 header + 3 lines
    });

    it('renders with custom number of lines', () => {
        const { container } = render(<SkeletonCard lines={5} />);
        const skeletons = container.querySelectorAll('.skeleton');
        expect(skeletons.length).toBe(6); // 1 header + 5 lines
    });
});
