/// <reference path="../models/WordObject.js" />
/// <reference path="../models/CardObject.js" />

Vue.config.devtools = false;
Vue.config.silent = true;

Vue.config.ignoredElements = ['app', 'preload', 'notification', 'message', 'icon', 'subtitle', 'badge', 'modal', 'controls', 'hider', 'confirmation', 'checkbox', 'toggle', 'legal', 'credit', 'version', 'categories', 'category', 'leftright', 'small', 'callout', 'instructions', 'gamelinks', 'gamelink', 'stats', 'stat', 'value', 'flogo', 'count', 'rotators', 'ghost', 'card', 'words', 'word', 'parking', 'spot', 'tray', 'diamond', 'hints', 'hint', 'cards'];

var app = new Vue({
  el: '#app',
  data: {
    //#region APP DATA
    appDataVersion: '2.1.44',
    appDataActionButtonTexts: { send: 'Send', guess: 'Guess', reply: 'Reply', copy: 'Copy', respond: 'Respond', create: 'Create', share: 'Share', quit: 'Give up' },
    appDataCards: [],
    appDataCardsParked: [],
    appDataLanguages: AllLanguages,
    appDataConfirmationObject: { message: 'Did they have the right answer?', target: 'correct' },
    appDataDraggedCard: new CardObject({}),
    appDataDraggedCardStartedInParkingLot: false,
    appDataEmptyCard: new CardObject({ id: 'ghost' }),
    appDataGameCatchphrase: 'A Puzzle Game of Words and Wits!',
    appDataGameName: 'Facets',
    appDataGhostX: 0,
    appDataGhostY: 0,
    appDataParkingScrollLeft: 0,
    appDataGlobalCreatedGames: [],
    appDataDailyGames: [],
    appDataUserDailyGamesStarted: [],
    appDataHints: [],
    appDataMessage: '',
    appDataParkingInputValue: '',
    appDataPlayerCurrent: new PlayerObject({}),
    appDataPlayerCreator: new PlayerObject({}),
    appDataPlayerSender: new PlayerObject({}),
    appDataShareURL: '',
    appDataTimeoutCardRotation: null,
    appDataTimeoutTrayRotation: null,
    appDataTimeoutNotification: null,
    appDataTransitionLong: 0,
    appDataTransitionShort: 0,
    appDataWordSets: [...WordSets],
    appCurrentDailyGameKey: -1,
    appDailyIsFreshToday: true,
    appDataNumberOfNewDailies: 1,
    appDataDailyGamesStats: [],
    appDataInc: 0,
    //#endregion

    //#region STATE MANAGEMENT
    appStateForceAutoCheck: false,
    appStateIsDragging: false,
    appStateIsGettingTinyURL: false,
    appStateIsGettingLast10Games: false,
    appStateIsGettingDailyGames: false,
    appStateIsGettingDailyGameStats: false,
    appStateIsGettingUserStats: false,
    appStateSolving: false,
    appStateIsGuessing: false,
    appStateIsModalShowing: false,
    appStateIsNewVersionAvailable: false,
    appStatePageHasLoaded: false,
    appStateShowCatChooser: false,
    appStateShowConfirmation: false,
    appStateShowGlobalCreated: false,
    appStateShowDailyGames: false,
    appStateShowInfo: false,
    appStateShowIntro: false,
    appStateShowOOBE: false,
    appStateShowStats: false,
    appStateShowSettings: false,
    appStateShowTutorial: false,
    appStateTrayIsRotating: false,
    appStateTrayRotation: 0,
    appStateUsePortraitLayout: false,
    appStateShowNotification: false,
    appParkingRightButtonDisabled: false,
    appStateShowMeta: true,
    vsShowDaily: true,
    appStateUseFlower: false,
    appStateBrowserNotificationInterval: null,
    appStateShareError: false,
    //#endregion

    //#region CURRENT GAME
    currentGameGuessCount: 0,
    currentGameGuessersName: '',
    currentGameLanguage: '',
    currentGameGuessingCardCount: 4,
    currentGameGuessingWordSet: WordSets.find((m) => m.id === '100'),
    currentGameReviewIsFinal: false,
    currentGameSolutionActual: '',
    currentGameSolutionGuessing: [],
    currentGameWordSet: WordSets.find((m) => m.id === '100'),
    //#endregion

    //#region USER SETTINGS
    userSettingsUseExtraCard: false,
    userSettingsUsesLightTheme: false,
    userSettingsUsesSimplifiedTheme: false,
    userSettingsUseMultiColoredGems: true,
    userSettingsUseWordSetThemes: true,
    userSettingsUserWantsDailyReminder: false,
    userSettingsShowAllCards: false,
    userSettingsStreaks: [],
    vsUseFocus: true,
    userSettingsLanguage: 'en-us',
    userSettingsLegalAccepted: false,
    //#endregion

    //#region TEMP USER SETTINGS
    tempName: '',
    tempID: 0,
    tempShareURLCode: '',
    tempUseMultiColoredGems: true,
    tempUserSettingsUsesLightTheme: false,
    tempUserSettingsUsesSimplifiedTheme: false,
    tempUserSettingsShowAllCards: false,
    tempUseWordSetThemes: true,
    tempUserWantsDailyReminder: false,
    tempWordSetName: '',
    tempUsePortraitLayout: false,
    tempUseExtraCard: false,
    tempWordSets: [],
    tempUserSettingsLanguage: 'en-us',
    //#endregion

    //#region DOM REFERENCE
    documentCssRoot: document.querySelector(':root'),
    cssStyles: window.getComputedStyle(document.querySelector(':root')),
    //#endregion
  },

  methods: {
    //#region STATE MANAGEMENT
    ToggleShowTutorial(e) {
      note('ToggleShowTutorial() called');
      if (e != null) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.appStateShowTutorial = !this.appStateShowTutorial;
    },

    ToggleUseLightTheme(_value) {
      note('ToggleUseLightTheme() called');
      this.userSettingsUsesLightTheme = _value;
      if (this.userSettingsUsesLightTheme) {
        document.getElementById('themeColor').content = 'hsl(140, 100%, 92%)';
      } else {
        document.getElementById('themeColor').content = 'hsl(215, 100%, 3%)';
      }
    },

    ToggleUseSimplifedTheme(_value) {
      note('ToggleUseSimplifedTheme() called');
      this.userSettingsUsesSimplifiedTheme = _value;
      if (this.userSettingsUsesSimplifiedTheme) {
        this.tempUseMultiColoredGems = true;
      }
    },

    ToggleShowAllCards(_value) {
      note('ToggleShowAllCards() called');
      this.userSettingsShowAllCards = _value;
    },

    ToggleFocus() {
      note('ToggleFocus() called');
      if (window.innerWidth <= 660) {
        this.vsUseFocus = !this.vsUseFocus;
      }
    },

    async ToggleShowGlobalCreated(e) {
      note('ToggleShowGlobalCreated() called');
      if (e != null) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.appStateShowGlobalCreated = !this.appStateShowGlobalCreated;
      if (this.appDataGlobalCreatedGames.length === 0) {
        this.GetLast10GlobalCreatedGames();
      }
    },

    async ToggleShowDailyGames(e) {
      note('ToggleShowDailyGames() called');
      if (e != null) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.appStateShowDailyGames = !this.appStateShowDailyGames;
      if (this.appStateShowDailyGames) {
        this.GetDailyGameStats();
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

    ToggleShowMeta(e) {
      note('ToggleShowMeta() called');
      if (e != null) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.appStateShowMeta = !this.appStateShowMeta;
    },

    SetTempLanguage(_lang) {
      note('SetTempLanguage() called');
      this.tempUserSettingsLanguage = _lang;
    },

    ToggleTempUseWordSetThemes() {
      note('ToggleTempUseWordSetThemes() called');
      this.tempUseWordSetThemes = !this.tempUseWordSetThemes;
    },

    async ToggleTempUserWantsDailyReminder() {
      note('ToggleTempUserWantsDailyReminder() called');

      this.tempUserWantsDailyReminder = !this.tempUserWantsDailyReminder;

      if (this.tempUserWantsDailyReminder && !this.getUserAcceptedNotificationsPermission) {
        let confirmed = await this.EnableDailyReminders();
        if (confirmed) {
          this.userSettingsUserWantsDailyReminder = this.tempUserWantsDailyReminder = true;
        } else {
          this.userSettingsUserWantsDailyReminder = this.tempUserWantsDailyReminder = false;
        }
      }
    },

    ToggleTempUseLightTheme() {
      note('ToggleTempUseLightTheme() called');
      this.tempUserSettingsUsesLightTheme = !this.tempUserSettingsUsesLightTheme;
    },

    ToggleTempUseSimplifiedTheme() {
      note('ToggleTempUseSimplifiedTheme() called');
      this.tempUserSettingsUsesSimplifiedTheme = !this.tempUserSettingsUsesSimplifiedTheme;
    },

    ToggleTempShowAllCards() {
      note('ToggleTempShowAllCards() called');
      this.tempUserSettingsShowAllCards = !this.tempUserSettingsShowAllCards;
    },

    ToggleTempUsePortraitLayout() {
      note('ToggleTempUsePortraitLayout() called');
      this.tempUsePortraitLayout = !this.tempUsePortraitLayout;
    },

    ToggleTempUseMultiColoredGems() {
      note('ToggleTempUseMultiColoredGems() called');
      this.tempUseMultiColoredGems = !this.tempUseMultiColoredGems;
    },

    ToggleTempUseExtraCard() {
      note('ToggleTemp≈UseExtraCard() called');
      this.tempUseExtraCard = !this.tempUseExtraCard;
    },

    ShowCategoryPicker() {
      note('ShowCategoryPicker() called');
      this.tempWordSetName = this.getCurrentSelectedTempWordSetName;
    },

    ShowSettings(e) {
      note('ShowSettings() called');
      if (e != null) {
        e.stopPropagation();
        e.preventDefault();
      }
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
    //#endregion

    //#region DATA MANAGEMENT
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
      note('LoadTranslatedWords() called');
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
      note('GetCurrentGameWordSet() called');
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
      } catch (e) {
        error(e);
      }

      return allWords;
    },

    async GetGuessingGameWordSet() {
      note('GetGuessingGameWordSet() called');
      let lang = this.userSettingsLanguage === '' ? '' : this.userSettingsLanguage + '/';
      if (this.currentGameLanguage !== '') {
        lang = this.currentGameLanguage + '/';
      }
      let allWords = [];
      let fetchPromises = this.currentGameGuessingWordSet.data.map(async (url) => {
        let modifiedUrl = url.toString().replace('./data/', './data/' + lang);
        if (this.currentGameGuessingWordSet.noLanguage) {
          modifiedUrl = url.toString().replace('./data/', './data/common/');
        }
        const response = await fetch(modifiedUrl);
        return await response.json();
      });

      try {
        let dataArrays = await Promise.all(fetchPromises);
        allWords = [].concat(...dataArrays);
      } catch (e) {
        error(e);
      }

      return allWords;
    },

    UpdateGameGuessesCount(_game, _solved = false) {
      note('UpdateGameGuessesCount() called');
      let startedGame = this.GetUserStartedGame(_game);
      if (startedGame && !startedGame.solved) {
        startedGame.solved = _solved;
        if (!this.getCurrentDaily.quit) {
          startedGame.guesses++;
        } else {
          startedGame.quit = true;
        }
        localStorage.setItem('dailyGames', JSON.stringify(this.appDataUserDailyGamesStarted));
      }
      this.UpdateDailyGameFromStartedGameData(startedGame);
    },

    async UpdateDailyGameFromStartedGameData(_gamestarted) {
      note('UpdateDailyGameFromStartedGameData() called');
      let foundGame = this.appDataDailyGames.find((game) => {
        return game.key === _gamestarted.key;
      });
      foundGame.guesses = _gamestarted.guesses;
      foundGame.solved = _gamestarted.solved;
      if (this.getCurrentDaily.quit) {
        foundGame.quit = true;
      }

      if (foundGame.solved) {
        await this.SendGameStatsToServer(foundGame);
      }
    },

    async SendGameStatsToServer(_stats) {
      if (!this.appStateSolving) {
        note('SendGameStatsToServer() called');
        let params = `id=${this.appDataPlayerCurrent.id}&key=${_stats.key}&guesses=${_stats.guesses}`;
        if (_stats.quit) {
          params = `id=${this.appDataPlayerCurrent.id}&key=${_stats.key}&guesses=${_stats.guesses}&quit=true`;
        }

        const requestUrl = `https://empty-night-9bea.bigtentgames.workers.dev/${params}`;

        await fetch(requestUrl, {
          method: 'GET',
          headers: {
            Origin: window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type',
          },
        })
          .then((response) => {
            if (!response.ok) {
              error(response.status);
            }
            return response.json();
          })
          .catch((e) => {
            error(e);
          })
          .finally(() => {
            this.GetDailyGameStats();
          });
      }
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
          window.history.pushState({}, document.title, window.location.pathname);
        }

        if (this.getCurrentDaily) {
          this.UpdateGameGuessesCount(this.getCurrentDaily, this.currentGameSolutionActual === this.currentGameSolutionGuessing);
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
        this.appStateShowNotification = true;

        this.appDataTimeoutNotification = setTimeout(() => {
          this.appStateShowNotification = false;
        }, 1700);

        this.ScrollParking(null, 'beginning');

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
        if (UseDebug) {
          announce('HERE ARE THE CARD WORDS');
          this.appDataCards.forEach((card) => {
            log(JSON.stringify(card.words));
          });

          for (let i = this.appDataCardsParked.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.appDataCardsParked[i], this.appDataCardsParked[j]] = [this.appDataCardsParked[j], this.appDataCardsParked[i]];
          }
        }
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
      this.appCurrentDailyGameKey = urlParams.has('key') ? urlParams.get('key').toString() : this.appCurrentDailyGameKey;
      this.currentGameGuessingWordSet = urlParams.has('wordSetID') ? this.appDataWordSets.find((s) => s.id === urlParams.get('wordSetID')) : this.currentGameWordSet;
      this.currentGameGuessingCardCount = urlParams.has('useExtraCard') && JSON.parse(urlParams.get('useExtraCard')) ? 5 : 4;
      this.appStateForceAutoCheck = this.appDataPlayerCreator.id === 0;

      if (this.appDataPlayerSender.id !== this.appDataPlayerCreator.id && this.appDataPlayerCreator.id !== this.appDataPlayerCurrent.id && !this.appStateForceAutoCheck) {
        this.appStateIsModalShowing = true;
        this.appDataConfirmationObject = { message: `Are you "${this.appDataPlayerCreator.name}," the original creator of this puzzle?`, target: 'creator' };
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

    async GetAISolution() {
      note('GetAISolution() called');
      let words, wordElements;
      words = [];
      wordElements = document.getElementsByTagName('word');

      for (let index = 0; index < wordElements.length; index++) {
        const element = wordElements[index];
        words.push(element.innerHTML);
      }
      words = words.join(',');

      const encodedWords = encodeURIComponent(words);
      const requestUrl = `https://divine-dream-3aa5.bigtentgames.workers.dev/?${encodedWords}`;

      try {
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            Origin: window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type',
          },
        });

        if (!response.ok) {
          error(response.status);
        }
        const payload = await response.text();
        this.SetAIHints(JSON.parse(payload).result);
        this.FillParkingLot();
      } catch (e) {
        error(e);
        if (UseDebug && this.userSettingsUseExtraCard) {
          payload = JSON.stringify({ result: ['1', '2', '3', '4'] });
          this.SetAIHints(JSON.parse(payload).result);
          this.FillParkingLot();
        }
      }
      this.ToggleShowMeta(null);
    },

    SetAIHints(_array) {
      note('SetAIHints() called');
      for (let index = 0; index < this.appDataHints.length; index++) {
        const element = this.appDataHints[index];
        element.value = _array[index];
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
      if (!this.appStateIsGettingLast10Games) {
        note('GetLast10GlobalCreatedGames() called');
        if (window.location.href !== window.location.origin + '/generate.html?generated=true') {
          this.appStateIsGettingLast10Games = true;
          this.appDataGlobalCreatedGames = [];
          var requestUrl = 'https://worker-falling-frost-2926.bigtentgames.workers.dev/';
          await fetch(requestUrl, {
            method: 'GET',
            headers: {
              Host: window.location.hostname,
              Origin: window.location.origin,
              'Access-Control-Request-Method': 'GET',
              'Access-Control-Request-Headers': 'Content-Type',
            },
          })
            .then((response) => {
              if (!response.ok) {
                error(response.status);
              }
              return response.text();
            })
            .then((payload) => {
              this.appDataGlobalCreatedGames = JSON.parse(payload);
            })
            .catch((e) => {
              error(e);
            })
            .finally(() => {
              this.appStateIsGettingLast10Games = false;
            });
        }
      }
    },

    async GetDailyGames() {
      if (!this.appStateIsGettingDailyGames) {
        note('GetDailyGames() called');
        if (this.vsShowDaily && window.location.href !== window.location.origin + '/generate.html?generated=true') {
          this.appStateIsGettingDailyGames = true;
          this.appStateIsGettingUserStats = true;
          this.appDataDailyGames = [];
          var requestUrl = 'https://lucky-bread-acb4.bigtentgames.workers.dev/';
          await fetch(requestUrl, {
            method: 'GET',
            headers: {
              Host: window.location.hostname,
              Origin: window.location.origin,
              'Access-Control-Request-Method': 'GET',
              'Access-Control-Request-Headers': 'Content-Type',
            },
          })
            .then((response) => {
              if (!response.ok) {
                error(response.status);
              }
              return response.text();
            })
            .then((payload) => {
              this.appDataDailyGames = JSON.parse(payload);
              let today = new Date();

              this.appDataDailyGames.forEach((daily) => {
                let previous = this.GetUserStartedGame(daily);
                daily.guesses = 0;
                if (previous) {
                  daily.solved = previous.solved;
                  daily.guesses = previous.guesses;
                  if (previous.quit) {
                    daily.quit = previous.quit;
                  }
                }
              });
              this.GetDailyGameStats();
            })
            .catch((e) => {
              error(e);
            })
            .finally(() => {
              this.appStateIsGettingDailyGames = false;
            });
        }
      }
    },

    async GetDailyGameStats() {
      if (!this.appStateIsGettingDailyGameStats) {
        note('GetDailyGameStats() called');
        this.appStateIsGettingDailyGameStats = true;
        var requestUrl = 'https://old-frog-73f3.bigtentgames.workers.dev/';
        await fetch(requestUrl, {
          method: 'GET',
          headers: {
            Host: window.location.hostname,
            Origin: window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type',
          },
        })
          .then((response) => {
            if (!response.ok) {
              error(response.status);
            }
            return response.text();
          })
          .then((payload) => {
            this.appDataDailyGamesStats = JSON.parse(payload);
            this.appDataDailyGames.forEach((game) => {
              game.showStats = false;
              game.stats = { avg: 0, guesscounts: { beyond2: 0 } };
              for (const stat of this.appDataDailyGamesStats) {
                if (stat.hasOwnProperty(game.key)) {
                  game.stats = stat[game.key];
                  break;
                }
              }
            });
          })
          .catch((e) => {
            error(e);
          })
          .finally(() => {
            this.GetUsersStats();
            this.appStateIsGettingDailyGameStats = false;
          });
      }
    },

    async GetUsersStats() {
      note('GetUsersStats() called');
      this.appStateIsGettingUserStats = true;
      var requestUrl = 'https://calm-glitter-d861.bigtentgames.workers.dev/' + this.appDataPlayerCurrent.id;
      await fetch(requestUrl, {
        method: 'GET',
        headers: {
          Host: window.location.hostname,
          Origin: window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      })
        .then((response) => {
          if (!response.ok) {
            error(response.status);
          }
          return response.text();
        })
        .then((payload) => {
          let userStats = JSON.parse(payload);
          for (const game of this.appDataDailyGames) {
            Vue.set(game, 'guesses', 0);
            Vue.set(game, 'quit', false);
          }
          userStats.forEach((stat) => {
            for (const game of this.appDataDailyGames) {
              if (stat.key === game.key) {
                Vue.set(game, 'guesses', stat.guesses);
                Vue.set(game, 'quit', stat.quit);
                Vue.set(game, 'solved', true);
              }
            }
          });
        })
        .catch((e) => {
          error(e);
        })
        .finally(() => {
          this.appStateIsGettingUserStats = false;
        });
    },
    //#endregion

    //#region HANDLERS
    HandleSubmitButtonPress() {
      note('HandleSubmitButtonPress() called');
      if (this.appDataPlayerCurrent.role === 'reviewer' && this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4) {
        this.appStateIsModalShowing = true;
        this.appDataConfirmationObject = { message: `Did ${this.appDataPlayerSender.name} have the right answer?`, target: 'correct' };
        this.appStateShowConfirmation = true;
      } else if (this.appStateIsGuessing) {
        if (this.currentGameSolutionGuessing === this.currentGameSolutionActual) {
          if (this.GetIsAIGenerated()) {
            this.ShareWin(null);
          } else {
            this.HandleNewGameClick();
          }
        } else if (this.getCurrentDaily || this.appStateForceAutoCheck) {
          if (this.getSubmitButtonText === this.appDataActionButtonTexts.quit) {
            this.appDataConfirmationObject = { message: 'Give up and see the solution?', target: 'quit' };
            this.appStateShowConfirmation = true;
          } else {
            this.IsCurrentGuessCorrect();
          }
        } else {
          this.ShareBoard();
        }
      } else {
        this.FillParkingLot();
      }
    },

    GetUserStartedGame(_game) {
      return this.appDataUserDailyGamesStarted.find((game) => {
        return game.key === _game.key;
      });
    },

    HasUserStartedGame(_game) {
      let foundGame = false;
      foundGame = this.GetUserStartedGame(_game) ? true : false;
      return foundGame;
    },

    HandleOldGameClick(e, _game, _showsol = false) {
      note('HandleOldGameClick() called');
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
      }

      let stringArray = ['?'];
      this.currentGameSolutionGuessing = '';
      this.appDataMessage = '';
      stringArray.push('sendingName=Player 1');
      stringArray.push('&generated=' + encodeURIComponent(this.getIsAIGenerating ? this.getIsAIGenerating : _game.generated));
      stringArray.push('&key=' + encodeURIComponent(_game.key));
      stringArray.push('&puzzleName=Player 1');
      stringArray.push('&puzzleID=' + encodeURIComponent(_game.puzzleID));
      stringArray.push('&lang=' + encodeURIComponent(_game.lang));
      stringArray.push('&wordSetID=' + encodeURIComponent(_game.wordSetID));
      stringArray.push('&useExtraCard=' + encodeURIComponent(_game.useExtraCard));
      stringArray.push('&sol=' + encodeURIComponent(_game.sol));
      stringArray.push('&board=' + encodeURIComponent(_game.board));
      this.appCurrentDailyGameKey = -1;
      if (_game.date && _game.key) {
        stringArray.push('&key=' + encodeURIComponent(_game.key));

        if (!this.HasUserStartedGame(_game)) {
          let currentGame = { key: _game.key, guesses: 0, solved: false };
          this.appDataUserDailyGamesStarted.push(currentGame);
          localStorage.setItem('dailyGames', JSON.stringify(this.appDataUserDailyGamesStarted));
        }
        this.appCurrentDailyGameKey = _game.key;
      }
      let searchString = stringArray.join('');
      let url = location.origin + searchString;
      log(url);
      history.pushState(null, null, url);
      if (this.appStateShowDailyGames) {
        this.ToggleShowDailyGames(e);
      }
      if (!this.appStateShowMeta) {
        this.ToggleShowMeta(e);
      }
      if (this.appStateShowGlobalCreated) {
        this.ToggleShowGlobalCreated(e);
      }
      this.LoadPage();
      this.appStateShowNotification = true;
      this.RotateTray(-4);
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

    HandleGameLinkClick(e, game) {
      note('HandleGameLinkClick() called');
      e.stopPropagation();
      e.preventDefault();
      if (game.solved && game.guesses > 0) {
        this.HandleSolvedPuzzleButtonClick(e, game);
      } else {
        this.HandleOldGameClick(e, game);
      }
    },

    HandleSolvedPuzzleButtonClick(e, _game) {
      note('HandleSolvedPuzzleButtonClick() called');
      e.stopPropagation();
      e.preventDefault();

      this.appStateSolving = true;
      this.HandleOldGameClick(e, _game, true);
      this.appStateShowNotification = false;
      setTimeout(() => {
        this.SolvePuzzleCurrent();
        this.appStateSolving = false;
        this.appStateShowNotification = false;
        history.pushState(null, null, window.location.origin + window.location.pathname);
      }, 150);
    },

    SolvePuzzleCurrent() {
      note('SolvePuzzleCurrent() called');
      let solArray = this.currentGameSolutionActual.split(':');

      let topHint = solArray[0];
      let hintIndex = this.appDataHints.findIndex((hint) => hint.value === topHint);

      this.RotateTrayBasedOnInputFocus(hintIndex, false);

      let anchorIDs = [parseInt(solArray[1]), parseInt(solArray[4]), parseInt(solArray[7]), parseInt(solArray[10])];

      for (let i = 0; i < this.appDataCards.length; i++) {
        const trayCard = this.appDataCards[i];
        if (trayCard.words.length === 0) {
          let parkedCard = this.appDataCardsParked.find((card) => {
            return card.words.find((word) => word.id === anchorIDs[i]);
          });
          if (parkedCard) {
            let wordIndex = parkedCard.words.findIndex((word) => word.id === anchorIDs[i]);
            let modifier = 0;
            switch (i) {
              case 1:
                modifier = 1;
                break;
              case 2:
                modifier = -1;
                break;
              case 3:
                modifier = 2;
                break;
            }
            parkedCard.rotation = 4 - wordIndex + modifier;
            this.SwapCards(trayCard, parkedCard);
          }
        }
      }

      this.ResetCardsAfterRotation();
      this.IsCurrentGuessCorrect();
    },

    HandleYesNo(_target, _value) {
      note('HandleYesNo() called');
      switch (_target) {
        case 'quit':
          this.getCurrentDaily.quit = true;
          this.SolvePuzzleCurrent();
          break;
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
            confirm = window.confirm(`Are you sure you are, (${this.appDataPlayerCreator.name}), the original creator?`);
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

      // dragged item position is handled through vue binding
      this.appDataGhostX = e.clientX;
      this.appDataGhostY = e.clientY;
    },

    HandleBodyPointerUp(e, _card) {
      this.appStateShareError = false;
      if (!this.appStateIsModalShowing) {
        this.appStateIsDragging = false;
        this.appDataDraggedCard = this.appDataEmptyCard;
      } else {
        this.appDataDraggedCard.isSelected = false;
      }
    },

    HandleBodyPointerDown(e) {
      this.appDataGhostX = e.clientX;
      this.appDataGhostY = e.clientY;
    },

    HandleCardPointerDown(e, _card) {
      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
        this.appDataGhostX = e.clientX;
        this.appDataGhostY = e.clientY;
        if (e.target.hasPointerCapture(e.pointerId)) {
          e.target.releasePointerCapture(e.pointerId);
        }
      }

      this.appDataDraggedCard = _card;
      this.appStateIsDragging = true;
    },

    HandleCardPointerUp(e, _card) {
      e.preventDefault();
      e.stopPropagation();
      this.appDataMessage = '';

      if (this.getSelectedCard && this.getSelectedCard === _card) {
        this.appDataDraggedCard = this.appDataEmptyCard;
        this.appStateIsDragging = false;
        return;
      }

      if (this.appDataDraggedCard.words.length > 0) {
        this.SwapCards(_card, this.appDataDraggedCard);
      }
    },

    ScrollParking(e, _direction) {
      note('ScrollParking() called');
      const parking = document.getElementById('parking');
      const cardsize = parseInt(this.cssStyles.getPropertyValue('--cardSize'));
      const scale = parseFloat(this.cssStyles.getPropertyValue('--scale'));

      if (_direction === 'left') {
        this.appDataParkingScrollLeft = parking.scrollLeft + scale * 2 * cardsize;
      } else if (_direction === 'right') {
        this.appDataParkingScrollLeft = parking.scrollLeft - scale * 2 * cardsize;
      } else if (_direction === 'beginning') {
        this.appDataParkingScrollLeft = 0;
      }

      parking.scrollTo({
        left: this.appDataParkingScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(() => {
        this.appParkingRightButtonDisabled = parking.scrollWidth - parking.clientWidth <= parking.scrollLeft;
      }, 300);
    },

    HandlePageVisibilityChange() {
      note('HandlePageVisibilityChange() called');
      this.UpdateServiceWorkerNotificationSettings();
      if (!document.hidden) {
        this.GetDailyGames();
      }
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
      this.tempUseMultiColoredGems = this.userSettingsUseMultiColoredGems;
      this.tempUseWordSetThemes = this.userSettingsUseWordSetThemes;
      this.tempUserWantsDailyReminder = this.userSettingsUserWantsDailyReminder;
      this.tempUserSettingsLanguage = this.userSettingsLanguage;
      this.tempUserSettingsUsesLightTheme = this.userSettingsUsesLightTheme;
      this.tempUseExtraCard = this.userSettingsUseExtraCard;
      this.tempUserSettingsUsesSimplifiedTheme = this.userSettingsUsesSimplifiedTheme;
      this.tempUserSettingsShowAllCards = this.userSettingsShowAllCards;
    },

    HandleIntroButtonClick(e) {
      note('HandleIntroButtonClick() called');
      this.SubmitSettings(null);
      this.appStateShowOOBE = true;
    },

    async SubmitSettings(e) {
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

        let userChangedID = this.appDataPlayerCurrent.id !== this.tempID;
        this.appDataPlayerCurrent.id = this.tempID;
        this.userSettingsUseWordSetThemes = this.tempUseWordSetThemes;
        this.userSettingsUserWantsDailyReminder = this.tempUserWantsDailyReminder;
        this.userSettingsUseExtraCard = this.tempUseExtraCard;
        this.ToggleUseLightTheme(this.tempUserSettingsUsesLightTheme);
        this.ToggleUseSimplifedTheme(this.tempUserSettingsUsesSimplifiedTheme);
        this.ToggleShowAllCards(this.tempUserSettingsShowAllCards);
        this.userSettingsUseMultiColoredGems = this.tempUseMultiColoredGems;
        this.currentGameGuessingCardCount = this.userSettingsUseExtraCard ? 5 : 4;
        this.SetWordSetTheme(this.currentGameGuessingWordSet);

        this.UpdateServiceWorkerNotificationSettings();

        localStorage.setItem('userID', this.appDataPlayerCurrent.id);
        localStorage.setItem('useWordSetThemes', this.userSettingsUseWordSetThemes);
        localStorage.setItem('userSettingsUserWantsDailyReminder', this.userSettingsUserWantsDailyReminder);
        localStorage.setItem('userSettingsLanguage', this.userSettingsLanguage);
        localStorage.setItem('userSettingsUsesLightTheme', this.userSettingsUsesLightTheme);
        localStorage.setItem('userSettingsUsesSimplifiedTheme', this.userSettingsUsesSimplifiedTheme);
        localStorage.setItem('userSettingsShowAllCards', this.userSettingsShowAllCards);
        localStorage.setItem('useMultiColoredGems', this.userSettingsUseMultiColoredGems);
        localStorage.setItem('useExtraCard', this.userSettingsUseExtraCard);
        localStorage.setItem('wordSet', this.currentGameWordSet.id);

        if (userChangedID) {
          await this.GetDailyGameStats();
          window.location.reload();
        }
      }
      this.appStateIsModalShowing = false;
      this.appStateShowSettings = false;
      this.appStateShowIntro = false;
    },

    UpdateServiceWorkerNotificationSettings() {
      note('UpdateServiceWorkerNotificationSettings() called');
      const updatedReminderSetting = this.tempUserWantsDailyReminder;

      if (navigator.serviceWorker.controller) {
        // Remove the .then() call here as postMessage is not a promise
        navigator.serviceWorker.controller.postMessage({
          type: 'USER_WANTS_REMINDER',
          tempUserWantsDailyReminder: updatedReminderSetting,
        });
        console.log('User setting sent to Service Worker:', updatedReminderSetting);
      } else {
        console.warn('No active service worker controller found.');

        navigator.serviceWorker.ready
          .then((registration) => {
            if (registration.active) {
              registration.active.postMessage({
                type: 'USER_WANTS_REMINDER',
                tempUserWantsDailyReminder: updatedReminderSetting,
              });
              console.log('User setting sent to Service Worker:', updatedReminderSetting);
            } else {
              console.warn('Service worker is not active during readiness check.');
            }
          })
          .catch((registrationError) => {
            console.error('Service Worker ready function failed:', registrationError);
          });
      }
    },

    GetUserSettings() {
      note('GetUserSettings() called');
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

      let dailyGames = localStorage.getItem('dailyGames');
      if (dailyGames !== undefined && dailyGames !== null) {
        this.appDataUserDailyGamesStarted = JSON.parse(dailyGames);
      }

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

      let userSettingsUserWantsDailyReminder = localStorage.getItem('userSettingsUserWantsDailyReminder');
      if (userSettingsUserWantsDailyReminder !== undefined && userSettingsUserWantsDailyReminder !== null) {
        this.userSettingsUserWantsDailyReminder = JSON.parse(userSettingsUserWantsDailyReminder);
        this.tempUserWantsDailyReminder = this.userSettingsUserWantsDailyReminder;
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

      let userSettingsShowAllCards = localStorage.getItem('userSettingsShowAllCards');
      if (userSettingsShowAllCards !== undefined && userSettingsShowAllCards !== null) {
        this.ToggleShowAllCards(JSON.parse(userSettingsShowAllCards));
        this.tempUserSettingsShowAllCards = this.userSettingsShowAllCards;
      }

      let userSettingsUseMultiColoredGems = localStorage.getItem('useMultiColoredGems');
      if (userSettingsUseMultiColoredGems !== undefined && userSettingsUseMultiColoredGems !== null) {
        this.userSettingsUseMultiColoredGems = JSON.parse(userSettingsUseMultiColoredGems);
        this.tempUseMultiColoredGems = this.userSettingsUseMultiColoredGems;
      }
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
            } else if (this.appStateShowCatChooser) {
              this.HandleGoButtonClick(e);
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
            } else if (this.appStateShowDailyGames) {
              this.ToggleShowDailyGames(null);
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
            } else if (this.appStateShowNotification) {
              this.appStateShowNotification = false;
            } else if (this.appStateShowMeta) {
              this.appStateShowMeta = false;
            } else if (!this.appStateShowMeta) {
              this.appStateShowMeta = true;
            }
            break;
          default:
        }
      }
    },

    HandleResize() {
      this.appStateUsePortraitLayout = document.body.offsetWidth / document.body.offsetHeight < 0.75;
    },

    HandlePopState() {
      note('HandlePopState() called');
      if (window.location.search) {
        this.LoadPage();
      } else {
        this.NewGame(null);
      }
    },
    //#endregion

    //#region COMMUNICATION
    ShareWin(e, _game = this.getCurrentDaily) {
      if (e !== null) {
        e.stopPropagation();
        e.preventDefault();
      }
      note('ShareWin() called');
      if (_game.solved) {
        let date = _game && this.getTodaysDaily === _game ? `Today's` : `The ${_game.date}`;
        let text = `I solved ${date} Daily in ${_game.guesses} tries! 😀
Can you do better?

<https://facets.bigtentgames.com>`;
        this.ConstructAndSetShareURLForCurrentGame();
        if (_game.guesses === 1) {
          text = `🥳 I solved ${date} Daily in 1 try! Can you?

<https://facets.bigtentgames.com>`;
        }
        if (_game.quit) {
          text = `😱 I gave up on ${date} Daily! Can you solve it?

<https://facets.bigtentgames.com>`;
        }
        this.ShareText(text, '');
        history.pushState(null, null, window.location.origin + window.location.pathname);
      }
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
              this.appStateShowNotification = true;
            })
            .catch((e) => {
              error(e);
              this.CopyToClipboardViaExecCommand(_text);
            });
        } else {
          // ClipboardItem is not available, use writeText
          await navigator.clipboard
            .writeText(_text)
            .then(() => {
              note('Attempting to copy via navigator.clipboard.writeText');
              this.appDataMessage = 'Message copied to the clipboard.';
              this.appStateShowNotification = true;
            })
            .catch((e) => {
              error(e);
              this.CopyToClipboardViaExecCommand(_text);
            });
        }
      } else {
        this.CopyToClipboardViaExecCommand(_text);
      }
    },

    async CopyToClipboardViaExecCommand(_text) {
      note('CopyToClipboardViaExecCommand() called');
      let result = copyToClipboard(_text);
      this.appDataMessage = '';
    },

    async ShareText(_text, _url) {
      note('ShareText() called');
      if (!this.getIsAIGenerating) {
        this.appDataMessage = '';
        note('_text = ' + _text);
        note('_url = ' + _url);
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
              note('Message shared via navigator.share()');
            })
            .catch((e) => {
              this.CopyTextToClipboard(_text + (_url === '' ? '' : ' <' + _url + '>'));
              error('Failed to share via navigator.share(): ', e);
            });
        } else {
          // fall back to clipboard
          this.CopyTextToClipboard(_text + (_url === '' ? '' : ' <' + _url + '>'));
        }
      }
    },

    async ShareBoard(_gotIt = false, _isNew = false) {
      note('ShareBoard() called');
      if (!this.getIsAIGenerating && this.isChromeAndiOSoriPadOS && this.appDataShareURL.indexOf('facets.bigtentgames.com/game/?') !== -1) {
        this.CopyTextToClipboard(this.GetShareTextBasedOnContext(_gotIt) + ' <' + this.appDataShareURL + '>');
        note('Shortened URL exists, copying to clipboard');
      } else {
        let currentGameReviewIsFinal = this.appDataPlayerCurrent.role === 'reviewer' && this.getNumberOfCardsThatHaveBeenPlacedOnTray === 4;
        let text = this.GetShareTextBasedOnContext(_gotIt);
        this.ConstructAndSetShareURLForCurrentGame(currentGameReviewIsFinal, _isNew);
        this.appStateIsGettingTinyURL = true;
        var corsflareUrl = this.getIsAIGenerating ? 'https://flat-night-eecc.bigtentgames.workers.dev/' : 'https://worker-winter-glade-cd02.bigtentgames.workers.dev/';
        var requestUrl = corsflareUrl + location.search.substring(1);

        note('Fetching short url');
        await fetch(requestUrl, {
          method: 'GET',
          headers: {
            Host: window.location.hostname,
            Origin: window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type',
          },
        })
          .then((response) => {
            if (!response.ok) {
              return response.text().then((errorMessage) => {
                const e = JSON.parse(errorMessage);
                error('(' + e.statusCode + ') ' + e.message);
              });
            }
            return response.text();
          })
          .then((shortUrlParam) => {
            this.appDataShareURL = location.origin + '/game/?' + shortUrlParam;
            this.ShareText(text, this.appDataShareURL);
          })
          .catch((e) => {
            error(e);
            if (!UseDebug) {
              this.appStateShareError = true;
            }
          })
          .finally(() => {
            this.appStateIsGettingTinyURL = false;
          });
        if (UseDebug) {
          this.ShareText(text, this.appDataShareURL);
        }
      }
    },

    ReportPuzzle(_game) {
      note('ReportPuzzle() called');
      location.href = 'mailto:bigtentgames@icloud.com?subject=Facets Puzzle Reported&body=Puzzle ID# ' + _game.key + '%0D%0A This puzzle contains offensive language.%0D%0A' + _game.hints;
    },

    ConstructAndSetShareURLForCurrentGame(_currentGameReviewIsFinal, _isNew = false) {
      note('ConstructAndSetShareURLForCurrentGame() called');
      if (this.appStateIsGuessing) {
        if (this.currentGameSolutionGuessing !== this.currentGameSolutionActual) {
          this.currentGameSolutionGuessing = '';
        }
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
        urlString += '&generated=' + encodeURIComponent(this.getCurrentDaily ? true : this.getIsAIGenerating);
        if (this.getCurrentDaily) {
          urlString += '&key=' + encodeURIComponent(this.getCurrentDaily.key);
          if (this.getCurrentDaily.quit) {
            urlString += '&quit=true';
          }
        }
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
      let count = this.getNumberOfCardsThatHaveBeenPlacedOnTray;
      let pretext = '';

      if (this.getNumberOfCardsThatHaveBeenPlacedOnTray < 4) {
        pretext = count + '/4 ';
      }

      if (count === 4 && this.appDataPlayerCurrent.role === 'reviewer' && !_gotIt) {
        count = 5;
      }

      let levelMessage = LevelMessage[count][getRandomInt(0, LevelMessage[count].length)];
      let usingName = _name !== '';
      let name = !usingName ? '' : _name + ', ';
      let useLowerCase = usingName && levelMessage.indexOf('I ') !== 0;
      levelMessage = useLowerCase ? levelMessage.charAt(0).toLowerCase() + levelMessage.slice(1) : levelMessage;
      let message = pretext + LevelEmoji[count][getRandomInt(0, LevelEmoji[count].length)] + ' ' + name + levelMessage;
      if (count === 4 && this.getCurrentDaily && this.getCurrentDaily.quit) {
        message = `AI is hard! We're working hard to make these Daily Games better to play.`;
      }
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
    //#endregion

    //#region CARD MANIPULATION
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
      }
    },

    RotateCard(e, _card, _inc) {
      note('RotateCard() called');
      e.preventDefault();
      e.stopPropagation();
      this.appDataTransitionShort = parseInt(getComputedStyle(document.body).getPropertyValue('--mediumTransition').replace('ms', ''));
      if (this.appStateIsGuessing && (!this.vsUseFocus || (this.vsUseFocus && e.target.parentElement.parentElement.id !== 'parking'))) {
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

    RotateTrayBasedOnInputFocus(_index, _useTimeout = true) {
      note('RotateTrayBasedOnInputFocus() called');
      if (_index != 0) {
        switch (_index) {
          case 0:
            this.RotateTray(0, _useTimeout);
            break;
          case 1:
            this.RotateTray(-1, _useTimeout);
            break;
          case 2:
            this.RotateTray(1, _useTimeout);
            break;
          case 3:
            this.RotateTray(-2, _useTimeout);
            break;
        }
      }
    },

    RotateTray(_inc, _useTimeout = true) {
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
        if (_useTimeout && !this.appStateSolving) {
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
        } else {
          this.ResetTrayAfterRotation();

          if (!this.appStateIsGuessing) {
            let hint0 = document.getElementById('hint0');
            this.appDataParkingInputValue = '';
            hint0.focus();
          }
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

    GetScrollSize() {
      const parking = document.getElementById('parking');
      return parking.scrollWidth - parking.clientWidth;
    },

    ConvertToDateFromKey(_key) {
      let day = _key.substring(2, 4);
      let year = _key.substring(4, 8);
      let month = _key.substring(0, 2) - 1;
      return new Date(year, month, day);
    },

    GetDateFormatted(_date, _nice = false) {
      const madj = _nice ? 0 : 1;
      let day = String(_date.getDate()).padStart(2, '0');
      let month = String(_date.getMonth() + madj).padStart(2, '0');
      let year = _date.getFullYear();
      let date = month + day + year;

      if (_nice) {
        let d = new Date(year, month, day); // Use Intl.DateTimeFormat to format the date
        let options = { month: 'short', day: 'numeric' };
        date = new Intl.DateTimeFormat(undefined, options).format(d);
      }

      return date;
    },

    GetIsAIGenerated() {
      if (this.getCurrentDaily) {
        return true;
      } else if (window.location.search) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('generated') && urlParams.get('generated').toString() === 'true';
      } else {
        return false;
      }
    },

    GetBoardFromURL() {
      let boardPieces = [];
      if (window.location.search) {
        let urlParams = new URLSearchParams(window.location.search);
        UseDebug = urlParams.has('useDebug') ? true : UseDebug;
        let search = decodeURIComponent(window.location.search);
        params = search.split('?')[1].split('&');
        boardPieces = urlParams.has('board') ? urlParams.get('board').split(':') : [];
      }
      return boardPieces;
    },
    //#endregion

    //#region INITIALIZATION
    async NewGame(e, _appDataMessage = '', _rotate = true) {
      note('NewGame() called');
      document.title = 'Facets!';
      this.appDataMessage = _appDataMessage;
      this.currentGameGuessCount = 0;
      this.appCurrentDailyGameKey = -1;
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
      this.appStateShowMeta = false;
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

    async LoadPage() {
      note('LoadPage() called');
      this.GetUserSettings();
      announce('Player ' + this.appDataPlayerCurrent.id + ' has loaded v' + this.appDataVersion);
      this.GetDailyGames();
      this.GetLast10GlobalCreatedGames();
      this.appDataTransitionLong = parseInt(getComputedStyle(document.body).getPropertyValue('--longTransition').replace('ms', ''));
      this.appDataTransitionShort = parseInt(getComputedStyle(document.body).getPropertyValue('--shortTransition').replace('ms', ''));
      this.appStatePageHasLoaded = true;
      let boardPieces = this.GetBoardFromURL();
      try {
        if (boardPieces.length >= 40) {
          document.title = 'Facets!';
          this.ToggleShowMeta(null);
          this.RestoreGame(boardPieces);
        } else if (!this.appStateIsGuessing) {
          if (this.getIsAIGenerating) {
            this.currentGameGuessingCardCount = 4;
            this.appDataPlayerCurrent.id = 0;

            this.currentGameWordSet = this.getEnabledWordSets.find((set) => set.id === '100');
            log(this.currentGameWordSet.name);
            this.SelectWordSet(null, this.currentGameWordSet);
            note(this.currentGameWordSet.name);

            setTimeout(() => {
              this.GetAISolution();
            }, 2000);
          }
          this.NewGame(null, '', false);
          this.ToggleShowMeta(null);
        }
      } catch (e) {
        error(e.message);
        boardPieces = [];
        this.NewGame(null, '😕 - Something went wrong.', false);
      }

      this.appStateUsePortraitLayout = document.body.offsetHeight > document.body.offsetWidth;
    },

    Retry(fn, retriesLeft = 3, interval = 1000) {
      return new Promise((resolve, reject) => {
        fn()
          .then(resolve)
          .catch((e) => {
            if (retriesLeft === 1) {
              reject(e);
            } else {
              setTimeout(() => {
                this.Retry(fn, retriesLeft - 1, interval * 2).then(resolve, reject);
              }, interval);
            }
          });
      });
    },

    HandleServiceWorkerRegistration() {
      if (this.getSyncIsSupported && this.isPWAOnHomeScreen) {
        note('HandleServiceWorkerRegistration() called');

        if ('serviceWorker' in navigator) {
          this.Retry(() => navigator.serviceWorker.getRegistration()).then((registration) => {
            const userSettings = this.GetUserSettings();
            if (registration) {
              log('Service Worker is already registered with scope:', registration.scope);

              if (registration.active) {
                registration.active.postMessage({
                  type: 'USER_WANTS_REMINDER',
                  tempUserWantsDailyReminder: this.tempUserWantsDailyReminder,
                });
                console.log('User setting sent to Service Worker:', this.tempUserWantsDailyReminder);

                this.ScheduleInitialPeriodicSync();
              }

              navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
                  this.HandleVersionAvailable();
                }
              });
            } else {
              this.Retry(() => navigator.serviceWorker.register('/service-worker.js', { scope: '/' }))
                .then((registration) => {
                  log('Service Worker registered with scope:', registration.scope);

                  if (registration.active) {
                    registration.active.postMessage({
                      type: 'USER_WANTS_REMINDER',
                      tempUserWantsDailyReminder: this.tempUserWantsDailyReminder,
                    });
                    console.log('User setting sent to Service Worker:', this.tempUserWantsDailyReminder);

                    this.ScheduleInitialPeriodicSync();
                  }

                  if ('sync' in registration) {
                    return registration.sync
                      .register('daily-reminder')
                      .then(() => {
                        log('Daily reminder sync registered');
                      })
                      .catch((e) => {
                        log(e);
                      });
                  }
                })
                .catch((e) => {
                  log(e);
                });
            }
          });
        } else {
          log('Service Workers are not supported');
        }
      } else {
        this.Retry(() => navigator.serviceWorker.getRegistrations()).then((registrations) => {
          if (registrations.length) {
            registrations.forEach((registration) => registration.unregister());
          } else {
            log('No service workers to unregister');
          }
        });
      }
    },

    ScheduleInitialPeriodicSync() {
      if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready
          .then((registration) => {
            const delay = this.GetDelayUntilNext8AM() - 30000; // 30 seconds before 8:00 AM
            setTimeout(() => {
              registration.periodicSync
                .register({
                  tag: 'daily-reminder',
                  minInterval: 24 * 60 * 60 * 1000, // 24 hours
                })
                .then(() => console.log('Periodic sync registered successfully'))
                .catch((error) => console.error('Periodic sync registration failed:', error));
            }, delay);
          })
          .catch((registrationError) => {
            console.error('SW ready failed: ', registrationError);
          });
      }
    },

    GetDelayUntilNext8AM() {
      const now = new Date();
      const next8AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);

      if (now.getTime() >= next8AM.getTime()) {
        next8AM.setDate(next8AM.getDate() + 1);
      }
      return next8AM.getTime() - now.getTime();
    },

    EnableDailyReminders() {
      return new Promise((resolve, reject) => {
        if (Notification.permission === 'granted') {
          this.HandleServiceWorkerRegistration();
          resolve(true);
        } else {
          Notification.requestPermission()
            .then((permission) => {
              if (permission === 'granted') {
                this.HandleServiceWorkerRegistration();
                resolve(true);
              } else {
                resolve(false);
              }
            })
            .catch((e) => {
              reject(e);
            });
        }
      });
    },

    HandleVersionAvailable() {
      note('HandleVersionAvailable() called');
    },
    //#endregion
  },

  mounted() {
    this.LoadPage();
    this.HandleServiceWorkerRegistration();
    window.addEventListener('keydown', this.HandleKeyDownEvent);
    window.addEventListener('pointermove', this.HandlePointerMoveEvent);
    window.addEventListener('visibilitychange', this.HandlePageVisibilityChange);
    window.addEventListener('resize', this.HandleResize);
    window.addEventListener('popstate', this.HandlePopState);
  },

  watch: {
    userSettingsLanguage: function (newLang, oldLang) {
      this.LoadTranslatedWords();
    },
  },

  computed: {
    //#region COMPUTED
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
    getFullCardsInTray: function () {
      return this.appDataCards.filter((card) => card.words.length > 0);
    },
    getEmptyCardsInTray: function () {
      return this.appDataCards.filter((card) => card.words.length === 0);
    },
    getNumberOfCardsThatHaveBeenPlacedOnTray: function () {
      return this.appDataCards === undefined ? 0 : this.getFullCardsInTray.length;
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
      clearTimeout(this.appDataTimeoutNotification);
      let time = 2000;
      let pronoun = this.currentGameGuessingWordSet.startsWithVowel ? 'an' : 'a';
      let name = this.appStateForceAutoCheck ? pronoun : this.appDataPlayerCreator.name + "'s ";
      let text = '';
      if (this.appDataMessage !== '') {
        text = this.appDataMessage;
      } else if (!this.appStateIsGuessing && this.appDataPlayerCurrent.id !== -1) {
        text = `You are creating a new "${this.currentGameGuessingWordSet.name}" puzzle!`;
        time = 1700;
      } else if (this.appDataPlayerCurrent.id === this.appDataPlayerSender.id && this.appDataPlayerCurrent.id !== -1 && this.appDataPlayerCurrent.id === this.appDataPlayerCreator.id) {
        text = `${this.appDataPlayerCurrent.name}, this is your own puzzle!`;
      } else if (this.currentGameReviewIsFinal && this.appDataPlayerCurrent.id !== -1) {
        text = `${this.appDataPlayerCurrent.name}, here's the solution.`;
      } else if (this.appDataPlayerCurrent.id !== this.appDataPlayerSender.id && this.appDataPlayerCurrent.id === this.appDataPlayerCreator.id && this.appDataPlayerCurrent.id !== -1) {
        text = `You are reviewing ${this.appDataPlayerSender.name}'s guess!`;
      } else {
        if (this.getCurrentDaily) {
          let today = new Date();
          text = `<name>The Daily – ${this.getCurrentDaily.date.split(',')[0]}</name><subtitle>Puzzle category – "${this.currentGameGuessingWordSet.name}"</subtitle>`;
          if (this.getCurrentDaily.key === this.getTodaysDaily.key) {
            text = `The Daily – Today<subtitle>Puzzle category –  "${this.currentGameGuessingWordSet.name}"</subtitle>`;
          }
        } else {
          text = `You are guessing ${name} "${this.currentGameGuessingWordSet.name}" puzzle!`;
        }
      }
      this.appDataTimeoutNotification = setTimeout(() => {
        this.appStateShowNotification = false;
      }, time);

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
    getEnabledTempWordSet: function () {
      let names = [];
      this.appDataWordSets.forEach((set) => {
        if (set.enabled) {
          names.push(set);
        }
      });
      return names.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    },
    getEnabledTempLanguages: function () {
      let names = [];
      this.appDataLanguages.forEach((lang) => {
        if (lang.enabled) {
          names.push({ name: lang.name, tag: lang.tag });
        }
      });
      return names.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    },
    getCurrentSelectedTempWordSetName: function () {
      return this.appDataWordSets.find((set) => set.isSelected).name;
    },
    getSubmitButtonText: function () {
      let text = this.appDataActionButtonTexts.send;
      if (this.appStateShareError) {
        return 'Retry';
      }
      if (this.appDataPlayerCurrent.role === 'reviewer') {
        text = this.appDataActionButtonTexts.respond;
      } else if (this.appDataPlayerCurrent.role === 'creator') {
        text = this.appDataActionButtonTexts.send;
      }

      if (this.appDataPlayerCurrent.id !== this.appDataPlayerCreator.id) {
        if (this.appStateForceAutoCheck) {
          if (this.getCurrentDaily && !this.getCurrentDaily.solved && this.getCurrentDaily.guesses > 1 && this.getNumberOfCardsThatHaveBeenPlacedOnTray !== 4) {
            text = this.appDataActionButtonTexts.quit;
          } else {
            text = this.appDataActionButtonTexts.guess;
          }
        }
        if (this.isChromeAndiOSoriPadOS && this.appDataShareURL.includes('facets.bigtentgames.com/game/?')) {
          text = this.appDataActionButtonTexts.copy;
        }
        if (this.currentGameSolutionGuessing === this.currentGameSolutionActual) {
          if (this.getCurrentDaily) {
            text = this.appDataActionButtonTexts.share;
          } else {
            text = this.appDataActionButtonTexts.create;
          }
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
    getTodaysKey: function () {
      let today = new Date();

      return this.GetDateFormatted(today);
    },
    getTodaysDaily: function () {
      let today = new Date();
      let daily = this.getDailyGamesWithWordSetNames.find((daily) => {
        return daily.key === this.GetDateFormatted(today);
      });
      return daily;
    },
    getCurrentDaily: function () {
      let daily = this.getDailyGamesWithWordSetNames.find((daily) => {
        return daily.key === this.appCurrentDailyGameKey;
      });
      return daily ? daily : null;
    },
    getDailyIsFreshToday: function () {
      if (this.getTodaysDaily === undefined) {
        return false;
      }
      const isFresh = this.getTodaysDaily.guesses === 0 && !this.HasUserStartedGame(this.getTodaysDaily) && !this.appStateIsGettingDailyGames && !this.appStateIsGettingUserStats;
      if (this.getIsBadgeSupported) {
        if (isFresh) {
          navigator.setAppBadge();
        } else {
          navigator.clearAppBadge();
        }
      }
      return isFresh;
    },
    getDailyGamesWithWordSetNames: function () {
      return this.appDataDailyGames.map((game) => {
        game.date = this.GetDateFormatted(this.ConvertToDateFromKey(game.key), true);
        const newArray = this.appDataWordSets.find((set) => set.id === game.wordSetID);
        if (newArray) {
          game.name = newArray.name;
        }
        return game;
      });
    },
    isChromeAndiOSoriPadOS: function () {
      note('isChromeAndiOSoriPadOS() called');
      var userAgent = navigator.userAgent || window.opera;
      var isChromeIOS = /CriOS/.test(userAgent) && /iPhone|iPad|iPod/.test(userAgent);
      userAgent = userAgent.toLowerCase();
      return isChromeIOS || (userAgent.includes('firefox') && userAgent.includes('android'));
    },
    getIsAIGenerating: function () {
      return window.location.href.indexOf(window.location.origin + '/generate.html') !== -1;
    },
    getIsAIGenerated: function () {
      return this.GetIsAIGenerated();
    },
    getActionButtonState: function () {
      let inactive = false;
      if (this.getNumberOfCardsThatHaveBeenPlacedOnTray !== 4 && this.getCurrentDaily && this.getCurrentDaily.guesses > 1 && !this.getCurrentDaily.quit) {
        inactive = false;
      } else if ((this.getNumberOfHintsThatHaveBeenFilled !== 4 && this.appDataPlayerCurrent.role === 'creator') || (this.getNumberOfCardsThatHaveBeenPlacedOnTray !== 4 && this.appDataPlayerCurrent.role !== 'reviewer' && this.appDataPlayerCurrent.id !== this.appDataPlayerCreator.id)) {
        inactive = true;
      }

      return inactive;
    },
    getCorrectCalIconClass: function () {
      let checkDate = this.getCurrentDaily.date;
      let day = parseInt(checkDate.split(' ')[1]);
      const today = new Date();
      let num = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() / 12;
      let iconIndex = Math.ceil(day / num);
      return `cal${iconIndex}`;
    },
    getUserAcceptedNotificationsPermission() {
      if ('Notification' in window) {
        return Notification.permission !== 'denied';
      }
      return false;
    },
    getSyncIsSupported: function () {
      return 'SyncManager' in window;
    },
    getIsBadgeSupported: function () {
      return navigator.setAppBadge !== undefined && navigator.setAppBadge !== null;
    },
    getResumeText: function () {
      let text = '';
      highlight(this.appDataPlayerCurrent.role);
      switch (this.appDataPlayerCurrent.role) {
        case 'creator':
          text = 'Creating';
          break;
        case 'reviewer':
          text = 'Reviewing';
          break;
        case 'guesser':
          text = 'Guessing';
          break;
      }
      return text;
    },
    isPWAOnHomeScreen: function () {
      return window.matchMedia('(display-mode: standalone)').matches;
    },
    //#endregion
  },
});
