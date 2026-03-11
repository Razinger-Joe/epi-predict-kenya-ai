import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the auth context
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

// Mock the theme context
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

describe("Dashboard Page", () => {
    it("renders the dashboard layout with sidebar and header", async () => {
        const Dashboard = (await import("@/pages/Dashboard")).default;
        renderWithProviders(<Dashboard />);

        // Dashboard header should show "Disease Intelligence"
        expect(screen.getByText("Disease Intelligence")).toBeDefined();
    });

    it("shows the biosurveillance subtitle", async () => {
        const Dashboard = (await import("@/pages/Dashboard")).default;
        renderWithProviders(<Dashboard />);

        expect(screen.getByText("Biosurveillance Command Center")).toBeDefined();
    });
});
