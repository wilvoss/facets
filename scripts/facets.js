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
    version: '0.1.025',
    gameName: 'Facets',
    gameCatchphrase: 'A game of word association!',
    gameMode: 'both',
    showArticle: false,
    changeName: false,
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
    r: document.querySelector(':root'),
  },
  methods: {
    ToggleShowModal(e) {
      e.preventDefault();
      e.stopPropagation();
      this.showModal = !this.showModal;
    },

    HandleSubmitButtonPress() {
      note('HandleSubmitButtonPress() called');
      if (this.isGuessing) {
        this.ShareBoard();
      } else {
        this.FillParkingLot();
      }
    },

    FillParkingLot() {
      note('FillParkingLot() called');
      this.puzzlePlayer.id = this.player.id;
      this.isGuessing = true;
      let temp = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
      let index = 0;
      this.cards.concat(this.parkedCards).forEach((card) => {
        card.id = this.player.value + index++;
        card.rotation = (getRandomInt(0, 1) === 1 ? 1 : -1) * getRandomInt(0, 4);
        this.ResetCardAfterRotation(card);
      });

      this.parkedCards = this.cards;
      this.parkedCards.push(new CardObject({ words: getUniqueWords(this.gameMode, 4) }));

      for (let i = this.parkedCards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [this.parkedCards[i], this.parkedCards[j]] = [this.parkedCards[j], this.parkedCards[i]];
      }

      this.parkedCards.push(new CardObject({}));

      this.cards = temp;
      this.ShareBoard();
    },

    RestoreGame(_boardArray) {
      note('RestoreGame() called');
      let corruptData = false;
      if (_boardArray.length >= 45) {
        this.shareURL = window.location.href;
        this.puzzleJustSent = false;
        let allWords = Nouns.concat(Verbs);
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
        let possibleName = _boardArray[_boardArray.length - 3];
        if (possibleName !== '' && parseInt(possibleName) !== NaN) {
          this.sendingPlayer.name = _boardArray[_boardArray.length - 3];
        }
        this.sendingPlayer.id = parseInt(_boardArray[_boardArray.length - 2]);
        this.puzzlePlayer.id = parseInt(_boardArray[_boardArray.length - 1]);
        this.player.role = this.puzzlePlayer.id === this.player.id && this.player.id !== this.sendingPlayer.id ? 'reviewer' : 'guesser';
      }
      this.isGuessing = true;
      if (corruptData) {
        announce('the data was corrupt');
        this.NewGame(null, '😕 - Something went wrong.');
      }
    },

    ConstructURLForCurrentGame() {
      note('ConstructURLForCurrentGame() called');
      let urlString = '';
      this.cards.concat(this.parkedCards).forEach((card) => {
        if (card.words.length === 0) {
          urlString += '----';
        }
        card.words.forEach((word) => {
          urlString += word.id + '-';
        });
      });

      this.hints.forEach((hint) => {
        urlString += hint.value + '-';
      });

      urlString += this.player.name + '-';
      urlString += this.player.id + '-';
      urlString += this.puzzlePlayer.id;
      urlString = encodeURIComponent(urlString);
      urlString = window.location.origin + '?board=' + urlString;
      this.shareURL = urlString;
      history.pushState(null, null, this.shareURL);
    },

    ShareBoard() {
      note('ShareBoard() called');
      this.puzzleJustSent = this.shareURL === '';
      let text = this.puzzleJustSent ? "Here's a new puzzle to solve!" : "Here's my guess!";
      if (this.player.role === 'reviewer') {
        switch (this.getNumberOfCardsThatHaveBeenPlacedOnTray) {
          case 0:
          case 1:
          case 2:
            text = '😱 Try again!';
            break;
          case 3:
            text = '🤪 Not quite!';
            break;
          case 4:
            text = '🔥 Nailed it!';
            break;
          default:
            break;
        }
      }
      this.shareURL = '';
      this.ConstructURLForCurrentGame();
      announce(this.shareURL);
      text = text + '\r\n' + this.shareURL;
      let _shareObject = {
        title: 'FACETS',
        text: text,
      };
      if (navigator.share) {
        navigator.share(_shareObject);
      } else if (navigator.clipboard !== undefined) {
        _shareObject = text;
        navigator.clipboard.writeText(_shareObject);
        this.message = 'Sharing message copied to the clipboard.';
      }
    },

    CreateCardsForPlayer(_player) {
      note('CreateCardsForPlayer() called');
      let words = getUniqueWords(this.gameMode);
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

    ToggleCardSelection(_card) {
      note('ToggleCardSelection() called');
      let selectedState = !_card.isSelected;
      this.cards.concat(this.parkedCards).forEach((card) => {
        card.isSelected = false;
      });
      _card.isSelected = selectedState;
      this.targetCard = _card.isSelected ? _card : null;

      this.cards.forEach((card) => {
        card.isInTray = true;
      });

      this.parkedCards.forEach((card) => {
        card.isInTray = false;
      });

      this.cards.concat(this.parkedCards).forEach((card) => {
        card.justDropped = false;
      });

      if (document.body.offsetWidth <= 640 && (_card.isSelected || _card.words.length === 0)) {
        this.showModal = true;
      }
    },

    HandleCardClick(e, _card) {
      note('HandleCardClick() called');
      e.preventDefault();
      e.stopPropagation();
      this.ToggleCardSelection(_card);
    },

    HandleBodyPointerUp(e, _card) {
      note('HandleBodyPointerUp() called');
      this.isDragging = false;
      this.draggedCard = this.emptyCard;
    },

    HandleCardPointerDown(e, _card) {
      note('HandleCardPointerDown() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
      }

      if (_card.words.length > 0) {
        this.draggedCard = _card;
        this.isDragging = true;
      }
    },

    HandleCardPointerUp(e, _card) {
      note('HandleCardPointerUp() called');
      e.preventDefault();
      e.stopPropagation();
      if (this.targetCard !== null) {
        this.draggedCard = this.targetCard;
      }

      this.message = '';

      if (this.draggedCard.words.length > 0 || this.showModal) {
        let temp1 = new CardObject(_card);
        let temp2 = new CardObject(this.draggedCard);
        _card.words = temp2.words;
        _card.rotation = temp2.rotation;
        _card.isSelected = false; //temp2.isSelected;
        this.draggedCard.words = temp1.words;
        this.draggedCard.rotation = temp1.rotation;
        this.draggedCard.isSelected = false; //temp1.isSelected;

        this.draggedCard.justDropped = true;
        _card.justDropped = true;

        setTimeout(() => {
          this.cards.concat(this.parkedCards).forEach((card) => {
            card.justDropped = false;
          });
          this.draggedCard.justDropped = false;
        }, this.longTransition);
      }

      this.isDragging = false;
      this.draggedCard = this.emptyCard;
    },

    HandlePickerCardClicked(e, _card) {
      note('HandlePickerCardClicked() called');

      if (_card !== null) {
        this.draggedCard = _card;
      } else {
        this.draggedCard = this.getFirstAvailableParkingSpot;
      }
      _card = this.targetCard;
      this.targetCard = null;

      this.message = '';

      this.HandleCardPointerUp(e, _card);
      this.showModal = false;
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
          this.ResetCardAfterRotation();
        }, this.shortTransition);
      }
    },

    HandlePointerMoveEvent(e) {
      this.ghostX = e.clientX;
      this.ghostY = e.clientY;
    },

    ResetCardAfterRotation() {
      note('ResetCardAfterRotation() called');

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
            hint0.focus();
          }, this.longTransition);
        }
      }
    },

    ResetTrayAfterRotation() {
      note('ResetTrayAfterRotation() called');

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

      this.cards.forEach((card) => {
        this.ResetCardAfterRotation(card);
      });

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
      this.trayRotation = 0;

      this.trayIsRotating = false;
    },

    NewGame(e, _message = '') {
      note('NewGame() called');
      this.message = _message;
      this.puzzleJustSent = false;
      this.player.role = 'creator';
      this.puzzlePlayer.id = this.player.id;
      this.sendingPlayer.id = this.player.id;
      this.shareURL = '';
      this.shareText = 'Send';
      history.replaceState(null, null, window.location.origin);
      this.isGuessing = false;
      this.cards = [];
      this.parkedCards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
      this.hints = [new WordObject({}), new WordObject({}), new WordObject({}), new WordObject({})];
      this.CreateCardsForPlayer(null);
    },

    HandlePageVisibilityChange() {
      let id = localStorage.getItem('userID');
      if (id !== undefined && id !== null) {
        id = JSON.parse(id);
        this.player.id = id;
        this.puzzlePlayer.id = id;
        this.sendingPlayer.id = id;
      } else {
        this.player.id = getRandomInt(100000, 100000000);
        localStorage.setItem('userID', this.player.id);
      }

      let name = localStorage.getItem('name');
      if (name !== undefined && name !== null) {
        name = name;
        this.player.name = name;
      } else {
        this.changeNameTitle = "Hello, what's your name?";
        this.showModal = true;
        this.changeName = true;
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
          let search = decodeURIComponent(window.location.search);
          boardPieces = search.split('?')[1].split('=')[1].split('-');
        }
        if (boardPieces.length >= 45) {
          document.title = 'Facets - CHALLENGE!';
          this.RestoreGame(boardPieces);
        } else if (!this.isGuessing) {
          this.NewGame();
        }
      } catch (e) {
        warn(e.message);
        boardPieces = [];
        this.NewGame(null, '😕 - Something went wrong.');
      }
    },

    ChangeName() {
      this.showModal = true;
      this.changeName = true;
      this.changeNameTitle = this.player.name === 'Player' ? "What's your name?" : "What's your new name?";
    },

    CancelNameChange(e) {
      note('CancelNameChange() called');
      e.preventDefault();
      e.stopPropagation();
      this.showModal = false;
      this.changeName = false;
    },

    SubmitName(e) {
      note('SubmitName() called');
      e.preventDefault();
      e.stopPropagation();
      this.showModal = false;
      this.changeName = false;
      this.player.name = document.getElementById('nameInput').value.trim();
      localStorage.setItem('name', this.player.name);
    },

    HandleKeyDownEvent(e) {
      switch (e.key) {
        case 'Enter':
          note('HandleKeyDownEvent() called');
          e.preventDefault();
          if (!this.isGuessing && this.getNumberOfHintsThatHaveBeenFilled === 4) {
            this.FillParkingLot();
          }
          if (this.showModal && this.changeName) {
            this.SubmitName(e);
          }
          break;
        case 'Tab':
          note('HandleKeyDownEvent() called');
          e.preventDefault();
          if (!this.trayIsRotating) {
            let newTarget = 'hint0';
            switch (e.target.id) {
              case 'hint0':
                document.getElementById(e.shiftKey ? 'hint2' : 'hint1').focus();
                break;

              default:
                document.getElementById('hint0').focus();
                break;
            }
          }
          break;
        case ' ':
          note('HandleKeyDownEvent() called');
          // e.preventDefault();
          // e.stopPropagation();
          break;
        default:
      }
    },

    HandleInputKeyDown(e) {
      note('HandleInputKeyDown() called');
      // input.value = input.value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ-]/g, '');
      // let isInvalidChars = /[^a-zA-ZÀ-ÖØ-öø-ÿ\-!]/.test(e.key);
      // if (isInvalidChars) {
      //   e.preventDefault();
      //   e.stopPropagation();
      // }
    },

    HandleOnPageHideEvent(_clearInterval = true) {
      note('HandleOnPageHideEvent() called');
      if (_clearInterval) {
        window.clearInterval(this.updateInterval);
      }

      this.appSettingsSoundFX.unload();
      if (this.appSettingsSaveSettings) {
        localStorage.setItem('storedVersion', this.currentVersion);
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
  },

  mounted() {
    this.LoadPage();
    window.addEventListener('keydown', this.HandleKeyDownEvent);
    window.addEventListener('pointermove', this.HandlePointerMoveEvent);
    window.addEventListener('visibilitychange', this.HandlePageVisibilityChange);
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
  },
});
