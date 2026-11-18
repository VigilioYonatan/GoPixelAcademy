import { useState } from 'preact/hooks';
import investigations from '../../content/senior/investigations.json';
import curriculum from '../../data/curriculum.json';
import { gradeInvestigation } from './engine/investigation.mjs';

type Locale = 'es' | 'en' | 'ja' | 'zh' | 'pt' | 'fr';
type RecordResult = {
  moduleId: string;
  challengeId: 'investigation-lab';
  version: number;
  correct: number;
  score: number;
  answers: number[];
  completedAt: string;
  passed: boolean;
};

type Props = {
  moduleId: string;
  locale: string;
  save: (record: RecordResult) => void;
  previous?: RecordResult;
  reportOnly?: boolean;
};

const localized: Record<string, {
  stage: string;
  notice: string;
  evaluate: string;
  retry: string;
  previous: string;
  expected: string;
  back: string;
  nextGate: string;
  sidebarTitle: string;
  step1: string;
  step2: string;
  step3: string;
  noSaved: string;
}> = {
  es: {
    stage: 'Investigación por etapas',
    notice: 'Caso técnico en español: analiza señales, causa raíz y remediación con consecuencias explicadas. No compila Go en el navegador.',
    evaluate: 'Evaluar investigación',
    retry: 'Reiniciar',
    previous: 'Resultado guardado',
    expected: 'Decisión recomendada',
    back: 'Volver al módulo',
    nextGate: 'Siguiente: Gate 4 (Operations Lab) →',
    sidebarTitle: 'Metodología de investigación',
    step1: 'Hipótesis guiada por métricas y trazas',
    step2: 'Aislamiento determinista de causa raíz',
    step3: 'Mitigación sin efectos secundarios',
    noSaved: 'Aún no hay resultado guardado para esta investigación.',
  },
  en: {
    stage: 'Step-by-step Investigation',
    notice: 'Spanish technical case study: static root-cause reasoning with explained trade-offs. Does not run Go in the browser.',
    evaluate: 'Evaluate investigation',
    retry: 'Restart',
    previous: 'Saved result',
    expected: 'Recommended decision',
    back: 'Back to module',
    nextGate: 'Next: Gate 4 (Operations Lab) →',
    sidebarTitle: 'Investigation methodology',
    step1: 'Metrics and trace-driven hypothesis',
    step2: 'Deterministic root-cause isolation',
    step3: 'Side-effect-free remediation',
    noSaved: 'No saved result for this investigation yet.',
  },
  ja: {
    stage: '段階的な技術調査',
    notice: 'スペイン語による技術ケーススタディです。ブラウザでGoを実行するものではありません。',
    evaluate: '回答を評価',
    retry: 'やり直す',
    previous: '保存された結果',
    expected: '推奨される判断',
    back: 'モジュールに戻る',
    nextGate: '次へ：Gate 4 (運用ラボ) →',
    sidebarTitle: '調査アプローチ',
    step1: 'メトリクスとトレースに基づく仮説',
    step2: '根本原因の特定',
    step3: '副作用のない緩和策',
    noSaved: '保存された結果はありません。',
  },
  zh: {
    stage: '分步根因调查',
    notice: '西班牙语技术案例：基于静态线索进行根因推理，不在浏览器中运行 Go。',
    evaluate: '评估调查',
    retry: '重新开始',
    previous: '已保存成绩',
    expected: '推荐决策',
    back: '返回模块',
    nextGate: '下一关：Gate 4 (运维故障处置) →',
    sidebarTitle: '技术调查方法论',
    step1: '基于指标与调用链提出假设',
    step2: '确定性定位故障根因',
    step3: '无副作用的生产修复策略',
    noSaved: '尚未保存该调查结果。',
  },
  pt: {
    stage: 'Investigação por etapas',
    notice: 'Estudo de caso em espanhol: raciocínio técnico estático de causa raiz, sem executar Go.',
    evaluate: 'Avaliar investigação',
    retry: 'Reiniciar',
    previous: 'Resultado salvo',
    expected: 'Decisão recomendada',
    back: 'Voltar ao módulo',
    nextGate: 'Próximo: Gate 4 (Operations Lab) →',
    sidebarTitle: 'Metodologia de investigação',
    step1: 'Hipótese orientada por métricas e traces',
    step2: 'Isolamento determinístico da causa raiz',
    step3: 'Remediação sem regressões colaterais',
    noSaved: 'Nenhum resultado salvo ainda.',
  },
  fr: {
    stage: 'Investigation étape par étape',
    notice: 'Cas technique en espagnol : analyse statique des causes profondes, sans exécution Go.',
    evaluate: 'Évaluer l’investigation',
    retry: 'Recommencer',
    previous: 'Résultat enregistré',
    expected: 'Décision recommandée',
    back: 'Retour au module',
    nextGate: 'Suivant : Gate 4 (Operations Lab) →',
    sidebarTitle: 'Méthodologie d’investigation',
    step1: 'Hypothèse guidée par métriques et traces',
    step2: 'Isolation déterministe de la cause racine',
    step3: 'Remédiation sans effets de bord',
    noSaved: 'Aucun résultat enregistré pour le moment.',
  },
};

const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

