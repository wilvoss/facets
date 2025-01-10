class LanguageObject {
  constructor(spec) {
    this.name = spec.name === undefined ? '' : spec.name;
    this.tag = spec.tag === undefined ? '' : spec.tag;
    this.enabled = spec.enabled === undefined ? true : spec.enabled;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
  }
}
// prettier-ignore
let AllLanguages = [
  new LanguageObject({ name: 'English', tag: 'en-us' }),
  new LanguageObject({ name: 'Español', tag: 'es-us' }),
  new LanguageObject({ name: '日本語', tag: 'ja-jp' }),
  new LanguageObject({ name: 'Français', tag: 'fr-fr' }),
  new LanguageObject({ name: '廣東話', tag: 'zh-hk' }),
  new LanguageObject({ name: 'العربية', tag: 'ar-sa' }),
  new LanguageObject({ name: 'Deutsch', tag: 'de-de' })
];
