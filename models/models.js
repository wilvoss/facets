let index = 0;

export class CardObject {
  constructor(spec = {}) {
    this.id = index++;
    this.words = spec.words ?? [];
    this.position = spec.position ?? '';
    this.rotation = spec.rotation ?? 0;
    this.isSelected = spec.isSelected ?? false;
    this.isInTray = spec.isInTray ?? false;
    this.isExtra = spec.isExtra ?? false;
    this.isRotating = spec.isRotating ?? false;
    this.wrongGuesses = spec.wrongGuesses ?? { s0: [], s1: [], s2: [], s3: [] };
    this.justDropped = spec.justDropped ?? false;
  }
}

export class LanguageObject {
  constructor(spec = {}) {
    this.name = spec.name ?? '';
    this.tag = spec.tag ?? '';
    this.enabled = spec.enabled ?? true;
    this.isSelected = spec.isSelected ?? false;
  }
}

export class PlayerObject {
  constructor(spec = {}) {
    this.id = spec.id ?? -1;
    this.cards = spec.cards ?? [];
    this.name = spec.name ?? 'Player';
    this.role = spec.role ?? 'creator';
    this.playerPosition = spec.playerPosition ?? 0;
  }
}

export function WordObject(spec = {}) {
  return {
    id: spec.id ?? -1,
    value: spec.value ?? '',
  };
}

export class WordSetObject {
  constructor(spec = {}) {
    this.id = spec.id ?? -1;
    this.emoji = spec.emoji ?? '';
    this.name = spec.name ?? '';
    this.isSelected = spec.isSelected ?? false;
    this.data = spec.data ?? [];
    this.textureImage = spec.textureImage ?? '../images/wallpapers/common.jpg';
    this.textureHue = spec.textureHue ?? 'radial-gradient(circle, hsla(var(--appBackgroundDarkHSL), .8) 0%, hsla(var(--appBackgroundDarkHSL), 1) 100%)';
    this.textureSize = spec.textureSize ?? '512px';
    this.textureBlendMode = spec.textureBlendMode ?? 'normal';
    this.enabled = spec.enabled ?? true;
    this.startsWithVowel = spec.startsWithVowel ?? false;
    this.wordAlignement = spec.wordAlignement ?? 'end';
    this.scale = spec.scale ?? 1;
    this.message = spec.message ?? '';
    this.noLanguage = spec.noLanguage ?? false;
  }
}
