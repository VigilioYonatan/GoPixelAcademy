import { resolveStudioAudio } from './audio';
import type { CinemaDeck } from './cinema.types';

function attachAudio(deck: CinemaDeck): CinemaDeck {
  const audio = resolveStudioAudio(deck.id);
  if (!audio) return deck;
  return {
    ...deck,
    audio,
    scenes: deck.scenes.map((sc, idx) => ({
      ...sc,
      speaker: audio.speakers?.[idx] ?? sc.speaker ?? 'gopher',
    })),
  };
}

/** 1. Video Intro Principal para la portada (Inicio) */
export const HOME_INTRO_DECK: CinemaDeck = attachAudio({
  id: 'HOME-INTRO',
  kicker: 'VIDEO INTRO · ESTUDIO HD',
  heading: 'De tu primer fmt.Println a Ingeniero Go Senior',
  ctaLabel: 'Entrar a Senior Mode',
  ctaHref: '#/senior',
  scenes: [
    {
      chapter: '01 · El Reto',
      title: 'La brecha entre el hola mundo y producción real',
      durationSec: 12,
      mascot: 'question',
      aura: 'ember',
      speaker: 'host',
      speech:
        '¿Alguna vez sentiste que los tutoriales de Go se quedan en el hola mundo, pero al desplegar en producción aparecen fugas silenciosas de memoria, carreras de datos y bloqueos en tus APIs?',
      visual: {
        kind: 'architecture',
        mode: 'incident',
        nodes: [
          { label: 'API Go', sub: 'Goroutines sin límite', state: 'hot' },
          { label: 'Heap Slice', sub: '10 MB retenidos', state: 'hot' },
          { label: 'Pool SQL', sub: 'Timeouts 5xx', state: 'hot' },
        ],
        metricLabel: 'Latencia P99 bajo ráfaga',
        metricBefore: '28 ms',
        metricAfter: '1,650 ms ⚠',
      },
    },
    {
      chapter: '02 · Memoria Visual',
      title: 'Escape Analysis, Stack, Heap y Goroutines en vivo',
      durationSec: 12,
      mascot: 'coding',
      aura: 'cyan',
      speaker: 'gopher',
      speech:
        'Bienvenido a GoPixel Academy. Aquí no memorizas sintaxis a ciegas: visualizas cómo crece el Heap con retención de slices, cómo coordina Go sus goroutines con canales acotados y por qué importan las fronteras limpias.',
      visual: {
        kind: 'stack-heap',
        mode: 'solution',
        stackLabel: 'SLICE HEADER (Stack · 24B)',
        stackItems: [
          { name: 'raw := read10MB()', value: 'ptr ──▶ 0x7f00', state: 'moved' },
          { name: 'header := copy()', value: 'len: 64B (aislado)', state: 'borrow' },
        ],
        heapLabel: 'HEAP & GARBAGE COLLECTOR',
        heapItems: [
          {
            addr: '0x9a20',
            data: 'make([]byte, 64)',
            note: 'Copia defensiva: libera los 10 MB originales en el próximo ciclo GC',
            alert: false,
          },
        ],
      },
    },
    {
      chapter: '03 · Senior Mode',
      title: '18 escenarios de producción, 90 Quality Gates y SRE',
      durationSec: 11,
      mascot: 'senior',
      aura: 'gold',
      speaker: 'host',
      speech:
        'Y cuando dominas la base de 36 lecciones interactivas, entras a Senior Mode: dieciocho escenarios reales de producción con noventa Quality Gates, diez simuladores operativos y revisión de Pull Requests.',
      visual: {
        kind: 'lanes',
        mode: 'ordered',
        statusBadge: '5 QUALITY GATES POR MÓDULO',
        laneA: {
          name: 'G1–G3 · Diagnóstico',
          steps: ['Decisiones', 'Evidencias pprof', 'Investigación'],
        },
        laneB: {
          name: 'G4–G5 · Mitigación',
          steps: ['Incidente SRE', 'Code Review PR', '10 Simuladores'],
        },
      },
    },
    {
      chapter: '04 · Go Nativo',
      title: '100% local en navegador + pruebas reales con go test -race',
      durationSec: 11,
      mascot: 'celebrate',
      aura: 'cyan',
      speaker: 'gopher',
      speech:
        'Todo cien por ciento local y gratuito en tu navegador, respaldado por dieciocho laboratorios Go nativos descargables para validar con go test -race en tu máquina. Pulsa empezar y construyamos criterio Senior.',
      visual: {
        kind: 'terminal',
        title: 'labs-native · Go 1.23+',
        lines: [
          { prompt: '$', text: 'go test -race ./...', tone: 'cmd' },
          { text: 'ok   gopixel/s03-idempotency   0.214s', tone: 'ok' },
          { text: 'ok   gopixel/s05-worker-pool   0.382s', tone: 'ok' },
          { text: 'PASS · 0 data races · 18/18 laboratorios verificados', tone: 'ok' },
        ],
      },
    },
  ],
});

/** 2. Intro de Senior Mode Dashboard (#/senior) */
export const SENIOR_OVERVIEW_DECK: CinemaDeck = attachAudio({
  id: 'SENIOR-OVERVIEW',
  kicker: 'SENIOR MODE · BRIEFING DE INGENIERÍA',
  heading: 'Cómo entrenar criterio de producción en los 90 Quality Gates',
  ctaLabel: 'Ir al Radar de Competencias',
  ctaHref: '#/senior/readiness',
  scenes: [
    {
      chapter: '01 · Criterio Senior',
      title: 'Más allá de compilar: latencia P99, invariantes y memoria',
      durationSec: 11,
      mascot: 'architecture',
      aura: 'gold',
      speaker: 'host',
      speech:
        'Estás en Go Senior Mode. En sistemas reales ya no basta con que el binario compile rápido: cada goroutine sin límite o error tragado impacta tu P99 y la estabilidad del negocio.',
      visual: {
        kind: 'architecture',
        mode: 'incident',
        nodes: [
          { label: 'HTTP Ingress', sub: 'Sin timeouts ni límites', state: 'hot' },
          { label: 'Worker Pool', sub: 'Cola no acotada', state: 'hot' },
          { label: 'Postgres', sub: 'Saturado (429 / 503)', state: 'hot' },
        ],
        metricLabel: 'Impacto en servicio',
        metricBefore: 'Compila ✓',
        metricAfter: 'Caída en producción ✗',
      },
    },
    {
      chapter: '02 · 5 Quality Gates',
      title: 'Ciclo completo: Decisiones, Evidencias, SRE y Code Review',
      durationSec: 12,
      mascot: 'debug',
      aura: 'cyan',
      speaker: 'gopher',
      speech:
        'Cada uno de los dieciocho módulos combina cinco Quality Gates concretos: decisiones de arquitectura, evidencias de pprof y logs, investigación por etapas, mitigación operativa y revisión crítica de código Go.',
      visual: {
        kind: 'lanes',
        mode: 'ordered',
        statusBadge: 'RUTA DETERMINISTA S01–S18',
        laneA: {
          name: 'Análisis Técnico',
          steps: ['G1 · Decision Lab', 'G2 · Evidence Lab', 'G3 · Investigation'],
        },
        laneB: {
          name: 'Producción Real',
          steps: ['G4 · Operations SRE', 'G5 · Code Review', 'ADR + Guía Go'],
        },
      },
    },
    {
      chapter: '03 · Validación Real',
      title: '10 Simuladores SRE, Radar de 6 ejes y labs Go nativos',
      durationSec: 11,
      mascot: 'senior',
      aura: 'gold',
      speaker: 'gopher',
      speech:
        'Experimenta con los diez simuladores deterministas, mide tu avance en el radar de seis dominios y descarga el código fuente real para comprobar cada invariante con go test -race ./...',
      visual: {
        kind: 'terminal',
        title: 'senior-labs · go test -race',
        lines: [
          { prompt: '$', text: 'cd labs-native && go test -race ./...', tone: 'cmd' },
          { text: 'ok   gopixel/s01-idiomatic-errors    0.14s', tone: 'ok' },
          { text: 'ok   gopixel/s07-slice-retention     0.19s', tone: 'ok' },
          { text: 'ok   gopixel/s18-capacity-capstone   0.41s', tone: 'ok' },
        ],
      },
    },
  ],
});

