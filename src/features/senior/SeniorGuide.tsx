import { useState } from 'preact/hooks';
import guides from '../../content/senior/guides.json';
import curriculum from '../../data/curriculum.json';
import { GoCodeBlock } from '../../components/GoCode';

type Locale = 'es' | 'en' | 'ja' | 'zh' | 'pt' | 'fr';

const i18n: Record<Locale, {
  home: string;
  heading: string;
  intro: string;
  source: string;
  tests: string;
  run: string;
  disclaimer: string;
  fallback: string;
  practice: string;
  copyCode: string;
  copied: string;
}> = {
  es: {
    home: 'Volver al módulo',
    heading: 'Guía de ingeniería Senior',
    intro: 'Lectura técnica, invariantes, código Go de referencia y pruebas oficiales sincronizadas con labs-native.',
    source: 'Implementación de referencia',
    tests: 'Pruebas de referencia',
    run: 'Comando de ejecución local',
    disclaimer: 'Se necesita Go 1.23+ instalado en tu equipo. La web no compila ni ejecuta este código.',
    fallback: '',
    practice: 'Ir al laboratorio descargable',
    copyCode: 'Copiar',
    copied: '✓ Copiado',
  },
  en: {
    home: 'Back to module',
    heading: 'Senior engineering guide',
    intro: 'Technical reading, invariants, reference Go source and automated tests synced with labs-native.',
    source: 'Reference implementation',
    tests: 'Reference tests',
    run: 'Local execution command',
    disclaimer: 'Requires Go 1.23+ installed locally. This website does not compile or execute this code.',
    fallback: 'The technical lesson is available in Spanish. Interface labels are translated.',
    practice: 'Get the downloadable lab',
    copyCode: 'Copy',
    copied: '✓ Copied',
  },
  ja: {
    home: 'モジュールに戻る',
    heading: 'Senior 技術ガイド',
    intro: '技術解説、設計上の不変条件、参考コード、実際のテスト。',
    source: '参考実装',
    tests: '参考テスト',
    run: 'ローカル実行',
    disclaimer: 'PC に Go 1.23+ が必要です。この Web サイトでは実行されません。',
    fallback: '本文はスペイン語です。画面ラベルは日本語です。',
    practice: 'ラボをダウンロード',
    copyCode: 'コピー',
    copied: '✓ コピー完了',
  },
  zh: {
    home: '返回模块',
    heading: 'Senior 工程指南',
    intro: '深度技术讲解、设计不变量、参考 Go 源码与真实单元测试。',
    source: '参考实现',
    tests: '参考测试',
    run: '本地执行命令',
    disclaimer: '需要在本机安装 Go 1.23+。本网站不执行此代码。',
    fallback: '技术正文为西班牙语，界面标签已翻译。',
    practice: '下载实验室',
    copyCode: '复制',
    copied: '✓ 已复制',
  },
  pt: {
    home: 'Voltar ao módulo',
    heading: 'Guia de engenharia Senior',
    intro: 'Leitura técnica, invariantes, código Go de referência e testes sincronizados com labs-native.',
    source: 'Implementação de referência',
    tests: 'Testes de referência',
    run: 'Comando local',
    disclaimer: 'Requer Go 1.23+ instalado no computador. O site não executa este código.',
    fallback: 'O conteúdo técnico está em espanhol; os rótulos da interface estão traduzidos.',
    practice: 'Baixar laboratório',
    copyCode: 'Copiar',
    copied: '✓ Copiado',
  },
  fr: {
    home: 'Retour au module',
    heading: 'Guide d’ingénierie Senior',
    intro: 'Lecture technique, invariants, code Go de référence et tests réels synchronisés avec labs-native.',
    source: 'Implémentation de référence',
    tests: 'Tests de référence',
    run: 'Commande locale',
    disclaimer: 'Go 1.23+ doit être installé sur votre ordinateur. Le site n’exécute pas ce code.',
    fallback: 'Le texte technique est en espagnol ; les libellés sont traduits.',
    practice: 'Télécharger le laboratoire',
    copyCode: 'Copier',
    copied: '✓ Copié',
  },
};

export function SeniorGuide({ moduleId, locale }: { moduleId: string; locale: Locale }) {
  const guide = guides.find(g => g.id === moduleId);
  const copy = i18n[locale] ?? i18n.es;
  const [copiedKey, setCopiedKey] = useState<'cmd' | 'src' | 'test' | null>(null);

  if (!guide) {
    return (
      <section class="content-page">
        <h1>404 · Guide not found</h1>
        <a href="#/senior">Senior Mode</a>
      </section>
    );
  }

  const module = curriculum.find(m => m.id === moduleId);
  const copyText = (key: 'cmd' | 'src' | 'test', text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <main class="content-page senior-guide" aria-labelledby="guide-heading">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/senior">Senior Mode</a>
        <span>/</span>
        <a href={`#/senior/${moduleId}`}>{moduleId}</a>
        <span>/</span>
        <b>{copy.heading}</b>
      </nav>

      <div class="page-heading">
        <div class="senior-hub-badges">
          <span class="senior-id-pill">{moduleId}</span>
          <span class="senior-kind-pill">GO ENGINEERING GUIDE</span>
        </div>
        <h1 id="guide-heading">{module?.title[locale] ?? guide.title}</h1>
        <p>{copy.intro}</p>
      </div>

      {copy.fallback && (
        <p class="notice" role="note" lang={locale}>{copy.fallback}</p>
      )}

      <div class="senior-guide-grid">
        <article class="card senior-guide-prose" lang="es">
          <h2>{guide.title}</h2>
          {guide.sections.map((s, i) => (
            <section key={i}>
              <h3>{i + 1}. {s.title}</h3>
              <p>{s.body}</p>
            </section>
          ))}
        </article>

        <aside class="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>{copy.run}</h3>
            <button
              type="button"
              class="btn btn-outline"
              style={{ minHeight: '32px', padding: '4px 10px', fontSize: '11px' }}
              onClick={() => copyText('cmd', guide.command)}
            >
              {copiedKey === 'cmd' ? copy.copied : copy.copyCode}
            </button>
          </div>
          <GoCodeBlock code={guide.command} lang="sh" />
          <p class="small-disclaimer">{copy.disclaimer}</p>
          <a class="btn btn-senior-solid" href={`#/senior/${moduleId}/native`} style={{ width: '100%', marginTop: '12px' }}>
            {copy.practice} →
          </a>
        </aside>
      </div>

      <details class="card senior-guide-code" open>
        <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>{copy.source}</strong> · <code>solution.go</code></span>
          <button
            type="button"
            class="btn btn-outline"
            style={{ minHeight: '32px', padding: '4px 10px', fontSize: '11px' }}
            onClick={e => {
              e.preventDefault();
              copyText('src', guide.referenceSource);
            }}
          >
            {copiedKey === 'src' ? copy.copied : copy.copyCode}
          </button>
        </summary>
        <GoCodeBlock code={guide.referenceSource} lang="go" showLineNumbers />
      </details>

      <details class="card senior-guide-code">
        <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>{copy.tests}</strong> · <code>solution_test.go</code></span>
          <button
            type="button"
            class="btn btn-outline"
            style={{ minHeight: '32px', padding: '4px 10px', fontSize: '11px' }}
            onClick={e => {
              e.preventDefault();
              copyText('test', guide.referenceTest);
            }}
          >
            {copiedKey === 'test' ? copy.copied : copy.copyCode}
          </button>
        </summary>
        <GoCodeBlock code={guide.referenceTest} lang="go" showLineNumbers />
      </details>
    </main>
  );
}
