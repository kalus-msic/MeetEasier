module.exports = {
  // ─── Classic UI (REACT_APP_UI_VARIANT=classic) ──────────────────────────────
  'board' : {
    'nextUp' : 'Nasleduje',
    'statusAvailable' : 'Volno',
    'statusBusy' : 'Busy',
    'statusError' : 'Error'
  },

  'navbar' : {
    'title' : 'Zasedací místnosti',
  },

  'roomFilter' : {
    'filterTitle' : 'Pobočky',
    'filterAllTitle' : 'Všechny místnosti',
  },

  // ─── Glass UI (REACT_APP_UI_VARIANT=glass, default) ─────────────────────────
  // Localizable strings + day/month names for both Glass dashboard and Glass
  // single-room view (single-room imports the dates from here too).

  'days' : ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
  'months' : [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince',
  ],

  'glass' : {
    'title' : 'Zasedací místnosti',
    'branchAll' : 'Všechny místnosti',
    'branchLabel' : 'Pobočky',
    'loading' : 'Načítání',

    // Single-word state shown next to the colored bar in each room row.
    'states' : {
      'free' : 'Volno',
      'soon' : 'Brzy',
      'occupied' : 'Obsazeno',
    },

    // Top summary cards.
    'summary' : {
      'free' : 'Volných',
      'soon' : 'Začíná brzy',
    },

    // Per-room row.
    'rowHeads' : {
      'inProgress' : 'Probíhá',
      'upcomingSoon' : 'Začíná za chvíli',
      'next' : 'Následuje',
    },
    'rowRight' : {
      'remaining' : 'Zbývá',
      'startsIn' : 'Začíná za',
      'freeFor' : 'Volno ještě',
      'free' : 'Volno',
      'minSuffix' : 'min',
    },

    'emptyDayLabel' : 'Žádná další událost dnes',
    'emptyList' : 'Žádné místnosti k zobrazení',
    'loadError' : 'Chyba načítání místností',
  },
};
