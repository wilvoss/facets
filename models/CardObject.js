/// <reference path="../helpers/console-enhancer.js" />
/// <reference path="../models/WordObject.js" />
let index = 0;

class CardObject {
  constructor(spec) {
    this.id = index++;
    this.words = spec.words === undefined ? [] : spec.words;
    this.position = spec.position === undefined ? '' : spec.position;
    this.rotation = spec.rotation === undefined ? 0 : spec.rotation;
    this.isSelected = spec.isSelected === undefined ? false : spec.isSelected;
    this.isInTray = spec.isInTray === undefined ? false : spec.isInTray;
    this.isExtra = spec.isExtra === undefined ? false : spec.isExtra;
    this.isRotating = spec.isRotating === undefined ? false : spec.isRotating;
    this.justDropped = spec.justDropped === undefined ? false : spec.justDropped;
  }
}
