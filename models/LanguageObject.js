class LanguageObject {
  constructor(spec) {
    this.name = spec.name === undefined ? '' : spec.name;
    this.tag = spec.tag === undefined ? '' : spec.tag;
    this.enabled = spec.enabled === undefined ? true : spec.enabled;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
  }
}

let AllLanguages = [new LanguageObject({ name: 'English', tag: 'en-us' }), new LanguageObject({ name: 'Español', tag: 'es-us' })];
