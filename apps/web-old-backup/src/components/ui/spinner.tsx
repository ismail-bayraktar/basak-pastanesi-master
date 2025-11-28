import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "default" | "primary" | "secondary";
}

export function Spinner({ className, size = "md", variant = "default", ...props }: SpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
        xl: "w-16 h-16 border-4",
    };

    const variantClasses = {
        default: "border-neutral-200 border-t-neutral-800",
        primary: "border-neutral-200 border-t-basak-golden",
        secondary: "border-neutral-200 border-t-basak-pistachio",
    };

    return (
        <div
            className={cn(
                "rounded-full animate-spin",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            {...props}
        >
            <span className="sr-only">Yükleniyor...</span>
        </div>
    );
}
