/// <reference path="../helpers/console-enhancer.js" />
/// <reference path="../models/WordObject.js" />
class CardObject {
  constructor(spec) {
    this.id = spec.id === undefined ? -1 : spec.id;
    this.words = spec.words === undefined ? [] : spec.words;
    this.owner = spec.owner === undefined ? '' : spec.owner;
    this.position = spec.position === undefined ? '' : spec.position;
    this.rotation = spec.rotation === undefined ? 0 : spec.rotation;
    this.parkedPosition = spec.parkedPosition === undefined ? '' : spec.parkedPosition;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.rotation = spec.rotation === undefined ? 0 : spec.rotation;
    this.isExtra = spec.isExtra === undefined ? false : spec.isExtra;
    this.isRotating = spec.isRotating === undefined ? false : spec.isRotating;
    this.justDropped = spec.justDropped === undefined ? false : spec.justDropped;
  }
}
