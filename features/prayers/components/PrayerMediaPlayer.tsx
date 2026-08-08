"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ListMusic, Play, Volume2 } from "lucide-react";
import MediaPlayer, {
  type RepeatMode,
} from "@/features/prayers/components/MediaPlayer";
import type { Prayer } from "@/lib/prayers";
import { markPrayerCompleted } from "@/lib/prayer-progress";

type PrayerMediaPlayerProps = {
  prayers: Prayer[];
};

type AudioVisualizer = {
  context: AudioContext | null;
  source: MediaElementAudioSourceNode | null;
  analyser: AnalyserNode | null;
  connectedAudio: HTMLAudioElement | null;
  animationFrame: number | null;
  bars: (HTMLSpanElement | null)[];
};

const WAVEFORM_CONFIG = {
  barCount: 72,
  fftSize: 256,
  smoothing: 0.82,
  frequencyRange: 0.7,
  minHeight: 10,
} as const;

export default function PrayerMediaPlayer({ prayers }: PrayerMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { prepare, start, stop, setBar } = useAudioVisualizer(audioRef);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.7);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const activePrayer = prayers[activeIndex];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!activePrayer?.audio) return null;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await prepare(audio);
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

  const selectAndPlayTrack = async (index: number) => {
    if (index === activeIndex) {
      const audio = audioRef.current;
      if (!audio) return;
      await prepare(audio);
      await audio.play();
      return;
    }

    setIsPlaying(true);
    selectTrack(index);
  };

  const moveTrack = (step: number) => {
    selectTrack((activeIndex + step + prayers.length) % prayers.length);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  };

  const changeVolume = (nextVolume: number) => {
    const volume = Math.round(nextVolume * 100) / 100;
    setVolume(volume);
    if (audioRef.current) audioRef.current.volume = volume;
  };

  const cycleRepeatMode = () => {
    setRepeatMode((mode) => {
      if (mode === "off") return "one";
      if (mode === "one") return "all";
      return "off";
    });
  };

  const handleTrackEnded = () => {
    markPrayerCompleted(activePrayer.id);

    if (activeIndex < prayers.length - 1) {
      setIsPlaying(true);
      selectTrack(activeIndex + 1);
      return;
    }

    if (repeatMode === "all") {
      setIsPlaying(true);
      selectTrack(0);
      return;
    }

    setIsPlaying(false);
  };

  return (
    <div className="mt-6">
      <MediaPlayer
        prayer={activePrayer}
        audioRef={audioRef}
        barCount={WAVEFORM_CONFIG.barCount}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        volume={volume}
        repeatMode={repeatMode}
        progress={progress}
        setBar={setBar}
        onTogglePlayback={() => void togglePlayback()}
        onPrevious={() => moveTrack(-1)}
        onNext={() => moveTrack(1)}
        onSeek={seek}
        onPlaybackRateChange={changePlaybackRate}
        onVolumeChange={changeVolume}
        onRepeatModeChange={cycleRepeatMode}
        onMetadataLoaded={(audio) => {
          audio.playbackRate = playbackRate;
          audio.volume = volume;
          setDuration(audio.duration);
        }}
        onTimeChange={setCurrentTime}
        onPlay={(audio) => {
          setIsPlaying(true);
          void start(audio);
        }}
        onPause={() => {
          setIsPlaying(false);
          stop();
        }}
        onEnded={handleTrackEnded}
      />

      <section className="mt-7" aria-labelledby="prayer-playlist-title">
        <div className="flex items-center gap-2">
          <ListMusic className="size-[var(--icon-md)] text-primary" />
          <h2
            id="prayer-playlist-title"
            className="font-headline text-xl font-bold"
          >
            Danh sách audio
          </h2>
        </div>
        <div className="mt-4 grid gap-3">
          {prayers.map((prayer, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={prayer.id}
                type="button"
                onClick={() => void selectAndPlayTrack(index)}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isActive ? "border-primary bg-primary/5" : "border-surface-container bg-surface-container-lowest hover:bg-surface-container-low"}`}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${isActive ? "bg-primary text-on-primary" : "bg-surface-container-low text-primary"}`}
                >
                  {isActive && isPlaying ? (
                    <Volume2 className="size-[var(--icon-md)]" />
                  ) : (
                    <Play className="size-[var(--icon-sm)] fill-current" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Audio {index + 1}
                  </span>
                  <span className="mt-1 block truncate font-headline font-bold">
                    {prayer.title}
                  </span>
                </span>
                {isActive && (
                  <span className="text-xs font-bold text-primary">
                    Đang chọn
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function useAudioVisualizer(audioRef: RefObject<HTMLAudioElement | null>) {
  const visualizerRef = useRef<AudioVisualizer>({
    context: null,
    source: null,
    analyser: null,
    connectedAudio: null,
    animationFrame: null,
    bars: [],
  });

  useEffect(() => {
    const visualizer = visualizerRef.current;
    return () => {
      if (visualizer.animationFrame !== null) {
        cancelAnimationFrame(visualizer.animationFrame);
      }
      visualizer.source?.disconnect();
      visualizer.analyser?.disconnect();
      void visualizer.context?.close();
    };
  }, []);

  const prepare = async (audio: HTMLAudioElement) => {
    const visualizer = visualizerRef.current;
    const audioContext =
      visualizer.context ?? (visualizer.context = new AudioContext());

    if (audioContext.state === "suspended") await audioContext.resume();
    if (visualizer.connectedAudio === audio && visualizer.analyser) return;

    visualizer.source?.disconnect();
    visualizer.analyser?.disconnect();

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = WAVEFORM_CONFIG.fftSize;
    analyser.smoothingTimeConstant = WAVEFORM_CONFIG.smoothing;

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    visualizer.source = source;
    visualizer.analyser = analyser;
    visualizer.connectedAudio = audio;
  };

  const start = async (audio: HTMLAudioElement) => {
    await prepare(audio);
    const visualizer = visualizerRef.current;
    const analyser = visualizer.analyser;
    if (!analyser) return;

    if (visualizer.animationFrame !== null) {
      cancelAnimationFrame(visualizer.animationFrame);
    }

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      if (audioRef.current !== audio || audio.paused) return;

      analyser.getByteFrequencyData(frequencyData);
      visualizer.bars.forEach((bar, index) => {
        if (!bar) return;
        const frequencyIndex = Math.floor(
          (index / WAVEFORM_CONFIG.barCount) *
            frequencyData.length *
            WAVEFORM_CONFIG.frequencyRange,
        );
        const amplitude = frequencyData[frequencyIndex] / 255;
        bar.style.height = `${Math.max(WAVEFORM_CONFIG.minHeight, amplitude * 100)}%`;
      });

      visualizer.animationFrame = requestAnimationFrame(update);
    };

    update();
  };

  const stop = () => {
    const visualizer = visualizerRef.current;
    if (visualizer.animationFrame === null) return;
    cancelAnimationFrame(visualizer.animationFrame);
    visualizer.animationFrame = null;
  };

  const setBar = (index: number, element: HTMLSpanElement | null) => {
    visualizerRef.current.bars[index] = element;
  };

  return { prepare, start, stop, setBar };
}
