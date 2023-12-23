class WordObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.value = spec.value === undefined ? '' : spec.value;
    this.owner = spec.owner == undefined ? '' : spec.owner;
    this.position = spec.position == undefined ? '' : spec.position;
  }
}

getUniqueWords = function (_mode = 'nouns', _num = 20) {
  let words = Nouns;
  switch (_mode) {
    case 'verbs':
      words = Verbs;
      break;
    case 'both':
      words = Nouns.concat(Verbs);
      break;
  }
  let shuffledWords = [...words]; // create a copy of the array
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    // swap elements shuffledNouns[i] and shuffledNouns[j]
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }

  return shuffledWords.slice(0, _num); // get the first four elements
};

/* prettier-ignore */
let Nouns = [
    "Apple", "Ball", "Chair", "Door", "Elephant", "Flower", "Guitar", "Hat", "Island", "Juice", "Kite", "Lemon", "Mountain", "Notebook", "Orange", "Pencil", "Queen", "Rainbow", "Star", "Tree", "Umbrella", "Violin", "Whale", "Xylophone", "Yacht", "Zoo", "Book", "Clock", "Desk", "Envelope", "Flag", "Grass", "House", "Igloo", "Jacket", "Key", "Lamp", "Moon", "Nest", "Owl", "Penguin", "Quilt", "River", "Sun", "Table", "Unicorn", "Van", "Wall", "X-ray", "Yogurt", "Zipper", "Ant", "Bear", "Crab", "Duck", "Eagle", "Fish", "Goat", "Hippo", "Insect", "Jellyfish", "Airport", "Bridge", "City", "Desert", "Elevator", "Forest", "Garden", "Harbor", "Island", "Jungle", "Kingdom", "Lagoon", "Museum", "Nursery", "Ocean", "Park", "Quarry", "River", "Swamp", "Tower", "University", "Valley", "Waterfall", "Xenon", "Yard", "Ziggurat", "Alley", "Beach", "Canyon", "Dome", "Estuary", "Fjord", "Glacier", "Hill", "Isthmus", "Jetty", "Knoll", "Ledge", "Mesa", "Niche", "Oasis", "Plateau", "Quicksand", "Ridge", "Steppe", "Tundra", "Upland", "Volcano", "Wetland", "Xeric", "Yard", "Zephyr", "Archipelago", "Basin", "Cape", "Delta", "Escarpment", "Foothill", "Gulf", "Highland", "Iceberg", "Jetstream", "Knob", "Lowland", "Marsh", "Notch", "Outcrop", "Prairie", "Quagmire", "Savanna", "Terrace", "Underground", "Vale", "Watershed", "Xebec", "Yawl", "Zeppelin"
];

/* prettier-ignore */
let Verbs = [
    "run", "jump", "swim", "climb", "read", "write", "draw", "paint", "sing", "dance", "talk", "listen", "hear", "see", "touch", "smell", "taste", "walk", "sit", "stand", "fly", "crawl", "dig", "push", "pull", "lift", "throw", "catch", "kick", "punch", "eat", "drink", "cook", "bake", "freeze", "melt", "burn", "wash", "clean", "dirty", "open", "close", "turn", "twist", "bend", "straighten", "roll", "fold", "cut", "tear", "paste", "type", "print", "scan", "photograph", "record", "play", "pause", "stop", "start", "move", "shake", "nod", "wave", "clap", "wink", "blink", "smile", "frown", "laugh", "cry", "shout", "whisper", "sing", "hum", "whistle", "stare", "glare", "gaze", "peek", "watch", "observe", "study", "learn", "teach", "guide", "lead", "follow", "change", "grow", "shrink", "expand", "contract", "explode", "implode", "scatter", "gather", "include", "exclude"
]
