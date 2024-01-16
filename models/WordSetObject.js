// var WordSetNames = { nouns: 'Nouns', verb: 'Verbs', all: 'Nouns + Verbs' };

class WordSetObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.name = spec.name === undefined ? '' : spec.name;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.data = spec.data === undefined ? [] : spec.data;
    this.textureImage = spec.textureImage === undefined ? '../images/common-alt2.jpg' : spec.textureImage;
    this.textureHue = spec.textureHue === undefined ? 205 : spec.textureHue;
    this.textureSize = spec.textureSize === undefined ? '512px' : spec.textureSize;
    this.textureBlendMode = spec.textureBlendMode === undefined ? 'normal' : spec.textureBlendMode;
    this.enabled = spec.enabled === undefined ? true : spec.enabled;
  }
}

let Nouns = new WordSetObject({ id: '1', name: 'Nouns', data: ['data/nouns.json'], textureImage: '../images/nouns-alt2.jpg' });
let Verbs = new WordSetObject({ id: '2', name: 'Verbs', data: ['data/verbs.json'], textureImage: '../images/verbs-alt2.jpg' });
let Winter = new WordSetObject({ id: '3', name: 'Winter', data: ['data/winter.json'], enabled: false });
let Spring = new WordSetObject({ id: '4', name: 'Spring', data: ['data/spring.json'], enabled: false });
let Summer = new WordSetObject({ id: '5', name: 'Summer', data: ['data/summer.json'], enabled: false });
let Fall = new WordSetObject({ id: '6', name: 'Fall', data: ['data/fall.json'], enabled: false });
let Science = new WordSetObject({ id: '7', name: 'Science', data: ['data/science.json'], textureImage: '../images/science-alt2.jpg' });
let Entertainment = new WordSetObject({ id: '8', name: 'Entertainment', data: ['data/entertainment.json'], textureImage: '../images/entertainment-alt2.jpg' });
let NounsVerbs = new WordSetObject({ id: '100', name: 'Nouns & Verbs', isSelected: true, data: [Nouns.data, Verbs.data], textureImage: '../images/common-alt2.jpg' });
let Seasons = new WordSetObject({ id: '101', name: 'Seasons', data: [Winter.data, Spring.data, Summer.data, Fall.data], textureImage: '../images/seasons-alt2.jpg' });
let Civilization = new WordSetObject({ id: '102', name: 'Civilization', data: ['../data/civilization.json'], textureImage: '../images/civilization-alt2.jpg' });
let Archeology = new WordSetObject({ id: '103', name: 'Archeology', data: ['../data/prehistory.json'], textureImage: '../images/prehistory-alt2.jpg' });

let WordSets = [NounsVerbs, Nouns, Verbs, Winter, Spring, Summer, Fall, Seasons, Entertainment, Science, Civilization, Archeology];
