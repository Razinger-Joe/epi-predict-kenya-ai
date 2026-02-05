import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "subtle" | "colorful";
    blur?: "sm" | "md" | "lg";
    border?: boolean;
    glow?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, variant = "default", blur = "md", border = true, glow = false, children, ...props }, ref) => {
        const blurMap = {
            sm: "backdrop-blur-sm",
            md: "backdrop-blur-md",
            lg: "backdrop-blur-lg"
        };

        const variantStyles = {
            default: "bg-background/60 dark:bg-background/40",
            elevated: "bg-background/80 dark:bg-background/60 shadow-xl",
            subtle: "bg-background/30 dark:bg-background/20",
            colorful: "bg-gradient-to-br from-primary/10 via-background/60 to-accent/10"
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl transition-all duration-300",
                    blurMap[blur],
                    variantStyles[variant],
                    border && "border border-border/50",
                    glow && "shadow-lg shadow-primary/5 hover:shadow-primary/10",
                    "hover:border-primary/30",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = "GlassCard";

interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

const GlassCardHeader = React.forwardRef<HTMLDivElement, GlassCardHeaderProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1.5 p-6", className)}
            {...props}
        />
    )
);

GlassCardHeader.displayName = "GlassCardHeader";

interface GlassCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

const GlassCardTitle = React.forwardRef<HTMLHeadingElement, GlassCardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
);

GlassCardTitle.displayName = "GlassCardTitle";

interface GlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const GlassCardContent = React.forwardRef<HTMLDivElement, GlassCardContentProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    )
);

GlassCardContent.displayName = "GlassCardContent";

export { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent };
