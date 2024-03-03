class ProgressMessageObject {
  constructor(spec) {
    this.level = spec.level === undefined ? 0 : spec.level;
    this.message = spec.last === undefined ? 'Uh uh.' : spec.message;
  }
}

// prettier-ignore
const LevelEmoji = [
  ['🤢', '🤮', '💩', '👎', '🥵', '😐'],
  ['🫣', '😢', '🫤'],
  ['😱', '🥺', '😥',],
  ['🤪', '🤭', '😜'],
  ['🔥', '😎', '🤯', '🥹', '😁', '🎉', '🥳', '👏', '👍'],
  ['☔️', '😭', '🙁', '😟', '🤨'],
];

// prettier-ignore
const LevelMessage = [
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
        'There are many ways to fail. You\'ve found a powerful one.',
    ],
    [
        'I guess one right is better than nothing?',
        'It\'s a start!',
        '3 out of 4 wrong isn\'t ideal.',
        'Something\s amiss.',
        'Could be worse, but not much.',
        'You can do it. I think.',
        'One is the loneliest number.',
        'There are many ways to fail. You\'ve found one.',
    ],
    [
        'You\'re missing a couple!',
        'Half \'n half. MMMMM.',
        '6 one, half-dozen the other.',
        '2 down, 2 to go.',
        'Coulda, woulda, shoulda.',
        'There are many ways to fail, this is just one of them.',
        'You\'re basic.'
    ],
    [
        'Not quite!',
        'Soooo close!',
        'You\'ve got this!',
        'You can do it!',
        'Just 1 card off.',
        '75% correct!',
        'I have high hopes!',
    ],
    [
        'You nailed it!',
        'Amazing!',
        'Such a vibe!',
        'Daaaaang, that\'s right!',
        'Wow. You\'re neat.',
        'Such synchronicity.',
        'Shazam!',
        'Boyaa!',
        'Words fail to express your genius.',
        'Correct!',
        'Time to celebrate!',
    ],
   [
        'Whelp, here\'s the solution.',
        'Let\'s end this.',
        'No more guessing for you.',
        'I was hopeful, then not.',
    ],
 ]
