import asyncio
import json
import math
import struct
import subprocess
import sys
import tempfile
import wave
from pathlib import Path
import edge_tts

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
AUDIO_OUT_DIR = ROOT / "public" / "audio"
MANIFEST_PATH = ROOT / "src" / "features" / "cinema" / "audio-manifest.json"
CHALLENGES_PATH = ROOT / "src" / "content" / "senior" / "challenges.json"
GUIDES_PATH = ROOT / "src" / "content" / "senior" / "guides.json"


def find_ffmpeg() -> str:
    """Prefer imageio_ffmpeg static binary with full libmp3lame + filter support."""
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


FFMPEG = find_ffmpeg()

# Two contrasted neural voices (Host + Senior Go Architect)
VOICE_HOST = "es-CO-SalomeNeural"    # Warm, crisp host introducing production pain
VOICE_GOPHER = "es-ES-AlvaroNeural"  # Confident, deep Senior Go mentor


def clean_for_speech(text: str) -> str:
    """Translates Go syntax & SRE terms to natural Spanish prosody while keeping exact UI subtitles."""
    replacements = [
        ("fmt.Println", "efe eme te punto print line"),
        ("fmt.Errorf", "efe eme te punto error efe"),
        ("errors.Is", "errors punto is"),
        ("errors.New", "errors punto new"),
        ("strconv.Atoi", "string conv punto a to i"),
        ("strings.Builder", "strings punto Builder"),
        ("filepath.Clean", "filepath punto Clean"),
        ("time.Sleep", "time punto Sleep"),
        ("FakeClock", "reloj simulado Fake Clock"),
        ("ctx.Done()", "context punto done"),
        ("<-ctx.Done()", "el canal context punto done"),
        ("context.Context", "context punto Context"),
        ("sync.Mutex", "sincronización con mutex"),
        ("sync/atomic", "paquete sync barra atomic"),
        ("net/http", "net barra http"),
        ("go test -run ^$ -bench . -benchmem", "go test guion bench con métricas de memoria"),
        ("go test -race ./...", "go test guion race en todos los paquetes"),
        ("go test -race", "go test guion race"),
        ("go test", "go test"),
        ("at-least-once", "entrega al menos una vez"),
        ("exactly-once", "entrega exactamente una vez"),
        ("exponential backoff con jitter", "retroceso exponencial con jitter aleatorio"),
        ("retry storm", "tormenta de reintentos"),
        ("circuit breaker", "cortacircuitos"),
        ("path traversal", "escalado de directorios"),
        ("symlinks", "enlaces simbólicos"),
        ("flaky tests", "pruebas inestables"),
        ("SQL", "ese cu ele"),
        ("happens-before", "happens before"),
        ("table-driven", "basadas en tablas"),
        ("backpressure", "contrapresión"),
        ("sub-slice", "sub slice"),
        ("backing array", "array subyacente"),
        ("escape analysis", "análisis de escape"),
        ("GC", "recolector de basura"),
        ("ns/op", "nanosegundos por operación"),
        ("B/op", "bytes por operación"),
        ("allocs/op", "asignaciones por operación"),
        ("copy()", "copy"),
        ("main.go", "main punto go"),
        ("go.mod", "go punto mod"),
        ("go.sum", "go punto sum"),
        ("[]byte", "slice de bytes"),
        ("[]string", "slice de strings"),
        ("map[string]", "mapa por string"),
        ("\"%w\"", "por ciento doble ve"),
        ("%w", "por ciento doble ve"),
        ("%v", "por ciento uve"),
        ("TTL", "tiempo de vida té té ele"),
        ("p95/p99", "pe noventa y cinco y pe noventa y nueve"),
        ("P99", "pe noventa y nueve"),
        ("p99", "pe noventa y nueve"),
        ("pprof", "pe prof"),
        ("OOM", "agotamiento de memoria"),
        ("ADR", "documento de arquitectura"),
        ("ADRs", "documentos de arquitectura"),
        ("RFC", "propuesta técnica erre efe ce"),
        ("SLO", "objetivo de nivel de servicio"),
        ("SRE", "fiabilidad operativa"),
        ("expand-and-contract", "expansión y contracción gradual"),
        ("grace period", "ventana de gracia"),
        ("readiness", "sonda de preparación"),
        ("panic", "pánico en tiempo de ejecución"),
        ("HTTP 409", "HTTP cuatrocientos nueve"),
        ("409 Conflict", "cuatrocientos nueve conflicto"),
        ("POST /charge", "POST barra charge"),
        ("POST /orders", "POST barra orders"),
        ("application/json", "application barra json"),
        ("4 KiB", "cuatro kilobytes"),
        ("ErrConflict", "error Conflict"),
        ("FuzzIdempotentReceipt", "Fuzz Idempotent Receipt"),
        ("BenchmarkSubmit", "Benchmark Submit"),
        ("labs-native", "labs guion native"),
        ("package main", "package main"),
        ("go build", "go build"),
        ("go run", "go run"),
        ("io.Writer", "i o punto Writer"),
        ("ServeMux", "Serve Mux"),
        ("http.Handler", "http punto Handler"),
        ("net/http", "net barra http"),
        ("fasthttp", "fast http"),
        ("WaitGroup", "Wait Group"),
        ("200", "doscientas"),
        ("gRPC", "ge erre pe ce"),
        ("chi", "chi"),
        ("Chi", "Chi"),
        ("Quality Gates", "puertas de calidad"),
        ("S01", "ese cero uno"),
        ("S02", "ese cero dos"),
        ("S03", "ese cero tres"),
        ("S04", "ese cero cuatro"),
        ("S05", "ese cero cinco"),
        ("S06", "ese cero seis"),
        ("S07", "ese cero siete"),
        ("S08", "ese cero ocho"),
        ("S09", "ese cero nueve"),
        ("S10", "ese diez"),
        ("S11", "ese once"),
        ("S12", "ese doce"),
        ("S13", "ese trece"),
        ("S14", "ese catorce"),
        ("S15", "ese quince"),
        ("S16", "ese dieciséis"),
        ("S17", "ese diecisiete"),
        ("S18", "ese dieciocho"),
        ("B01", "be cero uno"),
        ("I01", "i cero uno"),
        ("A01", "a cero uno"),
        ("M:N", "eme a ene"),
    ]
    out = text
    for old, new in replacements:
        out = out.replace(old, new)
    return out


