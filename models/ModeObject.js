var ModeNames = { nouns: 'Nouns', verb: 'Verbs', all: 'All' };

class ModeObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.name = spec.name === undefined ? ModeNames.all : spec.name;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
  }
}

let Modes = [new ModeObject({ name: ModeNames.nouns, isSelected: true }), new ModeObject({ name: ModeNames.verb }), new ModeObject({ name: ModeNames.all })];
