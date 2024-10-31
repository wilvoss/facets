/// <reference path="../models/ProgressMessageObject.js" />
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
    // app data
    appDataVersion: '1.2.039',
    appDataCards: [],
    appDataCardsParked: [],
    appDataLanguages: AllLanguages,
    appDataConfirmationObject: { message: 'Did they have the right answer?', target: 'correct' },
    appDataDraggedCard: new CardObject({}),
    appDataDraggedCardStartedInParkingLot: false,
    appDataEmptyCard: new CardObject({ id: 'ghost' }),
    appDataGameCatchphrase: 'A game of words!',
    appDataGameName: 'Facets',
    appDataGhostX: 0,
    appDataGhostY: 0,
    appDataVelocity: 0,
    appDataLastDiffX: 0,
    appDataCheckForPan: false,
    appDataInertialInterval: null,
    appDataGlobalCreatedGames: [],
    appDataHints: [],
    appDataMessage: '',
    appDataParkingInputValue: '',
    appDataPlayerCurrent: new PlayerObject({}),
    appDataPlayerCreator: new PlayerObject({}),
    appDataPlayerSender: new PlayerObject({}),
    appDataShareURL: '',
    appDataTimeoutCardRotation: null,
    appDataTimeoutTrayRotation: null,
    appDataTransitionLong: 0,
    appDataTransitionShort: 0,
    appDataWordSets: [...WordSets],
    // app state
    appStateForceAutoCheck: false,
    appStateIsDragging: false,
    appStateIsGettingTinyURL: false,
    appStateIsGettingLast10Games: false,
    appStateIsGuessing: false,
    appStateIsModalShowing: false,
    appStateIsNewVersionAvailable: false,
    appStatePageHasLoaded: false,
    appStateShowCatChooser: false,
    appStateShowConfirmation: false,
    appStateShowGlobalCreated: false,
    appStateShowInfo: false,
    appStateShowIntro: false,
    appStateShowOOBE: false,
    appStateShowSettings: false,
    appStateShowTutorial: false,
    appStateTrayIsRotating: false,
    appStateTrayRotation: 0,
    appStateUsePortraitLayout: false,
    appStateIsHorizontalPan: false,
    // current game
    currentGameGuessCount: 0,
    currentGameGuessersName: '',
    currentGameLanguage: '',
    currentGameGuessingCardCount: 4,
    currentGameGuessingWordSet: WordSets.find((m) => m.id === '100'),
    currentGameReviewIsFinal: false,
    currentGameSolutionActual: '',
    currentGameSolutionGuessing: [],
    currentGameWordSet: WordSets.find((m) => m.id === '100'),
    // user settings
    userSettingsUseExtraCard: false,
    userSettingsUsesLightTheme: false,
    userSettingsUsesSimplifiedTheme: false,
    userSettingsUseMultiColoredGems: true,
    userSettingsUseWordSetThemes: false,
    userSettingsStreaks: [],
    userSettingsFocus: false,
    userSettingsLanguage: 'en-us',
    // temp user settings
    tempName: '',
    tempID: 0,
    tempShareURLCode: '',
    tempUserSettingsUsesLightTheme: false,
    tempUserSettingsUsesSimplifiedTheme: false,
    tempUseWordSetThemes: false,
    tempWordSetName: '',
    tempUsePortraitLayout: false,
    tempUseExtraCard: false,
    tempWordSets: [],
    tempUserSettingsLanguage: 'en-us',
    // DOM reference
    documentCssRoot: document.querySelector(':root'),
  },

  methods: {
    /* === STATE MANAGEMENT === */
    ToggleShowTutorial(e) {
      note('ToggleShowTutorial() called');
      if (e != null) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.appStateShowTutorial = !this.appStateShowTutorial;
    },

    ToggleUseLightTheme(_value) {
      this.userSettingsUsesLightTheme = _value;
      if (this.userSettingsUsesLightTheme) {
        document.getElementById('themeColor').content = 'hsl(140, 100%, 89%)';
      } else {
        document.getElementById('themeColor').content = 'rgb(0, 9, 15)';
      }
    },

    ToggleUseSimplifedTheme(_value) {
      this.userSettingsUsesSimplifiedTheme = _value;
    },

    ToggleFocus() {
      if (window.innerWidth <= 660) {
        this.userSettingsFocus = !this.userSettingsFocus;
      }
    },

    async ToggleShowGlobalCreated() {
      this.appStateShowGlobalCreated = !this.appStateShowGlobalCreated;
      if (this.appDataGlobalCreatedGames.length === 0) {
        this.GetLast10GlobalCreatedGames();
      }
    },

    ToggleShowInfo(e) {
      note('ToggleShowInfo() called');
      if (e != null) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.appStateShowInfo = !this.appStateShowInfo;
    },

    SetTempLanguage(_lang) {
      note('SetTempLanguage() called');
      this.tempUserSettingsLanguage = _lang;
    },

    ToggleTempUseWordSetThemes() {
      note('ToggleTempUseWordSetThemes() called');
      this.tempUseWordSetThemes = !this.tempUseWordSetThemes;
    },

    ToggleTempUseLightTheme() {
      note('ToggleTempUseLightTheme() called');
      this.tempUserSettingsUsesLightTheme = !this.tempUserSettingsUsesLightTheme;
    },

    ToggleTempUseSimplifiedTheme() {
      note('ToggleTempUseSimplifiedTheme() called');
      this.tempUserSettingsUsesSimplifiedTheme = !this.tempUserSettingsUsesSimplifiedTheme;
    },

    ToggleTempUsePortraitLayout() {
      note('ToggleTempUsePortraitLayout() called');
      this.tempUsePortraitLayout = !this.tempUsePortraitLayout;
    },

    ToggleTempUseExtraCard() {
      note('ToggleTempUseExtraCard() called');
      this.tempUseExtraCard = !this.tempUseExtraCard;
    },

    ShowCategoryPicker() {
      this.tempWordSetName = this.getCurrentSelectedTempWordSetName;
    },

    ShowSettings() {
      note('ShowSettings() called');
      this.appStateIsModalShowing = true;
      this.appStateShowSettings = true;
      this.GetCategoryNames();
    },

    GetCategoryNames() {
      this.tempWordSets = [];
      this.tempWordSetName = this.getCurrentSelectedTempWordSetName;
      this.appDataWordSets.forEach((set) => {
        this.tempWordSets.push(new WordSetObject(set));
      });
      this.tempName = this.appDataPlayerCurrent.name;
    },

    /* === DATA MANAGEMENT === */
    SetWordSetTheme(_wordset) {
      note('SetWordSetTheme() called');
      if (this.userSettingsUseWordSetThemes) {
        this.documentCssRoot.style.setProperty('--texture2', 'url(' + _wordset.textureImage + ')');
        this.documentCssRoot.style.setProperty('--textureSize', _wordset.textureSize);
        this.documentCssRoot.style.setProperty('--textureBlendMode', _wordset.textureBlendMode);
        this.documentCssRoot.style.setProperty('--textureHue', _wordset.textureHue);
      } else {
        let textureSource = this.documentCssRoot.style.getPropertyValue('--textureSource');
        this.documentCssRoot.style.setProperty('--texture2', textureSource);
        this.documentCssRoot.style.setProperty('--textureSize', 'cover');
        this.documentCssRoot.style.setProperty('--textureBlendMode', 'normal');
        let textureHueSource = this.documentCssRoot.style.getPropertyValue('--textureHueSource');
        this.documentCssRoot.style.setProperty('--textureHue', textureHueSource);
      }
      this.documentCssRoot.style.setProperty('--wordScale', _wordset.scale);
    },

    async LoadTranslatedWords() {
      // Fetch the new words based on the selected language
      let translatedWords = await this.GetCurrentGameWordSet();

      // Create a dictionary of translated words by id
      let wordDictionary = {};
      translatedWords.forEach((word) => {
        wordDictionary[word.id] = word;
      });

      // Update the words in the cards array
      this.appDataCards.forEach((card) => {
        card.words.forEach((word) => {
          if (wordDictionary[word.id]) {
            word.value = wordDictionary[word.id].value; // Assuming 'value' holds the word text
          }
        });
      });

      this.appDataCardsParked.forEach((card) => {
        card.words.forEach((word) => {
          if (wordDictionary[word.id]) {
            word.value = wordDictionary[word.id].value; // Assuming 'value' holds the word text
          }
        });
      });
    },

    async GetCurrentGameWordSet() {
      log('GetCurrentGameWordSet() called');
      let allWords = [];
      let lang = this.userSettingsLanguage === '' ? '' : this.userSettingsLanguage + '/';
      if (this.currentGameLanguage !== '') {
        lang = this.currentGameLanguage;
      }
      let fetchPromises = this.currentGameWordSet.data.map(async (url) => {
        let modifiedUrl = url.toString().replace('./data/', './data/' + lang);
        if (this.currentGameWordSet.noLanguage) {
          modifiedUrl = url.toString().replace('./data/', './data/common/');
        }
        const response = await fetch(modifiedUrl);
        return await response.json();
      });

      try {
        let dataArrays = await Promise.all(fetchPromises);
        allWords = [].concat(...dataArrays);
      } catch (error) {
        console.error('Error:', error);
      }

      return allWords;
    },

    async GetGuessingGameWordSet() {
      log('GetGuessingGameWordSet() called');
      let lang = this.userSettingsLanguage === '' ? '' : this.userSettingsLanguage + '/';
      if (this.currentGameLanguage !== '') {
        lang = this.currentGameLanguage + '/';
      }
      let allWords = [];
      let fetchPromises = this.currentGameGuessingWordSet.data.map(async (url) => {
        const modifiedUrl = url.toString().replace('./data/', './data/' + lang);
        const response = await fetch(modifiedUrl);
        return await response.json();
      });

      try {
        let dataArrays = await Promise.all(fetchPromises);
        allWords = [].concat(...dataArrays);
      } catch (error) {
        console.error('Error:', error);
      }

      return allWords;
    },

    IsCurrentGuessCorrect() {
      note('IsCurrentGuessCorrect() called');
      if (this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
        this.currentGameGuessCount++;
        let hintValues = [];
        this.appDataHints.forEach((hint) => {
          hintValues.push(hint.value);
        });
        let actualSol = this.currentGameSolutionActual.split(':');
        let currentSol = this.GetCurrentSolutionParamString().split(':');

        let mappedSol = [];

        for (let i = 0; i < actualSol.length; i += 3) {
          for (let j = 0; j < currentSol.length; j += 3) {
            if (actualSol[i] === currentSol[j]) {
              mappedSol.push(currentSol[j], currentSol[j + 1], currentSol[j + 2]);
              break;
            }
          }
        }
        this.currentGameSolutionGuessing = mappedSol.join(':');

        if (this.currentGameSolutionActual === this.currentGameSolutionGuessing) {
          this.RotateTray(8);
        }
        if (mappedSol[1] !== actualSol[1]) {
          let card = this.appDataCards.find((card) => card.words.some((word) => word.id === parseInt(mappedSol[1])));
          this.SwapCards(card, this.getFirstAvailableParkingSpot);
        }
        if (mappedSol[2] !== actualSol[2]) {
          let card = this.appDataCards.find((card) => card.words.some((word) => word.id === parseInt(mappedSol[2])));
          this.SwapCards(card, this.getFirstAvailableParkingSpot);
        }
        if (mappedSol[10] !== actualSol[10]) {
          let card = this.appDataCards.find((card) => card.words.some((word) => word.id === parseInt(mappedSol[10])));
          this.SwapCards(card, this.getFirstAvailableParkingSpot);
        }
        if (mappedSol[11] !== actualSol[11]) {
          let card = this.appDataCards.find((card) => card.words.some((word) => word.id === parseInt(mappedSol[11])));
          this.SwapCards(card, this.getFirstAvailableParkingSpot);
        }
        this.appDataMessage = this.GetMessageBasedOnTrayCount(true, '');
        return false;
      }
    },

    async FillParkingLot() {
      note('FillParkingLot() called');
      this.appDataPlayerCreator.id = this.appDataPlayerCurrent.id;
      this.appStateIsGuessing = true;
      let temp = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
      let index = 0;
      this.currentGameSolutionActual = this.GetCurrentSolutionParamString();
      this.appDataCards.concat(this.appDataCardsParked).forEach((card) => {
        card.id = this.appDataPlayerCurrent.value + index++;
        card.rotation = (getRandomInt(0, 1) === 1 ? 1 : -1) * getRandomInt(0, 4);
      });

      this.ResetCardsAfterRotation(false);

      this.appDataCardsParked = this.appDataCards;
      let allUsedWords = [];
      this.appDataCards.forEach((card) => {
        card.words.forEach((word) => {
          allUsedWords.push(word);
        });
      });
      let wordset = await this.GetCurrentGameWordSet();

      if (this.currentGameGuessingCardCount === 5) {
        this.appDataCardsParked.push(new CardObject({ words: getUniqueWords(wordset, 4, getJustWords(allUsedWords)) }));
      }

      for (let i = this.appDataCardsParked.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [this.appDataCardsParked[i], this.appDataCardsParked[j]] = [this.appDataCardsParked[j], this.appDataCardsParked[i]];
      }
      if (this.currentGameGuessingCardCount === 4) {
        this.appDataCardsParked.push(new CardObject({}));
      }
      this.appDataCardsParked.push(new CardObject({}));

      this.appDataCards = temp;
      await this.ShareBoard(false, true);
      this.GetLast10GlobalCreatedGames();
    },

    async RestoreGame(_boardArray) {
      note('RestoreGame() called');
      var urlParams = new URLSearchParams(window.location.search);

      this.appDataPlayerSender.name = urlParams.has('sendingName') ? urlParams.get('sendingName') : this.appDataPlayerSender.name;
      this.currentGameGuessersName = this.appDataPlayerSender.name;
      this.currentGameLanguage = urlParams.has('lang') ? urlParams.get('lang') : 'en-us';
      this.appDataPlayerCreator.name = urlParams.has('puzzleName') ? urlParams.get('puzzleName') : this.appDataPlayerCreator.name;
      this.appDataPlayerSender.id = urlParams.has('sendingID') ? parseInt(urlParams.get('sendingID')) : this.appDataPlayerSender.id;
      this.appDataPlayerCreator.id = urlParams.has('puzzleID') ? parseInt(urlParams.get('puzzleID')) : this.appDataPlayerCreator.id;
      this.currentGameGuessingWordSet = urlParams.has('wordSetID') ? this.appDataWordSets.find((s) => s.id === urlParams.get('wordSetID')) : this.currentGameWordSet;
      this.currentGameGuessingCardCount = urlParams.has('useExtraCard') && JSON.parse(urlParams.get('useExtraCard')) ? 5 : 4;
      this.appStateForceAutoCheck = this.appDataPlayerCreator.id === 0;

      note('sender = ' + this.appDataPlayerSender.id);
      note('creator = ' + this.appDataPlayerCreator.id);
      note('current = ' + this.appDataPlayerCurrent.id);
      if (this.appDataPlayerSender.id !== this.appDataPlayerCreator.id && this.appDataPlayerCreator.id !== this.appDataPlayerCurrent.id && !this.appStateForceAutoCheck) {
        this.appStateIsModalShowing = true;
        this.appDataConfirmationObject = { message: 'Are you, (' + this.appDataPlayerCreator.name + '), the original creator of this puzzle?', target: 'creator' };
        this.appStateShowConfirmation = true;
      }

      let corruptData = false;
      if (_boardArray.length >= 40) {
        this.appDataShareURL = window.location.href;
        let allWords = await this.GetGuessingGameWordSet();

        this.appDataCards = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
        this.appDataCardsParked = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
        this.appDataHints = [new WordObject({}), new WordObject({}), new WordObject({}), new WordObject({})];
        let index = 0;

        this.appDataCards.forEach((card) => {
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
        this.appDataCardsParked.forEach((card) => {
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
        this.appDataHints.forEach((hint) => {
          hint.value = _boardArray[index++];
        });

        if (urlParams.has('sol')) {
          this.currentGameSolutionActual = urlParams.get('sol');
          if (urlParams.has('final')) {
            this.currentGameSolutionGuessing = this.currentGameSolutionActual;
            this.appDataMessage = this.appDataPlayerCurrent.name + ", here's the solution.";
            this.currentGameReviewIsFinal = true;
          }
        } else {
          this.currentGameSolutionActual = [];
        }

        this.SetWordSetTheme(this.currentGameGuessingWordSet);
        this.documentCssRoot.style.setProperty('--wordScale', this.currentGameGuessingWordSet.scale);
        this.appDataPlayerCurrent.role = this.appDataPlayerCreator.id === this.appDataPlayerCurrent.id && this.appDataPlayerCurrent.id !== this.appDataPlayerSender.id ? 'reviewer' : 'guesser';
      }
      this.appStateIsGuessing = true;
      if (corruptData) {
        announce('the data was corrupt');
        this.NewGame(null, '😕 - Something went wrong.');
      }
    },

    async CreateCardsForPlayer(_appDataPlayerCurrent) {
      note('CreateCardsForPlayer() called');
      let wordset = await this.GetCurrentGameWordSet();
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
        this.appDataCards.push(card);
      }
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
      this.documentCssRoot.style.setProperty('--wordScale', _wordSet.scale);
    },

    GetCurrentSolutionParamString() {
      note('GetCurrentSolutionParamString() called');
      let params = [];
      this.appDataHints.forEach((hint) => {
        hint.value = hint.value.trim();
      });
      if (this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
        params.push(this.appDataHints[0].value);
        params.push(this.appDataCards[0].words[0].id);
        params.push(this.appDataCards[1].words[0].id);

        params.push(this.appDataHints[1].value);
        params.push(this.appDataCards[1].words[1].id);
        params.push(this.appDataCards[3].words[1].id);

        params.push(this.appDataHints[2].value);
        params.push(this.appDataCards[2].words[3].id);
        params.push(this.appDataCards[0].words[3].id);

        params.push(this.appDataHints[3].value);
        params.push(this.appDataCards[3].words[2].id);
        params.push(this.appDataCards[2].words[2].id);
      }
      let param = params.join(':');
      return param;
    },

    GetUniqueCardId(_words) {
      note('GetUniqueCardId() called');
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
      note('CheckIfCardIsInTray() called');
      if (!_card.words || _card.words.length === 0) {
        return false;
      }
      this.appDataCards.forEach((card) => {
        if (this.GetUniqueCardId(card.words) === this.GetUniqueCardId(_card.words)) {
          return true;
        }
      });
      return false;
    },

    async GetLast10GlobalCreatedGames() {
      note('GetLast10GlobalCreatedGames() called');
      this.appStateIsGettingLast10Games = true;
      this.appDataGlobalCreatedGames = [];
      var requestUrl = 'https://worker-falling-frost-2926.bigtentgames.workers.dev/';
      await fetch(requestUrl, {
        headers: {
          Host: window.location.hostname,
          Origin: window.location.origin,
        },
      })
        .then((response) => {
          if (!response.ok) {
            this.appStateIsGettingLast10Games = false;
            throw new Error('Server error: ' + response.status);
          }
          return response.text();
        })
        .then((payload) => {
          this.appDataGlobalCreatedGames = JSON.parse(payload);
        })
        .catch((error) => {
          console.error('Error:', error);
          this.appStateIsGettingLast10Games = false;
        });

      this.appStateIsGettingLast10Games = false;
    },

    /* === HANDLERS === */
    HandleSubmitButtonPress() {
      note('HandleSubmitButtonPress() called');
      if (this.appDataPlayerCurrent.role === 'reviewer' && this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
        this.appStateIsModalShowing = true;
        this.appDataConfirmationObject = { message: 'Did they have the right answer?', target: 'correct' };
        this.appStateShowConfirmation = true;
      } else if (this.appStateIsGuessing) {
        if (this.appStateForceAutoCheck && this.appDataPlayerCurrent.role !== 'reviewer' && this.appStateIsGuessing && this.appDataPlayerCurrent.id !== this.appDataPlayerCreator.id) {
          this.IsCurrentGuessCorrect();
        } else {
          this.ShareBoard();
        }
      } else {
        this.FillParkingLot();
      }
    },

    HandleOldGameClick(_game) {
      let stringArray = ['?'];
      stringArray.push('sendingName=a Player');
      stringArray.push('&sendingID=' + encodeURIComponent(_game.sendingID));
      stringArray.push('&puzzleName=a Player');
      stringArray.push('&puzzleID=' + encodeURIComponent(_game.puzzleID));
      stringArray.push('&lang=' + encodeURIComponent(_game.lang));
      stringArray.push('&wordSetID=' + encodeURIComponent(_game.wordSetID));
      stringArray.push('&useExtraCard=' + encodeURIComponent(_game.useExtraCard));
      stringArray.push('&sol=' + encodeURIComponent(_game.sol));
      stringArray.push('&board=' + encodeURIComponent(_game.board));
      let searchString = stringArray.join('');
      let url = location.origin + searchString;
      console.log(url);
      history.pushState(null, null, url);
    },

    HandleGoButtonClick(event) {
      note('HandleGoButtonClick() called');
      this.SubmitSettings(event);
      this.appStateShowCatChooser = false;
    },

    HandleNewGameClick() {
      note('HandleNewGameClick() called');
      this.GetCategoryNames();
      this.appStateShowCatChooser = true;
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
        case 'creator':
          if (_value) {
            confirm = window.confirm('Are you sure you are, (' + this.appDataPlayerCreator.name + '), the original creator?');
            if (confirm) {
              this.tempID = this.appDataPlayerCreator.id;
              this.appDataPlayerCurrent.id = this.appDataPlayerCreator.id;
              this.appDataPlayerCurrent.role = 'reviewer';
              localStorage.setItem('userID', this.appDataPlayerCurrent.id);
            }
          }
          break;
        default:
          break;
      }
      this.appStateShowConfirmation = false;
      this.appStateIsModalShowing = false;
    },

    HandlePointerMoveEvent(e) {
      const diffX = e.clientX - this.appDataGhostX;
      const diffY = e.clientY - this.appDataGhostY;

      this.appDataGhostX = e.clientX;
      this.appDataGhostY = e.clientY;
      var container = document.getElementById('parking');
      if (!this.appStateIsHorizontalPan && !this.appDataCheckForPan) {
        log('checking for horizontal pan in parking lot');
        if (Math.abs(diffX) > Math.abs(diffY) && this.appDataDraggedCardStartedInParkingLot && this.userSettingsFocus) {
          this.appStateIsHorizontalPan = true;
          this.appDataDraggedCard.isSelected = false;
          this.appDataDraggedCard = this.appDataEmptyCard;
          this.appStateIsDragging = false;
        }
      } else {
      }
      this.appDataCheckForPan = true;

      if (this.appStateIsHorizontalPan && this.appDataDraggedCardStartedInParkingLot && e.target.parentElement.parentElement.id === 'parking') {
        container.scrollLeft -= diffX;
        this.appDataVelocity = diffX - this.appDataLastDiffX;
        this.appDataLastDiffX - diffX;
      }
    },

    ApplyInertia() {
      log('ApplyInertia() called');
      this.appDataInertialInterval = setInterval(() => {
        if (Math.abs(this.appDataVelocity) < 0.1) {
          clearInterval(this.appDataInertialInterval);
          return;
        }
        var currentScroll = document.getElementById('parking').scrollLeft;
        var newScroll = currentScroll - this.appDataVelocity;
        document.getElementById('parking').scrollLeft = newScroll;
        log('newScroll = ' + newScroll);
        log('document.getElementById("parking").scrollLeft = ' + document.getElementById('parking').scrollLeft);
        this.appDataVelocity *= 0.95;
      }, 16);
    },

    IsElementInsideContainer(element, container) {
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return elementRect.top >= containerRect.top && elementRect.left >= containerRect.left && elementRect.bottom <= containerRect.bottom && elementRect.right <= containerRect.right;
    },

    HandlePageVisibilityChange() {
      let id = localStorage.getItem('userID');
      if (id !== undefined && id !== null) {
        id = JSON.parse(id);
        this.appDataPlayerCurrent.id = id;
      } else {
        this.appDataPlayerCurrent.id = getRandomInt(10000000, 100000000);
        localStorage.setItem('userID', this.appDataPlayerCurrent.id);
        this.appStateShowOOBE = window.location.search !== '';
      }
      this.tempID = parseInt(this.appDataPlayerCurrent.id);

      let name = localStorage.getItem('name');
      if (name !== undefined && name !== null) {
        this.appDataPlayerCurrent.name = name;
      } else {
        this.appStateIsModalShowing = true;
        this.appStateShowIntro = true;
        setTimeout(() => {
          document.getElementById('nameInput').focus();
        }, 410);
      }

      this.appDataWordSets.forEach((m) => {
        m.isSelected = false;
      });
      let setID = localStorage.getItem('wordSet');
      if (setID !== undefined && setID !== null && this.appDataWordSets.find((m) => m.id === setID)) {
        this.currentGameWordSet = this.appDataWordSets.find((m) => m.id === setID);
      } else {
        this.currentGameWordSet = WordSets.find((m) => m.id === '100');
      }
      this.currentGameWordSet.isSelected = true;

      let language = localStorage.getItem('userSettingsLanguage');
      if (language !== undefined && language !== null) {
        this.userSettingsLanguage = language;
        this.tempUserSettingsLanguage = this.userSettingsLanguage;
      }

      let useThemes = localStorage.getItem('useWordSetThemes');
      if (useThemes !== undefined && useThemes !== null) {
        this.userSettingsUseWordSetThemes = JSON.parse(useThemes);
        this.tempUseWordSetThemes = this.userSettingsUseWordSetThemes;
        this.SetWordSetTheme(this.currentGameWordSet);
      }

      if (this.appStateIsGuessing) {
        this.documentCssRoot.style.setProperty('--wordScale', this.currentGameGuessingWordSet.scale);
      } else {
        this.documentCssRoot.style.setProperty('--wordScale', this.currentGameWordSet.scale);
      }

      let userSettingsUseExtraCard = localStorage.getItem('useExtraCard');
      if (userSettingsUseExtraCard !== undefined && userSettingsUseExtraCard !== null) {
        this.userSettingsUseExtraCard = JSON.parse(userSettingsUseExtraCard);
        this.tempUseExtraCard = this.userSettingsUseExtraCard;
      }

      let userSettingsUsesLightTheme = localStorage.getItem('userSettingsUsesLightTheme');
      if (userSettingsUsesLightTheme !== undefined && userSettingsUsesLightTheme !== null) {
        this.ToggleUseLightTheme(JSON.parse(userSettingsUsesLightTheme));
        this.tempUserSettingsUsesLightTheme = this.userSettingsUsesLightTheme;
      }

      let userSettingsUsesSimplifiedTheme = localStorage.getItem('userSettingsUsesSimplifiedTheme');
      if (userSettingsUsesSimplifiedTheme !== undefined && userSettingsUsesSimplifiedTheme !== null) {
        this.ToggleUseSimplifedTheme(JSON.parse(userSettingsUsesSimplifiedTheme));
        this.tempUserSettingsUsesSimplifiedTheme = this.userSettingsUsesSimplifiedTheme;
      }
    },

    HandleBodyPointerUp(e, _card) {
      note('HandleBodyPointerUp() called');
      if (!this.appStateIsModalShowing) {
        this.appStateIsDragging = false;
        this.appDataDraggedCard = this.appDataEmptyCard;
      } else {
        this.appDataDraggedCard.isSelected = false;
      }
      this.appDataCheckForPan = false;
      this.appStateIsHorizontalPan = false;
      this.appDataDraggedCardStartedInParkingLot = false;
      // this.ApplyInertia();
    },

    HandleBodyPointerDown(e) {
      this.appDataGhostX = e.clientX;
      this.appDataGhostY = e.clientY;
      this.appStateIsHorizontalPan = false;
      this.appDataCheckForPan = false;
      clearInterval(this.appDataInertialInterval); // Stop any ongoing inertia
    },

    HandleCardPointerDown(e, _card) {
      note('HandleCardPointerDown() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
        this.appDataGhostX = e.clientX;
        this.appDataGhostY = e.clientY;
        if (e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
        this.appDataDraggedCardStartedInParkingLot = e.target.parentElement.parentElement.id === 'parking';
      }

      this.appStateIsHorizontalPan = false;
      this.appDataCheckForPan = false;
      this.appDataDraggedCard = _card;
      this.appStateIsDragging = true;
    },

    HandleCardPointerUp(e, _card) {
      note('HandleCardPointerUp() called');
      e.preventDefault();
      e.stopPropagation();
      this.appDataMessage = '';

      if (this.getSelectedCard && this.getSelectedCard === _card) {
        this.appDataDraggedCard = this.appDataEmptyCard;
        this.appStateIsDragging = false;
        return;
      }

      if (this.appDataDraggedCard.words.length > 0 && !this.appStateIsHorizontalPan) {
        this.SwapCards(_card, this.appDataDraggedCard);
      }
      if (this.appStateIsHorizontalPan) {
        this.ApplyInertia();
      }

      if (this.appStateIsHorizontalPan) {
        this.appDataDraggedCard.isSelected = false;
        this.appDataDraggedCard = this.appDataEmptyCard;
        this.appStateIsDragging = false;
      }
      this.appDataCheckForPan = false;
      this.appStateIsHorizontalPan = false;
      this.appDataDraggedCardStartedInParkingLot = false;
    },

    HandlePickerCardClicked(e, _card) {
      note('HandlePickerCardClicked() called');
      e.preventDefault();
      e.stopPropagation();
      this.appDataMessage = '';

      if (_card === null) {
        _card = this.getFirstAvailableParkingSpot;
      }

      this.SwapCards(_card, this.appDataDraggedCard);
      this.appStateIsModalShowing = false;
    },

    CancelSettings(e) {
      note('CancelSettings() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.appStateIsModalShowing = false;
      this.appStateShowSettings = false;
      this.appStateShowIntro = false;
      this.tempID = this.appDataPlayerCurrent.id;
      this.tempUseWordSetThemes = this.userSettingsUseWordSetThemes;
      this.tempUserSettingsLanguage = this.userSettingsLanguage;
      this.tempUserSettingsUsesLightTheme = this.userSettingsUsesLightTheme;
      this.tempUseExtraCard = this.userSettingsUseExtraCard;
      this.tempUserSettingsUsesSimplifiedTheme = this.userSettingsUsesSimplifiedTheme;
    },

    HandleIntroButtonClick(e) {
      note('HandleIntroButtonClick() called');
      this.SubmitSettings(null);
      this.appStateShowOOBE = true;
    },

    SubmitSettings(e) {
      note('SubmitSettings() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.appDataPlayerCurrent.name = this.tempName !== '' ? this.tempName.trim() : this.appDataPlayerCurrent.name;
      if (!this.appStateIsGuessing) {
        this.appDataPlayerCreator.name = this.appDataPlayerCurrent.name;
      }
      localStorage.setItem('name', this.appDataPlayerCurrent.name);
      if (this.appStateShowSettings || this.appStateShowCatChooser) {
        this.userSettingsLanguage = this.tempUserSettingsLanguage;
        let newSelectedWordSet = this.tempWordSets.find((set) => set.name === this.tempWordSetName);
        this.SelectWordSet(e, newSelectedWordSet);

        let wordSetChanged = false;
        wordSetChanged = this.appDataWordSets.find((set) => set.isSelected === true).id !== this.tempWordSets.find((set) => set.isSelected === true).id;
        this.appDataWordSets = this.tempWordSets;
        this.currentGameWordSet = this.appDataWordSets.find((set) => set.isSelected === true);
        if ((wordSetChanged && !this.appStateIsGuessing) || this.appStateShowCatChooser) {
          this.NewGame();
          this.SetWordSetTheme(this.currentGameGuessingWordSet);
        }

        this.appDataPlayerCurrent.id = this.tempID;
        this.userSettingsUseWordSetThemes = this.tempUseWordSetThemes;
        // this.getCurrentGameWordSet();
        this.userSettingsUseExtraCard = this.tempUseExtraCard;
        this.ToggleUseLightTheme(this.tempUserSettingsUsesLightTheme);
        this.ToggleUseSimplifedTheme(this.tempUserSettingsUsesSimplifiedTheme);
        this.currentGameGuessingCardCount = this.userSettingsUseExtraCard ? 5 : 4;
        this.SetWordSetTheme(this.currentGameGuessingWordSet);

        localStorage.setItem('userID', this.appDataPlayerCurrent.id);
        localStorage.setItem('useWordSetThemes', this.userSettingsUseWordSetThemes);
        localStorage.setItem('userSettingsLanguage', this.userSettingsLanguage);
        localStorage.setItem('userSettingsUsesLightTheme', this.userSettingsUsesLightTheme);
        localStorage.setItem('userSettingsUsesSimplifiedTheme', this.userSettingsUsesSimplifiedTheme);
        localStorage.setItem('useExtraCard', this.userSettingsUseExtraCard);
        localStorage.setItem('wordSet', this.currentGameWordSet.id);
      }
      this.appStateIsModalShowing = false;
      this.appStateShowSettings = false;
      this.appStateShowIntro = false;
    },

    HandleKeyDownEvent(e) {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key) {
          case 'Enter':
            note('HandleKeyDownEvent() called');
            e.preventDefault();
            if (!this.appStateShowSettings && !this.appStateShowTutorial && !this.appStateShowIntro && !this.appStateShowInfo && !this.appStateShowConfirmation && !this.appStateIsGuessing && this.getNumberOfHintsThatHaveBeenFilled === 4) {
              this.FillParkingLot();
            }
            if (this.appStateShowSettings) {
              this.SubmitSettings(e);
            } else if (this.appStateShowTutorial) {
              this.appStateShowOOBE = false;
              this.ToggleShowTutorial(null);
            } else if (this.appStateShowIntro) {
              this.HandleIntroButtonClick(null);
            } else if (this.appStateShowConfirmation) {
              this.HandleYesNo(this.appDataConfirmationObject.target, true);
            } else if (this.appStateShowInfo) {
              this.appStateShowInfo = false;
            } else if (this.appStateShowGlobalCreated) {
              this.appStateShowGlobalCreated = false;
            }
            break;
          case 'Tab':
            note('HandleKeyDownEvent() called');
            e.preventDefault();
            if (!this.appStateTrayIsRotating) {
              this.RotateTray(e.shiftKey ? 1 : -1);
            }
            break;
          case ':':
          case '?':
          case '&':
          case '=':
            e.preventDefault();
            e.stopPropagation();
          case 'Escape':
            this.appStateShowOOBE = false;
            if (this.appStateShowSettings) {
              this.CancelSettings(null);
            } else if (this.appStateShowTutorial) {
              this.ToggleShowTutorial(null);
            } else if (this.appStateShowCatChooser) {
              this.appStateShowCatChooser = false;
            } else if (this.appStateShowConfirmation) {
              this.HandleYesNo(this.appDataConfirmationObject.target, false);
            } else if (this.appStateShowInfo) {
              this.appStateShowInfo = false;
            } else if (this.appStateShowGlobalCreated) {
              this.appStateShowGlobalCreated = false;
            }
            break;
          default:
        }
      }
    },

    HandleResize() {
      this.appStateUsePortraitLayout = document.body.offsetHeight > document.body.offsetWidth;
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
      console.log('HandleUpdateAppButtonClick() called');
      this.appStateIsNewVersionAvailable = false;
      // localStorage.setItem('newVersionAvailable', this.appStateIsNewVersionAvailable);
      if (this.serviceWorker) {
        // Send a message to the service worker to skip waiting
        this.serviceWorker.postMessage({ action: 'skipWaiting' });

        // Listen for the service worker to become active
        this.serviceWorker.addEventListener('controllerchange', () => {
          // Reload the page once the new service worker is active
          window.location.reload(true);
        });
      } else {
        // If no service worker, force a full page reload
        window.location.reload(true);
      }
    },

    CheckForServiceWorkerUpdate() {
      note('CheckForServiceWorkerUpdate() called');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          for (let registration of registrations) {
            registration.update();
          }
        });
      }
    },

    HandleServiceWorkerUnregistration() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          // Loop through each registration
          for (let registration of registrations) {
            // Unregister the service worker
            registration.unregister();
            // Reload the page to remove the service worker
            registration.active.postMessage('SKIP_WAITING');
          }
        });
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
                    this.appStateIsNewVersionAvailable = true;
                    // localStorage.setItem('newVersionAvailable', this.appStateIsNewVersionAvailable);
                  }
                  break;
              }
            });
          });
        });
      }
    },

    /* === COMMUNICATION === */
    ShareWin() {
      note('ShareWin() called');
      let text = this.appDataPlayerCreator.name + ', I got it in ' + this.currentGameGuessCount + ' tries! 😀';
      this.ConstructAndSetShareURLForCurrentGame();
      if (this.currentGameGuessCount === 1) {
        text = this.appDataPlayerCreator.name + ', I got it in 1 try! 🔥';
      }
      this.ShareText(text, '');
    },

    async CopyTextToClipboard(_text) {
      if (navigator.clipboard) {
        if (window.ClipboardItem) {
          // ClipboardItem is available
          await navigator.clipboard
            .write([
              new ClipboardItem({
                'text/plain': new Blob([_text], { type: 'text/plain' }),
              }),
            ])
            .then(() => {
              note('Attempting to copy via navigator.clipboard.write');
              this.appDataMessage = 'Message copied to the clipboard.';
            })
            .catch((err) => {
              error('Failed to copy text via navigator.clipboard.write: ', err);
              this.CopyToClipboardViaExecCommand(_text);
            });
        } else {
          // ClipboardItem is not available, use writeText
          await navigator.clipboard
            .writeText(_text)
            .then(() => {
              note('Attempting to copy via navigator.clipboard.writeText');
              this.appDataMessage = 'Message copied to the clipboard.';
            })
            .catch((err) => {
              error('Failed to copy text via navigator.clipboard.writeText: ', err);
              this.CopyToClipboardViaExecCommand(_text);
            });
        }
      } else {
        this.CopyToClipboardViaExecCommand(_text);
      }
    },

    async CopyToClipboardViaExecCommand(_text) {
      note('Attempting to copy via execCommand');
      let result = copyToClipboard(_text);
      log(result);
      this.appDataMessage = '';
    },

    async ShareText(_text, _url) {
      note('ShareText() called with this text:');
      this.appDataMessage = '';
      note(_text);
      note(_url);

      let _shareObject = {
        text: _text + (_url === '' ? '' : ' <' + _url + '>'),
      };

      if (navigator.canShare && !navigator.canShare(_shareObject)) {
        _shareObject = {
          text: _text,
          url: _url === '' ? window.location.origin : _url,
        };
      }
      if (navigator.share && navigator.canShare(_shareObject)) {
        await navigator
          .share(_shareObject)
          .then((result) => {
            console.log('Message shared via navigator.share()');
          })
          .catch((err) => {
            this.CopyTextToClipboard(_text + (_url === '' ? '' : ' <' + _url + '>'));
            console.error('Failed to share via navigator.share(): ', err);
          });
      } else {
        // fall back to clipboard
        this.CopyTextToClipboard(_text + (_url === '' ? '' : ' <' + _url + '>'));
      }
    },

    async ShareBoard(_gotIt = false, _isNew = false) {
      note('ShareBoard() called');
      if (this.isChromeAndiOSoriPadOS && this.appDataShareURL.indexOf('facets.bigtentgames.com/game/?') !== -1) {
        this.CopyTextToClipboard(this.GetShareTextBasedOnContext(_gotIt) + ' <' + this.appDataShareURL + '>');
        note('Shortened URL exists, copying to clipboard');
      } else {
        let currentGameReviewIsFinal = this.appDataPlayerCurrent.role === 'reviewer' && this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4;
        let text = this.GetShareTextBasedOnContext(_gotIt);
        this.ConstructAndSetShareURLForCurrentGame(currentGameReviewIsFinal, _isNew);

        this.appStateIsGettingTinyURL = true;
        var corsflareUrl = 'https://worker-winter-glade-cd02.bigtentgames.workers.dev/';
        var requestUrl = corsflareUrl + location.search.substring(1);

        note('Fetching short url');
        await fetch(requestUrl, {
          method: 'POST',
          headers: {
            Host: window.location.hostname,
            Origin: window.location.origin,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Server error: ' + response.status);
            }
            return response.text();
          })
          .then((shortUrlParam) => (this.appDataShareURL = location.origin + '/game/?' + shortUrlParam))
          .catch((error) => console.error('Error:', error));

        this.appStateIsGettingTinyURL = false;

        this.ShareText(text, this.appDataShareURL);
      }
    },

    ReportPuzzle(_game) {
      location.href = 'mailto:bigtentgames@icloud.com?subject=Facets Puzzle Reported&body=Puzzle ID# ' + _game.key + '%0D%0A This puzzle contains offensive language.%0D%0A' + _game.hints;
    },

    ConstructAndSetShareURLForCurrentGame(_currentGameReviewIsFinal, _isNew = false) {
      note('ConstructAndSetShareURLForCurrentGame() called');
      if (this.appStateIsGuessing) {
        this.currentGameSolutionGuessing = '';
        let urlString = '';
        let boardString = '';
        this.appDataCards.concat(this.appDataCardsParked).forEach((card) => {
          if (card.words.length === 0) {
            boardString += '::::';
          }
          card.words.forEach((word) => {
            boardString += word.id + ':';
          });
        });

        this.appDataHints.forEach((hint, index) => {
          hint.value = hint.value.trim();
          let encodedHint = encodeURIComponent(hint.value);
          boardString += encodedHint + (index === this.appDataHints.length - 1 ? '' : ':');
        });

        urlString = encodeURIComponent(urlString);
        urlString += '?sendingName=' + encodeURIComponent(this.appDataPlayerCurrent.name);
        urlString += '&puzzleName=' + encodeURIComponent(this.appDataPlayerCreator.name);
        urlString += '&puzzleID=' + encodeURIComponent(this.appDataPlayerCreator.id);
        urlString += '&lang=' + (_isNew === false ? encodeURIComponent(this.currentGameLanguage) : encodeURIComponent(this.userSettingsLanguage));
        urlString += '&wordSetID=' + encodeURIComponent(this.currentGameGuessingWordSet.id);
        if (_isNew) {
          urlString += '&isNew=true';
        }
        urlString += '&sendingID=' + encodeURIComponent(this.appDataPlayerCurrent.id);
        urlString += '&useExtraCard=' + encodeURIComponent(this.currentGameGuessingCardCount === 5);
        urlString += '&sol=' + encodeURIComponent(this.currentGameSolutionActual);
        if (_currentGameReviewIsFinal) {
          urlString += '&final=true';
        }
        urlString = window.location.origin + window.location.pathname + urlString + '&board=' + boardString;
        this.appDataShareURL = urlString;
        history.pushState(null, null, this.appDataShareURL);
      }
    },

    GetMessageBasedOnTrayCount(_gotIt, _name) {
      note('GetMessageBasedOnTrayCount() called');
      let index = this.getNumberOfCardsThatHaveBeenPlacedOnTray;
      let pretext = '';
      if (this.appDataPlayerCurrent.role === 'reviewer' && this.getNumberOfCardsThatHaveBeenPlacedOnTray < 4) {
        pretext = index + '/4 ';
      }
      if (index === 4 && this.appDataPlayerCurrent.role === 'reviewer' && !_gotIt) {
        index = 5;
      }
      let levelMessage = LevelMessage[index][getRandomInt(0, LevelMessage[index].length)];
      let usingName = _name !== '';
      let name = !usingName ? '' : _name + ', ';
      let useLowerCase = usingName && levelMessage.indexOf('I ') !== 0;
      levelMessage = useLowerCase ? levelMessage.toLowerCase() : levelMessage;
      let message = pretext + LevelEmoji[index][getRandomInt(0, LevelEmoji[index].length)] + ' ' + name + levelMessage;
      announce(message);
      return message;
    },

    GetShareTextBasedOnContext(_gotIt) {
      note('GetShareTextBasedOnContext() called');
      let text = '';
      let pretext = this.currentGameGuessingWordSet.startsWithVowel ? 'an ' : 'a ';
      pretext = this.currentGameGuessingCardCount === 5 ? 'a ' : pretext;
      if (this.appDataPlayerCurrent.id === this.appDataPlayerSender.id && this.appDataPlayerCurrent.id === this.appDataPlayerCreator.id) {
        text = '🧠' + this.currentGameGuessingWordSet.emoji + (this.currentGameGuessingCardCount === 5 ? '⭐️' : '') + ' I created ' + pretext + (this.currentGameGuessingCardCount === 5 ? '5-card ' : '') + '"' + this.currentGameGuessingWordSet.name + '" word puzzle for you to solve!';
      } else if (this.appDataPlayerCurrent.role === 'reviewer') {
        text = this.GetMessageBasedOnTrayCount(_gotIt, this.currentGameGuessersName);
      } else {
        text = '🤔 ' + this.appDataPlayerCreator.name + ", here's my guess!";
      }
      return text;
    },

    /* === CARD MANIPULATION === */
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
        this.appDataCards.concat(this.appDataCardsParked).forEach((card) => {
          card.justDropped = false;
        });
      }, this.appDataTransitionLong);

      this.appStateIsDragging = false;
      this.appDataDraggedCard = this.appDataEmptyCard;

      this.ConstructAndSetShareURLForCurrentGame();
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

      this.appDataCards.forEach((card) => {
        card.isSelected = false;
        card.isInTray = true;
        card.justDropped = false;
      });

      this.appDataCardsParked.forEach((card) => {
        card.isSelected = false;
        card.isInTray = false;
        card.justDropped = false;
      });

      _card.isSelected = _card.words.length === 0 ? false : selectedState;

      if (document.body.offsetHeight <= 660 && !this.appStateIsModalShowing) {
        this.appStateIsModalShowing = true;
      }

      if (_card.isSelected) {
        this.appDataDraggedCard = _card;
        warn('appDataDraggedCard card has been assigned on card click');
      }
    },

    RotateCard(e, _card, _inc) {
      note('RotateCard() called');
      e.preventDefault();
      e.stopPropagation();
      this.appDataTransitionShort = parseInt(getComputedStyle(document.body).getPropertyValue('--mediumTransition').replace('ms', ''));
      if (this.appStateIsGuessing && (!this.userSettingsFocus || (this.userSettingsFocus && e.target.parentElement.parentElement.id !== 'parking'))) {
        this.appDataMessage = '';
        if (this.appDataTimeoutCardRotation) {
          clearTimeout(this.appDataTimeoutCardRotation);
          this.appDataTimeoutCardRotation = null;
        }
        _card.isSelected = false;
        _card.rotation = _card.rotation + _inc;
        _card.isRotating = true;
        this.appDataTimeoutCardRotation = setTimeout(() => {
          this.ResetCardsAfterRotation();
        }, this.appDataTransitionShort);
      }
    },

    ResetCardsAfterRotation(_contructURL = true) {
      note('ResetCardsAfterRotation() called');

      this.appDataCards.concat(this.appDataCardsParked).forEach((card) => {
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
      if (this.appStateIsGuessing && _contructURL) {
        this.ConstructAndSetShareURLForCurrentGame();
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
      if (!this.appStateTrayIsRotating) {
        this.appDataMessage = '';
        this.appStateTrayIsRotating = true;
        if (this.appDataTimeoutTrayRotation) {
          clearTimeout(this.appDataTimeoutTrayRotation);
          this.appDataTimeoutTrayRotation = null;
        }
        if (this.getSelectedCard) this.getSelectedCard.isSelected = false;
        this.appStateTrayRotation = this.appStateTrayRotation + _inc;
        document.getElementById('parkingInput').focus();
        this.appDataTimeoutTrayRotation = setTimeout(() => {
          this.ResetTrayAfterRotation();
        }, this.appDataTransitionLong);

        if (!this.appStateIsGuessing) {
          setTimeout(() => {
            let hint0 = document.getElementById('hint0');
            this.appDataParkingInputValue = '';
            hint0.focus();
          }, this.appDataTransitionLong);
        }
      }
    },

    ResetTrayAfterRotation() {
      note('ResetTrayAfterRotation() called');
      this.appStateTrayIsRotating = false;
      this.appDataParkingInputValue = '';

      if (this.appStateTrayRotation < 3) {
        if (this.appStateTrayRotation !== 0) {
          let len = this.appDataHints.length;
          if (len > 0) {
            let shift = ((this.appStateTrayRotation % len) + len) % len;
            this.appDataHints = this.appDataHints.slice(-shift).concat(this.appDataHints.slice(0, -shift));
          }
        }

        let hint0 = this.appDataHints[0];
        let hint1 = this.appDataHints[1];
        let hint2 = this.appDataHints[2];
        let hint3 = this.appDataHints[3];
        let card0 = this.appDataCards[0];
        let card1 = this.appDataCards[1];
        let card2 = this.appDataCards[2];
        let card3 = this.appDataCards[3];

        card0.rotation = card1.rotation = card2.rotation = card3.rotation = this.appStateTrayRotation;

        this.ResetCardsAfterRotation(false);

        switch (this.appStateTrayRotation) {
          case -1:
            this.appDataHints[0] = hint0;
            this.appDataHints[1] = hint2;
            this.appDataHints[2] = hint3;
            this.appDataHints[3] = hint1;

            this.appDataCards[0] = card1;
            this.appDataCards[2] = card0;
            this.appDataCards[1] = card3;
            this.appDataCards[3] = card2;
            break;
          case 1:
            this.appDataHints[0] = hint3;
            this.appDataHints[1] = hint1;
            this.appDataHints[2] = hint0;
            this.appDataHints[3] = hint2;

            this.appDataCards[0] = card2;
            this.appDataCards[1] = card0;
            this.appDataCards[2] = card3;
            this.appDataCards[3] = card1;
            break;
          case 2:
          case -2:
            this.appDataHints[0] = hint1;
            this.appDataHints[1] = hint0;
            this.appDataHints[2] = hint3;
            this.appDataHints[3] = hint2;

            this.appDataCards[0] = card3;
            this.appDataCards[1] = card2;
            this.appDataCards[2] = card1;
            this.appDataCards[3] = card0;
            break;
          default:
            break;
        }

        this.ConstructAndSetShareURLForCurrentGame();
      }
      this.appStateTrayRotation = 0;
    },

    /* === INITIALIZATION === */
    async NewGame(e, _appDataMessage = '', _rotate = true) {
      note('NewGame() called');
      document.title = 'Facets!';
      this.appDataMessage = _appDataMessage;
      this.currentGameGuessCount = 0;
      this.currentGameLanguage = '';
      this.currentGameReviewIsFinal = false;
      this.currentGameGuessersName = '';
      this.appDataPlayerCurrent.role = 'creator';
      this.appDataPlayerCreator.id = this.appDataPlayerCurrent.id;
      this.appDataPlayerCreator.name = this.appDataPlayerCurrent.name;
      this.appDataPlayerSender.id = this.appDataPlayerCurrent.id;
      this.appDataPlayerSender.name = this.appDataPlayerCurrent.name;
      this.currentGameGuessingWordSet = this.currentGameWordSet;
      this.currentGameGuessingCardCount = this.userSettingsUseExtraCard ? 5 : 4;
      this.currentGameSolutionGuessing = '';
      this.appStateTrayIsRotating = false;
      this.appStateForceAutoCheck = false;
      this.SetWordSetTheme(this.currentGameWordSet);
      this.appDataShareURL = '';
      history.pushState(null, null, window.location.origin + window.location.pathname);
      this.appStateIsGuessing = false;
      this.appDataCards = [];
      this.appDataCardsParked = [new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({}), new CardObject({})];
      this.appDataHints = [new WordObject({}), new WordObject({}), new WordObject({}), new WordObject({})];
      await this.CreateCardsForPlayer(null);

      if (_rotate) {
        this.RotateTray(-4);
      }
    },

    LoadPage() {
      note('LoadPage() called');
      this.HandlePageVisibilityChange();
      announce('Player ' + this.appDataPlayerCurrent.id + ' has initiated the game - appDataVersion v' + this.appDataVersion);
      this.GetLast10GlobalCreatedGames();
      this.appDataTransitionLong = parseInt(getComputedStyle(document.body).getPropertyValue('--longTransition').replace('ms', ''));
      this.appDataTransitionShort = parseInt(getComputedStyle(document.body).getPropertyValue('--shortTransition').replace('ms', ''));
      this.appStatePageHasLoaded = true;

      let boardPieces = [];
      try {
        if (window.location.search) {
          var urlParams = new URLSearchParams(window.location.search);
          UseDebug = urlParams.has('useDebug') ? true : UseDebug;
          let search = decodeURIComponent(window.location.search);
          params = search.split('?')[1].split('&');
          boardPieces = urlParams.has('board') ? urlParams.get('board').split(':') : [];
        }

        if (boardPieces.length >= 40) {
          document.title = 'Facets!';
          this.RestoreGame(boardPieces);
        } else if (!this.appStateIsGuessing) {
          this.NewGame(null, '', false);
        }
      } catch (e) {
        warn(e.message);
        boardPieces = [];
        this.NewGame(null, '😕 - Something went wrong.', false);
      }

      this.appStateUsePortraitLayout = document.body.offsetHeight > document.body.offsetWidth;
    },
  },

  mounted() {
    this.HandleServiceWorkerUnregistration();
    this.LoadPage();
    window.addEventListener('keydown', this.HandleKeyDownEvent);
    window.addEventListener('pointermove', this.HandlePointerMoveEvent);
    window.addEventListener('visibilitychange', this.HandlePageVisibilityChange);
    window.addEventListener('resize', this.HandleResize);
    window.addEventListener('popstate', this.HandlePopState);
  },

  watch: {
    userSettingsLanguage: function (newLang, oldLang) {
      highlight('userSettingsLanguage watch triggered');
      this.LoadTranslatedWords();
    },
  },

  computed: {
    getSelectedCard: function () {
      return this.appDataCards.concat(this.appDataCardsParked).find((card) => card.isSelected === true);
    },
    getAllPlayerCards: function (_value) {
      return this.appDataCards.concat(this.appDataCardsParked).find((card) => card.id.indexOf(_value === 0));
    },
    getAllCards: function () {
      let newArray = this.appDataCards.concat(this.appDataCardsParked).filter((card) => card.words.length > 0);

      newArray.forEach((card) => {
        card.id = this.GetUniqueCardId(card.words);
      });
      newArray = newArray.sort((a, b) => a.id - b.id);
      return newArray;
    },
    getFirstThreeParkedCards: function () {
      return this.appDataCardsParked.splice(0, 3);
    },
    getNumberOfCardsThatHaveBeenPlacedOnTray: function () {
      return this.appDataCards === undefined ? 0 : this.appDataCards.filter((card) => card.words.length > 0).length;
    },
    getNumberOfHintsThatHaveBeenFilled: function () {
      return this.appDataHints === undefined ? 0 : this.appDataHints.filter((hint) => hint.value != '').length;
    },
    getUniqueCardId: function (_words) {
      return this.GetUniqueCardId(_words);
    },
    getFirstAvailableParkingSpot: function () {
      return this.appDataCardsParked.find((card) => card.words.length === 0);
    },
    getPlayerMessage: function () {
      let pronoun = this.currentGameGuessingWordSet.startsWithVowel ? 'an "' : 'a "';
      let name = this.appStateForceAutoCheck ? pronoun : this.appDataPlayerCreator.name + '\'s "';
      let text = 'Guessing ' + name + this.currentGameGuessingWordSet.name + '" puzzle!';
      if (!this.appStateIsGuessing) {
        text = this.appDataPlayerCurrent.name + ', you are creating a new "' + this.currentGameGuessingWordSet.name + '" puzzle!';
      } else {
        if (this.appDataPlayerCurrent.id === this.appDataPlayerSender.id && this.appDataPlayerCurrent.id === this.appDataPlayerCreator.id) {
          text = this.appDataPlayerCurrent.name + ', this is your own puzzle!';
        } else if (this.appDataPlayerCurrent.id !== this.appDataPlayerSender.id && this.appDataPlayerCurrent.id === this.appDataPlayerCreator.id) {
          text = this.appDataPlayerCurrent.name + ', you are reviewing ' + this.appDataPlayerSender.name + "'s guess!";
        }
      }
      return text;
    },
    getEnabledWordSets: function () {
      return this.appDataWordSets.filter((set) => set.enabled);
    },
    getEnabledTempWordSets: function () {
      return this.tempWordSets.filter((set) => set.enabled);
    },
    getEnabledTempWordSetNames: function () {
      let names = [];
      this.appDataWordSets.forEach((set) => {
        if (set.enabled) {
          names.push(set.name);
        }
      });
      return names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    },
    getEnabledTempLanguages: function () {
      let names = [];
      this.appDataLanguages.forEach((lang) => {
        if (lang.enabled) {
          names.push({ name: lang.name, tag: lang.tag });
        }
      });
      console.log(names);
      return names.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    },
    getCurrentSelectedTempWordSetName: function () {
      return this.appDataWordSets.find((set) => set.isSelected).name;
    },
    getSubmitButtonText: function () {
      let text = 'Send Guess';

      if (this.appDataPlayerCurrent.role === 'reviewer') {
        text = 'Send Back';
      } else if (this.appDataPlayerCurrent.role === 'creator') {
        text = 'Send Game';
      }

      if (this.appDataPlayerCurrent.id !== this.appDataPlayerCreator.id) {
        if (this.appStateForceAutoCheck) {
          text = 'Check Now';
        }
        if (this.isChromeAndiOSoriPadOS && this.appDataShareURL.includes('facets.bigtentgames.com/game/?')) {
          text = 'Copy';
        }
      }

      return text;
    },
    getCreatedGamesWithWordSetNames: function () {
      return this.appDataGlobalCreatedGames.map((game) => {
        const newArray = this.appDataWordSets.find((set) => set.id === game.wordSetID);
        return newArray ? { ...game, name: newArray.name } : game;
      });
    },
    isChromeAndiOSoriPadOS: function () {
      note('isChromeAndiOSoriPadOS() called');
      var userAgent = navigator.userAgent || window.opera;
      announce(userAgent);
      var isChromeIOS = /CriOS/.test(userAgent) && /iPhone|iPad|iPod/.test(userAgent);
      warn(isChromeIOS);
      userAgent = userAgent.toLowerCase();
      return isChromeIOS || (userAgent.includes('firefox') && userAgent.includes('android'));
    },
  },
});