def synthesize_ambient_bed(wav_path: Path, duration_sec: float, cue_times: list[float]) -> None:
    """
    Generates a warm studio electronic underscore (24kHz stereo WAV):
    - Detuned D-minor9 / F-maj7 chord pad with gentle breathing LFO
    - Intro swell (0..0.9s), ducked warm bed under dialogue, subtle crystal chime on cues
    """
    sample_rate = 24000
    total_samples = int((duration_sec + 0.6) * sample_rate)
    chord_freqs = [73.42, 110.00, 174.61, 220.00, 261.63, 329.63]
    cue_set = [t for t in cue_times if t > 0.2]

    buf = bytearray()
    two_pi = 2.0 * math.pi

    for n in range(total_samples):
        t = n / sample_rate
        if t < 0.35:
            env = (t / 0.35) * 0.11
        elif t < 1.1:
            env = 0.11 - ((t - 0.35) / 0.75) * 0.065
        elif t > duration_sec - 0.8:
            rem = max(0.0, (duration_sec + 0.55) - t) / 1.35
            env = 0.055 * (rem ** 1.4)
        else:
            env = 0.040 + 0.006 * math.sin(two_pi * 0.18 * t)

        pad_l = 0.0
        pad_r = 0.0
        for idx, f in enumerate(chord_freqs):
            detune = 1.0 + (0.0018 if idx % 2 == 0 else -0.0018)
            weight = 0.34 / (1.0 + idx * 0.35)
            s1 = math.sin(two_pi * f * t)
            s2 = math.sin(two_pi * f * detune * t + idx * 0.7)
            pad_l += weight * (0.65 * s1 + 0.35 * s2)
            pad_r += weight * (0.35 * s1 + 0.65 * s2)

        chime = 0.0
        if t < 0.9:
            chime += 0.05 * math.exp(-t * 4.2) * math.sin(two_pi * 587.33 * t)
            chime += 0.035 * math.exp(-t * 3.4) * math.sin(two_pi * 880.0 * t)
        for ct in cue_set:
            dt = t - ct
            if 0.0 <= dt < 0.55:
                chime += 0.032 * math.exp(-dt * 7.5) * math.sin(two_pi * 659.25 * dt)
                chime += 0.022 * math.exp(-dt * 6.0) * math.sin(two_pi * 987.77 * dt)

        left = max(-0.95, min(0.95, pad_l * env + chime))
        right = max(-0.95, min(0.95, pad_r * env + chime))
        buf += struct.pack("<hh", int(left * 32767), int(right * 32767))

    with wave.open(str(wav_path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(bytes(buf))


def probe_duration(media_path: Path) -> float:
    proc = subprocess.run(
        [FFMPEG, "-hide_banner", "-i", str(media_path)],
        capture_output=True,
        text=True,
    )
    out = proc.stderr or proc.stdout
    for line in out.splitlines():
        if "Duration:" in line:
            raw = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = raw.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 6.0


async def synth_turn(text: str, voice: str, rate: str, out_mp3: Path) -> float:
    comm = edge_tts.Communicate(clean_for_speech(text), voice=voice, rate=rate)
    await comm.save(str(out_mp3))
    return probe_duration(out_mp3)


async def build_deck_audio(
    deck_id: str,
    filename: str,
    scenes: list[dict],
    sem: asyncio.Semaphore,
) -> dict:
    async with sem:
        out_file = AUDIO_OUT_DIR / filename
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            scene_wavs: list[Path] = []
            cues: list[float] = []
            cursor = 0.45  # 450ms warm intro swell before first spoken word

            for idx, sc in enumerate(scenes):
                cues.append(round(cursor, 2))
                raw_mp3 = tmp / f"s_{idx}.mp3"
                voice = VOICE_HOST if sc["speaker"] == "host" else VOICE_GOPHER
                rate = sc.get("rate", "+4%")
                await synth_turn(sc["spoken"], voice, rate, raw_mp3)

                turn_wav = tmp / f"s_{idx}.wav"
                subprocess.run(
                    [
                        FFMPEG,
                        "-y",
                        "-hide_banner",
                        "-loglevel",
                        "error",
                        "-i",
                        str(raw_mp3),
                        "-af",
                        "silenceremove=start_periods=1:start_threshold=-48dB:stop_periods=-1:stop_duration=0.22:stop_threshold=-48dB,apad=pad_dur=0.28",
                        "-ar",
                        "24000",
                        "-ac",
                        "2",
                        str(turn_wav),
                    ],
                    check=True,
                )
                dur = probe_duration(turn_wav)
                scene_wavs.append(turn_wav)
                cursor += dur

            total_voice_dur = round(cursor + 0.35, 2)

            lead_wav = tmp / "lead.wav"
            subprocess.run(
                [
                    FFMPEG,
                    "-y",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-f",
                    "lavfi",
                    "-i",
                    "anullsrc=r=24000:cl=stereo:d=0.45",
                    str(lead_wav),
                ],
                check=True,
            )

            concat_list = tmp / "concat.txt"
            lines = [f"file '{lead_wav.as_posix()}'"] + [
                f"file '{w.as_posix()}'" for w in scene_wavs
            ]
            concat_list.write_text("\n".join(lines), encoding="utf-8")

            voice_track = tmp / "voice_full.wav"
            subprocess.run(
                [
                    FFMPEG,
                    "-y",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-f",
                    "concat",
                    "-safe",
                    "0",
                    "-i",
                    str(concat_list),
                    "-c",
                    "copy",
                    str(voice_track),
                ],
                check=True,
            )

            bed_wav = tmp / "bed.wav"
            synthesize_ambient_bed(bed_wav, total_voice_dur, cues)

            subprocess.run(
                [
                    FFMPEG,
                    "-y",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-i",
                    str(voice_track),
                    "-i",
                    str(bed_wav),
                    "-filter_complex",
                    "[0:a]highpass=f=85,acompressor=threshold=-18dB:ratio=2.6:attack=10:release=140:makeup=3dB[v];"
                    "[v][1:a]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0:weights='1.0 0.62',alimiter=limit=0.95[out]",
                    "-map",
                    "[out]",
                    "-codec:a",
                    "libmp3lame",
                    "-b:a",
                    "80k",
                    "-ar",
                    "24000",
                    "-ac",
                    "2",
                    str(out_file),
                ],
                check=True,
            )

            final_dur = round(probe_duration(out_file), 2)
            speakers = [sc["speaker"] for sc in scenes]
            print(f"  ✓ {filename} ({final_dur}s, {out_file.stat().st_size // 1024} KB)")
            return {
                "src": f"audio/{filename}",
                "totalSec": final_dur,
                "cues": cues,
                "speakers": speakers,
            }


def build_batch_1_scripts() -> dict[str, tuple[str, list[dict]]]:
    """First 5 studio capsules: HOME-INTRO, SENIOR-OVERVIEW, SENIOR-S01, SENIOR-S02, SENIOR-S03."""
    decks: dict[str, tuple[str, list[dict]]] = {}

    # 1. HOME-INTRO
    decks["HOME-INTRO"] = (
        "home-intro.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "¿Alguna vez sentiste que los tutoriales de Go se quedan en el hola mundo, pero al desplegar en producción aparecen fugas silenciosas de memoria, carreras de datos y bloqueos en tus APIs?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Bienvenido a GoPixel Academy. Aquí no memorizas sintaxis a ciegas: visualizas cómo crece el Heap con retención de slices, cómo coordina Go sus goroutines con canales acotados y por qué importan las fronteras limpias.",
            },
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Y cuando dominas la base de 36 lecciones interactivas, entras a Senior Mode: dieciocho escenarios reales de producción con noventa Quality Gates, diez simuladores operativos y revisión de Pull Requests.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Todo cien por ciento local y gratuito en tu navegador, respaldado por dieciocho laboratorios Go nativos descargables para validar con go test -race en tu máquina. Pulsa empezar y construyamos criterio Senior.",
            },
        ],
    )

    # 2. SENIOR-OVERVIEW
    decks["SENIOR-OVERVIEW"] = (
        "senior-overview.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Estás en Go Senior Mode. En sistemas reales ya no basta con que el binario compile rápido: cada goroutine sin límite o error tragado impacta tu P99 y la estabilidad del negocio.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Cada uno de los dieciocho módulos combina cinco Quality Gates concretos: decisiones de arquitectura, evidencias de pprof y logs, investigación por etapas, mitigación operativa y revisión crítica de código Go.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Experimenta con los diez simuladores deterministas, mide tu avance en el radar de seis dominios y descarga el código fuente real para comprobar cada invariante con go test -race ./...",
            },
        ],
    )

    # 3. SENIOR-S01 (Go idiomático, interfaces pequeñas y %w)
    decks["SENIOR-S01"] = (
        "senior-s01.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S01: Go idiomático y refactoring. Tenemos un servicio atado a interfaces gigantes y un parser que ante una entrada inválida devuelve cero sin avisar del fallo. ¿Dónde está el peligro?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Un zero value ambiguo permite procesar pedidos con cantidad cero como si fueran válidos. Debemos envolver el error de strconv.Atoi con fmt.Errorf \"%w\" para conservar la cadena comprobable con errors.Is.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Además, mueve la interfaz mínima al paquete consumidor y protege cada cambio con pruebas table-driven en go test -race. Nunca rompas contratos públicos solo por añadir abstracciones.",
            },
        ],
    )

    # 4. SENIOR-S02 (Arquitectura modular, hexagonal e inversión de dependencias)
    decks["SENIOR-S02"] = (
        "senior-s02.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S02: arquitectura modular y hexagonal. El monolito mezcló reglas de dominio dentro del adaptador SQL y empezaron a surgir ciclos de importación entre paquetes. ¿Cómo lo desacoplamos sin sobre-ingeniería?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Invertimos la dependencia sin inventar capas vacías: el servicio de negocio define su interfaz pequeña de repositorio y recibe la implementación real por constructor, nunca desde variables globales.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Así puedes inyectar un fake determinista en memoria dentro de tus pruebas unitarias, verificar que errors.Is sobrevive al adaptador de infraestructura y mantener el monolito limpio y testeable.",
            },
        ],
    )

    # 5. SENIOR-S03 (APIs de pagos idempotentes, mutex y TTL)
    decks["SENIOR-S03"] = (
        "senior-s03.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S03: diseño profesional de APIs. Un cliente sufre un corte de red tras pulsar pagar y su aplicación reintenta POST /charge dos veces seguidas. ¿Cómo evitamos cobrarle el doble?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Exigimos una clave de idempotencia estable por operación dentro de una sección crítica con sync.Mutex o transacción. Si la clave repite exactamente el mismo monto, devolvemos el recibo original sin sumar al saldo.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Y si la clave se reutiliza con distinto importe respondemos HTTP 409 conflicto, manteniendo el TTL de caché por encima de la ventana de reintentos y validándolo con cincuenta goroutines en go test -race.",
            },
        ],
    )

    return decks


