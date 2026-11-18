import nativeLabs from '../../content/senior/native-labs.json';
import curriculum from '../../data/curriculum.json';
import { evaluateReadiness } from './engine/readiness.mjs';
import { GoCodeBlock } from '../../components/GoCode';

type Locale = 'es' | 'en' | 'ja' | 'zh' | 'pt' | 'fr';

const labels: Record<Locale, {
  heading: string;
  sub: string;
  download: string;
  command: string;
  offline: string;
  back: string;
  openModule: string;
  practice: string;
  readiness: string;
  verified: string;
  missing: string;
  notCertification: string;
  totalProgress: string;
  programCompleted: string;
  radarTitle: string;
}> = {
  es: {
    heading: 'Laboratorios Go nativos',
    sub: '18 ejercicios con código Go auténtico y pruebas automatizadas. Se ejecutan en tu equipo con go test, no en el navegador.',
    download: 'Descargar los 18 laboratorios (.zip)',
    command: 'Ejecutar localmente',
    offline: 'No es ejecución Go en el navegador. Requiere Go 1.23 o superior en tu entorno local.',
    back: 'Volver a Senior Mode',
    openModule: 'Abrir módulo Senior',
    practice: 'Directorio',
    readiness: 'Mapa de competencias',
    verified: 'Actividades comprobadas',
    missing: 'Pendientes',
    notCertification: 'Este mapa refleja resultados de ejercicios educativos deterministas, no una certificación profesional.',
    totalProgress: 'Progreso acumulado',
    programCompleted: 'del programa Senior completado',
    radarTitle: 'Radar de competencias · 6 dominios',
  },
  en: {
    heading: 'Native Go labs',
    sub: '18 exercises with real Go source and automated tests. Run on your computer via go test, not inside the browser.',
    download: 'Download all 18 labs (.zip)',
    command: 'Run locally',
    offline: 'This is not browser Go execution. Requires Go 1.23 or newer in your local environment.',
    back: 'Back to Senior Mode',
    openModule: 'Open Senior module',
    practice: 'Directory',
    readiness: 'Competency map',
    verified: 'Checked activities',
    missing: 'Remaining',
    notCertification: 'This map shows deterministic educational assessments, not a professional certification.',
    totalProgress: 'Overall progress',
    programCompleted: 'of Senior program completed',
    radarTitle: 'Competency Radar · 6 domains',
  },
  ja: {
    heading: 'Go ネイティブラボ',
    sub: '実際の Go コードと自動テストを含む18個の演習。ブラウザではなくローカルで実行します。',
    download: '18個のラボをダウンロード (.zip)',
    command: 'ローカルで実行',
    offline: 'ブラウザ内の Go 実行ではありません。Go 1.23 以降が必要です。',
    back: 'Senior Mode に戻る',
    openModule: 'モジュールを開く',
    practice: 'ディレクトリ',
    readiness: 'スキルマップ',
    verified: '確認済みの活動',
    missing: '未完了',
    notCertification: 'これは教育上の評価であり、専門資格の証明ではありません。',
    totalProgress: '総合進捗',
    programCompleted: 'シニアプログラム達成率',
    radarTitle: 'スキルレーダー · 6領域',
  },
  zh: {
    heading: 'Go 原生实验室',
    sub: '18个包含真实 Go 源代码和自动化测试的练习，需在本地通过 go test 运行。',
    download: '下载18个实验室 (.zip)',
    command: '本地运行命令',
    offline: '这不是浏览器内的 Go 执行。需要本地安装 Go 1.23 或更高版本。',
    back: '返回 Senior Mode',
    openModule: '查看模块详情',
    practice: '源码目录',
    readiness: '能力雷达图',
    verified: '已验证活动',
    missing: '待完成',
    notCertification: '此地图展示确定性教学测评结果，不代表职业资格认证。',
    totalProgress: '总体进度',
    programCompleted: 'Senior 计划完成度',
    radarTitle: '能力分布雷达 · 6 大领域',
  },
  pt: {
    heading: 'Laboratórios Go nativos',
    sub: '18 exercícios com código Go real e testes automáticos. Execute no computador com go test, não no navegador.',
    download: 'Baixar os 18 laboratórios (.zip)',
    command: 'Executar localmente',
    offline: 'Não é execução Go no navegador. Requer Go 1.23 ou superior no ambiente local.',
    back: 'Voltar ao Senior Mode',
    openModule: 'Abrir módulo Senior',
    practice: 'Diretório',
    readiness: 'Mapa de competências',
    verified: 'Atividades verificadas',
    missing: 'Pendentes',
    notCertification: 'Este mapa reflete avaliações educacionais determinísticas, não uma certificação profissional.',
    totalProgress: 'Progresso total',
    programCompleted: 'do programa Senior concluído',
    radarTitle: 'Radar de competências · 6 domínios',
  },
  fr: {
    heading: 'Laboratoires Go natifs',
    sub: '18 exercices avec du vrai code Go et des tests automatisés, à exécuter localement via go test.',
    download: 'Télécharger les 18 laboratoires (.zip)',
    command: 'Exécuter localement',
    offline: 'Go ne s’exécute pas dans le navigateur. Nécessite Go 1.23 ou plus en local.',
    back: 'Retour à Senior Mode',
    openModule: 'Ouvrir le module Senior',
    practice: 'Répertoire',
    readiness: 'Carte des compétences',
    verified: 'Activités évaluées',
    missing: 'Restantes',
    notCertification: 'Ce tableau reflète des évaluations pédagogiques déterministes, pas une certification professionnelle.',
    totalProgress: 'Progression totale',
    programCompleted: 'du programme Senior complété',
    radarTitle: 'Radar de compétences · 6 domaines',
  },
};

