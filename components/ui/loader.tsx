import { cn } from "@/lib/utils";

interface LoaderProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function Loader({ className, size = "md" }: LoaderProps) {
    const heightClass = {
        sm: "h-4",
        md: "h-8",
        lg: "h-12",
    };

    const barWidthClass = {
        sm: "w-1",
        md: "w-2",
        lg: "w-3",
    };

    return (
        <div className={cn("flex items-end justify-center gap-1", className)}>
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "bg-primary rounded-full animate-music-bar",
                        heightClass[size],
                        barWidthClass[size]
                    )}
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: "1s",
                    }}
                />
            ))}
            <span className="sr-only">Loading...</span>
        </div>
    );
}
