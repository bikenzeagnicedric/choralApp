import { create } from "zustand";
import { Song } from "@/types";

interface AudioState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  setCurrentSong: (song) => set({ currentSong: song, isPlaying: !!song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  removeFromQueue: (songId) => set((state) => ({ queue: state.queue.filter((s) => s.id !== songId) })),
  playNext: () => {
    const { queue, currentSong } = get();
    if (!currentSong) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex < queue.length - 1) {
      set({ currentSong: queue[currentIndex + 1], isPlaying: true });
    }
  },
  playPrevious: () => {
    const { queue, currentSong } = get();
    if (!currentSong) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      set({ currentSong: queue[currentIndex - 1], isPlaying: true });
    }
  },
}));