def build_batch_2_scripts() -> dict[str, tuple[str, list[dict]]]:
    """Second 5 studio capsules: SENIOR-S04, SENIOR-S05, SENIOR-S06, SENIOR-S07, SENIOR-S08."""
    decks: dict[str, tuple[str, list[dict]]] = {}

    # 6. SENIOR-S04 (Modelado del dominio e invariantes de estados)
    decks["SENIOR-S04"] = (
        "senior-s04.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S04: modelado del dominio. El controlador HTTP cambia el estado de un pedido directamente y terminan marcando órdenes como canceladas después de haberse pagado. ¿Cómo protegemos esas reglas?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Sacamos la máquina de estados del handler y la encerramos en métodos atómicos del agregado Order. Si un pedido ya está en Paid o Cancelled, cualquier transición inválida debe rechazarse antes de tocar datos.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Protege el límite de consistencia probando transiciones válidas, inválidas y repetidas en go test -race, documentando cada precondición en tu documento de arquitectura.",
            },
        ],
    )

    # 7. SENIOR-S05 (Worker pools cancelables y backpressure)
    decks["SENIOR-S05"] = (
        "senior-s05.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S05: concurrencia de producción. Nuestro worker pool lanza goroutines sin control durante picos de tráfico y un envío bloqueado congela el shutdown del servidor. ¿Cómo lo domamos?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Acota siempre el número de workers y la capacidad de la cola, propagando context.Context con select sobre <-ctx.Done() para cancelar envíos al instante y aplicar contrapresión al llenar la cola.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Solo el productor propietario cierra el canal de trabajos y el coordinador espera con WaitGroup antes de retornar. Prueba saturación, cero workers y cancelaciones con go test -race.",
            },
        ],
    )

    # 8. SENIOR-S06 (Memory Model, happens-before y carreras lógicas)
    decks["SENIOR-S06"] = (
        "senior-s06.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S06: Memory Model y atómicos. Ejecuté go test -race y salió totalmente limpio, pero mi balance financiero sigue descuadrando bajo carga concurrente. ¿Cómo puede existir una carrera sin aviso?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "El detector detecta accesos físicos inseguros, pero no carreras lógicas de negocio. Si lees un saldo atómico y luego restas en otra operación atómica separada, otro hilo puede colarse entre ambas líneas.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Usa sync/atomic solo en contadores simples e independientes; cuando una invariante abarca varias comprobaciones coordinadas, protege la transacción completa con sync.Mutex o propiedad exclusiva.",
            },
        ],
    )

    # 9. SENIOR-S07 (Runtime, retención de backing array y escape analysis)
    decks["SENIOR-S07"] = (
        "senior-s07.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S07: runtime, memoria y recolector de basura. Solo guardamos cien bytes de cabecera de cada archivo recibido, pero la memoria del servicio sube hasta provocar OOM en producción. ¿Por qué?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "En Go, un sub-slice sigue apuntando al array subyacente completo de diez megabytes. Mientras viva esa pequeña referencia de cien bytes, el recolector de basura nunca puede liberar el bloque gigante en el Heap.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Si el fragmento vivirá minutos en memoria, crea un slice exacto y usa copy() para cortar la referencia al bloque grande, validando con análisis de escape y perfiles reales de Heap.",
            },
        ],
    )

    # 10. SENIOR-S08 (Ingeniería de rendimiento, profiling y benchmarks)
    decks["SENIOR-S08"] = (
        "senior-s08.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S08: ingeniería de rendimiento. Un compañero propuso reescribir medio módulo asegurando que reduce diez veces las asignaciones de memoria. ¿Lo aprobamos directamente en el Pull Request?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Jamás optimices a ciegas sin perfilar ni comparar la misma semántica con datos representativos. Preasignar capacidad o usar strings.Builder con Grow solo vale el coste si lo confirman las métricas reales.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Ejecuta go test -run ^$ -bench . -benchmem en condiciones reproducibles, revisa nanosegundos, B/op y allocs/op en varias muestras, y conserva tests de regresión para proteger el comportamiento.",
            },
        ],
    )

    return decks


