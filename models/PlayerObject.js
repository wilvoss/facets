class PlayerObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.cards = spec.cards === undefined ? [] : spec.cards;
    this.name = spec.name === undefined ? '' : spec.name;
    this.playerPosition = spec.playerPosition === undefined ? 0 : spec.playerPosition;
  }
}
