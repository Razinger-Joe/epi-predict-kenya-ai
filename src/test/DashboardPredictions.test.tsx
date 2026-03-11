import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/contexts/AuthContext", () => ({
    useAuth: () => ({
        user: { email: "test@epipredict.co.ke", user_metadata: { full_name: "Test User" } },
        session: { access_token: "mock-token" },
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/ThemeProvider", () => ({
    useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: React.ReactElement) {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                {ui}
            </MemoryRouter>
        </QueryClientProvider>
    );
}

describe("DashboardPredictions Page", () => {
    it("renders the 14-day forecast heading", async () => {
        const DashboardPredictions = (await import("@/pages/DashboardPredictions")).default;
        renderWithProviders(<DashboardPredictions />);

        expect(screen.getByText("14-Day Outbreak Forecast")).toBeDefined();
    });

    it("renders prediction cards with confidence badges", async () => {
        const DashboardPredictions = (await import("@/pages/DashboardPredictions")).default;
        renderWithProviders(<DashboardPredictions />);

        // Should have at least one confidence badge
        expect(screen.getByText("82% Confidence")).toBeDefined();
    });

    it("renders the correct number of predictions", async () => {
        const DashboardPredictions = (await import("@/pages/DashboardPredictions")).default;
        renderWithProviders(<DashboardPredictions />);

        // We expect 7 prediction cards — check for "Acknowledge & Action" buttons
        const buttons = screen.getAllByText("Acknowledge & Action");
        expect(buttons.length).toBe(7);
    });
});
