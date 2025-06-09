export class PlayerObject {
  constructor(spec = {}) {
    this.id = spec.id ?? -1;
    this.cards = spec.cards ?? [];
    this.name = spec.name ?? 'Player';
    this.role = spec.role ?? 'creator';
    this.playerPosition = spec.playerPosition ?? 0;
  }
}
