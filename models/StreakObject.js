class StreakObject {
  constructor(spec) {
    this.streakPlayerId = spec.streakPlayerId === undefined ? -1 : spec.streakPlayerId;
    this.streakPlayerName = spec.streakPlayerName === undefined ? -1 : spec.streakPlayerName;
    this.streak = spec.streak === undefined ? 0 : spec.streak;
  }
}
