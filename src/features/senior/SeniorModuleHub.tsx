import curriculum from '../../data/curriculum.json';
import seniorChallenges from '../../content/senior/challenges.json';
import { SeniorSimulationLab } from './SeniorSimulationLab';

type Locale = 'es' | 'en' | 'ja' | 'zh' | 'pt' | 'fr';

type SeniorModuleHubProps = {
  moduleId: string;
  locale: Locale;
  notes: Record<string, string>;
  updateNote: (id: string, note: string) => void;
  seniorResults: Record<string, { score: number; passed: boolean }>;
  evidenceResults: Record<string, { score: number; passed: boolean }>;
  investigationResults: Record<string, { score: number; passed: boolean }>;
  operationsResults: Record<string, { score: number; passed: boolean }>;
  reviewResults: Record<string, { score: number; passed: boolean }>;
};

const labels: Record<Locale, {
  scenarioTitle: string;
  notice: string;
  gatesHeading: string;
  btnQuiz: string;
  btnEvidence: string;
  btnInvestigation: string;
  btnOperations: string;
  btnReview: string;
  btnGuide: string;
  btnNative: string;
  outcomesHeading: string;
  adrHeading: string;
  adrLabel: string;
  adrPlaceholder: string;
  adrNotice: string;
  asideTitle: string;
  notEvaluated: string;
  passedBadge: string;
  failedBadge: string;
  viewResult: string;
  nativeCardTitle: string;
  nativeCardDesc: string;
  notFound: string;
  back: string;
}> = {
  es: {
    scenarioTitle: 'Escenario de producción',
    notice: 'Laboratorio de conocimientos: decisiones objetivas, evidencias de incidentes, revisión de código y reflexiones ADR. No compila Go en el navegador.',
    gatesHeading: '5 Quality Gates del módulo',
    btnQuiz: 'Decisiones de arquitectura',
    btnEvidence: 'Análisis de evidencias',
    btnInvestigation: 'Investigación por etapas',
    btnOperations: 'Incidente operativo',
    btnReview: 'Revisión de código Go',
    btnGuide: 'Estudiar guía técnica →',
    btnNative: 'Práctica Go real (descarga) →',
    outcomesHeading: 'Lo que vas a investigar',
    adrHeading: 'Architecture Decision Record · Reflexión técnica',
    adrLabel: 'Describe alternativas, riesgos y cómo validarías tu solución en producción:',
    adrPlaceholder: 'Contexto del problema, alternativas consideradas, decisión adoptada, trade-offs y plan de verificación...',
    adrNotice: 'Autoguardado local en navegador. Estas notas no se califican automáticamente ni alteran la puntuación.',
    asideTitle: 'Progreso del módulo',
    notEvaluated: 'Pendiente',
    passedBadge: 'Completado (100%)',
    failedBadge: 'Por revisar',
    viewResult: 'Ir al primer gate →',
    nativeCardTitle: 'Laboratorio Go nativo',
    nativeCardDesc: 'Código fuente Go y pruebas unitarias descargables para ejecutar con go test localmente.',
    notFound: 'Módulo Senior no encontrado',
    back: 'Volver a Senior',
  },
  en: {
    scenarioTitle: 'Production Scenario',
    notice: 'Knowledge lab: objective decisions, incident evidence, code review, and ADR notes. Does not compile Go in the browser.',
    gatesHeading: 'Module 5 Quality Gates',
    btnQuiz: 'Architecture Decisions',
    btnEvidence: 'Evidence Analysis',
    btnInvestigation: 'Step-by-step Investigation',
    btnOperations: 'Operations Incident',
    btnReview: 'Go Code Review',
    btnGuide: 'Study technical guide →',
    btnNative: 'Native Go lab (download) →',
    outcomesHeading: 'What you will investigate',
    adrHeading: 'Architecture Decision Record · Technical Reflection',
    adrLabel: 'Describe alternatives, trade-offs, and validation strategy:',
    adrPlaceholder: 'Problem context, considered alternatives, chosen decision, trade-offs, and verification plan...',
    adrNotice: 'Auto-saved locally in browser. ADR notes are unscored and do not change your quiz points.',
    asideTitle: 'Module Progress',
    notEvaluated: 'Pending',
    passedBadge: 'Completed (100%)',
    failedBadge: 'Needs review',
    viewResult: 'Start first gate →',
    nativeCardTitle: 'Native Go Lab',
    nativeCardDesc: 'Authentic Go code and test suites to execute locally via go test.',
    notFound: 'Senior module not found',
    back: 'Back to Senior',
  },
  ja: {
    scenarioTitle: '本番環境シナリオ',
    notice: '知識ラボ：客観的な判断、障害証拠、コードレビュー、ADR記録。ブラウザでGoをコンパイルしません。',
    gatesHeading: '5つの品質ゲート',
    btnQuiz: 'アーキテクチャ判断',
    btnEvidence: '証拠分析ラボ',
    btnInvestigation: '段階的調査',
    btnOperations: '運用インシデント対応',
    btnReview: 'Go コードレビュー',
    btnGuide: '技術ガイドを学ぶ →',
    btnNative: 'リアルGo実習（ダウンロード） →',
    outcomesHeading: '調査・学習のポイント',
    adrHeading: 'アーキテクチャ決定記録 (ADR)',
    adrLabel: '代替案、リスク、本番での検証手順を記述してください：',
    adrPlaceholder: '課題の背景、検討した代替案、決定内容、トレードオフ、検証計画...',
    adrNotice: 'ブラウザに自動保存されます。このノートは自動採点の対象外です。',
    asideTitle: 'モジュールの進捗',
    notEvaluated: '未完了',
    passedBadge: '合格 (100%)',
    failedBadge: '要見直し',
    viewResult: '最初のゲートへ →',
    nativeCardTitle: 'ネイティブ Go ラボ',
    nativeCardDesc: 'ローカルで go test を実行するための本物の Go ソースコードとテスト群です。',
    notFound: 'シニアモジュールが見つかりません',
    back: 'Senior に戻る',
  },
  zh: {
    scenarioTitle: '生产场景描述',
    notice: '知识实验室：客观决策、现场证据分析、代码审查与 ADR 架构反思。不直接在浏览器中编译 Go 代码。',
    gatesHeading: '本模块 5 道质量关卡',
    btnQuiz: '架构技术决策',
    btnEvidence: '现场证据分析',
    btnInvestigation: '分步根因调查',
    btnOperations: '生产故障处置',
    btnReview: 'Go 代码审查',
    btnGuide: '阅读深度技术指南 →',
    btnNative: '原生 Go 实验（下载） →',
    outcomesHeading: '核心研究要点',
    adrHeading: '架构决策记录 (ADR) · 深度反思',
    adrLabel: '陈述备选方案、技术权衡及生产验证策略：',
    adrPlaceholder: '问题背景、权衡的备选方案、采纳的决策、trade-offs 及验证方案...',
    adrNotice: '浏览器本地自动保存。ADR 笔记不进行自动机器评分，不影响测试得分。',
    asideTitle: '本模块完成度',
    notEvaluated: '未完成',
    passedBadge: '已通过 (100%)',
    failedBadge: '需复查',
    viewResult: '前往第一道关卡 →',
    nativeCardTitle: '原生 Go 实验包',
    nativeCardDesc: '包含真实的 Go 源码和自动化测试用例，供在本地环境中通过 go test 运行验证。',
    notFound: '未找到该 Senior 模块',
    back: '返回 Senior 模式',
  },
  pt: {
    scenarioTitle: 'Cenário de produção',
    notice: 'Laboratório de conhecimento: decisões técnicas, análise de incidentes, code review e notas ADR. Sem compilar Go no navegador.',
    gatesHeading: '5 Quality Gates do módulo',
    btnQuiz: 'Decisões de arquitetura',
    btnEvidence: 'Análise de evidências',
    btnInvestigation: 'Investigação por etapas',
    btnOperations: 'Incidente operacional',
    btnReview: 'Revisão de código Go',
    btnGuide: 'Estudar guia técnico →',
    btnNative: 'Prática Go real (download) →',
    outcomesHeading: 'O que você vai investigar',
    adrHeading: 'Architecture Decision Record · Reflexão técnica',
    adrLabel: 'Descreva alternativas, riscos e validação da solução:',
    adrPlaceholder: 'Contexto do problema, alternativas, decisão tomada, trade-offs e plano de testes...',
    adrNotice: 'Salvo localmente no navegador. Notas ADR não alteram a pontuação automática.',
    asideTitle: 'Progresso no módulo',
    notEvaluated: 'Pendente',
    passedBadge: 'Concluído (100%)',
    failedBadge: 'Rever',
    viewResult: 'Ir ao primeiro gate →',
    nativeCardTitle: 'Laboratório Go nativo',
    nativeCardDesc: 'Código Go real e suíte de testes para executar com go test no seu computador.',
    notFound: 'Módulo Senior não encontrado',
    back: 'Voltar ao Senior',
  },
  fr: {
    scenarioTitle: 'Scénario de production',
    notice: 'Laboratoire de compétences : décisions d’architecture, analyse d’incidents, revue de code et notes ADR. Ne compile pas Go dans le navigateur.',
    gatesHeading: '5 Quality Gates du module',
    btnQuiz: 'Décisions d’architecture',
    btnEvidence: 'Analyse des preuves',
    btnInvestigation: 'Investigation par étapes',
    btnOperations: 'Incident opérationnel',
    btnReview: 'Revue de code Go',
    btnGuide: 'Étudier le guide technique →',
    btnNative: 'Pratique Go réelle (téléchargement) →',
    outcomesHeading: 'Objectifs d’investigation',
    adrHeading: 'Architecture Decision Record · Réflexion technique',
    adrLabel: 'Décrivez les alternatives, compromis et stratégie de validation :',
    adrPlaceholder: 'Contexte du problème, alternatives étudiées, décision retenue, compromis et plan de vérification...',
    adrNotice: 'Enregistrement local automatique. Les notes ADR ne modifient pas la note chiffrée.',
    asideTitle: 'Progression du module',
    notEvaluated: 'En attente',
    passedBadge: 'Validé (100%)',
    failedBadge: 'À revoir',
    viewResult: 'Ouvrir le premier gate →',
    nativeCardTitle: 'Laboratoire Go natif',
    nativeCardDesc: 'Code source Go et tests automatisés à exécuter en local avec go test.',
    notFound: 'Module Senior introuvable',
    back: 'Retour à Senior',
  },
};

