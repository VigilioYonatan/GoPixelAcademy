---
name: ux-interactive-cinema
description: Diseño e implementación de videos intro minimalistas de cuadro único, pizarras didácticas animadas en HTML/CSS sin gasto de tokens y audio neuronal HD conversacional a dos voces masterizado en estudio (estilo NotebookLM / trailers tech).
owner: governance-platform
lifecycle: stable
introduced_in: 0.8.0
routing_ecosystems: "any"
routing_keywords: "video intro,reproductor interactivo,cinema player,pizarra animada,notebooklm,voz neuronal,audio estudio,explicacion animada,onboarding video,tts profesional"
routing_files: "package.json"
routing_capabilities: "feature,ux,audio,onboarding"
requires:
  - ui-interaction-motion
  - ux-accessibility
---

# ux-interactive-cinema — procedimiento Senior/Staff

1. **Cuadro Único Minimalista («Solo darle Play»):**
   - Prohibido apilar cajas periféricas fuera del reproductor.
   - Estado `idle`: póster limpio con duración, insignia HD y botón circular central `▶`.
   - Estado `playing | paused`: locutor con ecualizador, capítulos, pizarra semántica vectorizada (`JetBrains Mono`), subtítulos `CC` y barra inferior delgada con `scrubber` continuo.
2. **Ahorro total de tokens y megabytes (`0` LLM en runtime, `0` `.mp4` pesados):**
   - Pizarras DOM/CSS/SVG reutilizables (`architecture`, `stack-heap`, `code-diff`, `lanes`, `terminal`).
3. **Audio Neuronal HD a 2 Voces + Mastering DSP (`ffmpeg`):**
   - Alternar `Host` curioso + `Gopher Senior` mentor con diccionario fonético (`clean_for_speech`), colchón armónico cálido a `24 kHz`, `highpass=85Hz`, `acompressor` y `alimiter` hacia `.mp3` a `80 kbps`, exportando `audio-manifest.json`.
   - Adaptador de reloj dual resiliente (`<audio>` real + respaldo automático en entornos headless sin dispositivo de sonido).

Consultar [references/execution.md](references/execution.md) antes de auditar o ampliar módulos cinema.
