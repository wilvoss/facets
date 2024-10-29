class WordObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.value = spec.value === undefined ? '' : spec.value;
  }
}

getUniqueWords = function (_words, _num = 20, _exclude = null) {
  if (_exclude !== null) {
    _words = _words.filter((word) => !_exclude.includes(word.value));
  }

  let shuffledWords = [..._words];
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }

  return shuffledWords.slice(0, _num);
};

getWordIndex = function (_word) {
  return Nouns.concat(Verbs).findIndex((value) => value === _word);
};

getJustWords = function (_array) {
  let wordArray = [];
  _array.forEach((w) => {
    wordArray.push(w.value);
  });

  wordArray = wordArray.join(',');

  return wordArray;
};

createWordArray = function (_array, _index = 0) {
  let index = _index;
  let newArray = '';
  _array.forEach((word) => {
    newArray += '{"id":' + index++ + ',"value":"' + word + '"},';
  });
  return newArray;
};

sortWords = function (_array) {
  _array.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });

  return _array;
};

findDuplicateWords = function (_array) {
  let duplicates = _array.filter((item, index) => {
    let _item = JSON.stringify(item);
    return _array.map((e) => JSON.stringify(e)).indexOf(_item) != index && _array.map((e) => JSON.stringify(e)).lastIndexOf(_item) == index;
  });

  return duplicates;
};
