import type { RefObject } from "react";
import {
  ChevronDown,
  Headphones,
  MoreHorizontal,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import type { Prayer } from "@/lib/prayers";

const PLAYBACK_RATES = [0.25, 0.75, 1, 2] as const;

type MediaPlayerProps = {
  prayer: Prayer;
  audioRef: RefObject<HTMLAudioElement | null>;
  barCount: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isRepeating: boolean;
  progress: number;
  setBar: (index: number, element: HTMLSpanElement | null) => void;
  onTogglePlayback: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onVolumeChange: (volume: number) => void;
  onRepeatToggle: () => void;
  onMetadataLoaded: (audio: HTMLAudioElement) => void;
  onTimeChange: (time: number) => void;
  onPlay: (audio: HTMLAudioElement) => void;
  onPause: () => void;
  onEnded: () => void;
};

export default function MediaPlayer({
  prayer,
  audioRef,
  barCount,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  volume,
  isRepeating,
  progress,
  setBar,
  onTogglePlayback,
  onPrevious,
  onNext,
  onSeek,
  onPlaybackRateChange,
  onVolumeChange,
  onRepeatToggle,
  onMetadataLoaded,
  onTimeChange,
  onPlay,
  onPause,
  onEnded,
}: MediaPlayerProps) {
  const playedBars = Math.ceil((progress / 100) * barCount);

  return (
    <section className="overflow-hidden rounded-feature bg-on-surface px-4 py-4 text-surface shadow-editorial sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-on-primary">
          <Headphones className="size-[var(--icon-md)]" />
        </span>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-surface/80">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          ĐANG PHÁT
        </span>
      </div>

      <div className="mt-4 min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-surface/60">
          KINH CẦN THUỘC
        </p>
        <h2 className="mt-1.5 font-headline text-2xl leading-tight font-bold text-balance">
          {prayer.title}
        </h2>
      </div>

      <div
        className="mt-4 flex h-9 items-center gap-[3px] overflow-hidden sm:mt-5 sm:h-10"
        aria-hidden="true"
      >
        {Array.from({ length: barCount }, (_, index) => {
          const distance = Math.abs(index - 17);
          const height = Math.max(12, 64 - distance * 3 + ((index * 17) % 31));
          return (
            <span
              key={index}
              ref={(element) => setBar(index, element)}
              className={`min-w-0 flex-1 rounded-full transition-colors ${index < playedBars ? "bg-primary" : "bg-surface/25"}`}
              style={{ height: `${Math.min(height, 100)}%` }}
            />
          );
        })}
      </div>

      <div className="mt-2">
        <div className="relative flex h-4 items-center">
          <div className="absolute inset-x-0 h-1 rounded-full bg-surface/20" />
          <div
            className="absolute left-0 h-1 rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => onSeek(Number(event.target.value))}
            className="absolute inset-0 h-4 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-surface [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-surface"
            aria-label={`Tua ${prayer.title}`}
          />
        </div>
        <div className="flex justify-between text-xs font-bold tabular-nums text-surface/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:mt-3 sm:gap-3">
        <div className="flex min-w-0 items-center justify-start gap-1 text-surface/60 sm:gap-2">
          <label className="hidden h-8 items-center gap-2 rounded-full bg-surface/5 px-2 sm:flex">
            <Volume2
              className="size-[var(--icon-sm)] shrink-0"
              aria-hidden="true"
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(event) =>
                onVolumeChange(Number(event.currentTarget.value))
              }
              className="h-4 w-14 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Âm lượng"
              aria-valuetext={`${Math.round(volume * 100)}%`}
            />
          </label>
          <span className="relative inline-flex items-center">
            <select
              value={playbackRate}
              onChange={(event) =>
                onPlaybackRateChange(Number(event.currentTarget.value))
              }
              className="h-7 w-14 cursor-pointer appearance-none border-0 bg-transparent py-1 pr-3 pl-1 text-[11px] font-bold text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Tốc độ phát"
            >
              {PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}×
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-0.5 size-3 text-surface/60"
              aria-hidden="true"
            />
          </span>
        </div>

        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onPrevious}
            className="grid size-9 cursor-pointer place-items-center rounded-full text-surface transition-colors hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-10"
            aria-label="Bài trước"
          >
            <SkipBack className="size-[var(--icon-md)] fill-current" />
          </button>
          <button
            type="button"
            onClick={onTogglePlayback}
            className="grid size-14 cursor-pointer place-items-center rounded-full bg-surface text-primary shadow-soft transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-16"
            aria-label={isPlaying ? "Tạm dừng" : "Phát audio"}
          >
            {isPlaying ? (
              <Pause className="size-[var(--icon-lg)] fill-current" />
            ) : (
              <Play className="ml-1 size-[var(--icon-lg)] fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="grid size-9 cursor-pointer place-items-center rounded-full text-surface transition-colors hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-10"
            aria-label="Bài tiếp theo"
          >
            <SkipForward className="size-[var(--icon-md)] fill-current" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-1 text-surface/60">
          <button
            type="button"
            onClick={onRepeatToggle}
            className={`grid size-9 cursor-pointer place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isRepeating ? "bg-surface/10 text-primary" : "hover:bg-surface/10"}`}
            aria-label={isRepeating ? "Tắt phát lặp lại" : "Phát lặp lại"}
            aria-pressed={isRepeating}
          >
            <Repeat className="size-[var(--icon-sm)]" />
          </button>
          <span className="grid size-9 place-items-center">
            <MoreHorizontal
              className="size-[var(--icon-sm)]"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>

      <audio
        key={prayer.id}
        ref={audioRef}
        src={prayer.audio}
        preload="metadata"
        autoPlay={isPlaying}
        loop={isRepeating}
        onLoadedMetadata={(event) => onMetadataLoaded(event.currentTarget)}
        onTimeUpdate={(event) => onTimeChange(event.currentTarget.currentTime)}
        onPlay={(event) => onPlay(event.currentTarget)}
        onPause={onPause}
        onEnded={onEnded}
      />
    </section>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
