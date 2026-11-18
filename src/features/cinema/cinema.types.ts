export type GopherMascot =
  | 'architecture'
  | 'building'
  | 'celebrate'
  | 'coding'
  | 'debug'
  | 'graduate'
  | 'idea'
  | 'question'
  | 'reading'
  | 'senior'
  | 'welcome';

export type AuraTheme = 'gold' | 'ember' | 'cyan' | 'violet';

export type SpeakerRole = 'host' | 'gopher';

export type StageVisual =
  | {
      kind: 'terminal';
      title: string;
      lines: Array<{
        prompt?: string;
        text: string;
        tone?: 'cmd' | 'ok' | 'warn' | 'muted';
      }>;
    }
  | {
      kind: 'stack-heap';
      mode: 'problem' | 'solution';
      stackLabel: string;
      stackItems: Array<{
        name: string;
        value: string;
        state: 'ok' | 'moved' | 'borrow';
      }>;
      heapLabel: string;
      heapItems: Array<{
        addr: string;
        data: string;
        note: string;
        alert?: boolean;
      }>;
    }
  | {
      kind: 'lanes';
      mode: 'deadlock' | 'ordered';
      laneA: { name: string; steps: string[] };
      laneB: { name: string; steps: string[] };
      statusBadge: string;
    }
  | {
      kind: 'code-diff';
      file: string;
      before: string[];
      after: string[];
      callout: string;
    }
  | {
      kind: 'architecture';
      mode: 'incident' | 'mitigated';
      nodes: Array<{
        label: string;
        sub: string;
        state?: 'normal' | 'hot' | 'ok';
      }>;
      metricLabel: string;
      metricBefore: string;
      metricAfter: string;
    };

export interface CinemaScene {
  chapter: string;
  title: string;
  durationSec: number;
  mascot: GopherMascot;
  aura: AuraTheme;
  speaker?: SpeakerRole;
  speech: string;
  visual: StageVisual;
}

export interface StudioAudioMeta {
  src: string;
  totalSec: number;
  cues: number[];
  speakers?: SpeakerRole[];
}

export interface CinemaDeck {
  id: string;
  kicker: string;
  heading: string;
  ctaLabel?: string;
  ctaHref?: string;
  audio?: StudioAudioMeta;
  scenes: CinemaScene[];
}
