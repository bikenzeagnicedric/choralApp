import { Loader } from "@/components/ui/loader";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Loader size="lg" />
                <p className="text-muted-foreground animate-pulse font-medium">Chargement...</p>
            </div>
        </div>
    );
}
