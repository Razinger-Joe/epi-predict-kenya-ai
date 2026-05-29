import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps dashboard routes — redirects unauthenticated users to /login.
 * While auth state is still loading, a subtle spinner is shown so no
 * flash-of-login occurs on hard refreshes.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (!user) {
        // Preserve the intended destination so we can redirect after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
