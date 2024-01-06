var ModeNames = { nouns: 'Nouns', verb: 'Verbs', all: 'Both' };

class ModeObject {
  constructor(spec) {
    this.name = spec.name === undefined ? ModeNames.all : spec.name;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
  }
}

let Modes = [new ModeObject({ name: ModeNames.nouns }), new ModeObject({ name: ModeNames.verb }), new ModeObject({ name: ModeNames.all, isSelected: true })];
