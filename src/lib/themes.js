export const THEMES = {
  burgundy: { name: 'Burgundy',     primary: '#7B1D35', dark: '#5C1528', light: '#FBF0F3' },
  ocean:    { name: 'Ocean Blue',   primary: '#1B4F8A', dark: '#133A6B', light: '#EEF4FB' },
  forest:   { name: 'Forest Green', primary: '#1A5C3A', dark: '#134429', light: '#EEF7F2' },
  slate:    { name: 'Slate',        primary: '#2D3748', dark: '#1A202C', light: '#F1F5F9' },
}

export function applyTheme(name) {
  document.documentElement.setAttribute('data-theme', name)
  localStorage.setItem('pl_theme', name)
}

export function getStoredTheme() {
  return localStorage.getItem('pl_theme') || 'burgundy'
}