def build_batch_3_scripts() -> dict[str, tuple[str, list[dict]]]:
    """Third 5 studio capsules: SENIOR-S09, SENIOR-S10, SENIOR-S11, SENIOR-S12, SENIOR-S13."""
    decks: dict[str, tuple[str, list[dict]]] = {}

    # 11. SENIOR-S09 (Sistemas distribuidos, at-least-once y deduplicación)
    decks["SENIOR-S09"] = (
        "senior-s09.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S09: sistemas distribuidos. Nuestra cola reenvía eventos fuera de orden y en ocasiones repetidos, duplicando envíos a clientes. ¿No bastaría guardar los IDs vistos en un mapa de Go?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Un mapa en memoria solo protege una réplica y desaparece al reiniciar el contenedor. Con entrega at-least-once real, necesitas una clave de deduplicación durable compartida por todas las instancias.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Define ventana de expiración, diseña consumidores idempotentes sin asumir orden global y comprueba eventos repetidos y desordenados ejecutando go test -race en tus pruebas.",
            },
        ],
    )

    # 12. SENIOR-S10 (Datos, consistencia e inventario sin sobreventa)
    decks["SENIOR-S10"] = (
        "senior-s10.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S10: datos y consistencia. Quedaba una última unidad en stock y dos compradores la adquirieron a la vez dejando el inventario en menos uno, pese a usar sync.Mutex en el servidor Go.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "El clásico fallo en escalado horizontal: un mutex local en memoria no coordina varias réplicas del servicio, ni tampoco validar en una lectura y descontar en otra transacción distinta.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Combina validación y descuento de forma atómica en la base de datos con bloqueos, nivel de aislamiento o actualización condicional, verificando bajo compradores simultáneos con go test -race.",
            },
        ],
    )

    # 13. SENIOR-S11 (Resiliencia, backoff con jitter y presupuesto de reintentos)
    decks["SENIOR-S11"] = (
        "senior-s11.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S11: resiliencia y fallos parciales. Un microservicio aguas abajo tardó dos segundos extra en responder y los reintentos automáticos multiplicaron por cinco el tráfico hasta tumbar todo el clúster.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Reintentar en bucle sin freno genera amplificación inmediata y convierte un tropiezo leve en una caída total. Los timeouts deben caber dentro del presupuesto extremo a extremo de la petición.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Aplica exponential backoff con jitter para espaciar ráfagas, limita el presupuesto de reintentos solo a operaciones idempotentes y fija políticas claras de apertura en tu circuit breaker.",
            },
        ],
    )

    # 14. SENIOR-S12 (Seguridad backend, SQL parametrizado y path traversal)
    decks["SENIOR-S12"] = (
        "senior-s12.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S12: seguridad backend. Un endpoint permite descargar facturas enviando un nombre de archivo y el auditor señaló riesgo crítico de lectura arbitraria aunque ya llamábamos a filepath.Clean.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Mucho cuidado: filepath.Clean por sí solo no bloquea rutas absolutas ni escapes mediante symlinks maliciosos. Además, siempre debemos verificar permisos por objeto y nunca exponer secretos al cliente.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Rechaza escapes léxicos y enlaces simbólicos fuera de la raíz segura, usa placeholders parametrizados en SQL y prueba casos hostiles como punto punto barra en go test -race.",
            },
        ],
    )

    # 15. SENIOR-S13 (Testing complejo, reloj inyectado y cero flaky tests)
    decks["SENIOR-S13"] = (
        "senior-s13.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S13: testing de sistemas complejos. Nuestra suite tarda doce minutos y falla al azar en integración continua porque varios tests esperan expiraciones reales con time.Sleep.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Nunca apagues flaky tests para publicar ni dependas del reloj real del sistema. Inyecta una interfaz de reloj en tus componentes para separar el tiempo de negocio de la infraestructura.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Con un FakeClock determinista avanzas horas en microsegundos, verificas el instante exacto anterior y posterior al vencimiento y combinas fuzzing con go test -race sin pausas frágiles.",
            },
        ],
    )

    return decks


