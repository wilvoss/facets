// var WordSetNames = { nouns: 'Nouns', verb: 'Verbs', all: 'Nouns + Verbs' };

class WordSetObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.emoji = spec.emoji === undefined ? '' : spec.emoji;
    this.name = spec.name === undefined ? '' : spec.name;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.data = spec.data === undefined ? [] : spec.data;
    this.textureImage = spec.textureImage === undefined ? '../images/wallpapers/common.jpg' : spec.textureImage;
    this.textureHue = spec.textureHue === undefined ? 'radial-gradient(circle, hsla(var(--appBackgroundDarkHSL), .8) 0%, hsla(var(--appBackgroundDarkHSL), 1) 100%)' : spec.textureHue;
    this.textureSize = spec.textureSize === undefined ? '512px' : spec.textureSize;
    this.textureBlendMode = spec.textureBlendMode === undefined ? 'normal' : spec.textureBlendMode;
    this.enabled = spec.enabled === undefined ? true : spec.enabled;
    this.startsWithVowel = spec.startsWithVowel === undefined ? false : spec.startsWithVowel;
    this.wordAlignement = spec.wordAlignement === undefined ? 'end' : spec.wordAlignement;
    this.scale = spec.scale === undefined ? 1 : spec.scale;
    this.message = spec.message === undefined ? '' : spec.message;
    this.noLanguage = spec.noLanguage === undefined ? false : spec.noLanguage;
  }
}

let Nouns = new WordSetObject({ id: '1', name: 'Nouns', data: ['./data/nouns.json?2.2.04'], textureImage: '../images/wallpapers/nouns.jpg', enabled: false });
let Verbs = new WordSetObject({ id: '2', name: 'Verbs', data: ['./data/verbs.json?2.2.04'], textureImage: '../images/wallpapers/verbs.jpg', enabled: false });
let Winter = new WordSetObject({ id: '3', name: 'Winter', data: ['./data/winter.json?2.2.04'], enabled: false });
let Spring = new WordSetObject({ id: '4', name: 'Spring', data: ['./data/spring.json?2.2.04'], enabled: false });
let Summer = new WordSetObject({ id: '5', name: 'Summer', data: ['./data/summer.json?2.2.04'], enabled: false });
let Fall = new WordSetObject({ id: '6', name: 'Fall', data: ['./data/fall.json?2.2.04'], enabled: false });
let Science = new WordSetObject({ id: '7', emoji: '🧪', name: 'Science', data: ['./data/science.json?2.2.04'], textureImage: '../images/wallpapers/science.jpg' });
let Entertainment = new WordSetObject({ id: '8', emoji: '🍿', name: 'Entertainment', startsWithVowel: true, data: ['./data/entertainment.json?2.2.04'], textureImage: '../images/wallpapers/entertainment.jpg' });
let CommonEmoji = new WordSetObject({ id: '9', emoji: '✨', noLanguage: true, name: 'Emoji', startsWithVowel: true, data: ['./data/common-emoji.json?2.2.04'], scale: 1.8, wordAlignement: 'start', message: 'Some Emoji might not show on your device.', textureImage: '../images/wallpapers/emoji.jpg' });
let Cities = new WordSetObject({ id: '10', name: 'Cities', startsWithVowel: true, data: ['./data/cities.json?2.2.04'], enabled: false });
let Sport = new WordSetObject({ id: '11', name: 'Sport', startsWithVowel: true, data: ['./data/sports.json?2.2.04'], enabled: false });
let NounsVerbs = new WordSetObject({ id: '100', emoji: '🍎', name: 'Common', isSelected: true, data: [Nouns.data, Verbs.data], textureImage: '../images/wallpapers/common.jpg' });
let Seasons = new WordSetObject({ id: '101', emoji: '🍁', name: 'Seasons', data: [Winter.data, Spring.data, Summer.data, Fall.data], textureImage: '../images/wallpapers/seasons.jpg' });
let Civilization = new WordSetObject({ id: '102', emoji: '🌍', name: 'Civilization', data: ['./data/civilization.json?2.2.04'], textureImage: '../images/wallpapers/civilization.jpg' });
let Archeology = new WordSetObject({ id: '103', emoji: '🦴', name: 'Archeology', startsWithVowel: true, data: ['./data/prehistory.json?2.2.04'], textureImage: '../images/wallpapers/prehistory.jpg', enabled: false });
let Sports = new WordSetObject({ id: '104', emoji: '🏓', name: 'Sports', data: [Sport.data, Cities.data], textureImage: '../images/wallpapers/sports.jpg' });
let Kaomoji = new WordSetObject({ id: '105', scale: 0.8, emoji: '(☉_☉)', noLanguage: true, name: 'Kaomoji (¬_¬)', data: ['./data/kaomoji.json?2.2.04'], textureImage: '../images/wallpapers/emoji.jpg' });
let All = new WordSetObject({ id: '1000', emoji: '🎓', name: 'All Words', startsWithVowel: true, data: [Winter.data, Spring.data, Summer.data, Fall.data, Entertainment.data, Science.data, Civilization.data, Archeology.data, Nouns.data, Verbs.data, Cities.data, Sport.data] });

let WordSets = [NounsVerbs, Kaomoji, Nouns, Verbs, Winter, Spring, Summer, Fall, Seasons, Entertainment, Science, Civilization, Archeology, CommonEmoji, Sports, All];
