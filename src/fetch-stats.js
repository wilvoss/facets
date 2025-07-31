import { createApp } from '/src/helpers/vue.esm-browser.prod.js';
import { loadGameplayModules } from '/src/constants/gameplay.js';

//#region MODULE HANDLING

async function LoadAllModules() {
  const gameplayModules = await loadGameplayModules();
  return { ...gameplayModules };
}
//#endregion

LoadAllModules().then((modules) => {
  console.log('Modules loaded:', modules);

  const app = createApp({
    data() {
      return {
        source: 'https://facets-get-global-stats.bigtentgames.workers.dev/',
        isFetching: false,
        rawStats: [],
        stats: [],
        error: '',
        userSettingsUsesLightTheme: false,
      };
    },

    methods: {
      async LoadPage() {
        this.CheckTheme();
        await this.GetStats();
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

      CheckTheme() {
        let userSettingsUsesLightTheme = localStorage.getItem('userSettingsUsesLightTheme');
        if (userSettingsUsesLightTheme !== undefined && userSettingsUsesLightTheme !== null) {
          this.userSettingsUsesLightTheme = JSON.parse(userSettingsUsesLightTheme);
        }
      },

      ProcessRawStats() {
        let result = [];
        result.push({
          key: 'General',
          value: [
            { key: 'Games Created', value: this.rawStats.totalGames },
            { key: 'Hard Games', value: this.rawStats.totalHardGames },
          ],
        });
        let languages = [];
        this.rawStats.languagesCount.forEach((language) => {
          languages.push({ key: modules.allLanguages.find((item) => item.tag === language.lang).name, value: language.count });
        });

        this.SortByValueThenName(languages, 'key');

        result.push({ key: 'Language', value: languages });
        let sets = [];
        this.rawStats.wordsetIDCount.forEach((set) => {
          sets.push({ key: modules.wordSets.find((item) => item.id === set.id).name, value: set.count });
        });

        this.SortByValueThenName(sets, 'key');

        result.push({ key: 'Category', value: sets });
        return result;
      },

      SortByValueThenName(_array, _property) {
        _array.sort((a, b) => {
          if (b.value !== a.value) {
            return b.value - a.value;
          } else {
            if (a[_property] && b[_property]) {
              return a[_property].localeCompare(b[_property]);
            } else {
              return 0;
            }
          }
        });
      },

      HandleOnVisibilityChange(event) {
        this.CheckTheme();
      },
    },

    mounted() {
      this.LoadPage();
      window.addEventListener('visibilitychange', this.HandleOnVisibilityChange);
    },

    watch: {},

    computed: {
      getLanguageCounts: function () {
        return [];
      },
    },
  });
  window.app = app.mount('#app');
});
