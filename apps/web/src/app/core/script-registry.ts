import { isKnownScriptId } from '@letterwise/scripts/domain';
import type { ScriptDefinition } from './script-types';
import { HY_SCRIPT } from './scripts/hy.script';
import { RU_SCRIPT } from './scripts/ru.script';
import { ZH_SCRIPT } from './scripts/zh.script';

export const ALL_SCRIPTS: readonly ScriptDefinition[] = [HY_SCRIPT, RU_SCRIPT, ZH_SCRIPT];

export function getScriptDefinition(id: string): ScriptDefinition | undefined {
  return ALL_SCRIPTS.find((s) => s.id === id);
}

export { isKnownScriptId };
