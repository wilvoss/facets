export function LanguageObject(spec = {}) {
  return {
    name: spec.name ?? '',
    tag: spec.tag ?? '',
    enabled: spec.enabled ?? true,
    isSelected: spec.isSelected ?? false,
  };
}
