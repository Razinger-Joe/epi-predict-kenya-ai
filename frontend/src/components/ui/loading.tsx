import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    return (
        <Loader2
            className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
            aria-label="Loading..."
        />
    );
}

interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

interface SkeletonCardProps {
    lines?: number;
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
    return (
        <div className="p-6 border rounded-lg bg-card">
            <div className="skeleton h-4 w-1/3 mb-4" />
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton h-3 mb-2"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                />
            ))}
        </div>
    );
}
