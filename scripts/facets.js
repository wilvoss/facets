/// <reference path="../models/WordObject.js" />
/// <reference path="../models/WordObject.js" />
/// <reference path="../helpers/interact.min.js" />

// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = ['app'];

var app = new Vue({
  el: '#app',
  data: {
    gameName: 'Facets',
    gameCatchphrase: 'A game of word association!',
    gameMode: 'both',
    showArticle: false,
    emptyCard: new CardObject({ id: 'ghost' }),
    draggedCard: new CardObject({}),
    ghostX: 0,
    ghostY: 0,
    ghostOffsetX: 0,
    ghostOffsetY: 0,
    shareURL: '',
    year: new Date().getFullYear(),
    actualCards: [],
    cards: [],
    parkedCards: [],
    hints: [],
    player: new PlayerObject({}),
    puzzlePlayer: new PlayerObject({}),
    isGuessing: false,
    trayRotation: 0,
    trayIsRotating: false,
    longTransition: 0,
    shortTransition: 0,
    showModal: false,
    modalContainer: null,
    trayRotationTimeout: null,
    cardRotationTimeout: null,
    isDragging: false,
    r: document.querySelector(':root'),
  },
  methods: {
    ToggleShowModal() {
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
    },

    RestoreGame(_boardArray) {
      note('RestoreGame() called');
      if (_boardArray.length === 45) {
        let allWords = Nouns.concat(Verbs);
        this.cards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
        this.parkedCards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
        this.hints = [new WordObject({}), new WordObject({}), new WordObject({}), new WordObject({})];
        let index = 0;

        this.cards.forEach((card) => {
          for (let x = 0; x < 4; x++) {
            if (_boardArray[index] !== '') {
              card.words.push(allWords[parseInt(_boardArray[index])]);
            }
            index++;
          }
        });
        this.parkedCards.forEach((card) => {
          for (let x = 0; x < 4; x++) {
            if (_boardArray[index] !== '') {
              card.words.push(allWords[parseInt(_boardArray[index])]);
            }
            index++;
          }
        });
        this.hints.forEach((hint) => {
          hint.value = _boardArray[index++];
        });
        this.puzzlePlayer.name = _boardArray[index++];
      }
      history.replaceState(null, null, window.location.origin);
      this.isGuessing = true;
    },

    ConstructURLForCurrentGame() {
      note('ConstructURLForCurrentGame() called');
      let queryString = 'https://' + window.location.hostname + '?board=';
      this.cards.concat(this.parkedCards).forEach((card) => {
        if (card.words.length === 0) {
          queryString += '----';
        }
        card.words.forEach((word) => {
          queryString += getWordIndex(word) + '-';
        });
      });

      this.hints.forEach((hint) => {
        queryString += hint.value + '-';
      });

      queryString += this.player.name + '-';
      queryString += this.puzzlePlayer.name + '-';
      queryString += this.gameMode;

      this.shareURL = queryString;
    },

    ShareBoard() {
      note('ShareBoard() called');
      this.ConstructURLForCurrentGame();
      let _shareObject = {
        title: 'Facets Challenge',
        text: 'I created a puzzle, can you solve it?',
        url: this.shareURL,
      };
      if (navigator.share) {
        navigator.share(_shareObject);
      } else {
        _shareObject = this.shareURL;
        alert('Copied game link to the clipboard.');
        navigator.clipboard.writeText(_shareObject);
      }
    },

    ToggleCardSelection(_card) {
      note('ToggleCardSelection() called');
      if (_card.words.length > 0) {
        let selectedState = !_card.isSelected;
        this.cards.forEach((card) => {
          card.isSelected = false;
        });
        this.parkedCards.forEach((card) => {
          card.isSelected = false;
        });
        _card.isSelected = selectedState;
        this.draggedCard = _card.isSelected ? _card : this.emptyCard;
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

    HandleCardPointerDown(e, _card) {
      note('HandleCardPointerDown() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
      }

      if (this.getSelectedCard !== undefined && _card !== this.getSelectedCard) {
        this.getSelectedCard.justDropped = true;
        _card.justDropped = true;

        setTimeout(() => {
          this.cards.concat(this.parkedCards).forEach((card) => {
            card.justDropped = false;
          });
        }, this.longTransition);
        let temp1 = new CardObject(_card);
        let temp2 = new CardObject(this.getSelectedCard);
        _card.words = temp2.words;
        _card.rotation = temp2.rotation;
        this.getSelectedCard.words = temp1.words;
        this.getSelectedCard.rotation = temp1.rotation;
        this.getSelectedCard.isSelected = false;
      } else if (_card !== undefined) {
        // this.isDragging = false;
        this.ToggleCardSelection(_card);
      }
    },

    HandleBodyPointerUp(e, _card) {
      if (this.getSelectedCard !== null && this.getSelectedCard !== undefined) {
        this.isDragging = false;
        this.draggedCard = this.emptyCard;
        this.getSelectedCard.isSelected = false;
      }
    },

    HandleTouchStart(e) {
      e.preventDefault();
    },

    HandleCardDragStart(e, _card) {
      note('HandleCardDragStart() called');
      this.isDragging = true;
      this.cards.concat(this.parkedCards).forEach((card) => {
        card.isSelected = false;
      });
      this.HandleCardPointerDown(_card);
    },

    HandleCardClick(e, _card) {
      e.preventDefault();
      e.stopPropagation();
      this.ToggleCardSelection(_card);
    },

    HandleCardDrop(e, _card) {
      note('HandleCardDrop() called');
      this.HandleCardPointerDown(e, _card);
      this.isDragging = false;
      this.draggedCard = this.emptyCard;
    },

    HandleCardDragOver(e, _card) {
      e.preventDefault();
    },

    RotateCard(e, _card, _inc) {
      note('RotateCard() called');
      e.preventDefault();
      e.stopPropagation();
      if (this.isGuessing) {
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
            // _index = 2;
            break;
        }
      }
    },

    RotateTray(_inc) {
      note('RotateTray() called');
      if (!this.trayIsRotating) {
        this.trayIsRotating = true;
        if (this.trayRotationTimeout) {
          clearTimeout(this.trayRotationTimeout);
          this.trayRotationTimeout = null;
        }
        if (this.getSelectedCard) this.getSelectedCard.isSelected = false;
        this.trayRotation = this.trayRotation + _inc;
        this.cardtrayRotationTimeoutRotationTimeout = setTimeout(() => {
          this.ResetTrayAfterRotation();
        }, this.longTransition);

        setTimeout(() => {
          let hint0 = document.getElementById('hint0');
          hint0.focus();
          // hint0.select();
        }, this.longTransition);
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

      let hint1 = this.hints[0];
      let hint2 = this.hints[1];
      let hint3 = this.hints[2];
      let hint4 = this.hints[3];
      let card1 = this.cards[0];
      let card2 = this.cards[1];
      let card3 = this.cards[2];
      let card4 = this.cards[3];

      card1.rotation = card2.rotation = card3.rotation = card4.rotation = this.trayRotation;

      this.cards.forEach((card) => {
        this.ResetCardAfterRotation(card);
      });

      switch (this.trayRotation) {
        case -1:
          this.hints[1] = hint3;
          this.hints[2] = hint4;
          this.hints[3] = hint2;

          this.cards[0] = card2;
          this.cards[2] = card1;
          this.cards[1] = card4;
          this.cards[3] = card3;
          break;
        case 1:
          this.hints[0] = hint4;
          this.hints[2] = hint1;
          this.hints[3] = hint3;

          this.cards[0] = card3;
          this.cards[1] = card1;
          this.cards[2] = card4;
          this.cards[3] = card2;
          break;
        default:
          break;
      }
      this.trayRotation = 0;

      this.trayIsRotating = false;
    },

    NewGame() {
      note('NewGame() called');
      this.isGuessing = false;
      this.cards = [];
      this.parkedCards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
      this.hints = [new WordObject({}), new WordObject({}), new WordObject({}), new WordObject({})];
      this.CreateCardsForPlayer(null);
    },

    LoadPage() {
      note('LoadPage() called');
      this.longTransition = parseInt(getComputedStyle(document.body).getPropertyValue('--longTransition').replace('ms', ''));
      this.shortTransition = parseInt(getComputedStyle(document.body).getPropertyValue('--shortTransition').replace('ms', ''));
      let boardPieces = [];
      if (window.location.search) {
        boardPieces = window.location.search.split('?')[1].split('=')[1].split('-');
      }

      if (boardPieces.length >= 45) {
        this.RestoreGame(boardPieces);
      } else if (!this.isGuessing) {
        this.NewGame();
      } else {
        this.FillParkingLot();
        this.ShareBoard();
      }
    },

    HandleKeyDownEvent(e) {
      note('HandleKeyUpEvent() called');
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (!this.isGuessing && this.getNumberOfHintsThatHaveBeenFilled === 4) {
            this.FillParkingLot();
          } else if (this.isGuessing && this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
          }
          break;
        case 'Tab':
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
        default:
          break;
      }
    },

    HandleOnPageHideEvent(_clearInterval = true) {
      note('HandleOnPageHideEvent() called');
      if (_clearInterval) {
        window.clearInterval(this.updateInterval);
      }

      this.appSettingsSoundFX.unload();
      if (this.appSettingsSaveSettings) {
        localStorage.setItem('storedVersion', this.currentVersion);
        // localStorage.setItem('appSettingsModes', JSON.stringify(this.appSettingsModes));
      }
    },

    HandlePointerMoveEvent(e) {
      // note('HandlePointerMoveEvent() called');
      this.ghostX = e.clientX;
      this.ghostY = e.clientY;
      if (this.isGuessing) {
        this.isDragging = this.draggedCard.words.length > 0;
      }
    },
  },

  mounted() {
    this.LoadPage();
    window.addEventListener('keydown', this.HandleKeyDownEvent);
    window.addEventListener('pointermove', this.HandlePointerMoveEvent);
  },

  computed: {
    getSelectedCard: function () {
      return this.cards.concat(this.parkedCards).find((card) => card.isSelected === true);
    },
    getAllPlayerCards: function (_value) {
      return this.cards.concat(this.parkedCards).find((card) => card.id.indexOf(_value === 0));
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
  },
});

// interact('card').draggable({
//   inertia: true,
//   modifiers: [
//     interact.modifiers.restrictRect({
//       restriction: 'parent',
//       endOnly: true,
//     }),
//   ],
//   autoScroll: true,
//   listeners: {
//     move: function (event) {
//       var target = event.target;
//       var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
//       var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

//       target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

//       target.setAttribute('data-x', x);
//       target.setAttribute('data-y', y);
//     },
//     end: function (event) {
//       var textEl = event.target.querySelector('p');
//       textEl && (textEl.textContent = 'moved a distance of ' + Math.sqrt((Math.pow(event.pageX - event.x0, 2) + Math.pow(event.pageY - event.y0, 2)) | 0).toFixed(2) + 'px');
//     },
//   },
// });
