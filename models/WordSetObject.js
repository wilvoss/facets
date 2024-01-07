// var WordSetNames = { nouns: 'Nouns', verb: 'Verbs', all: 'Nouns + Verbs' };

class WordSetObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.name = spec.name === undefined ? WordSetNames.all : spec.name;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.data = spec.data === undefined ? [] : spec.data;
    this.textureImage = spec.textureImage === undefined ? '../images/facets.jpg' : spec.textureImage;
    this.textureHue = spec.textureHue === undefined ? 205 : spec.textureHue;
    this.textureSize = spec.textureSize === undefined ? 'cover' : spec.textureSize;
    this.textureBlendMode = spec.textureBlendMode === undefined ? 'multiply' : spec.textureBlendMode;
    this.enabled = spec.enabled === undefined ? true : spec.enabled;
  }
}

let Nouns = new WordSetObject({ id: '1', name: 'Nouns', data: ['data/nouns.json'] });
let Verbs = new WordSetObject({ id: '2', name: 'Verbs', data: ['data/verbs.json'] });
let Winter = new WordSetObject({ id: '3', name: 'Winter', data: ['data/winter.json'], enabled: false });
let Spring = new WordSetObject({ id: '4', name: 'Spring', data: ['data/spring.json'], enabled: false });
let Summer = new WordSetObject({ id: '5', name: 'Summer', data: ['data/summer.json'], enabled: false });
let Fall = new WordSetObject({ id: '6', name: 'Fall', data: ['data/fall.json'], enabled: false });
let Science = new WordSetObject({ id: '7', name: 'Science', data: ['data/science.json'] });
let Entertainment = new WordSetObject({ id: '8', name: 'Entertainment', data: ['data/entertainment.json'] });
let NounsVerbs = new WordSetObject({ id: '100', name: 'Nouns & Verbs', isSelected: true, data: [Nouns.data, Verbs.data] });
let Seasons = new WordSetObject({ id: '101', name: 'Seasons', data: [Winter.data, Spring.data, Summer.data, Fall.data] });

let WordSets = [NounsVerbs, Nouns, Verbs, Winter, Spring, Summer, Fall, Seasons, Entertainment, Science];
