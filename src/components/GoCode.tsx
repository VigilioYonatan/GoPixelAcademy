import { useRef } from 'preact/hooks';

type TokenType =
  | 'plain'
  | 'keyword'
  | 'type'
  | 'func'
  | 'pkg'
  | 'string'
  | 'comment'
  | 'number'
  | 'operator'
  | 'punct'
  | 'blank';

type Token = {
  type: TokenType;
  value: string;
};

const GO_KEYWORDS = new Set([
  'package', 'import', 'func', 'return', 'defer', 'go', 'select',
  'interface', 'struct', 'chan', 'map', 'type', 'var', 'const',
  'if', 'else', 'for', 'range', 'switch', 'case', 'default',
  'break', 'continue', 'fallthrough', 'goto',
]);

const GO_TYPES_AND_BUILTINS = new Set([
  'string', 'int', 'int8', 'int16', 'int32', 'int64',
  'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uintptr',
  'float32', 'float64', 'complex64', 'complex128',
  'bool', 'byte', 'rune', 'error', 'any', 'comparable',
  'true', 'false', 'nil', 'iota',
  'Context', 'WaitGroup', 'Mutex', 'RWMutex', 'ServeMux', 'Request', 'ResponseWriter',
]);

const SH_KEYWORDS = new Set([
  'cd', 'go', 'git', 'npm', 'test', 'vet', 'run', 'build', 'clone', 'install',
]);

