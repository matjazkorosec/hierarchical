export const FONT_FAMILIES = [
  { name: 'Arial', stack: 'Arial, Helvetica, Sans-Serif' },
  { name: 'Impact', stack: 'Impact, Charcoal, Sans-Serif' },
  { name: 'Georgia', stack: 'Georgia, Times New Roman, Times, Serif' },
  { name: 'Lucida Console', stack: 'Lucida Console, Monaco, Monospace' },
  { name: 'Comic Sans MS', stack: 'Comic Sans MS, Textile, Cursive' },
];

export const DEFAULT_SETTINGS = {
  fontSize: '14px',
  fontFamily: FONT_FAMILIES[0].stack,
  defaultColor: '#213547',
  positiveColor: '#008000',
  negativeColor: '#ff0000',
  skippedColor: '#213547',
  debugColor: '#cea309',
  usePositiveNegativeColors: false,
};

// load from local storage
export const getStoredSettings = () => {
  const stored = localStorage.getItem('treeSettings');
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const applyStyles = (settings: typeof DEFAULT_SETTINGS) => {
  document.documentElement.style.setProperty(
    '--tree-font-size',
    settings.fontSize
  );
  document.documentElement.style.setProperty(
    '--tree-font-family',
    settings.fontFamily
  );
  document.documentElement.style.setProperty(
    '--default-color',
    settings.defaultColor
  );
  document.documentElement.style.setProperty(
    '--skipped-color',
    settings.skippedColor
  );
  document.documentElement.style.setProperty(
    '--debug-color',
    settings.debugColor
  );

  if (settings.usePositiveNegativeColors) {
    document.documentElement.style.setProperty(
      '--positive-color',
      settings.positiveColor
    );
    document.documentElement.style.setProperty(
      '--negative-color',
      settings.negativeColor
    );
  } else {
    document.documentElement.style.setProperty(
      '--positive-color',
      settings.defaultColor
    );
    document.documentElement.style.setProperty(
      '--negative-color',
      settings.defaultColor
    );
  }
};
