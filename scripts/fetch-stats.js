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
    source: 'https://blue-heart-48ff.bigtentgames.workers.dev/',
    isFetching: false,
    rawStats: [],
    stats: [],
    error: '',
  },

  methods: {
    async LoadPage() {
      await this.GetStats();
      console.log(JSON.stringify(this.rawStats));
      this.stats = this.ProcessRawStats();
    },
    async GetStats() {
      this.isFetching = true;
      try {
        let response = await fetch(this.source, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          this.rawStats = await response.json();
          this.isFetching = false;
        } else {
          this.error = 'Error fetching data: ' + response.statusText;
          this.isFetching = false;
        }
      } catch (error) {
        this.error = 'Error fetching data: ' + error;
        this.isFetching = false;
      }
    },

    ProcessRawStats() {
      let result = [];
      result.push({
        key: 'Basic',
        value: [
          { key: 'Total games created', value: this.rawStats.totalGames },
          { key: 'Crazy hard games', value: this.rawStats.totalHardGames },
        ],
      });
      let languages = [];
      this.rawStats.languagesCount.forEach((language) => {
        languages.push({ key: AllLanguages.find((item) => item.tag === language.lang).name + ' games', value: language.count });
      });
      languages.sort((a, b) => b.value - a.value);
      result.push({ key: 'Languages', value: languages });
      let wordsets = [];
      this.rawStats.wordsetIDCount.forEach((set) => {
        wordsets.push({ key: WordSets.find((item) => item.id === set.id).name + ' games', value: set.count });
      });
      wordsets.sort((a, b) => b.value - a.value);
      result.push({ key: 'Categories', value: wordsets });
      return result;
    },
  },

  mounted() {
    this.LoadPage();
  },

  watch: {},

  computed: {
    getLanguageCounts: function () {
      return [];
    },
  },
});
