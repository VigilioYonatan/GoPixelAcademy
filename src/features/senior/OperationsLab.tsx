import { useState } from 'preact/hooks';
import rawLabs from '../../content/senior/operations-labs.json';
import curriculum from '../../data/curriculum.json';
import { gradeOperations } from './engine/operations.mjs';
import type { OperationsLab as OperationsLabType, OperationsRecord } from './engine/operations.mjs';

const labs = rawLabs as unknown as OperationsLabType[];
type Locale = 'es' | 'en' | 'ja' | 'zh' | 'pt' | 'fr';

type Props = {
  moduleId: string;
  locale: string;
  previous?: OperationsRecord;
  save: (record: OperationsRecord) => void;
  reportOnly?: boolean;
};

const labels: Record<string, {
  title: string;
  evidence: string;
  diagnosis: string;
  action: string;
  submit: string;
  retry: string;
  back: string;
  results: string;
  note: string;
  langNote: string;
  correct: string;
  incorrect: string;
  nextGate: string;
}> = {
  es: {
    title: 'Laboratorio operativo',
    evidence: 'Evidencia del incidente en producción',
    diagnosis: '1. Diagnóstico de causa raíz',
    action: '2. Mitigación operativa segura',
    submit: 'Evaluar hipótesis',
    retry: 'Intentar otra vez',
    back: 'Volver al módulo',
    results: 'Resultado guardado',
    note: 'Análisis estático educativo: no ejecuta código Go ni altera servicios reales.',
    langNote: '',
    correct: 'Correcto',
    incorrect: 'Por revisar',
    nextGate: 'Siguiente: Gate 5 (Code Review) →',
  },
  en: {
    title: 'Operations Lab',
    evidence: 'Production incident telemetry',
    diagnosis: '1. Root-cause diagnosis',
    action: '2. Safe operational mitigation',
    submit: 'Evaluate hypotheses',
    retry: 'Try again',
    back: 'Back to module',
    results: 'Saved result',
    note: 'Static educational reasoning: no Go code or live infrastructure is executed.',
    langNote: 'Incident case details are written in Spanish; UI controls follow your language.',
    correct: 'Correct',
    incorrect: 'Review needed',
    nextGate: 'Next: Gate 5 (Code Review) →',
  },
  ja: {
    title: '運用インシデントラボ',
    evidence: '本番インシデントの証拠ログ',
    diagnosis: '1. 根本原因の診断',
    action: '2. 安全な緩和策',
    submit: '仮説を評価',
    retry: 'もう一度',
    back: 'モジュールに戻る',
    results: '保存された結果',
    note: '静的な教育演習です。Goコードや本番環境は実行しません。',
    langNote: 'インシデント本文はスペイン語です。操作項目は日本語で表示されます。',
    correct: '正解',
    incorrect: '要確認',
    nextGate: '次へ：Gate 5 (コードレビュー) →',
  },
  zh: {
    title: '生产运维实验室',
    evidence: '生产事故遥测与现场日志',
    diagnosis: '1. 故障根因诊断',
    action: '2. 安全止损与缓解措施',
    submit: '评估假设',
    retry: '再试一次',
    back: '返回模块',
    results: '已保存结果',
    note: '静态教学推理：不执行 Go 代码或真实生产服务。',
    langNote: '事故案例正文为西班牙语，控制项已适配当前语言。',
    correct: '正确',
    incorrect: '需要复查',
    nextGate: '下一关：Gate 5 (Go 代码审查) →',
  },
  pt: {
    title: 'Laboratório operacional',
    evidence: 'Evidência do incidente em produção',
    diagnosis: '1. Diagnóstico de causa raiz',
    action: '2. Mitigação operacional segura',
    submit: 'Avaliar hipóteses',
    retry: 'Tentar novamente',
    back: 'Voltar ao módulo',
    results: 'Resultado salvo',
    note: 'Exercício estático: não executa Go nem serviços reais.',
    langNote: 'O texto técnico do incidente está em espanhol; os controles seguem seu idioma.',
    correct: 'Correto',
    incorrect: 'Rever',
    nextGate: 'Próximo: Gate 5 (Code Review) →',
  },
  fr: {
    title: 'Laboratoire opérationnel',
    evidence: 'Preuves télémétriques de l’incident',
    diagnosis: '1. Diagnostic de la cause racine',
    action: '2. Atténuation opérationnelle sûre',
    submit: 'Évaluer les hypothèses',
    retry: 'Réessayer',
    back: 'Retour au module',
    results: 'Résultat enregistré',
    note: 'Exercice statique : aucun code Go ni service de production n’est exécuté.',
    langNote: 'Le cas technique est rédigé en espagnol ; l’interface suit votre langue.',
    correct: 'Correct',
    incorrect: 'À revoir',
    nextGate: 'Suivant : Gate 5 (Code Review) →',
  },
};

const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