def build_batch_4_scripts() -> dict[str, tuple[str, list[dict]]]:
    """Final 5 Senior Mode capsules: SENIOR-S14, SENIOR-S15, SENIOR-S16, SENIOR-S17, SENIOR-S18."""
    decks: dict[str, tuple[str, list[dict]]] = {}

    # 16. SENIOR-S14 (Observabilidad e incidentes, P95/P99 y cardinalidad)
    decks["SENIOR-S14"] = (
        "senior-s14.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S14: observabilidad e incidentes. Nuestro panel muestra una latencia promedio excelente de diez milisegundos, pero clientes reales reportan bloqueos de tres segundos en el checkout. ¿Por qué miente el gráfico?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "La media esconde siempre las colas largas: un uno por ciento de peticiones sufriendo pausas de recolector de basura destruye la experiencia aunque el promedio luzca verde. Observa percentiles p95/p99 junto a errores y throughput.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Correlaciona logs y trazas con context, evita etiquetas con cardinalidad explosiva como IDs de usuario, diseña alertas basadas en SLO y prueba el cálculo exacto de percentiles con go test -race.",
            },
        ],
    )

    # 17. SENIOR-S15 (Despliegue, readiness y graceful shutdown)
    decks["SENIOR-S15"] = (
        "senior-s15.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S15: despliegue y operaciones. Cada vez que subimos una nueva versión a producción caen conexiones activas con error 502 o surgen panic al cerrar canales mientras aún llegan peticiones.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "El orden del apagado es sagrado: primero marca readiness como falso para sacar la instancia del balanceador, detén a los productores y drena los trabajos en curso dentro de un grace period acotado.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Solo el dueño del canal puede cerrarlo cuando nadie más envía; valida apagado doble, cancelación y cero goroutines huérfanas con go test -race, y documenta tu rollback reversible.",
            },
        ],
    )

    # 18. SENIOR-S16 (Migraciones, expand-and-contract y compatibilidad)
    decks["SENIOR-S16"] = (
        "senior-s16.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S16: migraciones y mantenimiento. Renombramos un campo del JSON y una columna SQL en el mismo despliegue; al instante fallaron las aplicaciones móviles con la versión anterior. ¿Cómo evolucionamos sin romper?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Aplica el patrón expand-and-contract: primero despliega soporte dual aceptando formatos antiguos y nuevos durante una ventana de coexistencia segura, antes de retirar campos heredados.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Versiona esquemas, prueba tanto cargas históricas como campos desconocidos ejecutando go test -race y define métricas de adopción junto con un plan de rollback antes de contraer el contrato.",
            },
        ],
    )

    # 19. SENIOR-S17 (Liderazgo técnico, RFC, ADRs y prioridad en Code Review)
    decks["SENIOR-S17"] = (
        "senior-s17.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S17: liderazgo técnico. Frente a un Pull Request enorme o un RFC complejo, es fácil enredarse discutiendo estilos menores y dejar pasar un riesgo grave de concurrencia o seguridad.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Una revisión Senior evalúa primero corrección, invariantes y seguridad, nunca opiniones subjetivas sin respaldo. Prioriza cada hallazgo multiplicando su probabilidad por su impacto real.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Evita comentarios vagos: enlaza la prueba concreta que reproduce el riesgo, propón una alternativa medible en go test -race y preserva siempre el porqué de las decisiones en tus ADRs.",
            },
        ],
    )

    # 20. SENIOR-S18 (System Design final, Ley de Little y backpressure)
    decks["SENIOR-S18"] = (
        "senior-s18.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Caso S18: examen final de System Design. Debemos diseñar una plataforma distribuida de trabajos bajo picos intensos. La tentación rápida es subir workers a diez mil y esperar lo mejor, ¿cierto?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Subir workers sin proteger las dependencias aguas abajo solo multiplica la contención y empeora el P99. Dimensiona concurrencia con la Ley de Little multiplicando tasa de llegada por latencia y utilización objetivo.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Aclara restricciones antes de dibujar cajas, diseña etapas incrementales con backpressure explícito, prueba tasas extremas de saturación con go test -race y completa ahora tu Capstone Senior.",
            },
        ],
    )

    return decks


