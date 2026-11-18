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
};

export function getSeniorCinemaDeck(moduleId: string): CinemaDeck | undefined {
  return SENIOR_MODULE_DECKS[moduleId];
}
