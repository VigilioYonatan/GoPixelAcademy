import { useState } from 'preact/hooks';
import curriculum from '../../data/curriculum.json';
import { GopherPlayer } from '../cinema/GopherPlayer';
import { SENIOR_OVERVIEW_DECK } from '../cinema/storyboards';

type Locale = 'es' | 'en' | 'ja' | 'zh' | 'pt' | 'fr';
type SeniorCategory = 'all' | 'concurrency' | 'resilience' | 'performance' | 'architecture' | 'operations';
type StatusFilter = 'all' | 'completed' | 'progress' | 'idle';

const statusLabels: Record<StatusFilter, Record<Locale, string>> = {
  all: { es: 'Todos', en: 'All', ja: 'すべて', zh: '全部', pt: 'Todos', fr: 'Tous' },
  completed: { es: 'Completados', en: 'Completed', ja: '完了', zh: '已完成', pt: 'Concluídos', fr: 'Complétés' },
  progress: { es: 'En progreso', en: 'In progress', ja: '進行中', zh: '进行中', pt: 'Em progresso', fr: 'En cours' },
  idle: { es: 'Sin iniciar', en: 'Not started', ja: '未着手', zh: '未开始', pt: 'Não iniciado', fr: 'Non commencé' },
};

const moduleCategories: Record<string, SeniorCategory> = {
  S01: 'architecture',
  S02: 'architecture',
  S03: 'resilience',
  S04: 'concurrency',
  S05: 'concurrency',
  S06: 'concurrency',
  S07: 'performance',
  S08: 'performance',
  S09: 'concurrency',
  S10: 'resilience',
  S11: 'resilience',
  S12: 'operations',
  S13: 'operations',
  S14: 'performance',
  S15: 'operations',
  S16: 'performance',
  S17: 'operations',
  S18: 'architecture',
};

const categoryLabels: Record<SeniorCategory, Record<Locale, string>> = {
  all: {
    es: 'Todas las áreas',
    en: 'All domains',
    ja: '全領域',
    zh: '全部领域',
    pt: 'Todas as áreas',
    fr: 'Tous les domaines',
  },
  concurrency: {
    es: 'Concurrencia',
    en: 'Concurrency',
    ja: '並行処理',
    zh: '并发模型',
    pt: 'Concorrência',
    fr: 'Concurrence',
  },
  resilience: {
    es: 'Resiliencia & APIs',
    en: 'Resilience & APIs',
    ja: '回復性 & API',
    zh: '韧性与 API',
    pt: 'Resiliência & APIs',
    fr: 'Résilience & APIs',
  },
  performance: {
    es: 'Rendimiento',
    en: 'Performance',
    ja: 'パフォーマンス',
    zh: '性能调优',
    pt: 'Desempenho',
    fr: 'Performance',
  },
  architecture: {
    es: 'Arquitectura',
    en: 'Architecture',
    ja: 'アーキテクチャ',
    zh: '系统架构',
    pt: 'Arquitetura',
    fr: 'Architecture',
  },
  operations: {
    es: 'Operaciones & SRE',
    en: 'Operations & SRE',
    ja: '運用 & SRE',
    zh: '运维与安全',
    pt: 'Operações & SRE',
    fr: 'Opérations & SRE',
  },
};

type SeniorDashboardProps = {
  locale: Locale;
  seniorResults: Record<string, { score: number; passed: boolean }>;
  evidenceResults: Record<string, { score: number; passed: boolean }>;
  investigationResults: Record<string, { score: number; passed: boolean }>;
  operationsResults: Record<string, { score: number; passed: boolean }>;
  reviewResults: Record<string, { score: number; passed: boolean }>;
};

