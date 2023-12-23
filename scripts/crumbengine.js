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
    gameName: 'Facets',
    gameCatchphrase: 'A game of word association!',
    gameMode: 'nouns',
    showArticle: false,
    year: new Date().getFullYear(),
    actualCards: [],
    cards: [],
    parkedCards: [],
    hints: [],
    player: new PlayerObject({ name: 'Wil' }),
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
      if (this.isGuessing) {
      } else {
        this.FillParkingLot();
      }
    },

    FillParkingLot() {
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

    ToggleCardSelection(_card) {
      if (_card.words.length > 0) {
        let selectedState = !_card.isSelected;
        this.cards.forEach((card) => {
          card.isSelected = false;
        });
        this.parkedCards.forEach((card) => {
          card.isSelected = false;
        });
        _card.isSelected = selectedState;
      }
    },

    CreateCardsForPlayer(_player) {
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

    HandleCardTouch(_card) {
      if (this.getSelectedCard !== undefined && _card !== this.getSelectedCard) {
        if (this.getSelectedCard !== undefined) {
          let temp1 = new CardObject(_card);
          let temp2 = new CardObject(this.getSelectedCard);
          _card.words = temp2.words;
          _card.rotation = temp2.rotation;
          this.getSelectedCard.words = temp1.words;
          this.getSelectedCard.rotation = temp1.rotation;
          this.getSelectedCard.isSelected = false;
        }
      } else {
        this.ToggleCardSelection(_card);
      }
    },

    HandleCardDragStart(_card) {
      this.cards.concat(this.parkedCards).forEach((card) => {
        card.isSelected = false;
      });
      this.HandleCardTouch(_card);
    },

    HandleCardDrop(_card) {
      log('hi');
    },

    HandleCardDragOver(e, _card) {
      e.preventDefault();
    },

    RotateTrayBasedOnInputFocus(_index) {
      log('RotateCard() called');
      switch (_index) {
        case 0:
          this.trayRotation = 0;
          break;
        case 1:
          this.trayRotation = -1;
          break;
        case 2:
          this.trayRotation = -2;
          break;
        case 3:
          this.trayRotation = -3;
          break;

        default:
          break;
      }
    },

    RotateCard(e, _card, _inc) {
      log('RotateCard() called');
      e.preventDefault();
      e.stopPropagation();
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
    },

    ResetCardAfterRotation() {
      log('ResetCardAfterRotation() called');

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

    RotateTray(_inc) {
      log('RotateTray() called');
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
      }
    },

    ResetTrayAfterRotation() {
      log('ResetTrayAfterRotation() called');

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
      this.isGuessing = false;
      this.cards = [];
      this.parkedCards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
      this.hints = [new WordObject({}), new WordObject({}), new WordObject({}), new WordObject({})];
      this.CreateCardsForPlayer(null);
    },

    LoadPage() {
      this.longTransition = parseInt(getComputedStyle(document.body).getPropertyValue('--longTransition').replace('ms', ''));
      this.shortTransition = parseInt(getComputedStyle(document.body).getPropertyValue('--shortTransition').replace('ms', ''));

      if (!this.isGuessing) {
        this.NewGame();
      } else {
        this.FillParkingLot();
      }
    },

    OpenUrl(e, _url) {
      e.stopPropagation();
      e.preventDefault();

      window.open(_url);
    },

    HandleKeyUpEvent(e) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (!this.isGuessing && this.getNumberOfHintsThatHaveBeenFilled === 4) {
            this.FillParkingLot();
          } else if (this.isGuessing && this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
          }
          break;
        default:
          break;
      }
    },
  },

  mounted() {
    this.LoadPage();
    window.addEventListener('keyup', this.HandleKeyUpEvent);
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
