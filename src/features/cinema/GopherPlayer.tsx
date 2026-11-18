import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { renderTokens } from '../../components/GoCode';
import { speakNarration, stopNarration } from './audio';
import type { CinemaDeck, StageVisual } from './cinema.types';

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function effectiveDuration(speech: string, baseSec: number): number {
  const words = speech.trim().split(/\s+/).length;
  return Math.max(baseSec, Math.ceil(words / 2.65));
}

function StageCanvas({ visual, progress }: { visual: StageVisual; progress: number }) {
  if (visual.kind === 'terminal') {
    const visibleCount = Math.max(1, Math.ceil(progress * visual.lines.length + 0.25));
    return (
      <div class="cinema-board cinema-terminal">
        <div class="cinema-board-top">
          <span class="cinema-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span class="cinema-board-title">{visual.title}</span>
          <span class="cinema-chip">GO SHELL</span>
        </div>
        <div class="cinema-term-body">
          {visual.lines.map((ln, idx) => {
            const shown = idx < visibleCount;
            return (
              <div
                key={`${ln.text}-${idx}`}
                class={`cinema-term-line ${ln.tone ?? 'cmd'} ${shown ? 'is-visible' : 'is-pending'}`}
              >
                {ln.prompt && <span class="term-prompt">{ln.prompt}</span>}
                <code>{ln.text}</code>
                {idx === visibleCount - 1 && <span class="pixel-cursor" aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (visual.kind === 'stack-heap') {
    return (
      <div class="cinema-board cinema-memory-grid">
        <div class="cinema-mem-col">
          <div class="cinema-mem-head">
            <span>{visual.stackLabel}</span>
          </div>
          {visual.stackItems.map(it => (
            <div key={it.name} class={`cinema-mem-row state-${it.state}`}>
              <strong>{it.name}</strong>
              <code>{it.value}</code>
            </div>
          ))}
        </div>
        <div class="cinema-mem-arrow" aria-hidden="true">
          <span>{visual.mode === 'solution' ? 'COPY ──▶' : 'PTR ──▶'}</span>
        </div>
        <div class="cinema-mem-col">
          <div class="cinema-mem-head heap">
            <span>{visual.heapLabel}</span>
          </div>
          {visual.heapItems.map(hp => (
            <div key={hp.addr} class={`cinema-heap-box ${hp.alert ? 'is-alert' : 'is-safe'}`}>
              <div class="cinema-heap-top">
                <span class="cinema-addr">{hp.addr}</span>
                <code>{hp.data}</code>
              </div>
              <small>{hp.note}</small>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.kind === 'lanes') {
    const activeStep = Math.min(2, Math.floor(progress * 3));
    return (
      <div class="cinema-board cinema-lanes">
        <div class="cinema-lanes-head">
          <span class={`cinema-chip ${visual.mode === 'ordered' ? 'ok' : 'hot'}`}>
            {visual.statusBadge}
          </span>
        </div>
        {[visual.laneA, visual.laneB].map(lane => (
          <div class="cinema-lane-row" key={lane.name}>
            <div class="cinema-lane-label">{lane.name}</div>
            <div class="cinema-lane-steps">
              {lane.steps.map((st, idx) => (
                <span key={st} class={`cinema-step-pill ${idx <= activeStep ? 'active' : ''}`}>
                  {st}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visual.kind === 'code-diff') {
    const showAfter = progress >= 0.22;
    return (
      <div class="cinema-board cinema-diff">
        <div class="cinema-board-top">
          <span class="cinema-board-title">{visual.file}</span>
          <span class="cinema-chip ok">GO DIFF</span>
        </div>
        <div class="cinema-diff-lines">
          {visual.before.map(b => (
            <div key={b} class="cinema-diff-del">
              <code>- {renderTokens(b, 'go')}</code>
            </div>
          ))}
          {visual.after.map(a => (
            <div key={a} class={`cinema-diff-add ${showAfter ? 'is-lit' : ''}`}>
              <code>+ {renderTokens(a, 'go')}</code>
            </div>
          ))}
        </div>
        <div class="cinema-callout">
          <span>✦ {visual.callout}</span>
        </div>
      </div>
    );
  }

  return (
    <div class="cinema-board cinema-arch">
      <div class="cinema-arch-nodes">
        {visual.nodes.map((nd, idx) => (
          <div key={nd.label} class="cinema-arch-step">
            <div class={`cinema-arch-box state-${nd.state ?? 'normal'}`}>
              <strong>{nd.label}</strong>
              <small>{nd.sub}</small>
            </div>
            {idx < visual.nodes.length - 1 && (
              <span class="cinema-flow-arrow" aria-hidden="true">
                ══▶
              </span>
            )}
          </div>
        ))}
      </div>
      <div class="cinema-metric-strip">
        <span class="cinema-metric-label">{visual.metricLabel}</span>
        <div class="cinema-metric-values">
          <span class="before">{visual.metricBefore}</span>
          <span aria-hidden="true">→</span>
          <strong class={visual.mode === 'incident' ? 'hot' : 'ok'}>{visual.metricAfter}</strong>
        </div>
      </div>
    </div>
  );
}

export interface GopherPlayerProps {
  deck: CinemaDeck;
  locale?: string;
  compact?: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

export function GopherPlayer({
  deck,
  locale = 'es',
  compact = false,
  onAction,
  actionLabel,
}: GopherPlayerProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [status, setStatus] = useState<'idle' | 'playing' | 'paused' | 'ended'>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [fallbackClock, setFallbackClock] = useState(!deck.audio);

  const studioUrl = deck.audio ? `${import.meta.env.BASE_URL}${deck.audio.src}` : undefined;

  const timeline = useMemo(() => {
    if (deck.audio && deck.audio.cues.length === deck.scenes.length) {
      const starts = deck.audio.cues.map((c, idx) => (idx === 0 ? 0 : c));
      const total = deck.audio.totalSec;
      const ends = starts.map((_, idx) => (idx < starts.length - 1 ? starts[idx + 1] : total));
      return { starts, ends, total };
    }
    const durs = deck.scenes.map(sc => effectiveDuration(sc.speech, sc.durationSec));
    const starts: number[] = [];
    let acc = 0;
    for (const d of durs) {
      starts.push(acc);
      acc += d;
    }
    const ends = starts.map((s, idx) => s + durs[idx]);
    return { starts, ends, total: acc };
  }, [deck]);

  useEffect(() => {
    stopNarration();
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setStatus('idle');
    setCurrentTime(0);
    setFallbackClock(!deck.audio);
    return () => {
      stopNarration();
    };
  }, [deck.id, deck.audio]);

  const sceneIdx = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < timeline.starts.length; i++) {
      if (currentTime >= timeline.starts[i] - 0.02) {
        idx = i;
      }
    }
    return idx;
  }, [currentTime, timeline.starts]);

  const currentScene = deck.scenes[sceneIdx] ?? deck.scenes[0];
  const sceneStart = timeline.starts[sceneIdx] ?? 0;
  const sceneEnd = timeline.ends[sceneIdx] ?? timeline.total;
  const sceneSpan = Math.max(0.5, sceneEnd - sceneStart);
  const sceneProgress =
    status === 'idle'
      ? 0.75
      : status === 'ended'
      ? 1
      : Math.min(1, Math.max(0, (currentTime - sceneStart) / sceneSpan));

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = speed;
    el.muted = muted;
  }, [speed, muted]);

  useEffect(() => {
    if (deck.audio) return;
    if (status !== 'playing' || muted) {
      stopNarration();
      return;
    }
    speakNarration(currentScene.speech, speed, locale);
    return () => stopNarration();
  }, [deck.audio, status, sceneIdx, muted, speed, currentScene.speech, locale]);

  // Dual resilient playback loop: syncs from <audio> or falls back seamlessly in headless CI
  useEffect(() => {
    if (status !== 'playing') return;
    let lastAudioTime = audioRef.current?.currentTime ?? 0;
    let stalledTicks = 0;

    const timer = window.setInterval(() => {
      const el = audioRef.current;
      if (studioUrl && el && !fallbackClock && !el.error) {
        const t = el.currentTime;
        if (Math.abs(t - lastAudioTime) < 0.001) {
          stalledTicks += 1;
          if (stalledTicks >= 6) {
            setFallbackClock(true);
          }
        } else {
          stalledTicks = 0;
          lastAudioTime = t;
          setCurrentTime(t);
          if (el.ended || t >= timeline.total - 0.05) {
            setStatus('ended');
            setCurrentTime(timeline.total);
          }
          return;
        }
      }

      setCurrentTime(prev => {
        const next = prev + 0.1 * speed;
        if (next >= timeline.total) {
          setStatus('ended');
          return timeline.total;
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [status, studioUrl, fallbackClock, speed, timeline.total]);

  function startOrTogglePlay() {
    const el = audioRef.current;
    if (status === 'playing') {
      el?.pause();
      stopNarration();
      setStatus('paused');
      return;
    }

    const restart = status === 'ended' || currentTime >= timeline.total - 0.08;
    const nextTime = restart ? 0 : currentTime;
    if (restart) {
      setCurrentTime(0);
    }

    if (studioUrl && el) {
      try {
        el.currentTime = nextTime;
        el.playbackRate = speed;
        el.muted = muted;
        const p = el.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => setFallbackClock(true));
        }
      } catch {
        setFallbackClock(true);
      }
    }
    setStatus('playing');
  }

  function seekTo(targetSec: number) {
    const clamped = Math.max(0, Math.min(timeline.total, targetSec));
    setCurrentTime(clamped);
    const el = audioRef.current;
    if (studioUrl && el) {
      try {
        el.currentTime = clamped;
      } catch {
        /* ignore before metadata */
      }
    }
    if (status === 'idle' || status === 'ended') {
      if (studioUrl && el) {
        try {
          el.playbackRate = speed;
          el.muted = muted;
          const p = el.play();
          if (p && typeof p.catch === 'function') {
            p.catch(() => setFallbackClock(true));
          }
        } catch {
          setFallbackClock(true);
        }
      }
      setStatus('playing');
    }
  }

  function jumpToScene(idx: number) {
    const clampedIdx = Math.max(0, Math.min(deck.scenes.length - 1, idx));
    const cueSec = clampedIdx === 0 ? 0 : (timeline.starts[clampedIdx] ?? 0) + 0.03;
    seekTo(cueSec);
  }

  function handleScrubberClick(e: MouseEvent) {
    const track = e.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * timeline.total);
  }

  function handleScrubberKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekTo(currentTime + 4);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekTo(currentTime - 4);
    }
  }

  function cycleSpeed() {
    setSpeed(s => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1));
  }

  function toggleFullscreen() {
    const node = screenRef.current;
    if (!node || typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
    } else {
      void node.requestFullscreen?.();
    }
  }

  const vttTrackSrc = useMemo(() => {
    const fmtVtt = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const ms = Math.round((sec - Math.floor(sec)) * 1000);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    };
    const body = deck.scenes
      .map((sc, i) => {
        const st = timeline.starts[i] ?? 0;
        const en = timeline.ends[i] ?? st + sc.durationSec;
        return `${fmtVtt(st)} --> ${fmtVtt(en)}\n${sc.speech}`;
      })
      .join('\n\n');
    return `data:text/vtt;charset=utf-8,${encodeURIComponent(`WEBVTT\n\n${body}`)}`;
  }, [deck.scenes, timeline.starts, timeline.ends]);

  const progressPct =
    timeline.total > 0 ? Math.min(100, Math.max(0, (currentTime / timeline.total) * 100)) : 0;
  const finalCtaLabel = actionLabel ?? deck.ctaLabel;
  const speakerRole = currentScene.speaker ?? 'gopher';
  const isGopherTalking = status === 'playing' && !muted && speakerRole === 'gopher';

  return (
    <section
      class={`gopher-cinema aura-${currentScene.aura} ${compact ? 'is-compact' : ''} is-${status}`}
      aria-label={`Video: ${deck.heading}`}
    >
      {studioUrl && (
        <audio
          ref={audioRef}
          src={studioUrl}
          preload="metadata"
          onTimeUpdate={e => {
            if (!fallbackClock && status === 'playing') {
              setCurrentTime(e.currentTarget.currentTime);
            }
          }}
          onEnded={() => {
            setCurrentTime(timeline.total);
            setStatus('ended');
          }}
        >
          <track kind="captions" src={vttTrackSrc} srcLang={locale} label="Subtítulos" default />
        </audio>
      )}

      <div class="cinema-screen" ref={screenRef}>
        {status === 'idle' ? (
          <button
            type="button"
            class="cinema-poster"
            onClick={startOrTogglePlay}
            aria-label={`Reproducir video: ${deck.heading}`}
          >
            <div class="cinema-poster-backdrop" aria-hidden="true">
              <StageCanvas visual={currentScene.visual} progress={0.75} />
            </div>

            <div class="cinema-poster-top">
              <span class="cinema-pill-hd">
                <i class="cinema-live-dot" /> {deck.kicker}
              </span>
              <span class="cinema-pill-dur">{formatTime(timeline.total)}</span>
            </div>

            <div class="cinema-poster-center">
              <span class="cinema-play-orb" aria-hidden="true">
                <svg width={compact ? 22 : 28} height={compact ? 22 : 28} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <title>Reproducir</title>
                  <path d="M6 4.5v15a1 1 0 0 0 1.54.84l12-7.5a1 1 0 0 0 0-1.68l-12-7.5A1 1 0 0 0 6 4.5Z" />
                </svg>
              </span>
              <strong class="cinema-poster-heading">{deck.heading}</strong>
              <span class="cinema-poster-sub">
                {deck.audio ? 'Audio Estudio HD · Sofía & Gopher Senior' : 'Explicación guiada con Gopher'} ·{' '}
                {deck.scenes.length} {deck.scenes.length === 1 ? 'escena' : 'escenas'}
              </span>
            </div>

            <img
              src={`${import.meta.env.BASE_URL}assets/gophers/${currentScene.mascot}.png`}
              alt=""
              aria-hidden="true"
              class="gopher cinema-poster-mascot"
            />
          </button>
        ) : (
          <>
            <div class="cinema-top-overlay">
              <div class={`cinema-speaker-badge role-${speakerRole} ${status === 'playing' && !muted ? 'is-live' : ''}`}>
                <span class="cinema-eq" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span>{speakerRole === 'host' ? 'Sofía · Host' : 'Gopher · Mentor Senior'}</span>
              </div>

              <nav class="cinema-scene-dots" aria-label="Capítulos del video">
                {deck.scenes.map((sc, idx) => (
                  <button
                    key={sc.chapter}
                    type="button"
                    class={`cinema-dot-btn ${idx === sceneIdx ? 'active' : ''}`}
                    onClick={() => jumpToScene(idx)}
                    title={sc.chapter}
                    aria-label={`Ir a ${sc.chapter}`}
                  >
                    {sc.chapter}
                  </button>
                ))}
              </nav>
            </div>

            <div class="cinema-stage-body">
              <div class="cinema-stage-left">
                <h4 class="cinema-live-title">{currentScene.title}</h4>
                <StageCanvas visual={currentScene.visual} progress={sceneProgress} />
              </div>

              <div class="cinema-stage-mascot">
                <div class={`gopher-aura-stage aura-${currentScene.aura} ${isGopherTalking ? 'is-speaking' : ''}`}>
                  <img
                    src={`${import.meta.env.BASE_URL}assets/gophers/${currentScene.mascot}.png`}
                    alt={`Gopher (${currentScene.mascot})`}
                    class="gopher cinema-gopher-img"
                  />
                </div>
              </div>
            </div>

            {captionsOn && status !== 'ended' && (
              <div class="cinema-subtitles" aria-live="polite">
                <p>{currentScene.speech}</p>
              </div>
            )}

            {status === 'ended' && (
              <div class="cinema-ended-overlay">
                <div class="cinema-ended-card">
                  <button type="button" class="btn btn-primary" onClick={startOrTogglePlay}>
                    ↺ Volver a ver
                  </button>
                  {finalCtaLabel &&
                    (onAction || deck.ctaHref) &&
                    (onAction ? (
                      <button type="button" class="btn btn-senior-solid" onClick={onAction}>
                        {finalCtaLabel} →
                      </button>
                    ) : (
                      <a class="btn btn-senior-solid" href={deck.ctaHref}>
                        {finalCtaLabel} →
                      </a>
                    ))}
                </div>
              </div>
            )}

            <div class="cinema-bottom-bar">
              <div
                class="cinema-scrubber"
                role="slider"
                tabIndex={0}
                aria-label="Línea de tiempo del video"
                aria-valuemin={0}
                aria-valuemax={Math.round(timeline.total)}
                aria-valuenow={Math.round(currentTime)}
                onClick={handleScrubberClick}
                onKeyDown={handleScrubberKeyDown}
              >
                <div class="cinema-scrubber-track">
                  <div class="cinema-scrubber-fill" style={{ width: `${progressPct}%` }} />
                  {timeline.starts.slice(1).map(cue => {
                    const leftPct = (cue / Math.max(1, timeline.total)) * 100;
                    return <i key={cue} class="cinema-cue-tick" style={{ left: `${leftPct}%` }} />;
                  })}
                </div>
              </div>

              <div class="cinema-controls-strip">
                <div class="cinema-ctrl-group">
                  <button
                    type="button"
                    class="cinema-icon-btn is-primary"
                    onClick={startOrTogglePlay}
                    aria-label={
                      status === 'playing' ? 'Pausar video' : status === 'ended' ? 'Repetir video' : 'Reproducir video'
                    }
                  >
                    {status === 'playing' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <title>Pausar</title>
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : status === 'ended' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <title>Repetir</title>
                        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <title>Reproducir</title>
                        <path d="M6 4.5v15a1 1 0 0 0 1.54.84l12-7.5a1 1 0 0 0 0-1.68l-12-7.5A1 1 0 0 0 6 4.5Z" />
                      </svg>
                    )}
                  </button>

                  <span class="cinema-time-readout">
                    {formatTime(currentTime)} / {formatTime(timeline.total)}
                  </span>

                  <span class="cinema-chapter-inline">{currentScene.chapter}</span>
                </div>

                <div class="cinema-ctrl-group">
                  <button
                    type="button"
                    class={`cinema-icon-btn ${captionsOn ? 'is-active' : ''}`}
                    onClick={() => setCaptionsOn(c => !c)}
                    aria-pressed={captionsOn}
                    aria-label={captionsOn ? 'Ocultar subtítulos' : 'Mostrar subtítulos'}
                    title="Subtítulos (CC)"
                  >
                    CC
                  </button>

                  <button
                    type="button"
                    class="cinema-icon-btn cinema-speed-pill"
                    onClick={cycleSpeed}
                    aria-label={`Velocidad de reproducción ${speed}x`}
                  >
                    {speed}x
                  </button>

                  <button
                    type="button"
                    class={`cinema-icon-btn ${!muted ? 'is-active' : ''}`}
                    onClick={() => setMuted(m => !m)}
                    aria-pressed={!muted}
                    aria-label={muted ? 'Activar audio' : 'Silenciar audio'}
                  >
                    {muted ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <title>Silenciado</title>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <title>Audio activo</title>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    class="cinema-icon-btn"
                    onClick={toggleFullscreen}
                    aria-label="Pantalla completa"
                    title="Pantalla completa"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <title>Pantalla completa</title>
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