const labels: Record<Locale, {
  eyebrow: string;
  title: string;
  subtitle: string;
  kpiScenarios: string;
  kpiGates: string;
  kpiSimulators: string;
  kpiProgress: string;
  nativeBtn: string;
  readinessBtn: string;
  capstoneBtn: string;
  notice: string;
  gatesWord: string;
  statusDone: string;
  statusProgress: string;
  statusIdle: string;
  emptyState: string;
}> = {
  es: {
    eyebrow: 'Especialización de ingeniería · Go Backend',
    title: 'Senior Mode',
    subtitle: 'Arquitectura limpia, concurrencia real, resiliencia operativa y revisión de código en sistemas Go de producción.',
    kpiScenarios: 'Escenarios reales',
    kpiGates: 'Quality gates',
    kpiSimulators: 'Simuladores SRE',
    kpiProgress: 'Gates superados',
    nativeBtn: 'Laboratorios Go nativos (18) ↓',
    readinessBtn: 'Mapa de competencias →',
    capstoneBtn: 'Capstone Go real →',
    notice: 'Evaluación determinista basada en escenarios reales. Los laboratorios compilables se ejecutan localmente con go test.',
    gatesWord: 'gates',
    statusDone: 'Completado',
    statusProgress: 'En progreso',
    statusIdle: 'No iniciado',
    emptyState: 'No hay módulos que coincidan con este filtro.',
  },
  en: {
    eyebrow: 'Engineering Specialization · Go Backend',
    title: 'Senior Mode',
    subtitle: 'Clean architecture, real concurrency, operational resilience, and code review for production Go systems.',
    kpiScenarios: 'Production scenarios',
    kpiGates: 'Quality gates',
    kpiSimulators: 'SRE simulators',
    kpiProgress: 'Passed gates',
    nativeBtn: 'Native Go labs (18) ↓',
    readinessBtn: 'Competency map →',
    capstoneBtn: 'Native Go capstone →',
    notice: 'Deterministic assessment built on production scenarios. Compilable Go labs run locally via go test.',
    gatesWord: 'gates',
    statusDone: 'Completed',
    statusProgress: 'In progress',
    statusIdle: 'Not started',
    emptyState: 'No modules match the selected filter.',
  },
  ja: {
    eyebrow: 'シニアエンジニアリング専攻 · Go バックエンド',
    title: 'Senior Mode',
    subtitle: '本番Goシステムのためのクリーンアーキテクチャ、並行処理、回復性、コードレビュー実践。',
    kpiScenarios: '本番シナリオ',
    kpiGates: '品質ゲート',
    kpiSimulators: 'SREシミュレーター',
    kpiProgress: '達成ゲート',
    nativeBtn: 'リアル Go · 18ラボ ↓',
    readinessBtn: 'スキルマップ →',
    capstoneBtn: 'キャップストーン →',
    notice: '本番シナリオに基づく決定論的な評価です。Goコードの実行はローカルの go test で行います。',
    gatesWord: 'gates',
    statusDone: '完了',
    statusProgress: '進行中',
    statusIdle: '未着手',
    emptyState: '選択した条件に一致するモジュールはありません。',
  },
  zh: {
    eyebrow: '高级后端工程专项 · Go 生产体系',
    title: 'Senior Mode',
    subtitle: '面向 Go 生产级后端系统的整洁架构、并发控制、韧性工程与代码审查训练。',
    kpiScenarios: '生产级场景',
    kpiGates: '质量关卡',
    kpiSimulators: 'SRE 模拟器',
    kpiProgress: '已通过关卡',
    nativeBtn: '原生 Go 实验室 (18) ↓',
    readinessBtn: '能力雷达图 →',
    capstoneBtn: 'Go 综合项目 →',
    notice: '基于真实生产场景的确定性技术评估。可编译 Go 实验请在本地使用 go test 运行。',
    gatesWord: '关卡',
    statusDone: '已完成',
    statusProgress: '进行中',
    statusIdle: '未开始',
    emptyState: '当前筛选条件下暂无匹配的模块。',
  },
  pt: {
    eyebrow: 'Especialização em Engenharia · Go Backend',
    title: 'Senior Mode',
    subtitle: 'Arquitetura limpa, concorrência real, resiliência operacional e revisão de código para sistemas Go em produção.',
    kpiScenarios: 'Cenários reais',
    kpiGates: 'Quality gates',
    kpiSimulators: 'Simuladores SRE',
    kpiProgress: 'Gates concluídos',
    nativeBtn: 'Laboratórios Go nativos (18) ↓',
    readinessBtn: 'Mapa de competências →',
    capstoneBtn: 'Capstone Go real →',
    notice: 'Avaliação determinística baseada em cenários reais. Os laboratórios compiláveis rodam localmente com go test.',
    gatesWord: 'gates',
    statusDone: 'Concluído',
    statusProgress: 'Em progresso',
    statusIdle: 'Não iniciado',
    emptyState: 'Nenhum módulo corresponde a este filtro.',
  },
  fr: {
    eyebrow: 'Spécialisation Ingénierie · Go Backend',
    title: 'Senior Mode',
    subtitle: 'Architecture propre, concurrence réelle, résilience opérationnelle et revue de code pour systèmes Go en production.',
    kpiScenarios: 'Scénarios réels',
    kpiGates: 'Quality gates',
    kpiSimulators: 'Simulateurs SRE',
    kpiProgress: 'Gates validés',
    nativeBtn: 'Laboratoires Go natifs (18) ↓',
    readinessBtn: 'Carte des compétences →',
    capstoneBtn: 'Projet Capstone Go →',
    notice: 'Évaluation déterministe sur scénarios réels. Les laboratoires compilables s’exécutent localement via go test.',
    gatesWord: 'gates',
    statusDone: 'Complété',
    statusProgress: 'En cours',
    statusIdle: 'Non commencé',
    emptyState: 'Aucun module ne correspond à ce filtre.',
  },
};

