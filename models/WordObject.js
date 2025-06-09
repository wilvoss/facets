export function WordObject(spec = {}) {
  return {
    id: spec.id ?? -1,
    value: spec.value ?? '',
  };
}
