var WordSetNames = { nouns: 'Nouns', verb: 'Verbs', all: 'Nouns + Verbs' };

class WordSetObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.name = spec.name === undefined ? ModeNames.all : spec.name;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.data = spec.data === undefined ? [] : spec.data;
  }
}

let Nouns = nouns;
let Verbs = verbs;
let AllWords = Nouns.concat(Verbs);

let Modes = [new WordSetObject({ id: "1", name: WordSetNames.nouns, data: ['data/nouns.json'] }), new WordSetObject({ id: "2", name: WordSetNames.verb, data: ['data/vebs.json'] }), new WordSetObject({ id: "3", name: WordSetNames.all, isSelected: true })];