const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

export function SeniorModuleHub({
  moduleId,
  locale,
  notes,
  updateNote,
  seniorResults,
  evidenceResults,
  investigationResults,
  operationsResults,
  reviewResults,
}: SeniorModuleHubProps) {
  const t = labels[locale] || labels.es;
  const m = curriculum.find(x => x.id === moduleId && x.track === 'senior');
  const ch = seniorChallenges.find(c => c.moduleId === moduleId);

  if (!m || !ch) {
    return (
      <div class="content-page" role="alert">
        <h2>{t.notFound}</h2>
        <a class="text-link" href="#/senior">{t.back}</a>
      </div>
    );
  }

  const note = notes[moduleId] || '';
  const hasSimulator = ['S05', 'S07', 'S09', 'S10', 'S11', 'S18'].includes(moduleId);

  const gates = [
    { code: 'G1', label: t.btnQuiz, href: `#/senior/${moduleId}/decision-lab`, res: seniorResults[moduleId] },
    { code: 'G2', label: t.btnEvidence, href: `#/senior/${moduleId}/evidence-lab`, res: evidenceResults[moduleId] },
    { code: 'G3', label: t.btnInvestigation, href: `#/senior/${moduleId}/investigation-lab`, res: investigationResults[moduleId] },
    { code: 'G4', label: t.btnOperations, href: `#/senior/${moduleId}/operations-lab`, res: operationsResults[moduleId] },
    { code: 'G5', label: t.btnReview, href: `#/senior/${moduleId}/review-lab`, res: reviewResults[moduleId] },
  ];

  const passedGates = gates.filter(g => g.res?.passed).length;

  return (
    <div class="content-page senior-module-hub">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/senior">Senior Mode</a>
        <span>/</span>
        <b>{m.id}</b>
      </nav>

      <div class="page-heading senior-hub-heading">
        <div class="senior-hub-badges">
          <span class="senior-id-pill">{m.id}</span>
          {m.challenge?.kind && (
            <span class="senior-kind-pill">{m.challenge.kind.toUpperCase()}</span>
          )}
          <span class="senior-gates-count">{passedGates}/5 gates</span>
        </div>
        <h1>{m.title[locale]}</h1>
      </div>

      <div class="senior-lab-grid">
        <div class="senior-lab-main">
          {/* Production Scenario Card */}
          <section class="card scenario-card">
            <div class="scenario-card-header">
              <div class="scenario-card-title-group">
                <img class="pixel-icon" src={asset('icons/crown.svg')} width={18} height={18} alt="" aria-hidden="true" />
                <b>{t.scenarioTitle}</b>
              </div>
              <span class="senior-gates-count">{passedGates}/5 gates</span>
            </div>

            <p class="brief-lead">{m.challenge?.scenario[locale]}</p>
            <div class="notice" role="note">{t.notice}</div>

            {/* 5 Structured Quality Gate Cards */}
            <div class="hub-gates-section">
              <span class="hub-gates-label">{t.gatesHeading}</span>
              <div class="hub-gates-grid">
                {gates.map(g => {
                  const passed = !!g.res?.passed;
                  const attempted = !!g.res;
                  return (
                    <a
                      key={g.code}
                      class={`hub-gate-card ${passed ? 'passed' : attempted ? 'attempted' : ''}`}
                      href={g.href}
                    >
                      <span class="hub-gate-code">{g.code}</span>
                      <span class="hub-gate-title">{g.label}</span>
                      <span class="hub-gate-state">
                        {passed ? `✓ ${g.res.score}%` : attempted ? `${g.res.score}%` : '→'}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Study Guide & Native Go Download Bar */}
            <div class="hub-resources-row">
              <a class="btn btn-senior-solid" href={`#/senior/${moduleId}/guide`}>
                {t.btnGuide}
              </a>
              <a class="btn btn-senior-ghost" href={`#/senior/${moduleId}/native`}>
                {t.btnNative}
              </a>
            </div>
          </section>

          {/* Interactive Deterministic Simulator (S05, S07, S09, S10, S11, S18) */}
          {hasSimulator && (
            <SeniorSimulationLab moduleId={moduleId} locale={locale} />
          )}

          {/* Learning Outcomes */}
          <section class="card">
            <h3>{t.outcomesHeading}</h3>
            <ol class="senior-outcomes">
              {ch.learningPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ol>
          </section>

          {/* ADR Reflection */}
          <section class="card notes-card">
            <h3>{t.adrHeading}</h3>
            <label for="senior-adr">{t.adrLabel}</label>
            <textarea
              id="senior-adr"
              class="notes-editor"
              maxLength={12000}
              value={note}
              onInput={e => updateNote(moduleId, (e.currentTarget as HTMLTextAreaElement).value)}
              placeholder={t.adrPlaceholder}
            />
            <p class="small-disclaimer">{t.adrNotice}</p>
          </section>
        </div>

        {/* Sidebar */}
        <aside class="senior-aside">
          <section class="card senior-progress-card">
            <img class="gopher" src={asset('gophers/architecture.png')} alt="" aria-hidden="true" style={{ maxHeight: '116px', margin: '0 auto 12px' }} />
            <h3>{t.asideTitle}</h3>
            <ul class="rubric-list">
              <li>
                <span>Decision Lab</span>
                <b class={seniorResults[moduleId]?.passed ? 'done' : ''}>
                  {seniorResults[moduleId] ? `${seniorResults[moduleId].score}%` : t.notEvaluated}
                </b>
              </li>
              <li>
                <span>Evidence Lab</span>
                <b class={evidenceResults[moduleId]?.passed ? 'done' : ''}>
                  {evidenceResults[moduleId] ? `${evidenceResults[moduleId].score}%` : t.notEvaluated}
                </b>
              </li>
              <li>
                <span>Investigation</span>
                <b class={investigationResults[moduleId]?.passed ? 'done' : ''}>
                  {investigationResults[moduleId] ? `${investigationResults[moduleId].score}%` : t.notEvaluated}
                </b>
              </li>
              <li>
                <span>Operations Lab</span>
                <b class={operationsResults[moduleId]?.passed ? 'done' : ''}>
                  {operationsResults[moduleId] ? `${operationsResults[moduleId].score}%` : t.notEvaluated}
                </b>
              </li>
              <li>
                <span>Code Review</span>
                <b class={reviewResults[moduleId]?.passed ? 'done' : ''}>
                  {reviewResults[moduleId] ? `${reviewResults[moduleId].score}%` : t.notEvaluated}
                </b>
              </li>
            </ul>

            <div style={{ marginTop: '16px' }}>
              <a class="text-link" href={`#/senior/${moduleId}/decision-lab`}>
                {t.viewResult}
              </a>
            </div>
          </section>

          <section class="card">
            <h3>{t.nativeCardTitle}</h3>
            <p class="small-disclaimer" style={{ margin: '8px 0 14px' }}>{t.nativeCardDesc}</p>
            <a class="btn btn-senior-ghost" href={`#/senior/${moduleId}/native`} style={{ width: '100%' }}>
              labs-native/{moduleId.toLowerCase()} ↗
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