const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

export function SeniorDashboard({
  locale,
  seniorResults,
  evidenceResults,
  investigationResults,
  operationsResults,
  reviewResults,
}: SeniorDashboardProps) {
  const t = labels[locale] || labels.es;
  const seniors = curriculum.filter(m => m.track === 'senior');
  const [activeCategory, setActiveCategory] = useState<SeniorCategory>('all');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');

  const categories: SeniorCategory[] = ['all', 'architecture', 'concurrency', 'resilience', 'performance', 'operations'];
  const statusFilters: StatusFilter[] = ['all', 'completed', 'progress', 'idle'];

  const getPassCount = (id: string) => [
    seniorResults[id]?.passed,
    evidenceResults[id]?.passed,
    investigationResults[id]?.passed,
    operationsResults[id]?.passed,
    reviewResults[id]?.passed,
  ].filter(Boolean).length;

  const filteredSeniors = seniors.filter(s => {
    const categoryMatches = activeCategory === 'all' || moduleCategories[s.id] === activeCategory;
    const count = getPassCount(s.id);
    const statusMatches =
      activeStatus === 'all' ||
      (activeStatus === 'completed' && count === 5) ||
      (activeStatus === 'progress' && count > 0 && count < 5) ||
      (activeStatus === 'idle' && count === 0);
    return categoryMatches && statusMatches;
  });

  const totalPassedGates = seniors.reduce((sum, s) => sum + getPassCount(s.id), 0);

  return (
    <div class="content-page senior-dashboard-view">
      {/* Sleek Architectural Hero */}
      <header class="senior-hero senior-hero-clean">
        <div class="senior-hero-body">
          <span class="senior-kicker">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p class="senior-hero-sub">{t.subtitle}</p>

          <div class="senior-kpi-strip">
            <div class="senior-kpi-item">
              <strong>18</strong>
              <span>{t.kpiScenarios}</span>
            </div>
            <div class="senior-kpi-item">
              <strong>90</strong>
              <span>{t.kpiGates}</span>
            </div>
            <div class="senior-kpi-item">
              <strong>10</strong>
              <span>{t.kpiSimulators}</span>
            </div>
            <div class="senior-kpi-item">
              <strong>{totalPassedGates}/90</strong>
              <span>{t.kpiProgress}</span>
            </div>
          </div>

          <div class="native-links senior-hero-actions">
            <a class="btn btn-senior-solid" href="#/senior/native">{t.nativeBtn}</a>
            <a class="btn btn-senior-ghost" href="#/senior/readiness">{t.readinessBtn}</a>
            <a class="btn btn-senior-ghost" href="#/senior/capstone">{t.capstoneBtn}</a>
          </div>

          <p class="senior-scope-note" role="status">{t.notice}</p>
        </div>

        <div class="senior-hero-mascot" aria-hidden="true">
          <img class="gopher" src={asset('gophers/senior.png')} alt="" />
        </div>
      </header>

      <div class="cinema-senior-wrap" style={{ marginTop: '24px' }}>
        <GopherPlayer deck={SENIOR_OVERVIEW_DECK} locale={locale} compact />
      </div>

      {/* Unified Filter Bar (Reference Style: Coral Active Pill + Clean Domain Chips) */}
      <div class="senior-toolbar">
        <div class="senior-status-tabs" role="tablist" aria-label="Filtro por estado">
          {statusFilters.map(st => {
            const count = st === 'all'
              ? seniors.length
              : st === 'completed'
              ? seniors.filter(s => getPassCount(s.id) === 5).length
              : st === 'progress'
              ? seniors.filter(s => { const c = getPassCount(s.id); return c > 0 && c < 5; }).length
              : seniors.filter(s => getPassCount(s.id) === 0).length;
            const label = statusLabels[st][locale] || statusLabels[st].es;
            const showCount = st === 'all' || count > 0;
            return (
              <button
                key={st}
                type="button"
                role="tab"
                aria-selected={activeStatus === st}
                class={`senior-pill-tab ${activeStatus === st ? 'active' : ''}`}
                onClick={() => setActiveStatus(st)}
              >
                {label}{showCount ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        <div class="senior-domain-chips" role="tablist" aria-label="Categorías Senior">
          {categories.map(cat => {
            const label = categoryLabels[cat][locale] || categoryLabels[cat].es;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                class={`senior-domain-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 18 Clean Production Scenario Cards */}
      {filteredSeniors.length === 0 ? (
        <div class="senior-empty-card" role="status">
          <p>{t.emptyState}</p>
        </div>
      ) : (
        <div class="senior-grid senior-grid-v2">
          {filteredSeniors.map(x => {
            const passCount = getPassCount(x.id);
            const isDone = passCount === 5;
            const isProgress = passCount > 0 && passCount < 5;
            const hasSim = ['S03', 'S05', 'S06', 'S07', 'S09', 'S10', 'S11', 'S14', 'S15', 'S18'].includes(x.id);

            return (
              <a class="senior-card senior-card-v2" key={x.id} href={`#/senior/${x.id}`}>
                <div class="senior-card-meta">
                  <span class={`senior-id-pill ${isDone ? 'done' : isProgress ? 'progress' : ''}`}>
                    {x.id}
                  </span>
                  <span class="senior-gates-count">
                    {passCount}/5 {t.gatesWord}
                  </span>
                  {hasSim && <span class="senior-sim-badge">⚡ Sim</span>}
                </div>

                <h3 class="senior-card-title">{x.title[locale]}</h3>
                <p class="senior-card-scenario">{x.challenge?.scenario[locale]}</p>

                <div class="senior-card-footer">
                  <span class={`senior-status-indicator ${isDone ? 'done' : isProgress ? 'progress' : 'idle'}`}>
                    {isDone ? (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <title>{t.statusDone}</title>
                        <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" stroke-width="1.5" />
                        <path d="M4.5 8.2L7 10.7L11.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    ) : isProgress ? (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <title>{t.statusProgress}</title>
                        <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" stroke-width="1.5" />
                        <circle cx="8" cy="8" r="2.5" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <title>{t.statusIdle}</title>
                        <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" stroke-width="1.4" />
                      </svg>
                    )}
                    <span>
                      {isDone
                        ? t.statusDone
                        : isProgress
                        ? `${t.statusProgress} (${passCount}/5)`
                        : t.statusIdle}
                    </span>
                    <span class="senior-arrow" aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
