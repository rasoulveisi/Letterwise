import { ALL_SCRIPT_METADATA, isKnownScriptId, KNOWN_SCRIPT_IDS } from './scripts-domain';

describe('scripts metadata', () => {
  it('exposes the known script ids', () => {
    expect(KNOWN_SCRIPT_IDS).toEqual(['hy', 'ru', 'zh']);
    expect(isKnownScriptId('hy')).toBe(true);
    expect(isKnownScriptId('unknown')).toBe(false);
  });

  it('keeps display metadata without teaching content', () => {
    expect(ALL_SCRIPT_METADATA[0]).toEqual({
      id: 'hy',
      name: 'Armenian',
      nativeLabel: 'Հայերեն',
      tagline: 'Learn the Armenian alphabet.',
    });
  });
});
