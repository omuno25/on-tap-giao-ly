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

const waveformCache = new Map<string, Promise<number[]>>();

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

  useEffect(() => {
    if (!activePrayer || !("mediaSession" in navigator)) return;
    if (typeof MediaMetadata === "undefined") return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activePrayer.title,
      artist: "KINH CẦN THUỘC",
      album: "Ôn tập Giáo lý",
    });
  }, [activePrayer]);

  if (!activePrayer?.audio) return null;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      if (isIOSDevice()) {
        await audio.play();
        void prepare(audio);
        return;
      }

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
    const audio = audioRef.current;
    const selectedPrayer = prayers[index];
    if (!audio || !selectedPrayer?.audio) return;

    if (index === activeIndex) {
      if (isIOSDevice()) {
        await audio.play();
        void prepare(audio);
        return;
      }

      await prepare(audio);
      await audio.play();
      return;
    }

    if (isIOSDevice()) {
      setCurrentTime(0);
      setDuration(0);
      setActiveIndex(index);
      setIsPlaying(true);
      audio.src = selectedPrayer.audio;
      audio.load();
      audio.playbackRate = playbackRate;
      audio.volume = volume;
      await audio.play();
      void prepare(audio);
      return;
    }

    setCurrentTime(0);
    setDuration(0);
    setActiveIndex(index);
    audio.src = selectedPrayer.audio;
    audio.load();
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    await prepare(audio);
    setIsPlaying(true);
    await audio.play();
  };

  const selectTrackWithoutPlaying = (index: number) => {
    if (index === activeIndex) return;

    audioRef.current?.pause();
    setIsPlaying(false);
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
          if (isIOSDevice()) void prepare(audio);
        }}
        onTimeChange={setCurrentTime}
        onPlay={(audio) => {
          setIsPlaying(true);
          setMediaSessionPlaybackState("playing");
          void start(audio);
        }}
        onPause={() => {
          setIsPlaying(false);
          setMediaSessionPlaybackState("paused");
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
              <div
                key={prayer.id}
                role="button"
                tabIndex={0}
                onClick={() => selectTrackWithoutPlaying(index)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  selectTrackWithoutPlaying(index);
                }}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isActive ? "border-primary bg-primary/5" : "border-surface-container bg-surface-container-lowest hover:bg-surface-container-low"}`}
              >
                <button
                  type="button"
                  onKeyDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    void selectAndPlayTrack(index);
                  }}
                  aria-label={`Phát ${prayer.title}`}
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${isActive ? "bg-primary text-on-primary" : "bg-surface-container-low text-primary"}`}
                >
                  {isActive && isPlaying ? (
                    <Volume2 className="size-[var(--icon-md)]" />
                  ) : (
                    <Play className="size-[var(--icon-sm)] fill-current" />
                  )}
                </button>
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
              </div>
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

    if (isIOSDevice()) {
      const heights = await getStaticWaveform(
        audio.currentSrc || audio.src,
      ).catch(() => null);
      if (!heights) return;
      if (audioRef.current !== audio) return;

      visualizer.bars.forEach((bar, index) => {
        if (bar) bar.style.height = `${heights[index]}%`;
      });
      return;
    }

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

function isIOSDevice() {
  const { platform, userAgent, maxTouchPoints } = navigator;

  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

function setMediaSessionPlaybackState(state: MediaSessionPlaybackState) {
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = state;
}

async function getStaticWaveform(source: string) {
  const cachedWaveform = waveformCache.get(source);
  if (cachedWaveform) return cachedWaveform;

  const waveform = decodeWaveform(source).catch((error: unknown) => {
    waveformCache.delete(source);
    throw error;
  });
  waveformCache.set(source, waveform);
  return waveform;
}

async function decodeWaveform(source: string) {
  const response = await fetch(source);
  if (!response.ok)
    throw new Error(`Unable to load waveform: ${response.status}`);

  const context = new OfflineAudioContext(1, 1, 44_100);
  const audioBuffer = await context.decodeAudioData(
    await response.arrayBuffer(),
  );
  const samples = audioBuffer.getChannelData(0);
  const amplitudes = Array.from(
    { length: WAVEFORM_CONFIG.barCount },
    (_, index) => {
      const start = Math.floor(
        (index / WAVEFORM_CONFIG.barCount) * samples.length,
      );
      const end = Math.floor(
        ((index + 1) / WAVEFORM_CONFIG.barCount) * samples.length,
      );
      let sumOfSquares = 0;

      for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
        sumOfSquares += samples[sampleIndex] ** 2;
      }

      return Math.sqrt(sumOfSquares / Math.max(1, end - start));
    },
  );
  const peak = Math.max(...amplitudes, Number.EPSILON);

  return amplitudes.map(
    (amplitude) =>
      WAVEFORM_CONFIG.minHeight +
      Math.sqrt(amplitude / peak) * (100 - WAVEFORM_CONFIG.minHeight),
  );
}
