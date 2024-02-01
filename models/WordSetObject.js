// var WordSetNames = { nouns: 'Nouns', verb: 'Verbs', all: 'Nouns + Verbs' };

class WordSetObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.name = spec.name === undefined ? '' : spec.name;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.data = spec.data === undefined ? [] : spec.data;
    this.textureImage = spec.textureImage === undefined ? '../images/wallpapers/common.jpg' : spec.textureImage;
    this.textureHue = spec.textureHue === undefined ? 205 : spec.textureHue;
    this.textureSize = spec.textureSize === undefined ? '512px' : spec.textureSize;
    this.textureBlendMode = spec.textureBlendMode === undefined ? 'normal' : spec.textureBlendMode;
    this.enabled = spec.enabled === undefined ? true : spec.enabled;
    this.startsWithVowel = spec.startsWithVowel === undefined ? false : spec.startsWithVowel;
    this.wordAlignement = spec.wordAlignement === undefined ? 'end' : spec.wordAlignement;
    this.scale = spec.scale === undefined ? 1 : spec.scale;
    this.message = spec.message === undefined ? '' : spec.message;
  }
}

let Nouns = new WordSetObject({ id: '1', name: 'Nouns', data: ['./data/nouns.json'], textureImage: '../images/wallpapers/nouns.jpg' });
let Verbs = new WordSetObject({ id: '2', name: 'Verbs', data: ['./data/verbs.json'], textureImage: '../images/wallpapers/verbs.jpg' });
let Winter = new WordSetObject({ id: '3', name: 'Winter', data: ['./data/winter.json'], enabled: false });
let Spring = new WordSetObject({ id: '4', name: 'Spring', data: ['./data/spring.json'], enabled: false });
let Summer = new WordSetObject({ id: '5', name: 'Summer', data: ['./data/summer.json'], enabled: false });
let Fall = new WordSetObject({ id: '6', name: 'Fall', data: ['./data/fall.json'], enabled: false });
let Science = new WordSetObject({ id: '7', name: 'Science', data: ['./data/science.json'], textureImage: '../images/wallpapers/wallpapers/science.jpg' });
let Entertainment = new WordSetObject({ id: '8', name: 'Entertainment', startsWithVowel: true, data: ['./data/entertainment.json'], textureImage: '../images/wallpapers/entertainment.jpg' });
let CommonEmoji = new WordSetObject({ id: '9', name: 'Emoji (beta)', startsWithVowel: true, data: ['./data/common-emoji.json'], scale: 1.9, wordAlignement: 'start', message: 'Some Emoji might not show on your device.', textureImage: '../images/wallpapers/emoji.jpg'  });
let NounsVerbs = new WordSetObject({ id: '100', name: 'Nouns & Verbs', isSelected: true, data: [Nouns.data, Verbs.data], textureImage: '../images/wallpapers/common.jpg' });
let Seasons = new WordSetObject({ id: '101', name: 'Seasons', data: [Winter.data, Spring.data, Summer.data, Fall.data], textureImage: '../images/wallpapers/wallpapers/seasons.jpg' });
let Civilization = new WordSetObject({ id: '102', name: 'Civilization', data: ['./data/civilization.json'], textureImage: '../images/wallpapers/civilization.jpg' });
let Archeology = new WordSetObject({ id: '103', name: 'Archeology', startsWithVowel: true, data: ['./data/prehistory.json'], textureImage: '../images/wallpapers/prehistory.jpg' });

let WordSets = [NounsVerbs, Nouns, Verbs, Winter, Spring, Summer, Fall, Seasons, Entertainment, Science, Civilization, Archeology, CommonEmoji];
