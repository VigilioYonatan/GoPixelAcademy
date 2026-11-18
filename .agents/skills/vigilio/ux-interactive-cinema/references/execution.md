# Ejecución y casos adversarios — ux-interactive-cinema

1. Leer `SKILL.md` y validar que exista `ffmpeg` con `libmp3lame` (`imageio-ffmpeg` si falta en `PATH`).
2. Usar UTF-8 explícito en `scripts/generate-cinema-audio.py`.
3. Casos adversarios obligatorios en QA:
   - Entorno CI headless sin tarjeta de sonido: tras `>= 600 ms` sin avance de `audio.currentTime`, conmutar al reloj interno sin bloquear la UI.
   - Cambio rápido de ruta/módulo: pausar `<audio>` y reiniciar `currentTime = 0`.
   - Símbolos Go (`fmt.Errorf`, `%w`, `<-ctx.Done()`, `P99`, `S01..S18`) traducidos en `clean_for_speech`, preservando código exacto en subtítulos `<track kind="captions">`.
   - Móvil `390×844` sin desbordamiento horizontal y respeto a `prefers-reduced-motion` / `data-reduced-motion`.