def build_batch_5_scripts() -> dict[str, tuple[str, list[dict]]]:
    """Next 5 capsules: SENIOR-CAPSTONE, LESSON-B01, LESSON-I01, LESSON-A01, FRAMEWORKS-OVERVIEW."""
    decks: dict[str, tuple[str, list[dict]]] = {}

    # 21. SENIOR-CAPSTONE (Capstone de Órdenes + Outbox en Go)
    decks["SENIOR-CAPSTONE"] = (
        "senior-capstone.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "El Capstone Senior conecta HTTP, inventario con 200 goroutines e idempotencia. Si aceptamos cuerpos ilimitados, reutilizamos claves o consultamos stock fuera del mutex, el sistema colapsa o sobrevende.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Por eso blindamos la frontera con POST /orders, application/json estricto hasta 4 KiB y token de desarrollo; el store reserva bajo sync.Mutex, memoriza recibos idempotentes o devuelve ErrConflict, y encola eventos en un Outbox copiado de forma segura.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Para comprobar cada invariante en tu máquina, descarga labs-native y ejecuta go test -race junto con FuzzIdempotentReceipt y BenchmarkSubmit. Así cierras el círculo completo de Senior Mode con código real.",
            },
        ],
    )

    # 22. LESSON-B01 (Primer programa Go: package main, import, fmt.Println)
    decks["LESSON-B01"] = (
        "lesson-b01.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Estás frente a B01, tu primer programa en Go. ¿Por qué todo ejecutable empieza obligatoriamente declarando package main, importando fmt y definiendo una func main sin parámetros?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Porque el compilador go build usa package main como punto de entrada único, enlaza únicamente paquetes declarados como fmt, rechaza variables o imports sin usar desde el primer segundo y genera un binario nativo autónomo.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "En GoPixel el navegador verifica la sintaxis de tu solución al instante, y cuando quieras compilar programas completos usarás go run o go build en tu terminal. Completa fmt.Println en main.go para ganar tu primer logro.",
            },
        ],
    )

    # 23. LESSON-I01 (Interfaces implícitas e inyección de dependencias)
    decks["LESSON-I01"] = (
        "lesson-i01.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Saltamos al nivel intermedio I01: en otros lenguajes las clases declaran implements explícitamente. ¿Por qué Go permite que un struct cumpla una interfaz sin escribir jamás esa palabra clave?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Son interfaces implícitas: si un tipo concreto implementa los métodos exactos que pide io.Writer o tu propio Store, ya satisface el contrato en tiempo de compilación sin acoplar paquetes entre sí ni crear jerarquías rígidas.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Al definir interfaces pequeñas justo donde las consumes, pruebas servicios HTTP o repositorios sustituyendo memoria real por fakes deterministas en go test sin levantar bases de datos pesadas.",
            },
        ],
    )

    # 24. LESSON-A01 (Goroutines M:N, canales tipados y WaitGroup)
    decks["LESSON-A01"] = (
        "lesson-a01.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "Llegamos a A01, nivel avanzado. Un hilo del sistema operativo pesa megabytes, así que crear miles frena el servidor. ¿Cómo logra Go ejecutar decenas de miles de tareas concurrentes sin saturar la memoria?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Una goroutine nace con apenas dos kilobytes de stack dinámico y el runtime M:N de Go las multiplexa sobre pocos núcleos reales. En lugar de compartir memoria sin cuidado, comunican valores seguros usando canales tipados.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Recuerda siempre coordinar el cierre con context.Context y WaitGroup para no dejar goroutines colgadas en background, y valida cada lección concurrente pasando go test -race.",
            },
        ],
    )

    # 25. FRAMEWORKS-OVERVIEW (net/http, Chi, Gin, Echo, Fiber y gRPC)
    decks["FRAMEWORKS-OVERVIEW"] = (
        "frameworks-overview.mp3",
        [
            {
                "speaker": "host",
                "rate": "+5%",
                "spoken": "En Frameworks Academy hay ocho rutas: net/http estándar, Gin, Chi, Echo, Fiber, persistencia y gRPC. ¿Necesitas siempre instalar un framework pesado para exponer una API rápida en Go?",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Depende de tu restricción real: desde Go 1.22 ServeMux soporta rutas con método y parámetros sin dependencias externas; Chi mantiene cien por cien compatibilidad http.Handler; Gin y Echo agilizan JSON; y Fiber prioriza ultra baja latencia con fasthttp.",
            },
            {
                "speaker": "gopher",
                "rate": "+4%",
                "spoken": "Compara throughput, P99 y asignaciones por operación en la tabla inferior, elige la herramienta más simple que cumpla tus requisitos y lleva ese criterio arquitectónico directamente a Senior Mode.",
            },
        ],
    )

    return decks


