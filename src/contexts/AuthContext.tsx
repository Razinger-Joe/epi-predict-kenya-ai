import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session, AuthError } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────────────────────
interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 0. Check for presentation day mock session first
        const mockSessionData = localStorage.getItem("epi_mock_session");
        if (mockSessionData) {
            try {
                const parsedSession = JSON.parse(mockSessionData);
                setSession(parsedSession);
                setUser(parsedSession.user);
                setLoading(false);
                return;
            } catch (e) {
                console.error("Failed to parse mock session");
            }
        }

        // 1. Check active session on mount
        supabase.auth.getSession().then(({ data: { session: activeSession }, error }) => {
            if (!localStorage.getItem("epi_mock_session")) {
                setSession(activeSession);
                setUser(activeSession?.user ?? null);
            }
            setLoading(false);
        }).catch(() => {
            // Unreachable or net error
            setLoading(false);
        });

        // 2. Listen for auth state changes (login, logout, token refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (!localStorage.getItem("epi_mock_session")) {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        // PRESENTATION HARDCODED CREDENTIALS
        if (
            (email.toLowerCase() === 'razingerjosef@gmail.com' && password === 'JM254') ||
            (email.toLowerCase() === 'donholmonlinestores89@gmail.com' && password === 'SW2211')
        ) {
            const mockUser: User = { 
                id: 'mock-user-1234', 
                email: email.toLowerCase(),
                app_metadata: {},
                user_metadata: {},
                aud: 'authenticated',
                created_at: new Date().toISOString()
            } as User;
            
            const mockSession: Session = { 
                access_token: 'mock-token-xyz', 
                token_type: 'bearer',
                expires_in: 3600,
                refresh_token: 'mock-refresh-xyz',
                user: mockUser 
            };
            
            localStorage.setItem("epi_mock_session", JSON.stringify(mockSession));
            setUser(mockUser);
            setSession(mockSession);
            return { error: null };
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return { error };
        } catch (err: any) {
            return { error: { message: "Network Error: Unable to reach authentication server", name: "AuthError", status: 500 } as AuthError };
        }
    }, []);

    const signUp = useCallback(
        async (email: string, password: string, metadata?: Record<string, unknown>) => {
            try {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: metadata },
                });
                return { error };
            } catch (err: any) {
                return { error: { message: "Network Error: Unable to reach authentication server", name: "AuthError", status: 500 } as AuthError };
            }
        },
        []
    );

    const signOut = useCallback(async () => {
        // Clear mock session if exists
        localStorage.removeItem("epi_mock_session");
        
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("Supabase signout failed", e);
        }
        
        setUser(null);
        setSession(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