/** 3–5. Primeros 3 briefings de módulos Senior (S01, S02, S03) */
const SENIOR_MODULE_DECKS: Record<string, CinemaDeck> = {
  S01: attachAudio({
    id: 'SENIOR-S01',
    kicker: 'BRIEFING S01 · GO IDIOMÁTICO',
    heading: 'S01 · Interfaces pequeñas y cadena de errores con %w',
    ctaLabel: 'Abrir Decision Lab (G1)',
    ctaHref: '#/senior/S01/decision-lab',
    scenes: [
      {
        chapter: '01 · El Peligro',
        title: 'Zero values ambiguos e interfaces gigantes acopladas',
        durationSec: 11,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S01: Go idiomático y refactoring. Tenemos un servicio atado a interfaces gigantes y un parser que ante una entrada inválida devuelve cero sin avisar del fallo. ¿Dónde está el peligro?',
        visual: {
          kind: 'code-diff',
          file: 's01-idiomatic-errors/parser.go',
          before: [
            'n, _ := strconv.Atoi(raw) // oculta el error',
            'return n // devuelve 0 silencioso',
          ],
          after: [
            'if err != nil { return 0, fmt.Errorf("qty: %w", err) }',
            'if n <= 0 { return 0, errors.New("must be positive") }',
          ],
          callout: 'Un 0 silencioso puede confirmar pedidos corruptos en producción.',
        },
      },
      {
        chapter: '02 · Refactor Idiomático',
        title: 'Envolver errores con %w para preservar errors.Is',
        durationSec: 12,
        mascot: 'coding',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Un zero value ambiguo permite procesar pedidos con cantidad cero como si fueran válidos. Debemos envolver el error de strconv.Atoi con fmt.Errorf "%w" para conservar la cadena comprobable con errors.Is.',
        visual: {
          kind: 'architecture',
          mode: 'mitigated',
          nodes: [
            { label: 'strconv.Atoi', sub: 'ErrSyntax original', state: 'normal' },
            { label: 'fmt.Errorf("%w")', sub: 'Contexto + Wrap', state: 'ok' },
            { label: 'errors.Is()', sub: 'Inspección segura', state: 'ok' },
          ],
          metricLabel: 'Contrato de errores',
          metricBefore: '%v (rompe cadena)',
          metricAfter: '%w (trazable y comprobable)',
        },
      },
      {
        chapter: '03 · Contrato y Pruebas',
        title: 'Interfaces en el consumidor y pruebas table-driven',
        durationSec: 12,
        mascot: 'graduate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Además, mueve la interfaz mínima al paquete consumidor y protege cada cambio con pruebas table-driven en go test -race. Nunca rompas contratos públicos solo por añadir abstracciones.',
        visual: {
          kind: 'terminal',
          title: 's01-idiomatic-errors · verify',
          lines: [
            { prompt: '$', text: 'go test -race ./s01-idiomatic-errors', tone: 'cmd' },
            { text: '=== RUN   TestParseQuantity', tone: 'muted' },
            { text: '--- PASS: TestParseQuantity (" 12 ", "oops", "0", "-1")', tone: 'ok' },
            { text: 'PASS · API pública protegida', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S02: attachAudio({
    id: 'SENIOR-S02',
    kicker: 'BRIEFING S02 · ARQUITECTURA HEXAGONAL',
    heading: 'S02 · Inversión de dependencias sin complejidad accidental',
    ctaLabel: 'Abrir Decision Lab (G1)',
    ctaHref: '#/senior/S02/decision-lab',
    scenes: [
      {
        chapter: '01 · Acoplamiento',
        title: 'Reglas de dominio mezcladas con SQL y ciclos de importación',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S02: arquitectura modular y hexagonal. El monolito mezcló reglas de dominio dentro del adaptador SQL y empezaron a surgir ciclos de importación entre paquetes. ¿Cómo lo desacoplamos sin sobre-ingeniería?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'HTTP Handler', sub: 'Conoce SQL directo', state: 'hot' },
            { label: 'Dominio <-> Infra', sub: 'Import cycle error', state: 'hot' },
            { label: 'DB Global', sub: 'Imposible testear sin Postgres', state: 'hot' },
          ],
          metricLabel: 'Acoplamiento de módulos',
          metricBefore: 'Import cycle',
          metricAfter: 'Fronteras limpias en consumidor',
        },
      },
      {
        chapter: '02 · Inversión Real',
        title: 'Puerto pequeño en dominio + inyección por constructor',
        durationSec: 11,
        mascot: 'architecture',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Invertimos la dependencia sin inventar capas vacías: el servicio de negocio define su interfaz pequeña de repositorio y recibe la implementación real por constructor, nunca desde variables globales.',
        visual: {
          kind: 'code-diff',
          file: 's02-injection/service.go',
          before: [
            'func Create(id string) { db.GlobalExec(id) }',
          ],
          after: [
            'type Repository interface { Save(id string) error }',
            'type Service struct { Repo Repository }',
            'func (s Service) Create(id string) error { ... }',
          ],
          callout: 'El adaptador SQL implementa al dominio; el dominio no importa SQL.',
        },
      },
      {
        chapter: '03 · Fake en Memoria',
        title: 'Pruebas unitarias rápidas sin levantar base de datos externa',
        durationSec: 11,
        mascot: 'coding',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Así puedes inyectar un fake determinista en memoria dentro de tus pruebas unitarias, verificar que errors.Is sobrevive al adaptador de infraestructura y mantener el monolito limpio y testeable.',
        visual: {
          kind: 'terminal',
          title: 's02-injection · unit tests',
          lines: [
            { prompt: '$', text: 'go test -race ./s02-injection', tone: 'cmd' },
            { text: 'TestCreate -> Service{Repo: &fakeRepo{}}', tone: 'muted' },
            { text: 'ok   errors.Is(err, errStorageFailure) == true', tone: 'ok' },
            { text: 'PASS · 0 ciclos de importación', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S03: attachAudio({
    id: 'SENIOR-S03',
    kicker: 'BRIEFING S03 · APIs IDEMPOTENTES',
    heading: 'S03 · Claves de idempotencia, sync.Mutex y ventana TTL',
    ctaLabel: 'Probar Simulador TTL abajo',
    ctaHref: '#/senior/S03',
    scenes: [
      {
        chapter: '01 · Doble Cobro',
        title: 'El riesgo silencioso de reintentar POST /charge sin clave',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S03: diseño profesional de APIs. Un cliente sufre un corte de red tras pulsar pagar y su aplicación reintenta POST /charge dos veces seguidas. ¿Cómo evitamos cobrarle el doble?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'App Cliente', sub: 'Timeout → Reintento #2', state: 'normal' },
            { label: 'POST /charge', sub: 'Sin Idempotency-Key', state: 'hot' },
            { label: 'Saldo Cliente', sub: 'Cobro duplicado: $500 ⚠', state: 'hot' },
          ],
          metricLabel: 'Efecto ante 2 reintentos',
          metricBefore: '2 cobros ($500)',
          metricAfter: '1 cobro seguro ($250)',
        },
      },
      {
        chapter: '02 · Sección Crítica',
        title: 'Clave única por operación + detección de conflicto de payload',
        durationSec: 13,
        mascot: 'senior',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Exigimos una clave de idempotencia estable por operación dentro de una sección crítica con sync.Mutex o transacción. Si la clave repite exactamente el mismo monto, devolvemos el recibo original sin sumar al saldo.',
        visual: {
          kind: 'lanes',
          mode: 'ordered',
          statusBadge: 'SYNC.MUTEX · RECEIPT CACHE',
          laneA: {
            name: 'Req #1 (key="req-1")',
            steps: ['Lock()', 'total += 250', 'Guarda receipt{250}'],
          },
          laneB: {
            name: 'Replay (key="req-1")',
            steps: ['Lock()', 'Match monto ✓', 'Devuelve original (no cobra)'],
          },
        },
      },
      {
        chapter: '03 · TTL y Concurrencia',
        title: 'HTTP 409 en conflictos y 50 goroutines simultáneas sin fugas',
        durationSec: 12,
        mascot: 'celebrate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Y si la clave se reutiliza con distinto importe respondemos HTTP 409 conflicto, manteniendo el TTL de caché por encima de la ventana de reintentos y validándolo con cincuenta goroutines en go test -race.',
        visual: {
          kind: 'terminal',
          title: 's03-idempotency · 50 concurrent goroutines',
          lines: [
            { prompt: '$', text: 'go test -race ./s03-idempotency', tone: 'cmd' },
            { text: '50 goroutines -> Charge("req-1", 250) => total == 250', tone: 'ok' },
            { text: 'Conflict Charge("req-1", 300) => HTTP 409 Conflict', tone: 'warn' },
            { text: 'PASS · TTL >= ventana · 0 cobros duplicados', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S04: attachAudio({
    id: 'SENIOR-S04',
    kicker: 'BRIEFING S04 · MODELADO DE DOMINIO',
    heading: 'S04 · Máquinas de estados e invariantes atómicas en Order',
    ctaLabel: 'Abrir Decision Lab (G1)',
    ctaHref: '#/senior/S04/decision-lab',
    scenes: [
      {
        chapter: '01 · Fuga de Reglas',
        title: 'Cambios de estado en handlers HTTP provocan órdenes inválidas',
        durationSec: 11,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S04: modelado del dominio. El controlador HTTP cambia el estado de un pedido directamente y terminan marcando órdenes como canceladas después de haberse pagado. ¿Cómo protegemos esas reglas?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'HTTP Handler', sub: 'o.State = Cancelled', state: 'hot' },
            { label: 'Sin Invariantes', sub: 'Paid -> Cancelled ⚠', state: 'hot' },
            { label: 'Base de Datos', sub: 'Pedido cobrado anulado', state: 'hot' },
          ],
          metricLabel: 'Integridad del agregado',
          metricBefore: 'Estado mutable',
          metricAfter: 'Máquina de estados en dominio',
        },
      },
      {
        chapter: '02 · Máquina de Estados',
        title: 'Transiciones explícitas dentro del método Transition()',
        durationSec: 12,
        mascot: 'building',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Sacamos la máquina de estados del handler y la encerramos en métodos atómicos del agregado Order. Si un pedido ya está en Paid o Cancelled, cualquier transición inválida debe rechazarse antes de tocar datos.',
        visual: {
          kind: 'code-diff',
          file: 's04-domain-state/order.go',
          before: [
            'func CancelHandler(o *Order) { o.State = Cancelled }',
          ],
          after: [
            'func (o *Order) Transition(next OrderState) error {',
            '  if o.State == Paid && next != Paid { return ErrImmutable }',
            '  o.State = next; return nil',
            '}',
          ],
          callout: 'Pending -> Paid/Cancelled · Paid/Cancelled son inmutables.',
        },
      },
      {
        chapter: '03 · Pruebas Límite',
        title: 'Validar transiciones repetidas y estados desconocidos',
        durationSec: 11,
        mascot: 'graduate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Protege el límite de consistencia probando transiciones válidas, inválidas y repetidas en go test -race, documentando cada precondición en tu documento de arquitectura.',
        visual: {
          kind: 'terminal',
          title: 's04-domain-state · state verification',
          lines: [
            { prompt: '$', text: 'go test -race ./s04-domain-state', tone: 'cmd' },
            { text: 'Pending -> Paid: nil | Paid -> Cancelled: error', tone: 'ok' },
            { text: 'Unknown state -> Paid: rejected cleanly', tone: 'ok' },
            { text: 'PASS · Invariante preservada en el agregado', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S05: attachAudio({
    id: 'SENIOR-S05',
    kicker: 'BRIEFING S05 · WORKER POOLS',
    heading: 'S05 · Concurrencia acotada, backpressure y ctx.Done()',
    ctaLabel: 'Probar Simulador Worker Pool',
    ctaHref: '#/senior/S05',
    scenes: [
      {
        chapter: '01 · Bloqueo',
        title: 'Goroutines ilimitadas y envíos sin receptor cuelgan el shutdown',
        durationSec: 11,
        mascot: 'debug',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S05: concurrencia de producción. Nuestro worker pool lanza goroutines sin control durante picos de tráfico y un envío bloqueado congela el shutdown del servidor. ¿Cómo lo domamos?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'Productor', sub: 'go process(req) infinito', state: 'hot' },
            { label: 'Canal unbuffered', sub: 'Send bloqueado en cierre', state: 'hot' },
            { label: 'Shutdown', sub: 'Timeout / Goroutine leak', state: 'hot' },
          ],
          metricLabel: 'Salud del servicio',
          metricBefore: 'Fugas de goroutines',
          metricAfter: 'Pool acotado y cancelable',
        },
      },
      {
        chapter: '02 · Backpressure',
        title: 'Cola acotada + select con <-ctx.Done() al enviar trabajos',
        durationSec: 12,
        mascot: 'coding',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Acota siempre el número de workers y la capacidad de la cola, propagando context.Context con select sobre <-ctx.Done() para cancelar envíos al instante y aplicar contrapresión al llenar la cola.',
        visual: {
          kind: 'lanes',
          mode: 'ordered',
          statusBadge: 'BOUNDED WORKER POOL · CTX.DONE()',
          laneA: {
            name: 'Productor + Context',
            steps: ['select { case jobs <- j:', 'case <-ctx.Done(): return }', 'close(jobs) único dueño'],
          },
          laneB: {
            name: 'N Workers Fijos',
            steps: ['for job := range jobs', 'Propaga 1er error', 'wg.Wait() drenado limpio'],
          },
        },
      },
      {
        chapter: '03 · Cierre Limpio',
        title: 'Validar cero workers, saturación y cancelación bajo race',
        durationSec: 11,
        mascot: 'senior',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Solo el productor propietario cierra el canal de trabajos y el coordinador espera con WaitGroup antes de retornar. Prueba saturación, cero workers y cancelaciones con go test -race.',
        visual: {
          kind: 'terminal',
          title: 's05-worker-pool · race & saturation',
          lines: [
            { prompt: '$', text: 'go test -race ./s05-worker-pool', tone: 'cmd' },
            { text: 'ok   cancel during full queue -> instant abort', tone: 'ok' },
            { text: 'ok   WaitGroup drained -> 0 leaked goroutines', tone: 'ok' },
            { text: 'PASS · 0 data races · backpressure determinista', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S06: attachAudio({
    id: 'SENIOR-S06',
    kicker: 'BRIEFING S06 · MEMORY MODEL',
    heading: 'S06 · Carreras lógicas más allá del Race Detector',
    ctaLabel: 'Probar Simulador Race abajo',
    ctaHref: '#/senior/S06',
    scenes: [
      {
        chapter: '01 · Espejismo',
        title: 'go test -race en verde, pero el balance pierde dinero en carga',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S06: Memory Model y atómicos. Ejecuté go test -race y salió totalmente limpio, pero mi balance financiero sigue descuadrando bajo carga concurrente. ¿Cómo puede existir una carrera sin aviso?',
        visual: {
          kind: 'lanes',
          mode: 'deadlock',
          statusBadge: 'CHECK-THEN-ACT RACE (SIN DATA RACE)',
          laneA: {
            name: 'Goroutine A',
            steps: ['v := atomic.Load() -> 100', '(pausa scheduler)', 'atomic.Add(-80) -> OK'],
          },
          laneB: {
            name: 'Goroutine B',
            steps: ['v := atomic.Load() -> 100', 'Ambas vieron 100!', 'atomic.Add(-80) -> -60 ⚠'],
          },
        },
      },
      {
        chapter: '02 · Atomicidad Lógica',
        title: 'Múltiples pasos atómicos no forman una transacción atómica',
        durationSec: 13,
        mascot: 'debug',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'El detector detecta accesos físicos inseguros, pero no carreras lógicas de negocio. Si lees un saldo atómico y luego restas en otra operación atómica separada, otro hilo puede colarse entre ambas líneas.',
        visual: {
          kind: 'code-diff',
          file: 's06-atomic/ledger.go',
          before: [
            'if bal.Load() >= amount { bal.Add(-amount) } // Race lógica',
          ],
          after: [
            'l.mu.Lock(); defer l.mu.Unlock()',
            'if l.balance >= amount { l.balance -= amount }',
          ],
          callout: 'Ausencia de data race != ausencia de race condition de negocio.',
        },
      },
      {
        chapter: '03 · Herramienta Exacta',
        title: 'Cuándo usar sync/atomic vs sync.Mutex o actor único',
        durationSec: 12,
        mascot: 'senior',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Usa sync/atomic solo en contadores simples e independientes; cuando una invariante abarca varias comprobaciones coordinadas, protege la transacción completa con sync.Mutex o propiedad exclusiva.',
        visual: {
          kind: 'terminal',
          title: 's06-atomic · invariant test',
          lines: [
            { prompt: '$', text: 'go test -race ./s06-atomic', tone: 'cmd' },
            { text: '200 goroutines competing for 100 balance...', tone: 'muted' },
            { text: 'ok   Mutex transaction -> final balance >= 0', tone: 'ok' },
            { text: 'PASS · Invariante financiera protegida', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S07: attachAudio({
    id: 'SENIOR-S07',
    kicker: 'BRIEFING S07 · MEMORIA Y GC',
    heading: 'S07 · Retención oculta de backing array en slices y Heap',
    ctaLabel: 'Probar Simulador Memoria abajo',
    ctaHref: '#/senior/S07',
    scenes: [
      {
        chapter: '01 · Fuga Oculta',
        title: 'Por qué 100 bytes retienen 10 MB sin liberar memoria al GC',
        durationSec: 11,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S07: runtime, memoria y recolector de basura. Solo guardamos cien bytes de cabecera de cada archivo recibido, pero la memoria del servicio sube hasta provocar OOM en producción. ¿Por qué?',
        visual: {
          kind: 'stack-heap',
          mode: 'problem',
          stackLabel: 'SUB-SLICE SIN COPY',
          stackItems: [
            { name: 'head := buf[:100]', value: 'len:100 · cap:10MB', state: 'moved' },
          ],
          heapLabel: 'BACKING ARRAY EN HEAP',
          heapItems: [
            {
              addr: '0x44f0',
              data: '[10,485,760 bytes]',
              note: 'GC BLOQUEADO: head[:100] retiene vivos los 10 MB completos ⚠',
              alert: true,
            },
          ],
        },
      },
      {
        chapter: '02 · Copia Defensiva',
        title: 'Aislar el slice pequeño con copy() libera el bloque gigante',
        durationSec: 12,
        mascot: 'coding',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'En Go, un sub-slice sigue apuntando al array subyacente completo de diez megabytes. Mientras viva esa pequeña referencia de cien bytes, el recolector de basura nunca puede liberar el bloque gigante en el Heap.',
        visual: {
          kind: 'stack-heap',
          mode: 'solution',
          stackLabel: 'SLICE AISLADO',
          stackItems: [
            { name: 'out := make([]byte,100)', value: 'len:100 · cap:100', state: 'borrow' },
          ],
          heapLabel: 'HEAP DESACOPLADO',
          heapItems: [
            {
              addr: '0x8b10',
              data: 'copy(out, buf[:100])',
              note: 'Los 10 MB originales pierden referencias y se liberan en el GC ✓',
              alert: false,
            },
          ],
        },
      },
      {
        chapter: '03 · Evidencia Real',
        title: 'Medir escape analysis y validar el trade-off con pprof',
        durationSec: 11,
        mascot: 'debug',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Si el fragmento vivirá minutos en memoria, crea un slice exacto y usa copy() para cortar la referencia al bloque grande, validando con análisis de escape y perfiles reales de Heap.',
        visual: {
          kind: 'terminal',
          title: 's07-slice-retention · heap check',
          lines: [
            { prompt: '$', text: 'go test -race ./s07-slice-retention', tone: 'cmd' },
            { text: 'Before: backing Retained = 10,000,000 B (OOM)', tone: 'warn' },
            { text: 'After : copy() Retained  = 100 B (99.99% freed)', tone: 'ok' },
            { text: 'PASS · Igualdad exacta y cap(out) == 100', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S08: attachAudio({
    id: 'SENIOR-S08',
    kicker: 'BRIEFING S08 · BENCHMARKS',
    heading: 'S08 · Ingeniería de rendimiento con pprof y -benchmem',
    ctaLabel: 'Abrir Decision Lab (G1)',
    ctaHref: '#/senior/S08/decision-lab',
    scenes: [
      {
        chapter: '01 · Intuición Falsa',
        title: 'Por qué no aprobar micro-optimizaciones sin evidencia reproducible',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S08: ingeniería de rendimiento. Un compañero propuso reescribir medio módulo asegurando que reduce diez veces las asignaciones de memoria. ¿Lo aprobamos directamente en el Pull Request?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'PR Conjetura', sub: 'Sin pprof ni baseline', state: 'hot' },
            { label: 'Complejidad +3x', sub: 'Código frágil e ilegible', state: 'hot' },
            { label: 'Dead Code Elim', sub: 'Benchmark optimizado falso', state: 'hot' },
          ],
          metricLabel: 'Riesgo de optimizar a ciegas',
          metricBefore: 'Sin datos reales',
          metricAfter: 'Complejidad sin ganancia',
        },
      },
      {
        chapter: '02 · Medir Primero',
        title: 'Preasignar con strings.Builder.Grow() y misma semántica',
        durationSec: 12,
        mascot: 'reading',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Jamás optimices a ciegas sin perfilar ni comparar la misma semántica con datos representativos. Preasignar capacidad o usar strings.Builder con Grow solo vale el coste si lo confirman las métricas reales.',
        visual: {
          kind: 'code-diff',
          file: 's08-performance/join_bench_test.go',
          before: [
            'out += item + "," // O(N²) reallocations por iteración',
          ],
          after: [
            'var b strings.Builder; b.Grow(totalLen)',
            'for _, it := range items { b.WriteString(it) }',
          ],
          callout: 'Comparar siempre entrada idéntica, resultado idéntico y evitar DCE.',
        },
      },
      {
        chapter: '03 · Lectura -benchmem',
        title: 'Interpretar ns/op, B/op y allocs/op en múltiples muestras',
        durationSec: 12,
        mascot: 'celebrate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Ejecuta go test -run ^$ -bench . -benchmem en condiciones reproducibles, revisa nanosegundos, B/op y allocs/op en varias muestras, y conserva tests de regresión para proteger el comportamiento.',
        visual: {
          kind: 'terminal',
          title: 's08-performance · -benchmem',
          lines: [
            { prompt: '$', text: 'go test -run ^$ -bench . -benchmem ./s08-performance', tone: 'cmd' },
            { text: 'BenchmarkConcatNaive-8     4210 ns/op   5312 B/op   18 allocs/op', tone: 'warn' },
            { text: 'BenchmarkBuilderGrow-8      248 ns/op    128 B/op    1 allocs/op', tone: 'ok' },
            { text: 'PASS · 17x throughput · 18x menos presión GC', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S09: attachAudio({
    id: 'SENIOR-S09',
    kicker: 'BRIEFING S09 · SISTEMAS DISTRIBUIDOS',
    heading: 'S09 · Entrega at-least-once, deduplicación durable e idempotencia',
    ctaLabel: 'Probar Simulador Mensajes abajo',
    ctaHref: '#/senior/S09',
    scenes: [
      {
        chapter: '01 · Duplicados',
        title: 'El riesgo de un map en memoria ante reintentos y reinicios',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S09: sistemas distribuidos. Nuestra cola reenvía eventos fuera de orden y en ocasiones repetidos, duplicando envíos a clientes. ¿No bastaría guardar los IDs vistos en un mapa de Go?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'Broker Queue', sub: 'At-least-once + Replay', state: 'normal' },
            { label: 'map[string]bool', sub: 'Se borra al reiniciar pod', state: 'hot' },
            { label: 'Efecto Negocio', sub: 'Envío cobrado 2 veces ⚠', state: 'hot' },
          ],
          metricLabel: 'Garantía distribuida',
          metricBefore: 'Estado volátil por nodo',
          metricAfter: 'Deduplicación durable compartida',
        },
      },
      {
        chapter: '02 · Clave Durable',
        title: 'Consumidor idempotente respaldado por almacén compartido',
        durationSec: 12,
        mascot: 'coding',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Un mapa en memoria protege solo una réplica y desaparece al reiniciar el contenedor. Con entrega at-least-once real, necesitas una clave de deduplicación durable compartida por todas las instancias.',
        visual: {
          kind: 'lanes',
          mode: 'ordered',
          statusBadge: 'IDEMPOTENT CONSUMER · EVENT KEY',
          laneA: {
            name: 'Instancia A (evt-42)',
            steps: ['INSERT event_id ON CONFLICT DO NOTHING', 'Aplica efecto ✓'],
          },
          laneB: {
            name: 'Instancia B (replay evt-42)',
            steps: ['Clave ya registrada', 'Confirma ACK sin repetir efecto ✓'],
          },
        },
      },
      {
        chapter: '03 · Reordenamiento',
        title: 'Probar eventos repetidos y fuera de orden con go test -race',
        durationSec: 11,
        mascot: 'senior',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Define ventana de expiración, diseña consumidores idempotentes sin asumir orden global y comprueba eventos repetidos y desordenados ejecutando go test -race en tus pruebas.',
        visual: {
          kind: 'terminal',
          title: 's09-dedup-events · replay & disorder',
          lines: [
            { prompt: '$', text: 'go test -race ./s09-dedup-events', tone: 'cmd' },
            { text: 'Replay [evt-1, evt-2, evt-1] -> effects == 2', tone: 'ok' },
            { text: 'Out-of-order delivery handled cleanly', tone: 'ok' },
            { text: 'PASS · Tolerante a duplicados y reinicios', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S10: attachAudio({
    id: 'SENIOR-S10',
    kicker: 'BRIEFING S10 · DATOS Y CONSISTENCIA',
    heading: 'S10 · Evitar sobreventa con transacciones atómicas y múltiples réplicas',
    ctaLabel: 'Probar Simulador Inventario abajo',
    ctaHref: '#/senior/S10',
    scenes: [
      {
        chapter: '01 · Sobreventa',
        title: 'Lectura y descuento separados provocan stock negativo (-1)',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S10: datos y consistencia. Quedaba una última unidad en stock y dos compradores la adquirieron a la vez dejando el inventario en menos uno, pese a usar sync.Mutex en el servidor Go.',
        visual: {
          kind: 'lanes',
          mode: 'deadlock',
          statusBadge: 'MULTI-POD OVERSOLD RACE (STOCK = 1)',
          laneA: {
            name: 'Pod Go #1',
            steps: ['SELECT stock -> 1', 'Pasa validación', 'UPDATE stock = stock - 1 -> 0'],
          },
          laneB: {
            name: 'Pod Go #2 (otro nodo)',
            steps: ['SELECT stock -> 1', 'Mutex local NO sirve aquí', 'UPDATE stock = stock - 1 -> -1 ⚠'],
          },
        },
      },
      {
        chapter: '02 · Límite Compartido',
        title: 'Combinar validación y descuento de forma atómica en BD',
        durationSec: 12,
        mascot: 'architecture',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'El clásico fallo en escalado horizontal: un mutex local en memoria no coordina varias réplicas del servicio, ni tampoco validar en una lectura y descontar en otra transacción distinta.',
        visual: {
          kind: 'code-diff',
          file: 's10-inventory/reserve.sql.go',
          before: [
            'stock := db.ReadStock(sku) // lectura previa vulnerable',
            'if stock >= qty { db.Exec("UPDATE stock = stock - $1", qty) }',
          ],
          after: [
            'res, _ := tx.Exec("UPDATE items SET stock = stock - $1 WHERE id = $2 AND stock >= $1", qty, sku)',
            'if rows == 0 { return ErrInsufficientStock }',
          ],
          callout: 'Validación y mutación unidas atómicamente: stock nunca < 0.',
        },
      },
      {
        chapter: '03 · Pruebas de Carga',
        title: 'Simular compradores simultáneos para la última unidad',
        durationSec: 10,
        mascot: 'celebrate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Combina validación y descuento de forma atómica en la base de datos con bloqueos, nivel de aislamiento o actualización condicional, verificando bajo compradores simultáneos con go test -race.',
        visual: {
          kind: 'terminal',
          title: 's10-inventory · oversell prevention',
          lines: [
            { prompt: '$', text: 'go test -race ./s10-inventory', tone: 'cmd' },
            { text: '15 concurrent buyers on stock=3 -> 3 confirmed, 12 rejected', tone: 'ok' },
            { text: 'final stock == 0 (>= 0 invariant kept)', tone: 'ok' },
            { text: 'PASS · Cero sobreventa garantizada', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S11: attachAudio({
    id: 'SENIOR-S11',
    kicker: 'BRIEFING S11 · RESILIENCIA',
    heading: 'S11 · Cortar tormentas de reintentos con backoff, jitter y presupuesto',
    ctaLabel: 'Probar Simulador Retries abajo',
    ctaHref: '#/senior/S11',
    scenes: [
      {
        chapter: '01 · Tormenta 5x',
        title: 'Reintentos inmediatos amplifican fallos hasta tumbar el clúster',
        durationSec: 12,
        mascot: 'debug',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S11: resiliencia y fallos parciales. Un microservicio aguas abajo tardó dos segundos extra en responder y los reintentos automáticos multiplicaron por cinco el tráfico hasta tumbar todo el clúster.',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: '100 Req/s', sub: 'Latencia +2s', state: 'normal' },
            { label: 'Retry Loop (5x)', sub: 'Sin jitter ni budget', state: 'hot' },
            { label: 'Servicio Destino', sub: '600 Req/s · Colapso total ⚠', state: 'hot' },
          ],
          metricLabel: 'Amplificación de carga',
          metricBefore: '100 req/s base',
          metricAfter: '600 req/s (Retry Storm)',
        },
      },
      {
        chapter: '02 · Presupuesto Timeouts',
        title: 'Timeouts dentro del deadline global y errores no reintentables',
        durationSec: 11,
        mascot: 'senior',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Reintentar en bucle sin freno genera amplificación inmediata y convierte un tropiezo leve en una caída total. Los timeouts deben caber dentro del presupuesto extremo a extremo de la petición.',
        visual: {
          kind: 'lanes',
          mode: 'ordered',
          statusBadge: 'RETRY BUDGET + BACKOFF + JITTER',
          laneA: {
            name: 'Error 400 / Context Done',
            steps: ['No reintentar jamás', 'Abortar dentro de deadline'],
          },
          laneB: {
            name: 'Error 503 Transitorio',
            steps: ['Backoff 100ms..1.6s', '+ Jitter aleatorio', 'Máx 1-2 reintentos con budget'],
          },
        },
      },
      {
        chapter: '03 · Backoff + Jitter',
        title: 'Espaciar ráfagas y definir política clara de Circuit Breaker',
        durationSec: 11,
        mascot: 'coding',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Aplica exponential backoff con jitter para espaciar ráfagas, limita el presupuesto de reintentos solo a operaciones idempotentes y fija políticas claras de apertura en tu circuit breaker.',
        visual: {
          kind: 'terminal',
          title: 's11-backoff · retry storm protection',
          lines: [
            { prompt: '$', text: 'go test -race ./s11-backoff', tone: 'cmd' },
            { text: 'ok   exponential delay bounded + jitter applied', tone: 'ok' },
            { text: 'ok   4xx errors skip retries immediately', tone: 'ok' },
            { text: 'PASS · Presupuesto acotado sin cascadas', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S12: attachAudio({
    id: 'SENIOR-S12',
    kicker: 'BRIEFING S12 · SEGURIDAD BACKEND',
    heading: 'S12 · Path traversal, symlinks y SQL parametrizado en Go',
    ctaLabel: 'Abrir Decision Lab (G1)',
    ctaHref: '#/senior/S12/decision-lab',
    scenes: [
      {
        chapter: '01 · Escape de Ruta',
        title: 'Por qué filepath.Clean por sí solo no detiene lecturas arbitrarias',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S12: seguridad backend. Un endpoint permite descargar facturas enviando un nombre de archivo y el auditor señaló riesgo crítico de lectura arbitraria aunque ya llamábamos a filepath.Clean.',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'Input ?f=../../etc', sub: 'Solo filepath.Clean()', state: 'hot' },
            { label: 'Symlink / Escape', sub: 'Sale del directorio raíz', state: 'hot' },
            { label: 'Archivo Secreto', sub: 'Fuga de credenciales ⚠', state: 'hot' },
          ],
          metricLabel: 'Postura de seguridad',
          metricBefore: 'Confiar solo en Clean()',
          metricAfter: 'Root confinement + permisos OS',
        },
      },
      {
        chapter: '02 · Defensa en Capas',
        title: 'Rechazar absolutas/symlinks, SQL con placeholders y AuthZ',
        durationSec: 12,
        mascot: 'senior',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Mucho cuidado: filepath.Clean por sí solo no bloquea rutas absolutas ni escapes mediante symlinks maliciosos. Además, siempre debemos verificar permisos por objeto y nunca exponer secretos al cliente.',
        visual: {
          kind: 'code-diff',
          file: 's12-traversal/safe_path.go',
          before: [
            'return os.ReadFile(filepath.Join(root, filepath.Clean(userFile)))',
          ],
          after: [
            'rel, err := filepath.Rel(rootAbs, targetReal)',
            'if err != nil || strings.HasPrefix(rel, "..") { return ErrEscape }',
          ],
          callout: 'Valida frontera real tras resolver symlinks + autorización por objeto.',
        },
      },
      {
        chapter: '03 · Casos Hostiles',
        title: 'Probar ../, rutas absolutas y enlaces simbólicos en go test',
        durationSec: 11,
        mascot: 'graduate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Rechaza escapes léxicos y enlaces simbólicos fuera de la raíz segura, usa placeholders parametrizados en SQL y prueba casos hostiles como punto punto barra en go test -race.',
        visual: {
          kind: 'terminal',
          title: 's12-traversal · security boundary tests',
          lines: [
            { prompt: '$', text: 'go test -race ./s12-traversal', tone: 'cmd' },
            { text: 'Blocked: "../../etc/passwd", "/root/key", symlink escape', tone: 'ok' },
            { text: 'Allowed: "2026/invoice-104.pdf" inside root', tone: 'ok' },
            { text: 'PASS · Zero traversal & parameterized queries verified', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S13: attachAudio({
    id: 'SENIOR-S13',
    kicker: 'BRIEFING S13 · TESTING DETERMINISTA',
    heading: 'S13 · Eliminar flaky tests mediante inyección de reloj (FakeClock)',
    ctaLabel: 'Abrir Decision Lab (G1)',
    ctaHref: '#/senior/S13/decision-lab',
    scenes: [
      {
        chapter: '01 · Flaky Tests',
        title: 'time.Sleep hace tus suites lentas y quebradizas en CI',
        durationSec: 11,
        mascot: 'debug',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S13: testing de sistemas complejos. Nuestra suite tarda doce minutos y falla al azar en integración continua porque varios tests esperan expiraciones reales con time.Sleep.',
        visual: {
          kind: 'lanes',
          mode: 'deadlock',
          statusBadge: 'FLAKY SUITE · DEPENDENCIA DE TIME.NOW()',
          laneA: {
            name: 'Local rápido',
            steps: ['ttl := 50ms', 'time.Sleep(60ms)', 'Pasa por suerte ✓'],
          },
          laneB: {
            name: 'CI cargado (CPU slow)',
            steps: ['Jitter scheduler +30ms', 'Lee cache expirado antes', 'FAIL aleatorio ✗'],
          },
        },
      },
      {
        chapter: '02 · Reloj Inyectado',
        title: 'Separar tiempo de negocio mediante una interfaz Clock',
        durationSec: 11,
        mascot: 'coding',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Nunca apagues flaky tests para publicar ni dependas del reloj real del sistema. Inyecta una interfaz de reloj en tus componentes para separar el tiempo de negocio de la infraestructura.',
        visual: {
          kind: 'code-diff',
          file: 's13-clock-testing/cache.go',
          before: [
            'expiresAt := time.Now().Add(ttl) // acoplado al OS',
          ],
          after: [
            'type Clock interface { Now() time.Time }',
            'expiresAt := c.clock.Now().Add(ttl) // 100% determinista',
          ],
          callout: 'Inyecta reloj real en producción y FakeClock en tus pruebas.',
        },
      },
      {
        chapter: '03 · Cero Esperas',
        title: 'Avanzar horas en microsegundos y probar bordes t-1, t y t+1',
        durationSec: 11,
        mascot: 'celebrate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Con un FakeClock determinista avanzas horas en microsegundos, verificas el instante exacto anterior y posterior al vencimiento y combinas fuzzing con go test -race sin pausas frágiles.',
        visual: {
          kind: 'terminal',
          title: 's13-clock-testing · deterministic time',
          lines: [
            { prompt: '$', text: 'go test -race ./s13-clock-testing', tone: 'cmd' },
            { text: 'fake.Advance(ttl - 1ms) -> active (valid)', tone: 'ok' },
            { text: 'fake.Advance(1ms)       -> expired at exact boundary', tone: 'ok' },
            { text: 'PASS · 0.008s · 0 flaky sleeps', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S14: attachAudio({
    id: 'SENIOR-S14',
    kicker: 'BRIEFING S14 · OBSERVABILIDAD P99',
    heading: 'S14 · Percentiles P95/P99, alta cardinalidad y alertas por SLO',
    ctaLabel: 'Probar Simulador P99 abajo',
    ctaHref: '#/senior/S14',
    scenes: [
      {
        chapter: '01 · Media Engañosa',
        title: 'El promedio en 10ms esconde bloqueos de 3 segundos en el 1%',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S14: observabilidad e incidentes. Nuestro panel muestra una latencia promedio excelente de diez milisegundos, pero clientes reales reportan bloqueos de tres segundos en el checkout. ¿Por qué miente el gráfico?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'Promedio Global', sub: '10 ms (verde falso)', state: 'normal' },
            { label: 'Cola Larga (GC/Locks)', sub: '1% peticiones > 3,000 ms', state: 'hot' },
            { label: 'Labels UserID', sub: 'Explosión cardinalidad RAM ⚠', state: 'hot' },
          ],
          metricLabel: 'Realidad del Checkout',
          metricBefore: 'Avg 10 ms',
          metricAfter: 'P99 3,120 ms (SLO roto)',
        },
      },
      {
        chapter: '02 · Colas Largas',
        title: 'Evaluar distribución real (P95/P99) junto a throughput y errores',
        durationSec: 13,
        mascot: 'debug',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'La media esconde siempre las colas largas: un uno por ciento de peticiones sufriendo pausas de recolector de basura destruye la experiencia aunque el promedio luzca verde. Observa percentiles p95/p99 junto a errores y throughput.',
        visual: {
          kind: 'lanes',
          mode: 'ordered',
          statusBadge: 'SLO TELEMETRY · ZERO-ALLOC TRACKING',
          laneA: {
            name: 'Métricas Acotadas',
            steps: ['Histograms P50/P95/P99', 'Labels acotados (ruta/status)'],
          },
          laneB: {
            name: 'Trazas + slog',
            steps: ['Correlación trace_id', 'Alertas por burn rate SLO'],
          },
        },
      },
      {
        chapter: '03 · Trazas y SLOs',
        title: 'Evitar cardinalidad explosiva y probar percentiles extremos',
        durationSec: 13,
        mascot: 'graduate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Correlaciona logs y trazas con context, evita etiquetas con cardinalidad explosiva como IDs de usuario, diseña alertas basadas en SLO y prueba el cálculo exacto de percentiles con go test -race.',
        visual: {
          kind: 'terminal',
          title: 's14-percentiles · tail distribution',
          lines: [
            { prompt: '$', text: 'go test -race ./s14-percentiles', tone: 'cmd' },
            { text: 'Empty, unordered & heavy-tail inputs tested', tone: 'ok' },
            { text: 'P50=11ms | P95=48ms | P99=310ms (alert threshold)', tone: 'warn' },
            { text: 'PASS · Cálculo determinista de distribución', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S15: attachAudio({
    id: 'SENIOR-S15',
    kicker: 'BRIEFING S15 · ZERO DOWNTIME',
    heading: 'S15 · Readiness probe y drenado ordenado con Server.Shutdown',
    ctaLabel: 'Probar Simulador Shutdown abajo',
    ctaHref: '#/senior/S15',
    scenes: [
      {
        chapter: '01 · Cortes 502',
        title: 'Cerrar conexiones o canales en caliente provoca panic y 502',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S15: despliegue y operaciones. Cada vez que subimos una nueva versión a producción caen conexiones activas con error 502 o surgen panic al cerrar canales mientras aún llegan peticiones.',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'Load Balancer', sub: 'Sigue enviando tráfico', state: 'hot' },
            { label: 'SIGKILL / close()', sub: 'Cierra canal con productores', state: 'hot' },
            { label: 'Clientes Activos', sub: 'HTTP 502 / send on closed ⚠', state: 'hot' },
          ],
          metricLabel: 'Durante Rolling Deploy',
          metricBefore: 'Abrupto',
          metricAfter: '0 errores 502 con drenado ordenado',
        },
      },
      {
        chapter: '02 · Orden Sagrado',
        title: 'Readiness false -> parar productores -> drenar con deadline',
        durationSec: 12,
        mascot: 'architecture',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'El orden del apagado es sagrado: primero marca readiness como falso para sacar la instancia del balanceador, detén a los productores y drena los trabajos en curso dentro de un grace period acotado.',
        visual: {
          kind: 'lanes',
          mode: 'ordered',
          statusBadge: 'GRACEFUL SHUTDOWN SEQUENCE',
          laneA: {
            name: '1. Corte Ingress',
            steps: ['SIGTERM recibido', '/readyz -> 503', 'Server.Shutdown(ctx)'],
          },
          laneB: {
            name: '2. Cierre Seguro',
            steps: ['Productores paran', 'Drain in-flight <= 10s', 'close(ch) único dueño'],
          },
        },
      },
      {
        chapter: '03 · Zero Leaks',
        title: 'Validar apagado doble, cancelación y rollback reversible',
        durationSec: 11,
        mascot: 'senior',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Solo el dueño del canal puede cerrarlo cuando nadie más envía; valida apagado doble, cancelación y cero goroutines huérfanas con go test -race, y documenta tu rollback reversible.',
        visual: {
          kind: 'terminal',
          title: 's15-shutdown · zero-downtime check',
          lines: [
            { prompt: '$', text: 'go test -race ./s15-shutdown', tone: 'cmd' },
            { text: 'ok   double Shutdown() idempotent -> nil panic', tone: 'ok' },
            { text: 'ok   in-flight drained cleanly within timeout', tone: 'ok' },
            { text: 'PASS · 0 dropped connections · Rollback listo', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S16: attachAudio({
    id: 'SENIOR-S16',
    kicker: 'BRIEFING S16 · MIGRACIONES SEGURAS',
    heading: 'S16 · Contratos retrocompatibles con Expand-and-Contract',
    ctaLabel: 'Abrir Decision Lab (G1)',
    ctaHref: '#/senior/S16/decision-lab',
    scenes: [
      {
        chapter: '01 · Ruptura en Vivo',
        title: 'Renombrar campos JSON/SQL de golpe rompe apps móviles activas',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S16: migraciones y mantenimiento. Renombramos un campo del JSON y una columna SQL en el mismo despliegue; al instante fallaron las aplicaciones móviles con la versión anterior. ¿Cómo evolucionamos sin romper?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'App v1 (Legacy)', sub: 'Envía total_cents', state: 'normal' },
            { label: 'Backend v2 Rígido', sub: 'Exige amount solamente', state: 'hot' },
            { label: 'Contratos rotos', sub: 'HTTP 400 masivos en prod ⚠', state: 'hot' },
          ],
          metricLabel: 'Impacto en clientes',
          metricBefore: 'Big-Bang Deploy',
          metricAfter: 'Coexistencia dual sin cortes',
        },
      },
      {
        chapter: '02 · Expand-Contract',
        title: 'Ventana de coexistencia leyendo y escribiendo ambos esquemas',
        durationSec: 11,
        mascot: 'building',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Aplica el patrón expand-and-contract: primero despliega soporte dual aceptando formatos antiguos y nuevos durante una ventana de coexistencia segura, antes de retirar campos heredados.',
        visual: {
          kind: 'code-diff',
          file: 's16-compatibility/payload.go',
          before: [
            'type OrderV2 struct { Amount int64 `json:"amount"` }',
          ],
          after: [
            'type OrderCompat struct {',
            '  Amount      int64  `json:"amount"`',
            '  TotalLegacy *int64 `json:"total_cents,omitempty"`',
            '}',
          ],
          callout: 'Fase Expand: acepta v1+v2. Solo contrae cuando tráfico v1 == 0%.',
        },
      },
      {
        chapter: '03 · Pruebas Históricas',
        title: 'Probar payloads v1/v2 y medir adopción antes de contraer',
        durationSec: 12,
        mascot: 'coding',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Versiona esquemas, prueba tanto cargas históricas como campos desconocidos ejecutando go test -race y define métricas de adopción junto con un plan de rollback antes de contraer el contrato.',
        visual: {
          kind: 'terminal',
          title: 's16-compatibility · schema evolution',
          lines: [
            { prompt: '$', text: 'go test -race ./s16-compatibility', tone: 'cmd' },
            { text: 'v1 JSON {"total_cents": 500} -> mapped safely ✓', tone: 'ok' },
            { text: 'v2 JSON {"amount": 500}      -> mapped safely ✓', tone: 'ok' },
            { text: 'PASS · Dual window + rollback verificado', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S17: attachAudio({
    id: 'SENIOR-S17',
    kicker: 'BRIEFING S17 · LIDERAZGO TÉCNICO',
    heading: 'S17 · Code Reviews con evidencia, severidad y ADRs claros',
    ctaLabel: 'Abrir Decision Lab (G1)',
    ctaHref: '#/senior/S17/decision-lab',
    scenes: [
      {
        chapter: '01 · Nitpicking vs Riesgo',
        title: 'No discutas formato menor mientras pasa un riesgo crítico de sistema',
        durationSec: 11,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S17: liderazgo técnico. Frente a un Pull Request enorme o un RFC complejo, es fácil enredarse discutiendo estilos menores y dejar pasar un riesgo grave de concurrencia o seguridad.',
        visual: {
          kind: 'lanes',
          mode: 'deadlock',
          statusBadge: 'ANTI-PATRÓN DE REVISIÓN',
          laneA: {
            name: 'Review superficial',
            steps: ['"Esto está mal"', '"Prefiero otro nombre"', 'Aprueba con data race oculto ⚠'],
          },
          laneB: {
            name: 'Review Senior',
            steps: ['Correctitud primero', 'Seguridad e invariantes', 'Evidencia reproducible ✓'],
          },
        },
      },
      {
        chapter: '02 · Matriz Severidad',
        title: 'Priorizar por Probabilidad × Impacto sobre corrección y seguridad',
        durationSec: 11,
        mascot: 'reading',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Una revisión Senior evalúa primero corrección, invariantes y seguridad, nunca opiniones subjetivas sin respaldo. Prioriza cada hallazgo multiplicando su probabilidad por su impacto real.',
        visual: {
          kind: 'architecture',
          mode: 'mitigated',
          nodes: [
            { label: 'P0 · Bloqueante', sub: 'Data race / IDOR / OOM', state: 'hot' },
            { label: 'P1 · Diseño', sub: 'Acoplamiento / Sin rollback', state: 'normal' },
            { label: 'P2 · Nit', sub: 'Estilo (no bloquea PR)', state: 'ok' },
          ],
          metricLabel: 'Criterio de priorización',
          metricBefore: 'Subjetivo',
          metricAfter: 'Severidad = Probabilidad × Impacto',
        },
      },
      {
        chapter: '03 · Evidencia y ADR',
        title: 'Enlazar test que reproduce el fallo y documentar el porqué',
        durationSec: 12,
        mascot: 'senior',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Evita comentarios vagos: enlaza la prueba concreta que reproduce el riesgo, propón una alternativa medible en go test -race y preserva siempre el porqué de las decisiones en tus ADRs.',
        visual: {
          kind: 'terminal',
          title: 's17-review-priority · RFC & ADR ranking',
          lines: [
            { prompt: '$', text: 'go test -race ./s17-review-priority', tone: 'cmd' },
            { text: 'Ranked #1 [CRITICAL]: unauthenticated mutation', tone: 'warn' },
            { text: 'Ranked #2 [HIGH]: missing backoff budget', tone: 'ok' },
            { text: 'PASS · Evidencia reproducible + ADR preservado', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  S18: attachAudio({
    id: 'SENIOR-S18',
    kicker: 'BRIEFING S18 · SYSTEM DESIGN FINAL',
    heading: 'S18 · Capacidad, Ley de Little, backpressure y Capstone Senior',
    ctaLabel: 'Probar Simulador Capacidad abajo',
    ctaHref: '#/senior/S18',
    scenes: [
      {
        chapter: '01 · Mito 10k Workers',
        title: 'Escalar workers sin proteger dependencias colapsa el P99',
        durationSec: 12,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Caso S18: examen final de System Design. Debemos diseñar una plataforma distribuida de trabajos bajo picos intensos. La tentación rápida es subir workers a diez mil y esperar lo mejor, ¿cierto?',
        visual: {
          kind: 'architecture',
          mode: 'incident',
          nodes: [
            { label: 'Ráfaga Entrada', sub: '500 jobs/seg', state: 'normal' },
            { label: '10,000 Workers', sub: 'Sin límite ni backpressure', state: 'hot' },
            { label: 'DB & Downstream', sub: 'Contención extrema · P99 x20 ⚠', state: 'hot' },
          ],
          metricLabel: 'Estabilidad del sistema',
          metricBefore: 'Sobrecarga por workers',
          metricAfter: 'Ley de Little + rechazo temprano',
        },
      },
      {
        chapter: '02 · Ley de Little',
        title: 'Estimar concurrencia necesaria: L = λ · W y margen de utilización',
        durationSec: 12,
        mascot: 'senior',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Subir workers sin proteger las dependencias aguas abajo solo multiplica la contención y empeora el P99. Dimensiona concurrencia con la Ley de Little multiplicando tasa de llegada por latencia y utilización objetivo.',
        visual: {
          kind: 'code-diff',
          file: 's18-capacity/model.go',
          before: [
            'workers := 10000 // número arbitrario sin medir latencia',
          ],
          after: [
            '// Ley de Little: concurrencia = llegadas/s × latencia(s)',
            'required := int(math.Ceil((arrivalRate * latencySec) / targetUtil))',
          ],
          callout: 'Acota colas y rechaza rápido (429) antes de saturar la base de datos.',
        },
      },
      {
        chapter: '03 · Graduación Senior',
        title: 'Probar saturación con go test -race y conquistar el Capstone Go',
        durationSec: 12,
        mascot: 'celebrate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Aclara restricciones antes de dibujar cajas, diseña etapas incrementales con backpressure explícito, prueba tasas extremas de saturación con go test -race y completa ahora tu Capstone Senior.',
        visual: {
          kind: 'terminal',
          title: 's18-capacity · 18/18 Senior Labs Complete',
          lines: [
            { prompt: '$', text: 'cd labs-native && go test -race ./...', tone: 'cmd' },
            { text: 'ok   s18-capacity  -> zero overflow · 429 shedding clean', tone: 'ok' },
            { text: '18 / 18 Senior Modules + Capstone Go verified', tone: 'ok' },
            { text: 'PASS · ¡Listo para Ingeniería Go Senior en Producción!', tone: 'ok' },
          ],
        },
      },
    ],
  }),
};

export function getSeniorCinemaDeck(moduleId: string): CinemaDeck | undefined {
  return SENIOR_MODULE_DECKS[moduleId];
}

/** 21. Capstone Senior de Órdenes + Outbox en Go */
export const SENIOR_CAPSTONE_DECK: CinemaDeck = attachAudio({
  id: 'SENIOR-CAPSTONE',
  kicker: 'CAPSTONE GO NATIVO · ESTUDIO HD',
  heading: 'Capstone Senior: pedidos HTTP, Mutex, idempotencia y Outbox',
  ctaLabel: 'Descargar labs-native y correr go test -race',
  ctaHref: '#/senior/capstone',
  scenes: [
    {
      chapter: '01 · Frontera y Riesgo',
      title: 'Cuerpos sin límite o stock fuera de lock rompen el inventario',
      durationSec: 12,
      mascot: 'question',
      aura: 'ember',
      speaker: 'host',
      speech:
        'El Capstone Senior conecta HTTP, inventario con 200 goroutines e idempotencia. Si aceptamos cuerpos ilimitados, reutilizamos claves o consultamos stock fuera del mutex, el sistema colapsa o sobrevende.',
      visual: {
        kind: 'architecture',
        mode: 'incident',
        nodes: [
          { label: 'POST /orders', sub: 'Payload sin límite / token débil', state: 'hot' },
          { label: 'Check Stock', sub: 'Carrera con 200 goroutines', state: 'hot' },
          { label: 'Outbox Local', sub: 'Eventos perdidos / duplicados', state: 'hot' },
        ],
        metricLabel: 'Integridad bajo 200 goroutines',
        metricBefore: 'Sobreventa y race condition',
        metricAfter: '17 reservas exactas + 0 fugas',
      },
    },
    {
      chapter: '02 · Diseño Transaccional',
      title: 'Validación estricta de 4 KiB, sync.Mutex e idempotencia',
      durationSec: 13,
      mascot: 'coding',
      aura: 'cyan',
      speaker: 'gopher',
      speech:
        'Por eso blindamos la frontera con POST /orders, application/json estricto hasta 4 KiB y token de desarrollo; el store reserva bajo sync.Mutex, memoriza recibos idempotentes o devuelve ErrConflict, y encola eventos en un Outbox copiado de forma segura.',
      visual: {
        kind: 'code-diff',
        file: 'labs-native/capstone/orders/store.go',
        before: [
          'if stock[sku] >= qty { // lectura fuera del lock',
          '    stock[sku] -= qty',
          '}',
        ],
        after: [
          's.mu.Lock()',
          'defer s.mu.Unlock()',
          'receipt, conflict := s.checkIdempotency(key, req)',
          's.outbox = append(s.outbox, event.Clone()) // copia segura',
        ],
        callout: 'Una clave repetida conserva recibo; reutilizada con otros datos retorna ErrConflict.',
      },
    },
    {
      chapter: '03 · Fuzzing & Race Detector',
      title: 'Verificar invariantes con go test -race y BenchmarkSubmit',
      durationSec: 12,
      mascot: 'celebrate',
      aura: 'gold',
      speaker: 'gopher',
      speech:
        'Para comprobar cada invariante en tu máquina, descarga labs-native y ejecuta go test -race junto con FuzzIdempotentReceipt y BenchmarkSubmit. Así cierras el círculo completo de Senior Mode con código real.',
      visual: {
        kind: 'terminal',
        title: 'labs-native · go test ./capstone/...',
        lines: [
          { prompt: '$', text: 'go test -race ./capstone/... -count=1', tone: 'cmd' },
          { text: 'ok   capstone/orders  TestAtomicInventoryUnderLoad (17/200)', tone: 'ok' },
          { text: 'ok   capstone/orders  FuzzIdempotentReceipt · BenchmarkSubmit', tone: 'ok' },
          { text: 'PASS · Sistema Go Senior validado de extremo a extremo', tone: 'ok' },
        ],
      },
    },
  ],
});

/** 22-24. Anclas clave del track Aprende Go (B01, I01, A01) */
const LESSON_ANCHOR_DECKS: Record<string, CinemaDeck> = {
  B01: attachAudio({
    id: 'LESSON-B01',
    kicker: 'FUNDAMENTOS GO · LECCIÓN B01',
    heading: 'Tu primer programa Go: package main, import y binario nativo',
    ctaLabel: 'Completar main.go abajo',
    ctaHref: '#/lesson/B01',
    scenes: [
      {
        chapter: '01 · Anatomía Base',
        title: 'Todo ejecutable Go arranca en package main y func main()',
        durationSec: 11,
        mascot: 'question',
        aura: 'gold',
        speaker: 'host',
        speech:
          'Estás frente a B01, tu primer programa en Go. ¿Por qué todo ejecutable empieza obligatoriamente declarando package main, importando fmt y definiendo una func main sin parámetros?',
        visual: {
          kind: 'code-diff',
          file: 'main.go',
          before: [
            '// Sin package main no hay binario ejecutable',
            'fmt.Println("Hola")',
          ],
          after: [
            'package main',
            'import "fmt"',
            'func main() { fmt.Println("Hola GoPixel!") }',
          ],
          callout: 'Regla estricta de Go: imports o variables sin usar impiden compilar.',
        },
      },
      {
        chapter: '02 · Binario Estático',
        title: 'Compilación veloz a código máquina sin máquinas virtuales',
        durationSec: 11,
        mascot: 'reading',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Porque el compilador go build usa package main como punto de entrada único, enlaza únicamente paquetes declarados como fmt, rechaza variables o imports sin usar desde el primer segundo y genera un binario nativo autónomo.',
        visual: {
          kind: 'stack-heap',
          mode: 'solution',
          stackLabel: 'Código Fuente Go',
          stackItems: [
            { name: 'package main', value: 'Entry point', state: 'ok' },
            { name: 'import "fmt"', value: 'Stdlib I/O', state: 'ok' },
            { name: 'func main()', value: 'Sin retorno', state: 'ok' },
          ],
          heapLabel: 'Resultado de go build',
          heapItems: [
            { addr: 'BINARIO', data: 'app / app.exe estático', note: 'Cero JVM o runtime externo' },
            { addr: 'VELOCIDAD', data: 'Compilación en milisegundos', note: 'Imports verificados al instante' },
          ],
        },
      },
      {
        chapter: '03 · Tu Turno en B01',
        title: 'Valida la sintaxis aquí y compila localmente con go run',
        durationSec: 11,
        mascot: 'celebrate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'En GoPixel el navegador verifica la sintaxis de tu solución al instante, y cuando quieras compilar programas completos usarás go run o go build en tu terminal. Completa fmt.Println en main.go para ganar tu primer logro.',
        visual: {
          kind: 'terminal',
          title: 'hello-go · tu flujo local',
          lines: [
            { prompt: '$', text: 'go run main.go', tone: 'cmd' },
            { text: 'Hola GoPixel!', tone: 'ok' },
            { prompt: '$', text: 'go build -o gopixel-app main.go', tone: 'cmd' },
            { text: 'PASS · Primer paso hacia Go Backend completado', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  I01: attachAudio({
    id: 'LESSON-I01',
    kicker: 'INTERMEDIO GO · LECCIÓN I01',
    heading: 'Interfaces implícitas: desacoplamiento sin implements',
    ctaLabel: 'Practicar interfaz I01 abajo',
    ctaHref: '#/lesson/I01',
    scenes: [
      {
        chapter: '01 · Adiós Rigidez',
        title: 'Satisfacer contratos sin acoplar paquetes con implements',
        durationSec: 11,
        mascot: 'question',
        aura: 'violet',
        speaker: 'host',
        speech:
          'Saltamos al nivel intermedio I01: en otros lenguajes las clases declaran implements explícitamente. ¿Por qué Go permite que un struct cumpla una interfaz sin escribir jamás esa palabra clave?',
        visual: {
          kind: 'code-diff',
          file: 'store.go',
          before: [
            '// En otros lenguajes: acoplas el struct al paquete contrato',
            'class MemoryStore implements pkg.Store { ... }',
          ],
          after: [
            'type Writer interface { Write(p []byte) (int, error) }',
            'func (m *MemoryStore) Write(p []byte) (int, error) { ... }',
          ],
          callout: 'Si tiene los métodos exactos, ya implementa la interfaz automáticamente.',
        },
      },
      {
        chapter: '02 · Duck Typing Estático',
        title: 'Contratos pequeños definidos del lado del consumidor',
        durationSec: 11,
        mascot: 'architecture',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Son interfaces implícitas: si un tipo concreto implementa los métodos exactos que pide io.Writer o tu propio Store, ya satisface el contrato en tiempo de compilación sin acoplar paquetes entre sí ni crear jerarquías rígidas.',
        visual: {
          kind: 'architecture',
          mode: 'mitigated',
          nodes: [
            { label: 'HTTP Handler', sub: 'Pide interfaz mínima Store', state: 'ok' },
            { label: 'PostgresStore', sub: 'Implementa en producción', state: 'ok' },
            { label: 'FakeStore', sub: 'Implementa en go test', state: 'ok' },
          ],
          metricLabel: 'Acoplamiento de paquetes',
          metricBefore: 'Dependencia circular rígida',
          metricAfter: 'Inversión de dependencias limpia ✓',
        },
      },
      {
        chapter: '03 · Testing Sin Mocks Pesados',
        title: 'Sustituir IO real por fakes deterministas en go test',
        durationSec: 10,
        mascot: 'celebrate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Al definir interfaces pequeñas justo donde las consumes, pruebas servicios HTTP o repositorios sustituyendo memoria real por fakes deterministas en go test sin levantar bases de datos pesadas.',
        visual: {
          kind: 'terminal',
          title: 'i01-interfaces · test determinista',
          lines: [
            { prompt: '$', text: 'go test -v ./service', tone: 'cmd' },
            { text: 'svc := NewOrderService(&FakeStore{}) // cumple Store', tone: 'ok' },
            { text: 'PASS · 0 Docker requerido · verificación en 4 ms', tone: 'ok' },
          ],
        },
      },
    ],
  }),

  A01: attachAudio({
    id: 'LESSON-A01',
    kicker: 'AVANZADO GO · LECCIÓN A01',
    heading: 'Goroutines M:N, stack de 2 KB y canales tipados',
    ctaLabel: 'Resolver ejercicio A01 abajo',
    ctaHref: '#/lesson/A01',
    scenes: [
      {
        chapter: '01 · Peso de Hilos',
        title: 'Miles de hilos del OS consumen gigas; Go escala ligero',
        durationSec: 11,
        mascot: 'question',
        aura: 'ember',
        speaker: 'host',
        speech:
          'Llegamos a A01, nivel avanzado. Un hilo del sistema operativo pesa megabytes, así que crear miles frena el servidor. ¿Cómo logra Go ejecutar decenas de miles de tareas concurrentes sin saturar la memoria?',
        visual: {
          kind: 'lanes',
          mode: 'deadlock',
          laneA: {
            name: 'OS Threads (~2 MB c/u)',
            steps: ['10,000 hilos -> 20 GB RAM', 'Context switch lento en kernel'],
          },
          laneB: {
            name: 'Memoria sin canal',
            steps: ['Escritura concurrente sin lock', 'Peligro de data race'],
          },
          statusBadge: 'RIESGO · Sobrecarga de hilos y estado compartido',
        },
      },
      {
        chapter: '02 · Scheduler M:N',
        title: 'Comunicar valores por canales en lugar de compartir memoria',
        durationSec: 11,
        mascot: 'coding',
        aura: 'cyan',
        speaker: 'gopher',
        speech:
          'Una goroutine nace con apenas dos kilobytes de stack dinámico y el runtime M:N de Go las multiplexa sobre pocos núcleos reales. En lugar de compartir memoria sin cuidado, comunican valores seguros usando canales tipados.',
        visual: {
          kind: 'lanes',
          mode: 'ordered',
          laneA: {
            name: 'G1..GN (2 KB stack)',
            steps: ['go work(ctx, ch)', 'Planificador M:N en user-space'],
          },
          laneB: {
            name: 'Canal Tipado ch',
            steps: ['ch <- resultado', 'res := <-ch (handshake seguro)'],
          },
          statusBadge: 'SEGURO · Cero context switch pesado + sincronía clara',
        },
      },
      {
        chapter: '03 · Cierre Coordinado',
        title: 'Evitar fugas de goroutines con context y WaitGroup',
        durationSec: 10,
        mascot: 'celebrate',
        aura: 'gold',
        speaker: 'gopher',
        speech:
          'Recuerda siempre coordinar el cierre con context.Context y WaitGroup para no dejar goroutines colgadas en background, y valida cada lección concurrente pasando go test -race.',
        visual: {
          kind: 'terminal',
          title: 'a01-concurrency · clean shutdown',
          lines: [
            { prompt: '$', text: 'go test -race ./a01-goroutines', tone: 'cmd' },
            { text: 'wg.Wait() -> todas las goroutines cerraron con ctx.Done()', tone: 'ok' },
            { text: 'PASS · 0 data races · 0 goroutine leaks', tone: 'ok' },
          ],
        },
      },
    ],
  }),
};

export function getLessonCinemaDeck(lessonId: string): CinemaDeck | undefined {
  return LESSON_ANCHOR_DECKS[lessonId];
}

/** 25. Frameworks Academy Overview (net/http, Chi, Gin, Echo, Fiber, SQL, gRPC) */
export const FRAMEWORKS_OVERVIEW_DECK: CinemaDeck = attachAudio({
  id: 'FRAMEWORKS-OVERVIEW',
  kicker: 'FRAMEWORKS ACADEMY · ESTUDIO HD',
  heading: 'Cómo elegir framework Go según tus restricciones reales',
  ctaLabel: 'Explorar las 8 rutas abajo',
  ctaHref: '#/frameworks',
  scenes: [
    {
      chapter: '01 · El Dilema',
      title: '¿Cuándo basta net/http y cuándo conviene un router externo?',
      durationSec: 11,
      mascot: 'question',
      aura: 'cyan',
      speaker: 'host',
      speech:
        'En Frameworks Academy hay ocho rutas: net/http estándar, Gin, Chi, Echo, Fiber, persistencia y gRPC. ¿Necesitas siempre instalar un framework pesado para exponer una API rápida en Go?',
      visual: {
        kind: 'architecture',
        mode: 'incident',
        nodes: [
          { label: 'Stdlib net/http', sub: '0 dependencias externas', state: 'normal' },
          { label: 'Gin / Chi / Echo', sub: 'Radix Tree + http.Handler', state: 'normal' },
          { label: 'Fiber (fasthttp)', sub: 'Ruptura de net/http estándar', state: 'hot' },
        ],
        metricLabel: 'Trampa habitual al elegir stack',
        metricBefore: 'Elegir solo por hype',
        metricAfter: 'Elegir según compatibilidad y P99',
      },
    },
    {
      chapter: '02 · Mapa del Ecosistema',
      title: 'Go 1.22+ ServeMux, Chi composable, Gin/Echo JSON y Fiber fasthttp',
      durationSec: 13,
      mascot: 'architecture',
      aura: 'violet',
      speaker: 'gopher',
      speech:
        'Depende de tu restricción real: desde Go 1.22 ServeMux soporta rutas con método y parámetros sin dependencias externas; Chi mantiene cien por cien compatibilidad http.Handler; Gin y Echo agilizan JSON; y Fiber prioriza ultra baja latencia con fasthttp.',
      visual: {
        kind: 'architecture',
        mode: 'mitigated',
        nodes: [
          { label: 'net/http + Chi', sub: '100% estándar · 2 allocs', state: 'ok' },
          { label: 'Gin / Echo', sub: 'JSON rápido + validación', state: 'ok' },
          { label: 'SQL + gRPC', sub: 'Contratos fuertes e índices', state: 'ok' },
        ],
        metricLabel: 'Criterio de Arquitectura Go',
        metricBefore: 'Reescribir por incompatibilidad',
        metricAfter: 'Portabilidad total con http.Handler ✓',
      },
    },
    {
      chapter: '03 · Benchmark Real',
      title: 'Medir throughput, latencia P99 y allocs/op antes de decidir',
      durationSec: 11,
      mascot: 'senior',
      aura: 'gold',
      speaker: 'gopher',
      speech:
        'Compara throughput, P99 y asignaciones por operación en la tabla inferior, elige la herramienta más simple que cumpla tus requisitos y lleva ese criterio arquitectónico directamente a Senior Mode.',
      visual: {
        kind: 'terminal',
        title: 'frameworks · criterio de selección Go 1.23',
        lines: [
          { prompt: '$', text: 'mux.HandleFunc("GET /orders/{id}", h.GetOrder)', tone: 'cmd' },
          { text: 'net/http & Chi -> ~145k-160k req/s · compatibilidad total', tone: 'ok' },
          { text: 'PASS · Simplicidad primero, benchmarks con evidencia', tone: 'ok' },
        ],
      },
    },
  ],
});
