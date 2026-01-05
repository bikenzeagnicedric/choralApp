"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/stores/useAudioStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LyricsViewer } from "./LyricsViewer";

export function AudioPlayer() {
  const { currentSong, isPlaying, setIsPlaying, playNext, playPrevious, setCurrentSong } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying, setIsPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  return (
    <>
      {showLyrics && <LyricsViewer onClose={() => setShowLyrics(false)} />}

      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 p-4 z-50 animate-in slide-in-from-bottom duration-500">
        <audio ref={audioRef} src={currentSong.audio_url || ""} onTimeUpdate={handleTimeUpdate} onEnded={playNext} onLoadedMetadata={handleTimeUpdate} />

        <div className="container mx-auto max-w-4xl flex items-center gap-4">
          {/* Info */}
          <div className="flex-1 min-w-0 flex items-center gap-4 cursor-pointer" onClick={() => setShowLyrics(true)}>
            <div className="relative group">
              <div className="h-12 w-12 rounded-md bg-white/10 flex items-center justify-center border border-white/20 group-hover:border-white/50 transition-colors">
                <Maximize2 className="h-5 w-5 text-white/50 group-hover:text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate hover:underline">{currentSong.title}</h3>
              <p className="text-white/60 text-xs truncate">{currentSong.category?.name || "Sans catégorie"}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={playPrevious} className="text-white hover:bg-white/10">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button size="icon" className="rounded-full h-10 w-10 bg-white text-black hover:bg-white/90" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={playNext} className="text-white hover:bg-white/10">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <div className="w-full flex items-center gap-2 text-xs text-white/60">
              <span>{formatTime(progress)}</span>
              <Slider value={[progress]} max={duration} onValueChange={handleSeek} className="w-full cursor-pointer" />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Close */}
          <div className="flex-1 flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => setCurrentSong(null)} className="text-white/60 hover:text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