export function tokenizeGo(source: string, lang: 'go' | 'sh' | 'auto' = 'auto'): Token[] {
  const isShell =
    lang === 'sh' ||
    (lang === 'auto' && /^(?:\s*#|\s*cd\s|\s*go\s+test|\s*git\s+clone)/m.test(source) && !/\bpackage\s+\w+/.test(source));

  const tokens: Token[] = [];
  let i = 0;
  const n = source.length;

  while (i < n) {
    const ch = source[i];
    const next = source[i + 1];

    // Shell # comment
    if (isShell && ch === '#') {
      let end = source.indexOf('\n', i);
      if (end === -1) end = n;
      tokens.push({ type: 'comment', value: source.slice(i, end) });
      i = end;
      continue;
    }

    // Go line comment //
    if (!isShell && ch === '/' && next === '/') {
      let end = source.indexOf('\n', i);
      if (end === -1) end = n;
      tokens.push({ type: 'comment', value: source.slice(i, end) });
      i = end;
      continue;
    }

    // Go block comment /* ... */
    if (!isShell && ch === '/' && next === '*') {
      let end = source.indexOf('*/', i + 2);
      end = end === -1 ? n : end + 2;
      tokens.push({ type: 'comment', value: source.slice(i, end) });
      i = end;
      continue;
    }

    // Placeholder blank ___+
    if (ch === '_' && source.slice(i, i + 3) === '___') {
      let end = i;
      while (end < n && source[end] === '_') end++;
      tokens.push({ type: 'blank', value: source.slice(i, end) });
      i = end;
      continue;
    }

    // Double-quoted or single-quoted string (with blank highlighting inside!)
    if (ch === '"' || ch === '\'') {
      const quote = ch;
      let j = i + 1;
      let segStart = i;
      while (j < n && source[j] !== '\n') {
        if (source[j] === '\\') {
          j += 2;
          continue;
        }
        if (source[j] === '_' && source.slice(j, j + 3) === '___') {
          if (j > segStart) {
            tokens.push({ type: 'string', value: source.slice(segStart, j) });
          }
          let bEnd = j;
          while (bEnd < n && source[bEnd] === '_') bEnd++;
          tokens.push({ type: 'blank', value: source.slice(j, bEnd) });
          j = bEnd;
          segStart = j;
          continue;
        }
        if (source[j] === quote) {
          j++;
          break;
        }
        j++;
      }
      if (j > segStart) {
        tokens.push({ type: 'string', value: source.slice(segStart, j) });
      }
      i = j;
      continue;
    }

    // Raw backtick string `...`
    if (!isShell && ch === '`') {
      let end = source.indexOf('`', i + 1);
      end = end === -1 ? n : end + 1;
      tokens.push({ type: 'string', value: source.slice(i, end) });
      i = end;
      continue;
    }

    // Numbers
    if (/\d/.test(ch) && (i === 0 || !/[A-Za-z0-9_]/.test(source[i - 1]))) {
      let end = i + 1;
      while (end < n && /[0-9a-fA-FxXoObB._]/.test(source[end])) end++;
      tokens.push({ type: 'number', value: source.slice(i, end) });
      i = end;
      continue;
    }

    // Identifiers / Keywords / Types / Functions / Packages
    if (/[A-Za-z_]/.test(ch)) {
      let end = i + 1;
      while (end < n && /[A-Za-z0-9_-]/.test(source[end])) {
        if (!isShell && source[end] === '-') break;
        end++;
      }
      const word = source.slice(i, end);

      if (isShell) {
        if (SH_KEYWORDS.has(word)) {
          tokens.push({ type: 'keyword', value: word });
        } else if (word.startsWith('-')) {
          tokens.push({ type: 'operator', value: word });
        } else {
          tokens.push({ type: 'plain', value: word });
        }
      } else if (GO_KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (GO_TYPES_AND_BUILTINS.has(word)) {
        tokens.push({ type: 'type', value: word });
      } else {
        // Look ahead past spaces for '(' or '.'
        let k = end;
        while (k < n && source[k] === ' ') k++;
        if (source[k] === '(' || source[k] === '[') {
          tokens.push({ type: 'func', value: word });
        } else if (source[end] === '.') {
          tokens.push({ type: 'pkg', value: word });
        } else if (/^[A-Z]/.test(word)) {
          tokens.push({ type: 'type', value: word });
        } else {
          tokens.push({ type: 'plain', value: word });
        }
      }
      i = end;
      continue;
    }

    // Special Go operators :=, <-, ..., ==, !=, <=, >=, &&, ||
    const two = source.slice(i, i + 2);
    if (source.slice(i, i + 3) === '...') {
      tokens.push({ type: 'operator', value: '...' });
      i += 3;
      continue;
    }
    if (two === ':=' || two === '<-' || two === '==' || two === '!=' || two === '<=' || two === '>=' || two === '&&' || two === '||') {
      tokens.push({ type: 'operator', value: two });
      i += 2;
      continue;
    }

    if (isShell && ch === '-' && /[A-Za-z-]/.test(next || '')) {
      let end = i + 1;
      while (end < n && /[A-Za-z0-9=-]/.test(source[end])) end++;
      tokens.push({ type: 'type', value: source.slice(i, end) });
      i = end;
      continue;
    }

    if ('{}()[].,;:'.includes(ch)) {
      tokens.push({ type: 'punct', value: ch });
      i++;
      continue;
    }

    if ('+-*/%&|^!<>=~'.includes(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // Whitespace & anything else
    let end = i + 1;
    while (end < n && (source[end] === ' ' || source[end] === '\t' || source[end] === '\n' || source[end] === '\r')) {
      end++;
    }
    tokens.push({ type: 'plain', value: source.slice(i, end) });
    i = end;
  }

  return tokens;
}

export function renderTokens(code: string, lang: 'go' | 'sh' | 'auto' = 'auto') {
  const tokens = tokenizeGo(code, lang);
  return tokens.map((tok, idx) =>
    tok.type === 'plain' ? (
      tok.value
    ) : (
      <span key={idx} class={`tok-${tok.type}`}>
        {tok.value}
      </span>
    )
  );
}

type GoCodeBlockProps = {
  code: string;
  lang?: 'go' | 'sh' | 'auto';
  className?: string;
  showLineNumbers?: boolean;
};

export function GoCodeBlock({
  code,
  lang = 'auto',
  className = '',
  showLineNumbers = false,
}: GoCodeBlockProps) {
  const normalized = code.replace(/\r\n/g, '\n');
  const lineCount = normalized.split('\n').length;

  return (
    <pre class={`mini-code go-code-block ${showLineNumbers ? 'with-lines' : ''} ${className}`.trim()}>
      {showLineNumbers && (
        <span class="go-line-gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, idx) => (
            <span key={idx}>{idx + 1}</span>
          ))}
        </span>
      )}
      <code class="go-code-content">{renderTokens(normalized, lang)}</code>
    </pre>
  );
}

type GoCodeEditorProps = {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  fontSize?: 'sm' | 'md' | 'lg';
};

export function GoCodeEditor({
  value,
  onChange,
  ariaLabel,
  fontSize = 'md',
}: GoCodeEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const normalized = value.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  const syncScroll = (ta: HTMLTextAreaElement) => {
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget as HTMLTextAreaElement;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = `${ta.value.slice(0, start)}    ${ta.value.slice(end)}`;
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = start + 4;
        ta.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div class={`go-ide-body font-${fontSize}`}>
      <div class="go-ide-gutter" ref={gutterRef} aria-hidden="true">
        {lines.map((_, idx) => (
          <span key={idx}>{idx + 1}</span>
        ))}
      </div>
      <div class="go-ide-stage">
        <pre class={`go-ide-highlight font-${fontSize}`} ref={preRef} aria-hidden="true">
          <code>
            {renderTokens(normalized, 'go')}
            {normalized.endsWith('\n') ? ' ' : ''}
          </code>
        </pre>
        <textarea
          aria-label={ariaLabel}
          spellcheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          class={`code-editor go-ide-textarea font-${fontSize}`}
          value={normalized}
          onScroll={e => syncScroll(e.currentTarget as HTMLTextAreaElement)}
          onKeyDown={handleKeyDown}
          onInput={e => {
            const ta = e.currentTarget as HTMLTextAreaElement;
            onChange(ta.value);
            syncScroll(ta);
          }}
        />
      </div>
    </div>
  );
}
