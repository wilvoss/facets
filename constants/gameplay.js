import { version } from '/constants/version.js';

export async function loadGameplayModules() {
  const { WordSetObject, WordObject, LanguageObject, CardObject, PlayerObject } = await import(`../models/models.min.js?${version}`);

  // // Predefined WordSet instances
  const Nouns = new WordSetObject({ id: '1', name: 'Nouns', data: ['./data/nouns.json?2.2.12'], textureImage: '../images/wallpapers/nouns.jpg', enabled: false });
  const Verbs = new WordSetObject({ id: '2', name: 'Verbs', data: ['./data/verbs.json?2.2.06'], textureImage: '../images/wallpapers/verbs.jpg', enabled: false });
  const Winter = new WordSetObject({ id: '3', name: 'Winter', data: ['./data/winter.json?2.2.06'], enabled: false });
  const Spring = new WordSetObject({ id: '4', name: 'Spring', data: ['./data/spring.json?2.2.06'], enabled: false });
  const Summer = new WordSetObject({ id: '5', name: 'Summer', data: ['./data/summer.json?2.2.06'], enabled: false });
  const Fall = new WordSetObject({ id: '6', name: 'Fall', data: ['./data/fall.json?2.2.06'], enabled: false });
  const Science = new WordSetObject({ id: '7', emoji: '🧪', name: 'Science', data: ['./data/science.json?2.2.06'], textureImage: '../images/wallpapers/science.jpg' });
  const Entertainment = new WordSetObject({ id: '8', emoji: '🍿', name: 'Entertainment', startsWithVowel: true, data: ['./data/entertainment.json?2.2.06'], textureImage: '../images/wallpapers/entertainment.jpg' });
  const CommonEmoji = new WordSetObject({ id: '9', emoji: '✨', noLanguage: true, name: 'Emoji', startsWithVowel: true, data: ['./data/common-emoji.json?2.2.06'], scale: 1.8, wordAlignement: 'start', message: 'Some Emoji might not show on your device.', textureImage: '../images/wallpapers/emoji.jpg' });
  const Cities = new WordSetObject({ id: '10', name: 'Cities', startsWithVowel: true, data: ['./data/cities.json?2.2.06'], enabled: false });
  const Sport = new WordSetObject({ id: '11', name: 'Sport', startsWithVowel: true, data: ['./data/sports.json?2.2.06'], enabled: false });
  const Adjectives = new WordSetObject({ id: '12', name: 'Adjectives', data: ['./data/adjectives.json?2.2.33'], textureImage: '../images/wallpapers/verbs.jpg', enabled: false });
  const Interjections = new WordSetObject({ id: '13', name: 'Interjections', data: ['./data/interjections.json?2.2.33'], textureImage: '../images/wallpapers/verbs.jpg', enabled: false });
  const NounsVerbsAdj = new WordSetObject({ id: '100', emoji: '🍎', name: 'Common', isSelected: true, data: [Nouns.data, Verbs.data, Adjectives.data], textureImage: '../images/wallpapers/common.jpg' });
  const Seasons = new WordSetObject({ id: '101', emoji: '🍁', name: 'Seasons', data: [Winter.data, Spring.data, Summer.data, Fall.data], textureImage: '../images/wallpapers/seasons.jpg' });
  const Civilization = new WordSetObject({ id: '102', emoji: '🌍', name: 'Civilization', data: ['./data/civilization.json?2.2.06'], textureImage: '../images/wallpapers/civilization.jpg' });
  const Archeology = new WordSetObject({ id: '103', emoji: '🦴', name: 'Archeology', startsWithVowel: true, data: ['./data/prehistory.json?2.2.06'], textureImage: '../images/wallpapers/prehistory.jpg', enabled: false });
  const Sports = new WordSetObject({ id: '104', emoji: '🏓', name: 'Sports', data: [Sport.data, Cities.data], textureImage: '../images/wallpapers/sports.jpg' });
  const Kaomoji = new WordSetObject({ id: '105', scale: 0.8, emoji: '(☉_☉)', noLanguage: true, name: 'Kaomoji (¬_¬)', data: ['./data/kaomoji.json?2.2.06'], textureImage: '../images/wallpapers/emoji.jpg' });

  const All = new WordSetObject({
    id: '1000',
    emoji: '🎓',
    name: 'All Words',
    startsWithVowel: true,
    data: [Adjectives.data, Interjections.data, Winter.data, Spring.data, Summer.data, Fall.data, Entertainment.data, Science.data, Civilization.data, Archeology.data, Nouns.data, Verbs.data, Cities.data, Sport.data],
  });

  const wordSets = [NounsVerbsAdj, Kaomoji, Winter, Spring, Summer, Fall, Seasons, Entertainment, Science, Civilization, Archeology, CommonEmoji, Sports, All];

  // prettier-ignore
  const allLanguages = [
        new LanguageObject({ name: 'English', tag: 'en-us' }),
        new LanguageObject({ name: 'Español', tag: 'es-us' }),
        new LanguageObject({ name: '日本語', tag: 'ja-jp' }),
        new LanguageObject({ name: 'Français', tag: 'fr-fr' }),
        new LanguageObject({ name: '廣東話', tag: 'zh-hk' }),
        new LanguageObject({ name: 'العربية', tag: 'ar-sa' }),
        new LanguageObject({ name: 'Deutsch', tag: 'de-de' })
    ];

  const firstRunGuessingMessages = [
    ['Hey! Your friend created this word association puzzle for you to solve.', 'Hello! Our AI created this word association puzzle for you to solve.'],
    ['The goal is to place 4 cards on the gem to form word-pairs on the outer edge that connect to these clues.'],
    ['Drag cards to any spot on the gem.'],
    ['Tap the corners of any card in the tray to rotate.'],
    ['Keep placing cards. You can tap the big arrows to rotate the entire gem. '],
    ['In order to know if you\'ve solved it, you have to "Send" it back to your friend!', 'Tap "Guess" when you think you have the right cards in the right spots!'],
  ];

  // prettier-ignore
  const firstRunCreatingMessages = [
        ['Right now, you are creating a word association puzzle to challenge your friends.'],
        ['There are four cards on the gem, each with their own four words.'],
        ['To start, type a 1-word clue here that connects the word-pair <i>word1</i> and <i>word2</i>.'],
        ['Tap the large arrows to fill in the other clues.'],
        ['When you\'re ready, tap this to scramble the puzzle and share it with your friends!'],
        ['You\'ll then see what your friends see: the cards on the gem randomly moved to these spots.'],
        ['Your friends will then try to recreate this puzzle based on your clues.'],
    ];

  // prettier-ignore
  const firstRunReviewingMessages = [
        ['Excellent! Your friend sent you a guess for this puzzle that you created.'],
        ['If any card is in the wrong spot, drag it out of the gem into any empty spot.'],
        ['Then, send them a response to let them know how they did.'],
    ];

  // prettier-ignore
  const levelEmoji = [
        ['🤢', '🤮', '🥵'],
        ['🫣', '😱', '😥'],
        ['😢', '🥺', '🫤'],
        ['🤪', '🤭', '😜'],
        ['🔥', '❤️', '🎁', '🏅', '👌', '🌟'],
        ['🛑', '⛔️', '👎']
    ];

  // prettier-ignore
  const levelMessage = [
        [
            'Oh boy, this is just sad.',
            'Yikes - that smarts.',
            'This is how we grow.',
            'This one is challenging!',
            'YOLO',
            'Copium.',
            'Really?',
            'That\'s a whiff!',
            'Where to begin?',
            'The idea is to guess correctly.',
            'There are many ways to fail. You\'ve found a powerful one.'
        ],
        [
            'I guess one right is better than nothing?',
            'It\'s a start!',
            '3 out of 4 wrong isn\'t ideal.',
            'Something\'s amiss.',
            'Could be worse, but not much.',
            'You can do it. I think.',
            'One is the loneliest number.',
            'There are many ways to fail. You\'ve found one.'
        ],
        [
            'You\'re missing a couple!',
            'Half \'n half. MMMMM.',
            '6 one, half-dozen the other.',
            '2 down, 2 to go.',
            'Coulda, woulda, shoulda.',
            'There are many ways to fail, this is just one of them.',
            'Ya basic.'
        ],
        [
            'Not quite!',
            'Soooo close!',
            'You\'ve got this!',
            'You can do it!',
            'Just 1 card off.',
            '75% correct!',
            'I have high hopes!'
        ],
        [
            'You nailed it!',
            'Got it - amazing!',
            'Such a vibe, you solved it!',
            'Daaaaang, that\'s right!',
            'Wow. You\'re neat - well done.',
            'Such synchronicity. It\'s like you know me!',
            'Shazam! Perfect.',
            'Booyah! You locked it in.',
            'Correct!',
            'Time to celebrate!'
        ],
        [
            'Whelp, here\'s the solution.',
            'Let\'s end this.',
            'No more guessing for you.',
            'I was hopeful, then not. Here\'s the final puzzle.'
        ]
    ];

  return {
    Nouns,
    Verbs,
    Winter,
    Spring,
    Summer,
    Fall,
    Science,
    Entertainment,
    CommonEmoji,
    Cities,
    Sport,
    Adjectives,
    Interjections,
    NounsVerbsAdj,
    Seasons,
    Civilization,
    Archeology,
    Sports,
    Kaomoji,
    All,
    wordSets,
    allLanguages,
    firstRunGuessingMessages,
    firstRunCreatingMessages,
    firstRunReviewingMessages,
    levelEmoji,
    levelMessage,
    WordSetObject,
    WordObject,
    LanguageObject,
    CardObject,
    PlayerObject,
  };
}
