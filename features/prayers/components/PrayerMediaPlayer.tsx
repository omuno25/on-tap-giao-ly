"use client";

import { useRef, useState } from "react";
import {
  Headphones,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import type { Prayer } from "@/lib/prayers";
import { markPrayerCompleted } from "@/lib/prayer-progress";

type PrayerMediaPlayerProps = {
  prayers: Prayer[];
};

export default function PrayerMediaPlayer({ prayers }: PrayerMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const activePrayer = prayers[activeIndex];

  if (!activePrayer?.audio) return null;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTime(0);
    setDuration(0);
    setActiveIndex(index);
  };

  const moveTrack = (step: number) => {
    selectTrack((activeIndex + step + prayers.length) % prayers.length);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className="mt-6">
      <section className="overflow-hidden rounded-feature bg-on-surface p-5 text-surface shadow-editorial">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-on-primary">
            <Headphones className="size-[var(--icon-lg)]" />
          </span>
          <span className="rounded-full bg-surface/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-surface/75">
            Đang phát
          </span>
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-surface/60">Kinh cần thuộc</p>
        <h2 className="mt-2 font-headline text-2xl font-bold">{activePrayer.title}</h2>

        <div className="mt-7">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer accent-primary"
            aria-label={`Tua ${activePrayer.title}`}
          />
          <div className="mt-2 flex justify-between text-[11px] font-bold tabular-nums text-surface/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6">
          <button type="button" onClick={() => moveTrack(-1)} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-surface transition-colors hover:bg-surface/10" aria-label="Bài trước">
            <SkipBack className="size-[var(--icon-md)] fill-current" />
          </button>
          <button type="button" onClick={togglePlayback} className="grid h-16 w-16 cursor-pointer place-items-center rounded-full bg-surface text-on-surface shadow-soft transition-transform active:scale-95" aria-label={isPlaying ? "Tạm dừng" : "Phát audio"}>
            {isPlaying ? <Pause className="size-[var(--icon-lg)] fill-current" /> : <Play className="ml-1 size-[var(--icon-lg)] fill-current" />}
          </button>
          <button type="button" onClick={() => moveTrack(1)} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-surface transition-colors hover:bg-surface/10" aria-label="Bài tiếp theo">
            <SkipForward className="size-[var(--icon-md)] fill-current" />
          </button>
        </div>

        <audio
          key={activePrayer.id}
          ref={audioRef}
          src={activePrayer.audio}
          preload="metadata"
          autoPlay={isPlaying}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            markPrayerCompleted(activePrayer.id);
            moveTrack(1);
          }}
        />
      </section>

      <section className="mt-7" aria-labelledby="prayer-playlist-title">
        <div className="flex items-center gap-2">
          <ListMusic className="size-[var(--icon-md)] text-primary" />
          <h2 id="prayer-playlist-title" className="font-headline text-xl font-bold">Danh sách audio</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {prayers.map((prayer, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={prayer.id}
                type="button"
                onClick={() => selectTrack(index)}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isActive ? "border-primary bg-primary/5" : "border-surface-container bg-surface-container-lowest hover:bg-surface-container-low"}`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${isActive ? "bg-primary text-on-primary" : "bg-surface-container-low text-primary"}`}>
                  {isActive && isPlaying ? <Volume2 className="size-[var(--icon-md)]" /> : <Play className="size-[var(--icon-sm)] fill-current" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Audio {index + 1}</span>
                  <span className="mt-1 block truncate font-headline font-bold">{prayer.title}</span>
                </span>
                {isActive && <span className="text-xs font-bold text-primary">Đang chọn</span>}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
