import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music2, Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
            {/* Dark overlay with pattern */}
            <div className="absolute inset-0 bg-black/80 z-0" />
            <div className="absolute inset-0 z-0 opacity-20 bg-[grid-white/10] [mask-image:radial-gradient(white,transparent_70%)]" />

            {/* Animated background elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />

            <div className="relative z-10 text-center px-4 max-w-2xl">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <Music2 className="h-24 w-24 text-primary animate-bounce" />
                        <Search className="h-10 w-10 text-white absolute -bottom-2 -right-2 bg-black rounded-full p-2 border border-white/20" />
                    </div>
                </div>

                <h1 className="text-7xl font-bold text-white mb-4 tracking-tighter">404</h1>
                <h2 className="text-3xl font-semibold text-white/90 mb-6">Silence dans la chorale...</h2>

                <p className="text-xl text-white/60 mb-10 leading-relaxed">
                    Cette note semble s'être égarée. La page que vous recherchez n'existe pas ou a été déplacée vers un autre pupitre.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-semibold px-8">
                            <Home className="mr-2 h-5 w-5" />
                            Retour à l'accueil
                        </Button>
                    </Link>
                    <Link href="/songs">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-8">
                            <Music2 className="mr-2 h-5 w-5" />
                            Voir les chants
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10">
                    <p className="text-white/40 italic text-sm">
                        « Chantez au Seigneur un chant nouveau... même si vous vous perdez en route. »
                    </p>
                </div>
            </div>
        </div>
    );
}
