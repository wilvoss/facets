/// <reference path="../models/WordObject.js" />
/// <reference path="../models/CardObject.js" />

// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = ['app'];

var app = new Vue({
  el: '#app',
  data: {
    version: '0.1.146',
    newVersionAvailable: false,
    gameName: 'Facets',
    currentGameID: 0,
    currentGameSol: '',
    currentGuessCount: 0,
    isFinal: false,
    guessingGameSol: [],
    gameCatchphrase: 'A game of words!',
    wordSets: [...WordSets],
    guessingCardCount: 4,
    tempName: '',
    tempID: 0,
    editID: false,
    useWordSetThemes: false,
    autoCheck: true,
    useMultiColoredGems: true,
    tempUseMultiColoredGems: true,
    tempAutoCheck: true,
    usePortraitLayout: false,
    useExtraCard: false,
    tempUseWordSetThemes: false,
    tempWordSetName: '',
    tempUsePortraitLayout: false,
    tempUseExtraCard: false,
    guessingWithExtraCard: false,
    gameWordSet: WordSets.find((m) => m.id === '100'),
    tempWordSets: [],
    guessersName: '',
    guessingWordSet: WordSets.find((m) => m.id === '100'),
    showArticle: false,
    showSettings: false,
    showIntro: false,
    showTutorial: false,
    confirmation: { message: 'Did they have the right answer?', target: 'correct' },
    showConfirmation: false,
    showTutorial: false,
    changeNameTitle: "What's your name?",
    emptyCard: new CardObject({ id: 'ghost' }),
    draggedCard: new CardObject({}),
    ghostX: 0,
    ghostY: 0,
    ghostOffsetX: 0,
    ghostOffsetY: 0,
    shareURL: '',
    targetCard: null,
    year: new Date().getFullYear(),
    actualCards: [],
    cards: [],
    parkedCards: [],
    hints: [],
    parkingInputValue: '',
    player: new PlayerObject({}),
    puzzlePlayer: new PlayerObject({}),
    sendingPlayer: new PlayerObject({}),
    shareText: 'Send',
    puzzleJustSent: false,
    isGuessing: false,
    trayRotation: 0,
    trayIsRotating: false,
    longTransition: 0,
    shortTransition: 0,
    showModal: false,
    modalContainer: null,
    message: '',
    trayRotationTimeout: null,
    cardRotationTimeout: null,
    isDragging: false,
    documentCssRoot: document.querySelector(':root'),
  },

  methods: {
    ToggleShowModal(e) {
      e.preventDefault();
      e.stopPropagation();
      this.showModal = !this.showModal;
    },

    ToggleShowTutorial(e) {
      note('ToggleShowTutorial() called');
      if (e != null) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.showTutorial = !this.showTutorial;
    },

    ToggleTempUseWordSetThemes() {
      note('ToggleTempUseWordSetThemes() called');
      this.tempUseWordSetThemes = !this.tempUseWordSetThemes;
    },

    ToggleTempUsePortraitLayout() {
      note('ToggleTempUsePortraitLayout() called');
      this.tempUsePortraitLayout = !this.tempUsePortraitLayout;
    },

    ToggleTempUseMultiColoredGems() {
      note('ToggleTempUsePortraitLayout() called');
      this.tempUseMultiColoredGems = !this.tempUseMultiColoredGems;
    },

    ToggleTempUseExtraCard() {
      note('ToggleTempUseExtraCard() called');
      this.tempUseExtraCard = !this.tempUseExtraCard;
    },

    ToggleAutoCheck() {
      note('ToggleAutoCheck() called');
      this.tempAutoCheck = !this.tempAutoCheck;
    },

    SetWordSetTheme(_wordset) {
      note('SetWordSetTheme() called');
      if (this.useWordSetThemes) {
        this.documentCssRoot.style.setProperty('--texture2', 'url(' + _wordset.textureImage + ')');
        this.documentCssRoot.style.setProperty('--textureSize', _wordset.textureSize);
        this.documentCssRoot.style.setProperty('--textureBlendMode', _wordset.textureBlendMode);
        this.documentCssRoot.style.setProperty('--hueTheme', _wordset.textureHue);
      } else {
        this.documentCssRoot.style.setProperty('--texture2', 'radial-gradient(circle, hsla(var(--appBackgroundDarkestHSL), .3) 0%, hsla(var(--appBackgroundDarkestHSL), 0) 40%, hsla(var(--appBackgroundDarkestHSL), 1) 80%)');
        this.documentCssRoot.style.setProperty('--textureSize', 'cover');
        this.documentCssRoot.style.setProperty('--textureBlendMode', 'normal');
        this.documentCssRoot.style.setProperty('--hueTheme', '205');
      }
    },

    HandleSubmitButtonPress() {
      note('HandleSubmitButtonPress() called');
      if (this.player.role === 'reviewer' && this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
        this.showModal = true;
        this.confirmation = { message: 'Did they have the right answer?', target: 'correct' };
        this.showConfirmation = true;
      } else if (this.isGuessing) {
        if (this.autoCheck && this.player.role !== 'reviewer' && this.isGuessing && this.player.id !== this.puzzlePlayer.id) {
          this.IsCurrentGuessCorrect();
        } else {
          this.ShareBoard();
        }
      } else {
        this.FillParkingLot();
      }
    },

    IsCurrentGuessCorrect() {
      note('IsCurrentGuessCorrect() called');
      if (this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
        this.currentGuessCount++;
        let hintValues = [];
        this.hints.forEach((hint) => {
          hintValues.push(hint.value);
        });
        let actualSol = this.currentGameSol.split('-');
        let currentSol = this.GetCurrentSolutionParamString().split('-');

        let mappedSol = [];

        for (let i = 0; i < actualSol.length; i += 3) {
          for (let j = 0; j < currentSol.length; j += 3) {
            if (actualSol[i] === currentSol[j]) {
              mappedSol.push(currentSol[j], currentSol[j + 1], currentSol[j + 2]);
              break;
            }
          }
        }
        this.guessingGameSol = mappedSol.join('-');

        if (this.currentGameSol === this.guessingGameSol) {
          this.RotateTray(8);
          // this.message = 'You have solved the puzzle!';
          // return true;
        }
        // {
        // insert code to identify incorrect cards and remove from the board.
        if (mappedSol[1] !== actualSol[1]) {
          // find and remove the card with mappedSol[1]
          let card = this.cards.find((card) => card.words.some((word) => word.id === parseInt(mappedSol[1])));
          this.SwapCards(card, this.getFirstAvailableParkingSpot);
        }
        if (mappedSol[2] !== actualSol[2]) {
          let card = this.cards.find((card) => card.words.some((word) => word.id === parseInt(mappedSol[2])));
          this.SwapCards(card, this.getFirstAvailableParkingSpot);
        }
        if (mappedSol[10] !== actualSol[10]) {
          let card = this.cards.find((card) => card.words.some((word) => word.id === parseInt(mappedSol[10])));
          this.SwapCards(card, this.getFirstAvailableParkingSpot);
        }
        if (mappedSol[11] !== actualSol[11]) {
          let card = this.cards.find((card) => card.words.some((word) => word.id === parseInt(mappedSol[11])));
          this.SwapCards(card, this.getFirstAvailableParkingSpot);
        }
        this.message = this.GetMessageBasedOnTrayCount(true, this.player.name, false);
        return false;
        // }
      }
    },

    HandleNewGameClick() {
      note('HandleNewGameClick() called');
      if (this.isGuessing && this.player.role !== 'reviewer' && this.puzzlePlayer.id !== this.player.id) {
        this.showModal = true;
        this.confirmation = { message: 'Are you sure you want <br/>to create a new game?', target: 'newgame' };
        this.showConfirmation = true;
      } else {
        this.NewGame();
      }
    },

    async FillParkingLot() {
      note('FillParkingLot() called');
      this.puzzlePlayer.id = this.player.id;
      this.isGuessing = true;
      let temp = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
      let index = 0;
      this.currentGameSol = this.GetCurrentSolutionParamString();
      this.cards.concat(this.parkedCards).forEach((card) => {
        card.id = this.player.value + index++;
        card.rotation = (getRandomInt(0, 1) === 1 ? 1 : -1) * getRandomInt(0, 4);
      });

      this.ResetCardsAfterRotation(false);

      this.parkedCards = this.cards;
      let allUsedWords = [];
      this.cards.forEach((card) => {
        card.words.forEach((word) => {
          allUsedWords.push(word);
        });
      });
      let wordset = await this.getCurrentGameWordSet;

      if (this.guessingCardCount === 5) {
        this.parkedCards.push(new CardObject({ words: getUniqueWords(wordset, 4, getJustWords(allUsedWords)) }));
      }

      for (let i = this.parkedCards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [this.parkedCards[i], this.parkedCards[j]] = [this.parkedCards[j], this.parkedCards[i]];
      }
      if (this.guessingCardCount === 4) {
        this.parkedCards.push(new CardObject({}));
      }
      this.parkedCards.push(new CardObject({}));

      this.cards = temp;
      this.ShareBoard();
    },

    async RestoreGame(_boardArray) {
      note('RestoreGame() called');
      var urlParams = new URLSearchParams(window.location.search);

      this.sendingPlayer.name = urlParams.has('sendingName') ? urlParams.get('sendingName') : this.sendingPlayer.name;
      this.guessersName = this.sendingPlayer.name;
      this.puzzlePlayer.name = urlParams.has('puzzleName') ? urlParams.get('puzzleName') : this.puzzlePlayer.name;
      this.sendingPlayer.id = urlParams.has('sendingID') ? parseInt(urlParams.get('sendingID')) : this.sendingPlayer.id;
      this.puzzlePlayer.id = urlParams.has('puzzleID') ? parseInt(urlParams.get('puzzleID')) : this.puzzlePlayer.id;
      this.guessingWordSet = urlParams.has('wordSetID') ? this.wordSets.find((s) => s.id === urlParams.get('wordSetID')) : this.gameWordSet;
      this.guessingCardCount = urlParams.has('useExtraCard') && JSON.parse(urlParams.get('useExtraCard')) ? 5 : 4;

      let corruptData = false;
      if (_boardArray.length >= 40) {
        this.shareURL = window.location.href;
        this.puzzleJustSent = false;
        let allWords = await this.getGuessingGameWordSet;

        this.cards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
        this.parkedCards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
        this.hints = [new WordObject({}), new WordObject({}), new WordObject({}), new WordObject({})];
        let index = 0;

        this.cards.forEach((card) => {
          for (let x = 0; x < 4; x++) {
            if (_boardArray[index] !== '') {
              let word = allWords.find((_word) => _word.id === parseInt(_boardArray[index]));
              if (word === undefined) {
                corruptData = true;
              }
              card.words.push(word);
            }
            index++;
          }
        });
        this.parkedCards.forEach((card) => {
          for (let x = 0; x < 4; x++) {
            if (_boardArray[index] !== '') {
              let word = allWords.find((_word) => _word.id === parseInt(_boardArray[index]));
              if (word === undefined) {
                corruptData = true;
              }
              card.words.push(word);
            }
            index++;
          }
        });
        this.hints.forEach((hint) => {
          hint.value = _boardArray[index++];
        });

        if (urlParams.has('sol')) {
          this.currentGameSol = urlParams.get('sol');
          if (urlParams.has('final')) {
            this.guessingGameSol = this.currentGameSol;
            this.message = this.player.name + ", here's the solution.";
            this.isFinal = true;
          }
        } else {
          this.currentGameSol = [];
        }

        this.SetWordSetTheme(this.guessingWordSet);
        this.player.role = this.puzzlePlayer.id === this.player.id && this.player.id !== this.sendingPlayer.id ? 'reviewer' : 'guesser';
      }
      this.isGuessing = true;
      if (corruptData) {
        announce('the data was corrupt');
        this.NewGame(null, '😕 - Something went wrong.');
      }
    },

    ConstructURLForCurrentGame(_isFinal) {
      note('ConstructURLForCurrentGame() called');
      if (this.isGuessing) {
        this.guessingGameSol = '';
        let urlString = '';
        this.cards.concat(this.parkedCards).forEach((card) => {
          if (card.words.length === 0) {
            urlString += '----';
          }
          card.words.forEach((word) => {
            urlString += word.id + '-';
          });
        });

        this.hints.forEach((hint, index) => {
          urlString += hint.value + (index === this.hints.length - 1 ? '' : '-');
        });

        urlString = encodeURIComponent(urlString);
        urlString += '&sendingName=' + encodeURIComponent(this.player.name);
        urlString += '&sendingID=' + encodeURIComponent(this.player.id);
        urlString += '&puzzleName=' + encodeURIComponent(this.puzzlePlayer.name);
        urlString += '&puzzleID=' + encodeURIComponent(this.puzzlePlayer.id);
        urlString += '&wordSetID=' + encodeURIComponent(this.guessingWordSet.id);
        urlString += '&useExtraCard=' + encodeURIComponent(this.guessingCardCount === 5);
        urlString += '&sol=' + encodeURIComponent(this.currentGameSol);
        if (_isFinal) {
          urlString += '&final=true';
        }
        urlString = window.location.origin + window.location.pathname + '?board=' + urlString + '&deletableCharacters=these';
        this.shareURL = urlString;
        history.pushState(null, null, this.shareURL);
      }
    },

    HandleYesNo(_target, _value) {
      switch (_target) {
        case 'correct':
          this.ShareBoard(_value);
          break;
        case 'newgame':
          if (_value) {
            this.NewGame(null);
          }
          break;
        default:
          break;
      }
      this.showConfirmation = false;
      this.showModal = false;
    },

    GetMessageBasedOnTrayCount(_gotIt, _name, _useName = true) {
      note('GetMessageBasedOnTrayCount() called');
      let name = _useName ? _name + ', ' : '';
      switch (this.getNumberOfCardsThatHaveBeenPlacedOnTray) {
        case 0:
          return '🤢 Oh boy. ' + name + (!_useName ? 'This' : 'this') + ' is just sad.';
        case 1:
          return '🫣 ' + name + 'I guess one right is better than nothing?';
        case 2:
          return '😱 ' + name + (!_useName ? "You're" : "you're") + ' missing a couple!';
        case 3:
          return '🤪 ' + name + (!_useName ? 'Not' : 'not') + ' quite!';
        case 4:
          if (this.player.role !== 'reviewer') {
            if (this.currentGuessCount === 1) {
              return '🔥 ' + name + (!_useName ? 'You' : 'you') + ' nailed it in 1 try!';
            } else {
              return '😀 Nice, ' + name + 'you got it in ' + this.currentGuessCount + ' tries!';
            }
          } else if (_gotIt) {
            return '🔥 ' + name + (!_useName ? 'You' : 'you') + ' nailed it!';
          } else {
            return '☔️ Whelp ' + name + "better luck next time. Here's the solution.";
          }
          break;
        default:
          break;
      }
    },

    ShareWin() {
      note('ShareBoard() called');
      let text = this.puzzlePlayer.name + ', I got it in ' + this.currentGuessCount + ' tries! 😀';
      if (this.currentGuessCount === 1) {
        text = this.puzzlePlayer.name + ', I got it in 1 try! 🔥';
      }
      this.ShareText(text);
    },

    ShareText(_text) {
      let _shareObject = {
        text: _text,
      };
      if (navigator.share) {
        navigator.share(_shareObject);
      } else if (navigator.clipboard) {
        if (window.ClipboardItem) {
          // ClipboardItem is available
          navigator.clipboard
            .write([
              new ClipboardItem({
                'text/plain': new Blob([_text], { type: 'text/plain' }),
              }),
            ])
            .then(() => {
              this.message = 'Sharing message copied to the clipboard.';
            })
            .catch((err) => {
              console.error('Failed to copy text: ', err);
            });
        } else {
          // ClipboardItem is not available, use writeText
          navigator.clipboard
            .writeText(_text)
            .then(() => {
              this.message = 'Sharing message copied to the clipboard.';
            })
            .catch((err) => {
              console.error('Failed to copy text: ', err);
            });
        }
      } else {
        copyToClipboard(_text);
        this.message = 'Sharing message copied to the clipboard.';
      }
    },

    async ShareBoard(_gotIt = false) {
      note('ShareBoard() called');
      this.puzzleJustSent = this.shareURL === '';
      let newPuzzleIcon = '🧠';
      let text = this.player.id === this.sendingPlayer.id && this.player.id === this.puzzlePlayer.id ? newPuzzleIcon + " Here's a new " + (this.guessingCardCount === 5 ? '5-card ' : '') + '"' + this.guessingWordSet.name + '" puzzle to solve!' : '🤔 ' + this.puzzlePlayer.name + ", here's my guess!";
      let nailedIt = false;
      let isFinal = false;
      document.getElementById('shareButton').focus();
      if (this.player.role === 'reviewer') {
        text = this.GetMessageBasedOnTrayCount(_gotIt, this.guessersName);
        isFinal = this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4;
      }
      this.shareURL = '';
      this.ConstructURLForCurrentGame(isFinal);

      var corsflareUrl = 'https://worker-cold-butterfly-c870.bigtentgames.workers.dev/';
      var requestUrl = corsflareUrl + encodeURIComponent(window.location.search);

      await fetch(requestUrl, {
        headers: {
          Host: new URL(this.shareURL).hostname,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Server error: ' + response.status);
          }
          return response.text();
        })
        .then((shortUrl) => (this.shareURL = shortUrl))
        .catch((error) => console.error('Error:', error));

      if (this.player.role !== 'reviewer' || !_gotIt) {
        text = text + (nailedIt ? '' : '\r\n' + this.shareURL);
      }
      this.ShareText(text);
    },

    async CreateCardsForPlayer(_player) {
      note('CreateCardsForPlayer() called');
      let wordset = await this.getCurrentGameWordSet;
      let words = getUniqueWords(wordset);
      for (let x = 0; x < 4; x++) {
        const card = new CardObject({ position: x });
        if (x === 3) {
          card.position = 2;
        }
        if (x === 2) {
          card.position = 3;
        }
        card.words = words.slice(0 + x * 4, 4 + x * 4);
        this.cards.push(card);
      }
    },

    /* === CARD MANIPULATION === */

    HandleBodyPointerUp(e, _card) {
      note('HandleBodyPointerUp() called');
      if (!this.showModal) {
        this.isDragging = false;
        this.draggedCard = this.emptyCard;
      } else {
        this.draggedCard.isSelected = false;
      }
    },

    HandleBodyPointerDown(e) {
      this.ghostX = e.clientX;
      this.ghostY = e.clientY;
    },

    HandleCardPointerDown(e, _card) {
      note('HandleCardPointerDown() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
        this.ghostX = e.clientX;
        this.ghostY = e.clientY;
        if (e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
      }

      this.draggedCard = _card;
      this.isDragging = true;
    },

    HandleCardPointerUp(e, _card) {
      note('HandleCardPointerUp() called');
      e.preventDefault();
      e.stopPropagation();
      this.message = '';

      if (this.getSelectedCard && this.getSelectedCard === _card) {
        this.draggedCard = this.emptyCard;
        this.isDragging = false;
        return;
      }

      if (this.draggedCard.words.length > 0) {
        this.SwapCards(_card, this.draggedCard);
      }
    },

    HandlePickerCardClicked(e, _card) {
      note('HandlePickerCardClicked() called');
      e.preventDefault();
      e.stopPropagation();
      this.message = '';

      if (_card === null) {
        _card = this.getFirstAvailableParkingSpot;
      }

      this.SwapCards(_card, this.draggedCard);
      this.showModal = false;
    },

    SwapCards(_card1, _card2) {
      note('SwapCards() called');

      let temp1 = new CardObject(_card1);
      let temp2 = new CardObject(_card2);

      _card1.words = temp2.words;
      _card1.rotation = temp2.rotation;
      _card1.isSelected = false;
      _card1.justDropped = true;

      _card2.words = temp1.words;
      _card2.rotation = temp1.rotation;
      _card2.isSelected = false;
      _card2.justDropped = true;

      setTimeout(() => {
        this.cards.concat(this.parkedCards).forEach((card) => {
          card.justDropped = false;
        });
      }, this.longTransition);

      this.isDragging = false;
      this.draggedCard = this.emptyCard;

      this.ConstructURLForCurrentGame();
    },

    HandleCardClick(e, _card) {
      note('HandleCardClick() called');
      e.preventDefault();
      e.stopPropagation();
      this.ToggleCardSelection(_card);
    },

    ToggleCardSelection(_card) {
      note('ToggleCardSelection() called');

      if (this.getSelectedCard && this.getSelectedCard !== _card) {
        this.SwapCards(this.getSelectedCard, _card);
        return;
      }

      let selectedState = !_card.isSelected;
      warn(this.draggedCard.words.length > 0);

      this.cards.forEach((card) => {
        card.isSelected = false;
        card.isInTray = true;
        card.justDropped = false;
      });

      this.parkedCards.forEach((card) => {
        card.isSelected = false;
        card.isInTray = false;
        card.justDropped = false;
      });

      _card.isSelected = _card.words.length === 0 ? false : selectedState;

      if (document.body.offsetHeight <= 660 && !this.showModal) {
        this.showModal = true;
      }

      if (_card.isSelected) {
        this.draggedCard = _card;
        warn('draggedCard card has been assigned on card click');
      }
    },

    RotateCard(e, _card, _inc) {
      note('RotateCard() called');
      e.preventDefault();
      e.stopPropagation();
      if (this.isGuessing) {
        this.message = '';
        if (this.cardRotationTimeout) {
          clearTimeout(this.cardRotationTimeout);
          this.cardRotationTimeout = null;
        }
        _card.isSelected = false;
        _card.rotation = _card.rotation + _inc;
        _card.isRotating = true;
        this.cardRotationTimeout = setTimeout(() => {
          this.ResetCardsAfterRotation();
        }, this.shortTransition);
      }
    },

    ResetCardsAfterRotation(_contructURL = true) {
      note('ResetCardsAfterRotation() called');

      this.cards.concat(this.parkedCards).forEach((card) => {
        if (card.rotation !== 0) {
          card.isRotating = false;
          let len = card.words.length;
          if (len > 0) {
            let shift = ((card.rotation % len) + len) % len;
            card.words = card.words.slice(-shift).concat(card.words.slice(0, -shift));
          }
          card.rotation = 0;
        }
      });
      if (this.isGuessing && _contructURL) {
        this.ConstructURLForCurrentGame();
      }
    },

    RotateTrayBasedOnInputFocus(_index) {
      note('RotateTrayBasedOnInputFocus() called');
      if (_index != 0) {
        switch (_index) {
          case 0:
            this.RotateTray(0);
            break;
          case 1:
            this.RotateTray(-1);
            break;
          case 2:
            this.RotateTray(1);
            break;
          case 3:
            this.RotateTray(-2);
            break;
        }
      }
    },

    RotateTray(_inc) {
      note('RotateTray() called');
      if (!this.trayIsRotating) {
        this.message = '';
        this.trayIsRotating = true;
        if (this.trayRotationTimeout) {
          clearTimeout(this.trayRotationTimeout);
          this.trayRotationTimeout = null;
        }
        if (this.getSelectedCard) this.getSelectedCard.isSelected = false;
        this.trayRotation = this.trayRotation + _inc;
        document.getElementById('parkingInput').focus();
        this.cardtrayRotationTimeoutRotationTimeout = setTimeout(() => {
          this.ResetTrayAfterRotation();
        }, this.longTransition);

        if (!this.isGuessing) {
          setTimeout(() => {
            let hint0 = document.getElementById('hint0');
            this.parkingInputValue = '';
            hint0.focus();
          }, this.longTransition);
        }
      }
    },

    ResetTrayAfterRotation() {
      note('ResetTrayAfterRotation() called');
      this.trayIsRotating = false;
      this.parkingInputValue = '';

      if (this.trayRotation < 3) {
        if (this.trayRotation !== 0) {
          let len = this.hints.length;
          if (len > 0) {
            let shift = ((this.trayRotation % len) + len) % len;
            this.hints = this.hints.slice(-shift).concat(this.hints.slice(0, -shift));
          }
        }

        let hint0 = this.hints[0];
        let hint1 = this.hints[1];
        let hint2 = this.hints[2];
        let hint3 = this.hints[3];
        let card0 = this.cards[0];
        let card1 = this.cards[1];
        let card2 = this.cards[2];
        let card3 = this.cards[3];

        card0.rotation = card1.rotation = card2.rotation = card3.rotation = this.trayRotation;

        this.ResetCardsAfterRotation(false);

        switch (this.trayRotation) {
          case -1:
            this.hints[0] = hint0;
            this.hints[1] = hint2;
            this.hints[2] = hint3;
            this.hints[3] = hint1;

            this.cards[0] = card1;
            this.cards[2] = card0;
            this.cards[1] = card3;
            this.cards[3] = card2;
            break;
          case 1:
            this.hints[0] = hint3;
            this.hints[1] = hint1;
            this.hints[2] = hint0;
            this.hints[3] = hint2;

            this.cards[0] = card2;
            this.cards[1] = card0;
            this.cards[2] = card3;
            this.cards[3] = card1;
            break;
          case 2:
          case -2:
            this.hints[0] = hint1;
            this.hints[1] = hint0;
            this.hints[2] = hint3;
            this.hints[3] = hint2;

            this.cards[0] = card3;
            this.cards[1] = card2;
            this.cards[2] = card1;
            this.cards[3] = card0;
            break;
          default:
            break;
        }

        this.ConstructURLForCurrentGame();
      }
      this.trayRotation = 0;
    },

    /* END CARD MANIPULATION */

    async NewGame(e, _message = '', _rotate = true) {
      note('NewGame() called');
      document.title = 'Facets!';
      this.message = _message;
      this.currentGuessCount = 0;
      this.isFinal = false;
      this.puzzleJustSent = false;
      this.guessersName = '';
      this.player.role = 'creator';
      this.puzzlePlayer.id = this.player.id;
      this.puzzlePlayer.name = this.player.name;
      this.sendingPlayer.id = this.player.id;
      this.sendingPlayer.name = this.player.name;
      this.guessingWordSet = this.gameWordSet;
      this.guessingCardCount = this.useExtraCard ? 5 : 4;
      this.guessingGameSol = '';
      this.trayIsRotating = false;
      this.SetWordSetTheme(this.gameWordSet);
      this.shareURL = '';
      this.shareText = 'Send';
      history.pushState(null, null, window.location.origin + window.location.pathname);
      this.isGuessing = false;
      this.cards = [];
      this.parkedCards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
      this.hints = [new WordObject({}), new WordObject({}), new WordObject({}), new WordObject({})];
      await this.CreateCardsForPlayer(null);
      localStorage.setItem('currentGameID', { gameId: this.currentGameID });

      if (_rotate) {
        this.RotateTray(-4);
      }
    },

    HandlePointerMoveEvent(e) {
      this.ghostX = e.clientX;
      this.ghostY = e.clientY;
    },

    HandlePageVisibilityChange() {
      let id = localStorage.getItem('userID');
      if (id !== undefined && id !== null) {
        id = JSON.parse(id);
        this.player.id = id;
      } else {
        this.player.id = getRandomInt(10000000, 100000000);
        localStorage.setItem('userID', this.player.id);
      }
      this.tempID = parseInt(this.player.id);

      let name = localStorage.getItem('name');
      if (name !== undefined && name !== null) {
        this.player.name = name;
      } else {
        this.changeNameTitle = "Hello, what's your name?";
        this.showModal = true;
        this.showIntro = true;
        setTimeout(() => {
          document.getElementById('nameInput').focus();
        }, 410);
      }

      this.wordSets.forEach((m) => {
        m.isSelected = false;
      });
      let setID = localStorage.getItem('wordSet');
      if (setID !== undefined && setID !== null && this.wordSets.find((m) => m.id === setID)) {
        this.gameWordSet = this.wordSets.find((m) => m.id === setID);
      } else {
        this.gameWordSet = WordSets.find((m) => m.id === '100');
      }
      this.gameWordSet.isSelected = true;

      let useThemes = localStorage.getItem('useWordSetThemes');
      if (useThemes !== undefined && useThemes !== null) {
        this.useWordSetThemes = JSON.parse(useThemes);
        this.tempUseWordSetThemes = this.useWordSetThemes;
        this.SetWordSetTheme(this.gameWordSet);
      }

      let _newVersionAvailable = localStorage.getItem('newVersionAvailable');
      try {
        if (_newVersionAvailable !== undefined && _newVersionAvailable !== null) {
          this.newVersionAvailable = JSON.parse(_newVersionAvailable);
        }
      } catch (_error) {
        error('_newVersionAvailable error: ' + _error);
      }
      // let usePortraitLayout = localStorage.getItem('usePortraitLayout');
      // if (usePortraitLayout !== undefined && usePortraitLayout !== null) {
      //   this.usePortraitLayout = JSON.parse(usePortraitLayout);
      //   this.tempUsePortraitLayout = this.usePortraitLayout;
      // }

      let useExtraCard = localStorage.getItem('useExtraCard');
      if (useExtraCard !== undefined && useExtraCard !== null) {
        this.useExtraCard = JSON.parse(useExtraCard);
        this.tempUseExtraCard = this.useExtraCard;
      }

      let autoCheck = localStorage.getItem('autoCheck');
      if (autoCheck !== undefined && autoCheck !== null) {
        this.autoCheck = JSON.parse(autoCheck);
        this.tempAutoCheck = this.autoCheck;
      }

      let useMultiColoredGems = localStorage.getItem('useMultiColoredGems');
      if (useMultiColoredGems !== undefined && useMultiColoredGems !== null) {
        this.useMultiColoredGems = JSON.parse(useMultiColoredGems);
        this.tempUseMultiColoredGems = this.useMultiColoredGems;
      }
    },

    LoadPage() {
      note('LoadPage() called');
      this.HandlePageVisibilityChange();
      announce('Player ' + this.player.id + ' has initiated the app.');
      this.longTransition = parseInt(getComputedStyle(document.body).getPropertyValue('--longTransition').replace('ms', ''));
      this.shortTransition = parseInt(getComputedStyle(document.body).getPropertyValue('--shortTransition').replace('ms', ''));

      let boardPieces = [];
      try {
        if (window.location.search) {
          var urlParams = new URLSearchParams(window.location.search);
          let search = decodeURIComponent(window.location.search);
          params = search.split('?')[1].split('&');
          boardPieces = urlParams.has('board') ? urlParams.get('board').split('-') : [];
        }

        if (boardPieces.length >= 40) {
          document.title = 'Facets!';
          this.RestoreGame(boardPieces);
        } else if (!this.isGuessing) {
          this.NewGame(null, '', false);
        }
      } catch (e) {
        warn(e.message);
        boardPieces = [];
        this.NewGame(null, '😕 - Something went wrong.', false);
      }

      this.usePortraitLayout = document.body.offsetHeight > document.body.offsetWidth;
    },

    OpenSettings() {
      note('OpenSettings() called');
      this.showModal = true;
      this.showSettings = true;
      this.changeNameTitle = this.player.name + ", what's your new name?";
      this.tempWordSets = [];
      this.tempWordSetName = this.getCurrentSelectedTempWordSetName;
      this.wordSets.forEach((set) => {
        this.tempWordSets.push(new WordSetObject(set));
      });
      this.tempName = this.player.name;
    },

    SelectWordSet(e, _wordSet) {
      note('SelectWordSet() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.tempWordSets.forEach((set) => {
        set.isSelected = false;
      });
      _wordSet.isSelected = true;
    },

    GetCurrentSolutionParamString() {
      note('GetCurrentSolutionParamString() called');
      let params = [];
      if (this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
        params.push(this.hints[0].value);
        params.push(this.cards[0].words[0].id);
        params.push(this.cards[1].words[0].id);

        params.push(this.hints[1].value);
        params.push(this.cards[1].words[1].id);
        params.push(this.cards[3].words[1].id);

        params.push(this.hints[2].value);
        params.push(this.cards[2].words[3].id);
        params.push(this.cards[0].words[3].id);

        params.push(this.hints[3].value);
        params.push(this.cards[3].words[2].id);
        params.push(this.cards[2].words[2].id);
      }
      let param = params.join('-');
      return param;
    },

    CancelSettings(e) {
      note('CancelSettings() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.editID = false;
      this.showModal = false;
      this.showSettings = false;
      this.showIntro = false;
      this.tempID = this.player.id;
      this.tempUseWordSetThemes = this.useWordSetThemes;
      this.tempUseMultiColoredGems = this.useMultiColoredGems;
      // this.tempUsePortraitLayout = this.usePortraitLayout;
      this.tempUseExtraCard = this.useExtraCard;
      this.tempAutoCheck = this.autoCheck;
    },

    HandleIntroButtonClick(e) {
      note('HandleIntroButtonClick() called');
      this.SubmitSettings(null);
      this.ToggleShowTutorial(null);
    },

    SubmitSettings(e) {
      note('SubmitSettings() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.player.name = this.tempName !== '' ? this.tempName.trim() : this.player.name;
      if (!this.isGuessing) {
        this.puzzlePlayer.name = this.player.name;
      }
      localStorage.setItem('name', this.player.name);
      if (this.showSettings) {
        let newSelectedWordSet = this.tempWordSets.find((set) => set.name === this.tempWordSetName);
        this.SelectWordSet(e, newSelectedWordSet);

        let wordSetChanged = false;
        wordSetChanged = this.wordSets.find((set) => set.isSelected === true).id !== this.tempWordSets.find((set) => set.isSelected === true).id;
        this.wordSets = this.tempWordSets;
        this.gameWordSet = this.wordSets.find((set) => set.isSelected === true);
        if (wordSetChanged && !this.isGuessing) {
          this.NewGame();
          this.SetWordSetTheme(this.guessingWordSet);
        }

        this.player.id = this.tempID;
        this.useWordSetThemes = this.tempUseWordSetThemes;
        // this.usePortraitLayout = this.tempUsePortraitLayout;
        this.useExtraCard = this.tempUseExtraCard;
        this.autoCheck = this.tempAutoCheck;
        this.useMultiColoredGems = this.tempUseMultiColoredGems;
        this.guessingCardCount = this.useExtraCard ? 5 : 4;
        this.SetWordSetTheme(this.guessingWordSet);

        localStorage.setItem('userID', this.player.id);
        // localStorage.setItem('usePortraitLayout', this.usePortraitLayout);
        localStorage.setItem('useWordSetThemes', this.useWordSetThemes);
        localStorage.setItem('useExtraCard', this.useExtraCard);
        localStorage.setItem('autoCheck', this.autoCheck);
        localStorage.setItem('useMultiColoredGems', this.useMultiColoredGems);
        localStorage.setItem('wordSet', this.gameWordSet.id);
      }
      this.editID = false;
      this.showModal = false;
      this.showSettings = false;
      this.showIntro = false;
    },

    HandleKeyDownEvent(e) {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key) {
          case 'Enter':
            note('HandleKeyDownEvent() called');
            e.preventDefault();
            if (!this.isGuessing && this.getNumberOfHintsThatHaveBeenFilled === 4) {
              this.FillParkingLot();
            }
            if (this.showSettings) {
              this.SubmitSettings(e);
            } else if (this.showTutorial) {
              this.ToggleShowTutorial(null);
            } else if (this.showConfirmation) {
              this.HandleYesNo(this.confirmation.target, true);
            } else if (this.showIntro) {
              this.HandleIntroButtonClick(null);
            }
            break;
          case 'Tab':
            note('HandleKeyDownEvent() called');
            e.preventDefault();
            if (!this.trayIsRotating) {
              this.RotateTray(e.shiftKey ? 1 : -1);
            }
            break;
          case '-':
            e.preventDefault();
            e.stopPropagation();
          case 'Escape':
            if (this.showSettings) {
              this.CancelSettings(null);
            } else if (this.showTutorial) {
              this.ToggleShowTutorial(null);
            } else if (this.showConfirmation) {
              this.HandleYesNo(this.confirmation.target, false);
            }
            break;
          default:
        }
      }
    },

    GetUniqueCardId(_words) {
      if (_words.length === 0) {
        return 0;
      }
      let letters = '';
      _words.forEach((word) => {
        letters += word.value.toLowerCase();
      });
      letters = letters.split('');
      letters = letters.sort();
      letters = letters.join('');
      let prime = 1000000007; // a large prime number
      let hash = 0;
      for (let i = 0; i < letters.length; i++) {
        hash = (hash * 26 + (letters.charCodeAt(i) - 'a'.charCodeAt(0) + 1)) % prime;
      }
      return hash;
    },

    CheckIfCardIsInTray(_card) {
      if (!_card.words || _card.words.length === 0) {
        return false;
      }
      this.cards.forEach((card) => {
        if (this.GetUniqueCardId(card.words) === this.GetUniqueCardId(_card.words)) {
          return true;
        }
      });
      return false;
    },

    HandleResize() {
      this.usePortraitLayout = document.body.offsetHeight > document.body.offsetWidth;
    },

    HandlePopState() {
      note('HandlePopState() called');
      if (window.location.search) {
        this.LoadPage();
      } else {
        this.NewGame(null);
      }
    },

    HandleUpdateAppButtonClick() {
      note('HandleUpdateAppButtonClick() called');
      this.newVersionAvailable = false;
      localStorage.setItem('newVersionAvailable', this.newVersionAvailable);
      if (this.serviceWorker !== '') {
        this.serviceWorker.postMessage({ action: 'skipWaiting' });
      } else {
        window.location.reload(true);
      }
    },

    HandleServiceWorkerRegistration() {
      note('HandleServiceWorkerRegistration() called');
      if ('serviceWorker' in navigator) {
        // Register the service worker
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          reg.addEventListener('updatefound', () => {
            // An updated service worker has appeared in reg.installing!
            this.serviceWorker = reg.installing;
            this.serviceWorker.addEventListener('statechange', () => {
              // Has service worker state changed?
              switch (this.serviceWorker.state) {
                case 'installed':
                  // There is a new service worker available, show the notification
                  if (navigator.serviceWorker.controller) {
                    this.newVersionAvailable = true;
                    localStorage.setItem('newVersionAvailable', this.newVersionAvailable);
                  }
                  break;
              }
            });
          });
        });
      }
    },
  },

  mounted() {
    // this.HandleServiceWorkerRegistration();
    this.LoadPage();
    window.addEventListener('keydown', this.HandleKeyDownEvent);
    window.addEventListener('pointermove', this.HandlePointerMoveEvent);
    window.addEventListener('visibilitychange', this.HandlePageVisibilityChange);
    window.addEventListener('resize', this.HandleResize);
    window.addEventListener('popstate', this.HandlePopState);
  },

  computed: {
    getSelectedCard: function () {
      return this.cards.concat(this.parkedCards).find((card) => card.isSelected === true);
    },
    getAllPlayerCards: function (_value) {
      return this.cards.concat(this.parkedCards).find((card) => card.id.indexOf(_value === 0));
    },
    getAllCards: function () {
      let newArray = this.cards.concat(this.parkedCards).filter((card) => card.words.length > 0);

      newArray.forEach((card) => {
        card.id = this.GetUniqueCardId(card.words);
      });
      newArray = newArray.sort((a, b) => a.id - b.id);
      return newArray;
    },
    getFirstThreeParkedCards: function () {
      return this.parkedCards.splice(0, 3);
    },
    getNumberOfCardsThatHaveBeenPlacedOnTray: function () {
      return this.cards === undefined ? 0 : this.cards.filter((card) => card.words.length > 0).length;
    },
    getNumberOfHintsThatHaveBeenFilled: function () {
      return this.hints === undefined ? 0 : this.hints.filter((hint) => hint.value != '').length;
    },
    getUniqueCardId: function (_words) {
      return this.GetUniqueCardId(_words);
    },
    getFirstAvailableParkingSpot: function () {
      return this.parkedCards.find((card) => card.words.length === 0);
    },
    getPlayerMessage: function () {
      let text = this.player.name + ', you are guessing ' + this.puzzlePlayer.name + '\'s "' + this.guessingWordSet.name + '" puzzle!';
      if (!this.isGuessing) {
        text = this.player.name + ', you are creating a new "' + this.guessingWordSet.name + '" puzzle!';
      } else {
        if (this.player.id === this.sendingPlayer.id && this.player.id === this.puzzlePlayer.id) {
          text = this.player.name + ', this is your own puzzle!';
        } else if (this.player.id !== this.sendingPlayer.id && this.player.id === this.puzzlePlayer.id) {
          text = this.player.name + ', you are reviewing ' + this.sendingPlayer.name + "'s guess!";
        }
      }
      return text;
    },
    getEnabledTempWordSets: function () {
      return this.tempWordSets.filter((set) => set.enabled);
    },
    getEnabledTempWordSetNames: function () {
      let names = [];
      this.wordSets.forEach((set) => {
        if (set.enabled) {
          names.push(set.name);
        }
      });
      return names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    },
    getCurrentSelectedTempWordSetName: function () {
      return this.wordSets.find((set) => set.isSelected).name;
    },
    getCurrentGameWordSet: async function () {
      let allWords = [];
      let fetchPromises = this.gameWordSet.data.map((url) => fetch(url).then((response) => response.json()));

      try {
        let dataArrays = await Promise.all(fetchPromises);
        allWords = [].concat(...dataArrays);
      } catch (error) {
        console.error('Error:', error);
      }

      return allWords;
    },
    getGuessingGameWordSet: async function () {
      let allWords = [];
      let fetchPromises = this.guessingWordSet.data.map((url) => fetch(url).then((response) => response.json()));

      try {
        let dataArrays = await Promise.all(fetchPromises);
        allWords = [].concat(...dataArrays);
      } catch (error) {
        console.error('Error:', error);
      }

      return allWords;
    },
    getSubmitButtonText: function () {
      let text = 'Send';
      if (this.player.id !== this.puzzlePlayer.id) {
        text = this.autoCheck ? 'Guess' : text;
      }
      return text;
    },
  },
});
