export interface ProductPreset {
  id: string;
  productName: string;
  productAdvantages: string;
  productLink: string;
  topic: string;
  createdAt: string;
}

const STORAGE_KEY = "blog_product_presets";

function getSavedPresets(): ProductPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllPresets(): ProductPreset[] {
  return getSavedPresets().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function savePreset(data: {
  productName: string;
  productAdvantages: string;
  productLink: string;
  topic: string;
}): ProductPreset {
  const presets = getSavedPresets();
  const preset: ProductPreset = {
    id: `preset-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
  presets.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  return preset;
}

export function deletePreset(id: string): void {
  const presets = getSavedPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}
