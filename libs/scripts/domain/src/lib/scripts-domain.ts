export type ScriptId = 'hy' | 'ru' | 'zh';

export interface ScriptMetadata {
  readonly id: ScriptId;
  readonly name: string;
  readonly nativeLabel: string;
  readonly tagline: string;
}

export const ALL_SCRIPT_METADATA = [
  {
    id: 'hy',
    name: 'Armenian',
    nativeLabel: 'Հայերեն',
    tagline: 'Learn the Armenian alphabet.',
  },
  {
    id: 'ru',
    name: 'Russian',
    nativeLabel: 'Русский',
    tagline: 'Learn the Russian alphabet.',
  },
  {
    id: 'zh',
    name: 'Chinese',
    nativeLabel: '中文',
    tagline: 'Learn core Chinese characters.',
  },
] as const satisfies readonly ScriptMetadata[];

export const KNOWN_SCRIPT_IDS = ALL_SCRIPT_METADATA.map((script) => script.id) as readonly ScriptId[];

export function isKnownScriptId(id: string): id is ScriptId {
  return (KNOWN_SCRIPT_IDS as readonly string[]).includes(id);
}
