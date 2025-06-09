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
