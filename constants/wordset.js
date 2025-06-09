import { WordSetObject } from '../models/WordSetObject.min.js';
import { LanguageObject } from '../models/LanguageObject.min.js';

// // Predefined WordSet instances
export const Nouns = new WordSetObject({ id: '1', name: 'Nouns', data: ['./data/nouns.json?2.2.12'], textureImage: '../images/wallpapers/nouns.jpg', enabled: false });
export const Verbs = new WordSetObject({ id: '2', name: 'Verbs', data: ['./data/verbs.json?2.2.06'], textureImage: '../images/wallpapers/verbs.jpg', enabled: false });
export const Winter = new WordSetObject({ id: '3', name: 'Winter', data: ['./data/winter.json?2.2.06'], enabled: false });
export const Spring = new WordSetObject({ id: '4', name: 'Spring', data: ['./data/spring.json?2.2.06'], enabled: false });
export const Summer = new WordSetObject({ id: '5', name: 'Summer', data: ['./data/summer.json?2.2.06'], enabled: false });
export const Fall = new WordSetObject({ id: '6', name: 'Fall', data: ['./data/fall.json?2.2.06'], enabled: false });
export const Science = new WordSetObject({ id: '7', emoji: '🧪', name: 'Science', data: ['./data/science.json?2.2.06'], textureImage: '../images/wallpapers/science.jpg' });
export const Entertainment = new WordSetObject({ id: '8', emoji: '🍿', name: 'Entertainment', startsWithVowel: true, data: ['./data/entertainment.json?2.2.06'], textureImage: '../images/wallpapers/entertainment.jpg' });
export const CommonEmoji = new WordSetObject({ id: '9', emoji: '✨', noLanguage: true, name: 'Emoji', startsWithVowel: true, data: ['./data/common-emoji.json?2.2.06'], scale: 1.8, wordAlignement: 'start', message: 'Some Emoji might not show on your device.', textureImage: '../images/wallpapers/emoji.jpg' });
export const Cities = new WordSetObject({ id: '10', name: 'Cities', startsWithVowel: true, data: ['./data/cities.json?2.2.06'], enabled: false });
export const Sport = new WordSetObject({ id: '11', name: 'Sport', startsWithVowel: true, data: ['./data/sports.json?2.2.06'], enabled: false });
export const Adjectives = new WordSetObject({ id: '12', name: 'Adjectives', data: ['./data/adjectives.json?2.2.33'], textureImage: '../images/wallpapers/verbs.jpg', enabled: false });
export const Interjections = new WordSetObject({ id: '13', name: 'Interjections', data: ['./data/interjections.json?2.2.33'], textureImage: '../images/wallpapers/verbs.jpg', enabled: false });

export const NounsVerbsAdj = new WordSetObject({ id: '100', emoji: '🍎', name: 'Common', isSelected: true, data: [Nouns.data, Verbs.data, Adjectives.data], textureImage: '../images/wallpapers/common.jpg' });
export const Seasons = new WordSetObject({ id: '101', emoji: '🍁', name: 'Seasons', data: [Winter.data, Spring.data, Summer.data, Fall.data], textureImage: '../images/wallpapers/seasons.jpg' });
export const Civilization = new WordSetObject({ id: '102', emoji: '🌍', name: 'Civilization', data: ['./data/civilization.json?2.2.06'], textureImage: '../images/wallpapers/civilization.jpg' });
export const Archeology = new WordSetObject({ id: '103', emoji: '🦴', name: 'Archeology', startsWithVowel: true, data: ['./data/prehistory.json?2.2.06'], textureImage: '../images/wallpapers/prehistory.jpg', enabled: false });
export const Sports = new WordSetObject({ id: '104', emoji: '🏓', name: 'Sports', data: [Sport.data, Cities.data], textureImage: '../images/wallpapers/sports.jpg' });
export const Kaomoji = new WordSetObject({ id: '105', scale: 0.8, emoji: '(☉_☉)', noLanguage: true, name: 'Kaomoji (¬_¬)', data: ['./data/kaomoji.json?2.2.06'], textureImage: '../images/wallpapers/emoji.jpg' });

export const All = new WordSetObject({
  id: '1000',
  emoji: '🎓',
  name: 'All Words',
  startsWithVowel: true,
  data: [Adjectives.data, Interjections.data, Winter.data, Spring.data, Summer.data, Fall.data, Entertainment.data, Science.data, Civilization.data, Archeology.data, Nouns.data, Verbs.data, Cities.data, Sport.data],
});

export const wordSets = [NounsVerbsAdj, Kaomoji, Winter, Spring, Summer, Fall, Seasons, Entertainment, Science, Civilization, Archeology, CommonEmoji, Sports, All];

// prettier-ignore
export const allLanguages = [
    new LanguageObject({ name: 'English', tag: 'en-us' }),
    new LanguageObject({ name: 'Español', tag: 'es-us' }),
    new LanguageObject({ name: '日本語', tag: 'ja-jp' }),
    new LanguageObject({ name: 'Français', tag: 'fr-fr' }),
    new LanguageObject({ name: '廣東話', tag: 'zh-hk' }),
    new LanguageObject({ name: 'العربية', tag: 'ar-sa' }),
    new LanguageObject({ name: 'Deutsch', tag: 'de-de' })
  ];
