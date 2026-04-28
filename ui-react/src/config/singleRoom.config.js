module.exports = {
  // ─── Classic UI (REACT_APP_UI_VARIANT=classic) ──────────────────────────────
  'nextUp' : 'Následuje',
  'statusAvailable' : 'Volno',
  'statusBusy' : 'Obsazeno',
  'upcomingTitle' : 'Nadcházející',

  // ─── Glass UI (REACT_APP_UI_VARIANT=glass, default) ─────────────────────────
  'glass' : {
    'roomLabel' : 'Zasedací místnost',

    // Big status word in the main card (uppercase by convention).
    'states' : {
      'free' : 'VOLNO',
      'soon' : 'ZAČÍNÁ BRZY',
      'occupied' : 'OBSAZENO',
    },

    // Compact label for the corner status pill.
    'shortStates' : {
      'free' : 'Volno',
      'soon' : 'Začíná brzy',
      'occupied' : 'Obsazeno',
    },

    // Hero block label above the organizer/time pair.
    'hero' : {
      'occupied' : 'Právě obsazuje',
      'soon' : 'Začíná za chvíli',
      'free' : 'Následuje',
    },

    // Time band ("Od → Do") and remaining-time line below the hero.
    'time' : {
      'from' : 'Od',
      'to' : 'Do',
      'remaining' : 'Zbývá',
      'startsIn' : 'Začíná za',
      'freeFor' : 'Volno ještě',
      'minSuffix' : 'min',
    },

    'agenda' : {
      'title' : 'Nadcházející',
      'empty' : 'Žádná další událost dnes',
    },

    'backLink' : '← Ostatní místnosti',

    // Booking buttons + dropdown.
    'buttons' : {
      'bookNow' : 'Rezervovat teď',
      'bookAfter' : 'Rezervovat po',
      'bookAfterNext' : 'Rezervovat po následující',
      'extend' : 'Prodloužit',
      'end' : 'Ukončit',
      'confirmEnd' : 'Opravdu ukončit?',
      'yes' : 'Ano',
      'no' : 'Ne',
      'minutesSuffix' : 'minut',
      'noFreeSlot' : 'Žádný volný čas',
    },

    'popup' : {
      'booking' : 'Probíhá rezervace... Prosím vyčkejte!',
      'extending' : 'Prodlužuji rezervaci... Prosím vyčkejte!',
      'canceling' : 'Ruším rezervaci... Prosím vyčkejte!',
    },
  },
};
