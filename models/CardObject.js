let index = 0;

export function CardObject(spec = {}) {
  return {
    id: index++,
    words: spec.words ?? [],
    position: spec.position ?? '',
    rotation: spec.rotation ?? 0,
    isSelected: spec.isSelected ?? false,
    isInTray: spec.isInTray ?? false,
    isExtra: spec.isExtra ?? false,
    isRotating: spec.isRotating ?? false,
    wrongGuesses: spec.wrongGuesses ?? { s0: [], s1: [], s2: [], s3: [] },
    justDropped: spec.justDropped ?? false,
  };
}