export function OperationsLab({ moduleId, locale, previous, save, reportOnly = false }: Props) {
  const lab = labs.find(v => v.moduleId === moduleId);
  const mod = curriculum.find(m => m.id === moduleId);
  const loc = (locale as Locale) || 'es';
  const t = labels[loc] || labels.es;
  const [answers, setAnswers] = useState<number[]>([-1, -1]);
  const [score, setScore] = useState<ReturnType<typeof gradeOperations> | null>(null);

  if (!lab) return <div role="alert">Lab not found</div>;

  const selected = reportOnly ? previous?.answers : answers;
  const evaluation = reportOnly && previous ? gradeOperations(lab, previous.answers) : score;

  const evaluate = () => {
    try {
      const result = gradeOperations(lab, answers);
      setScore(result);
      save({
        moduleId,
        challengeId: 'operations-lab',
        version: lab.version,
        correct: result.correct,
        score: result.score,
        answers: [...answers],
        passed: result.passed,
        completedAt: new Date().toISOString(),
      });
    } catch {
      setScore(null);
    }
  };

  return (
    <div class="content-page senior-operations">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/senior">Senior Mode</a>
        <span>/</span>
        <a href={`#/senior/${moduleId}`}>{moduleId}</a>
        <span>/</span>
        <b>{t.title}</b>
      </nav>

      <div class="page-heading">
        <div class="senior-hub-badges">
          <span class="senior-id-pill">{moduleId}</span>
          <span class="senior-kind-pill">G4 · {lab.kind.toUpperCase()}</span>
        </div>
        <h1>{mod?.title[loc] ?? lab.title}</h1>
        <p>{lab.brief}</p>
      </div>

      <div class="senior-lab-grid">
        <div class="senior-lab-main">
          <section class="card">
            <h2>{t.evidence}</h2>
            <pre class="mini-code">{lab.evidence}</pre>
            <p class="small-disclaimer">
              {t.note}{t.langNote ? ` ${t.langNote}` : ''}
            </p>
          </section>

          <section class="card">
            <h2>{lab.title}</h2>
            {reportOnly && !previous && <p class="notice" role="status">{t.results}: —</p>}

            {([lab.diagnoses, lab.actions] as string[][]).map((options, step) => (
              <fieldset class="senior-question" disabled={reportOnly || !!evaluation} key={step}>
                <legend><b>{step === 0 ? t.diagnosis : t.action}</b></legend>
                <div class="senior-options">
                  {options.map((option, index) => (
                    <label class={`senior-option ${selected?.[step] === index ? 'chosen' : ''}`} key={index}>
                      <input
                        type="radio"
                        name={`${moduleId}-operations-${step}`}
                        checked={selected?.[step] === index}
                        onChange={() => setAnswers(prev => prev.map((v, i) => (i === step ? index : v)))}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {evaluation && (
                  <p class={evaluation.details[step] ? 'feedback correct' : 'feedback incorrect'}>
                    {evaluation.details[step] ? `✓ ${t.correct}` : `✗ ${t.incorrect}`} · {options[step === 0 ? lab.diagnosisCorrect : lab.actionCorrect]}
                  </p>
                )}
              </fieldset>
            ))}

            <div class="rubric-actions">
              {!reportOnly && (
                <button
                  type="button"
                  class="btn btn-senior"
                  disabled={!!score || answers.some(v => v < 0)}
                  onClick={evaluate}
                >
                  {t.submit}
                </button>
              )}
              {!reportOnly && (
                <button
                  type="button"
                  class="btn btn-outline"
                  onClick={() => {
                    setAnswers([-1, -1]);
                    setScore(null);
                  }}
                >
                  {t.retry}
                </button>
              )}
              <a class="text-link" href={`#/senior/${moduleId}`}>{t.back}</a>
            </div>

            {evaluation && (
              <div class="notice" role="status" style={{ marginTop: '16px' }}>
                <strong>{evaluation.score}% · {evaluation.correct}/2</strong>
                <p style={{ margin: '8px 0' }}>{lab.explanation}</p>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  {!reportOnly && (
                    <a href={`#/senior/${moduleId}/operations-lab/result`} class="text-link">{t.results} →</a>
                  )}
                  <a href={`#/senior/${moduleId}/review-lab`} class="text-link">{t.nextGate}</a>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside class="senior-aside">
          <section class="card">
            <img class="gopher" src={asset('gophers/debug.png')} alt="" aria-hidden="true" style={{ maxHeight: '120px', margin: '0 auto 12px' }} />
            <h3>{t.results}</h3>
            <ul class="rubric-list">
              <li>
                <span>Status</span>
                <b class={previous?.passed ? 'done' : ''}>
                  {previous ? `${previous.score}% (${previous.correct}/2)` : '—'}
                </b>
              </li>
            </ul>
            <p class="small-disclaimer" style={{ margin: '12px 0 0' }}>{t.note}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