async def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else "--batch5"
    AUDIO_OUT_DIR.mkdir(parents=True, exist_ok=True)
    if mode == "--all":
        decks = {
            **build_batch_1_scripts(),
            **build_batch_2_scripts(),
            **build_batch_3_scripts(),
            **build_batch_4_scripts(),
            **build_batch_5_scripts(),
        }
    elif mode == "--batch1":
        decks = build_batch_1_scripts()
    elif mode == "--batch2":
        decks = build_batch_2_scripts()
    elif mode == "--batch3":
        decks = build_batch_3_scripts()
    elif mode == "--batch4":
        decks = build_batch_4_scripts()
    else:
        decks = build_batch_5_scripts()
    print(f"🎙️ Generando {len(decks)} pistas de audio neuronal HD + mastering de estudio con {FFMPEG}...")
    sem = asyncio.Semaphore(5)

    tasks = {
        deck_id: asyncio.create_task(build_deck_audio(deck_id, fname, scenes, sem))
        for deck_id, (fname, scenes) in decks.items()
    }

    manifest: dict = {}
    if MANIFEST_PATH.exists():
        try:
            manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception:
            manifest = {}

    for deck_id, task in tasks.items():
        manifest[deck_id] = await task

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"\n✅ Audio manifest guardado en {MANIFEST_PATH} ({len(manifest)} videos listos)")


if __name__ == "__main__":
    asyncio.run(main())
