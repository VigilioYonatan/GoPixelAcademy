---
name: gopher-pixel-cinema
version: 0.9.0
description: Reproductor minimalista de cuadro único (GopherPlayer) con pizarras HTML/CSS animadas para Go Backend y pistas de audio neuronal HD conversacional a 2 voces masterizadas en estudio.
---

# Gopher Pixel Cinema — Arquitectura y Operación en GoPixel Academy

## Archivos del módulo
- `src/features/cinema/cinema.types.ts` — contratos `CinemaDeck`, `CinemaScene`, `StageVisual`, `SpeakerRole` y `StudioAudioMeta`.
- `src/features/cinema/audio-manifest.json` — tiempos exactos (`totalSec`, `cues[]`, `speakers[]`) medidos tras mastering `ffmpeg`.
- `src/features/cinema/audio.ts` — `resolveStudioAudio` y `cleanForSpeech` adaptado a Go.
- `src/features/cinema/storyboards.ts` — 40 guiones curados estudio HD: `HOME_INTRO_DECK`, `SENIOR_OVERVIEW_DECK`, 18 Senior (`S01..S18`), `SENIOR_CAPSTONE_DECK`, Básico (`B01..B12`), Intermedio (`I01..I05`), `A01` y `FRAMEWORKS_OVERVIEW_DECK`.
- `src/features/cinema/GopherPlayer.tsx` — reproductor `16:9` de cuadro único con póster `▶`, ecualizador de locutor, 5 pizarras Go (`terminal`, `stack-heap`, `lanes`, `code-diff`, `architecture`), `WebVTT` (`<track kind="captions">`), `scrubber` continuo y reloj dual resiliente.
- `scripts/generate-cinema-audio.py` — pipeline TTS 2 voces (`es-CO-SalomeNeural` + `es-ES-AlvaroNeural`) + mastering DSP (`ffmpeg` → `public/audio/*.mp3`).

## Reglas de calidad
1. Todo cambio de texto hablado en `scripts/generate-cinema-audio.py` obliga a sincronizar `storyboards.ts` y regenerar `.mp3` + `audio-manifest.json`.
2. Usar sintaxis Go coloreada (`renderTokens`) y `JetBrains Mono` en los tableros de código.
3. Validar con `npm run lint`, `npm test`, `npm run build` y `npm run test:buttons` + inspección visual en desktop y móvil (`390×844`).