const base = import.meta.env.BASE_URL;

export function NativeLabCatalog({ locale, activeModule }: { locale: Locale; activeModule?: string }) {
  const t = labels[locale] || labels.es;
  const labs = activeModule ? nativeLabs.filter(l => l.id === activeModule) : nativeLabs;

  return (
    <section class="content-page native-lab-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/senior">{t.back}</a>
        <span>/</span>
        <b>{t.heading}</b>
      </nav>

      <div class="page-heading">
        <span class="senior-kicker">GO · REAL TESTS · RACE DETECTOR</span>
        <h1>{t.heading}</h1>
        <p>{t.sub}</p>
      </div>

      <div class="native-hero-bar card">
        <div class="native-hero-bar-top">
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>{t.command}</h2>
            <p class="small-disclaimer" style={{ margin: 0 }}>{t.offline}</p>
          </div>
          <a class="btn btn-senior-solid native-download" href={`${base}downloads/go-native-senior-labs.zip`} download style={{ margin: 0 }}>
            {t.download} ↓
          </a>
        </div>
        <GoCodeBlock
          lang="sh"
          code={`cd labs-native\ngo test ./...\ngo test -race ./...\ngo test -run '^$' -bench . ./s08-performance`}
        />
      </div>

      <div class="senior-grid senior-grid-v2" style={{ marginTop: '24px' }}>
        {labs.map(l => (
          <article class="senior-card senior-card-v2" key={l.id}>
            <div class="senior-card-meta">
              <span class="senior-id-pill">{l.id}</span>
              <span class="senior-gates-count">go test · -race</span>
            </div>
            <h3 class="senior-card-title">
              {curriculum.find(m => m.id === l.id)?.title[locale] || l.title}
            </h3>
            <p class="senior-card-scenario" style={{ marginBottom: '14px' }}>
              <code class="native-slug-chip">{l.directory}</code>
            </p>
            <div class="senior-card-footer">
              <a class="senior-status-indicator idle" href={`#/senior/${l.id}`}>
                <span>{t.openModule}</span>
                <span class="senior-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type Records = {
  seniorResults: Record<string, { score: number; passed: boolean }>;
  evidenceResults: Record<string, { score: number; passed: boolean }>;
  investigationResults: Record<string, { score: number; passed: boolean }>;
  operationsResults: Record<string, { score: number; passed: boolean }>;
  reviewResults: Record<string, { score: number; passed: boolean }>;
};

const radarAxes = [
  { name: 'Arquitectura', modules: ['S01', 'S02', 'S03'] },
  { name: 'Concurrencia', modules: ['S04', 'S05', 'S06'] },
  { name: 'Rendimiento', modules: ['S07', 'S08', 'S09'] },
  { name: 'Resiliencia', modules: ['S10', 'S11', 'S12'] },
  { name: 'Observabilidad', modules: ['S13', 'S14', 'S15'] },
  { name: 'System Design', modules: ['S16', 'S17', 'S18'] },
];

export function SeniorReadiness({ locale, records }: { locale: Locale; records: Records }) {
  const t = labels[locale] || labels.es;
  const results = evaluateReadiness(nativeLabs.map(l => l.id), records);

  const cx = 200, cy = 170, maxR = 115;
  const axisData = radarAxes.map((axis, i) => {
    const angle = (-90 + i * 60) * (Math.PI / 180);
    const passedCount = axis.modules.reduce((acc, id) => {
      const mod = results.modules.find(m => m.moduleId === id);
      return acc + (mod ? mod.passed : 0);
    }, 0);
    const pct = Math.round((passedCount / 15) * 100);
    const r = Math.max(12, (maxR * pct) / 100);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    const labelX = cx + (maxR + 34) * Math.cos(angle);
    const labelY = cy + (maxR + 24) * Math.sin(angle);
    return { ...axis, pct, x, y, angle, labelX, labelY };
  });

  const polygonPoints = axisData.map(a => `${a.x.toFixed(1)},${a.y.toFixed(1)}`).join(' ');

  return (
    <section class="content-page">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/senior">{t.back}</a>
        <span>/</span>
        <b>{t.readiness}</b>
      </nav>

      <div class="page-heading">
        <span class="senior-kicker">LEARNING PROGRESS · NOT CERTIFICATION</span>
        <h1>{t.readiness}</h1>
        <p>{t.notCertification}</p>
      </div>

      <div class="readiness-overview">
        <div class="radar-card">
          <span class="senior-kicker" style={{ marginBottom: '12px' }}>{t.radarTitle}</span>
          <svg class="radar-svg" viewBox="0 0 400 340" aria-label="Radar de competencias Senior">
            <title>{t.radarTitle}</title>
            {[0.25, 0.5, 0.75, 1].map(scale => {
              const webPoints = [0, 1, 2, 3, 4, 5].map(i => {
                const rad = (-90 + i * 60) * (Math.PI / 180);
                return `${(cx + maxR * scale * Math.cos(rad)).toFixed(1)},${(cy + maxR * scale * Math.sin(rad)).toFixed(1)}`;
              }).join(' ');
              return <polygon key={scale} points={webPoints} fill="none" stroke="var(--border)" stroke-width="1" stroke-dasharray={scale < 1 ? '3 3' : 'none'} />;
            })}
            {axisData.map((a, i) => {
              const endX = cx + maxR * Math.cos(a.angle);
              const endY = cy + maxR * Math.sin(a.angle);
              return (
                <g key={i}>
                  <line x1={cx} y1={cy} x2={endX} y2={endY} stroke="var(--border)" stroke-width="1" />
                  <text x={a.labelX} y={a.labelY} text-anchor="middle" dominant-baseline="middle" class="radar-axis-text">
                    {a.name}
                  </text>
                  <text x={a.labelX} y={a.labelY + 13} text-anchor="middle" dominant-baseline="middle" class="radar-pct-text">
                    {a.pct}%
                  </text>
                </g>
              );
            })}
            <polygon points={polygonPoints} fill="rgba(0, 173, 216, 0.24)" stroke="var(--go, #00add8)" stroke-width="2.2" />
            {axisData.map((a, i) => (
              <circle key={i} cx={a.x} cy={a.y} r={4} fill="#ff6b3d" stroke="var(--surface, #102236)" stroke-width="2" />
            ))}
          </svg>
        </div>

        <section class="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span class="senior-kicker">{t.totalProgress}</span>
          <h2 style={{ fontSize: '32px', margin: '8px 0' }}>{results.checked} / {results.possible} · {t.verified}</h2>
          <div class="progress-track" style={{ height: '12px', borderRadius: '999px' }}>
            <div class="progress-fill" style={{ width: `${results.percent}%`, height: '100%', borderRadius: '999px' }} />
          </div>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--go-light)', margin: '8px 0 18px' }}>
            {results.percent}% {t.programCompleted}
          </p>
          <div class="domain-scores">
            {axisData.map(a => (
              <div class="domain-score-chip" key={a.name}>
                <span>{a.name}</span>
                <b>{a.pct}%</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div class="senior-grid senior-grid-v2">
        {results.modules.map(m => {
          const isDec = !!records.seniorResults[m.moduleId]?.passed;
          const isEvd = !!records.evidenceResults[m.moduleId]?.passed;
          const isInv = !!records.investigationResults[m.moduleId]?.passed;
          const isOps = !!records.operationsResults[m.moduleId]?.passed;
          const isRev = !!records.reviewResults[m.moduleId]?.passed;
          const isDone = m.passed === 5;
          const isProgress = m.passed > 0 && m.passed < 5;

          return (
            <a class="senior-card senior-card-v2" key={m.moduleId} href={`#/senior/${m.moduleId}`}>
              <div class="senior-card-meta">
                <span class={`senior-id-pill ${isDone ? 'done' : isProgress ? 'progress' : ''}`}>
                  {m.moduleId}
                </span>
                <span class="senior-gates-count">{m.passed}/5 gates</span>
              </div>

              <h3 class="senior-card-title">
                {curriculum.find(l => l.id === m.moduleId)?.title[locale] || nativeLabs.find(l => l.id === m.moduleId)?.title}
              </h3>

              <div class="module-badges-row" style={{ margin: '6px 0 16px' }}>
                <span class={`mini-badge ${isDec ? 'done' : ''}`} title="Decision Lab">DEC {isDec ? '✓' : '·'}</span>
                <span class={`mini-badge ${isEvd ? 'done' : ''}`} title="Evidence Lab">EVD {isEvd ? '✓' : '·'}</span>
                <span class={`mini-badge ${isInv ? 'done' : ''}`} title="Investigation Lab">INV {isInv ? '✓' : '·'}</span>
                <span class={`mini-badge ${isOps ? 'done' : ''}`} title="Operations Lab">OPS {isOps ? '✓' : '·'}</span>
                <span class={`mini-badge ${isRev ? 'done' : ''}`} title="Code Review">REV {isRev ? '✓' : '·'}</span>
              </div>

              <div class="senior-card-footer">
                <span class={`senior-status-indicator ${isDone ? 'done' : isProgress ? 'progress' : 'idle'}`}>
                  <span>
                    {isDone ? t.verified : `${t.missing}: ${5 - m.passed}/5`}
                  </span>
                  <span class="senior-arrow" aria-hidden="true">→</span>
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
