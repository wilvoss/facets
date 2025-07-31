export function GetUniqueWords(_words, _num = 20, _exclude = null) {
  if (_exclude !== null) {
    _words = _words.filter((word) => !_exclude.includes(word.value));
  }

  let shuffledWords = [..._words];
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }

  return shuffledWords.slice(0, _num);
}

export function GetWordIndex(_word) {
  return Nouns.concat(Verbs).findIndex((value) => value === _word);
}

export function GetJustWords(_array) {
  return _array.map((w) => w.value).join(',');
}

export function createWordArray(_array, _index = 0) {
  return _array.map((word, index) => `{"id":${_index + index},"value":"${word}"}`).join(',');
}

export function sortWords(_array) {
  return _array.sort((a, b) => a.value.localeCompare(b.value));
}

export function findDuplicateWords(_array) {
  return _array.filter((item, index) => {
    let _item = JSON.stringify(item);
    return _array.map((e) => JSON.stringify(e)).indexOf(_item) !== index && _array.map((e) => JSON.stringify(e)).lastIndexOf(_item) === index;
  });
}