export function InvestigationLab({ moduleId, locale, save, previous, reportOnly = false }: Props) {
  const lab = investigations.find(v => v.moduleId === moduleId);
  const mod = curriculum.find(m => m.id === moduleId);
  const loc = (locale as Locale) || 'es';
  const labels = localized[loc] || localized.es;
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);
  const [result, setResult] = useState<ReturnType<typeof gradeInvestigation> | null>(null);

  if (!lab) return <p role="alert">Investigation not found</p>;

  if (reportOnly) {
    return (
      <div class="content-page senior-investigation">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="#/senior">Senior Mode</a>
          <span>/</span>
          <a href={`#/senior/${moduleId}`}>{moduleId}</a>
          <span>/</span>
          <b>{labels.stage}</b>
        </nav>
        <div class="page-heading">
          <div class="senior-hub-badges">
            <span class="senior-id-pill">{moduleId}</span>
            <span class="senior-kind-pill">G3 · REPORT</span>
          </div>
          <h1>{mod?.title[loc] ?? lab.title}</h1>
          <p>{lab.title}</p>
        </div>
        <section class="card">
          <h2>{previous ? `${previous.score}% · ${previous.correct}/3` : labels.noSaved}</h2>
          <p class="notice">{labels.notice}</p>
          {previous && lab.steps.map((step, i) => (
            <div class="senior-result-row" key={step.id}>
              <b>{i + 1}. {step.prompt}</b>
              <p class={previous.answers[i] === step.correct ? 'feedback correct' : 'feedback incorrect'}>
                {previous.answers[i] === step.correct ? '✓' : '✗'} {step.options[previous.answers[i]]}
              </p>
              <p><b>{labels.expected}:</b> {step.options[step.correct]}</p>
              <p>{step.explanation}</p>
            </div>
          ))}
          <div class="rubric-actions">
            <a class="btn btn-outline" href={`#/senior/${moduleId}/investigation-lab`}>{labels.retry}</a>
            <a class="text-link" href={`#/senior/${moduleId}/operations-lab`}>{labels.nextGate}</a>
          </div>
        </section>
      </div>
    );
  }

  const evaluate = () => {
    try {
      const r = gradeInvestigation(lab, answers);
      setResult(r);
      save({
        moduleId,
        challengeId: 'investigation-lab',
        version: lab.version,
        correct: r.correct,
        score: r.score,
        answers: [...answers],
        passed: r.passed,
        completedAt: new Date().toISOString(),
      });
    } catch {
      setResult(null);
    }
  };

  return (
    <div class="content-page senior-investigation">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/senior">Senior Mode</a>
        <span>/</span>
        <a href={`#/senior/${moduleId}`}>{moduleId}</a>
        <span>/</span>
        <b>{labels.stage}</b>
      </nav>

      <div class="page-heading">
        <div class="senior-hub-badges">
          <span class="senior-id-pill">{moduleId}</span>
          <span class="senior-kind-pill">G3 · INVESTIGATION LAB</span>
        </div>
        <h1>{mod?.title[loc] ?? lab.title}</h1>
        <p>{lab.brief}</p>
      </div>

      <div class="senior-lab-grid">
        <div class="senior-lab-main">
          <section class="card">
            <h2>{lab.title}</h2>
            <p class="notice">{labels.notice}</p>

            {lab.steps.map((step, i) => (
              <fieldset class="senior-question" disabled={!!result} key={step.id}>
                <legend><b>{i + 1}. {step.prompt}</b></legend>
                <div class="senior-options">
                  {step.options.map((opt, oi) => (
                    <label class={`senior-option ${answers[i] === oi ? 'chosen' : ''}`} key={oi}>
                      <input
                        type="radio"
                        name={step.id}
                        checked={answers[i] === oi}
                        onChange={() => setAnswers(a => a.map((v, j) => (j === i ? oi : v)))}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {result && (
                  <div class={`feedback ${result.details[i].correct ? 'correct' : 'incorrect'}`}>
                    <b>{result.details[i].correct ? '✓' : '✗'} {labels.expected}: {step.options[step.correct]}</b>
                    <p>{step.explanation}</p>
                  </div>
                )}
              </fieldset>
            ))}

            <div class="rubric-actions">
              <button
                type="button"
                class="btn btn-senior"
                disabled={!!result || answers.some(v => v < 0)}
                onClick={evaluate}
              >
                {labels.evaluate}
              </button>
              <button
                type="button"
                class="btn btn-outline"
                onClick={() => {
                  setAnswers([-1, -1, -1]);
                  setResult(null);
                }}
              >
                {labels.retry}
              </button>
              <a class="text-link" href={`#/senior/${moduleId}`}>{labels.back}</a>
            </div>

            {result && (
              <div class="notice" role="status" style={{ marginTop: '16px' }}>
                <strong>{result.score}% · {result.correct}/{result.total}</strong> · {result.verification}
                <div style={{ marginTop: '10px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <a class="text-link" href={`#/senior/${moduleId}/operations-lab`}>{labels.nextGate}</a>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside class="senior-aside">
          <section class="card">
            <img class="gopher" src={asset('gophers/debug.png')} alt="" aria-hidden="true" style={{ maxHeight: '120px', margin: '0 auto 12px' }} />
            <h3>{labels.sidebarTitle}</h3>
            <ul class="rubric-list">
              <li><span>01</span><b>{previous ? `${previous.score}%` : 'G3'}</b></li>
              <li><span>{labels.step1}</span></li>
              <li><span>{labels.step2}</span></li>
              <li><span>{labels.step3}</span></li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
