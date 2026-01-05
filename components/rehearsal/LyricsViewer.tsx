"use client";

import { useAudioStore } from "@/stores/useAudioStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LyricsViewerProps {
  onClose: () => void;
}

export function LyricsViewer({ onClose }: LyricsViewerProps) {
  const { currentSong } = useAudioStore();

  if (!currentSong) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pt-20 pb-28 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/50 hover:text-white" onClick={onClose}>
        <X className="h-8 w-8" />
      </Button>

      <div className="max-w-2xl w-full h-full flex flex-col items-center text-center">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{currentSong.title}</h2>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-white border-white/30">
              {currentSong.category?.name || "Divers"}
            </Badge>
            {currentSong.key && (
              <Badge variant="secondary" className="bg-white/10 text-white">
                {currentSong.key}
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 w-full px-4">
          <div className="space-y-8 pb-20">
            {currentSong.lyrics_structure && currentSong.lyrics_structure.length > 0 ? (
              currentSong.lyrics_structure.map((block: any, index: number) => (
                <div key={index} className={`space-y-4 ${block.type === "chorus" ? "font-bold text-white text-xl md:text-2xl" : "text-white/80 text-lg md:text-xl"}`}>
                  {block.type === "chorus" && <span className="block text-xs uppercase tracking-widest text-primary/80 mb-2">Refrain</span>}
                  {block.content.split("\n").map((line: string, i: number) => (
                    <p key={i} className="leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-white/40">
                <Music className="h-16 w-16 mb-4 opacity-20" />
                <p>Paroles non disponibles</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
