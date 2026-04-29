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
      // Shown under the big VOLNO status word when there is no event today
      // (hero block is hidden in that case).
      'freeRest' : 'Volno do konce dne',
    },

    // Time band ("Od → Do") and remaining-time line below the hero.
    'time' : {
      'from' : 'Od',
      'to' : 'Do',
      'remaining' : 'Zbývá',
      'startsIn' : 'Začíná za',
      'freeFor' : 'Volno ještě',
      // Suffixes used by fmtDurationHm: < 90 min stays in minutes,
      // 90 min – 24 h switches to hours + remainder, >= 24 h to days.
      'minSuffix' : 'min',
      'hourSuffix' : 'h',
      'daySuffix' : 'd',
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
      'bookCustom' : 'Rezervovat na čas…',
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
      'success' : 'Hotovo ✓',
      'conflict' : 'Slot byl mezitím obsazen — vyberte jiný čas',
      'error' : 'Rezervaci se nepodařilo dokončit',
    },

    'bookingModal' : {
      'title' : 'Nová rezervace',
      'selectedTime' : 'Vybraný čas',
      'selectionLabel' : 'Vaše rezervace',
      'from' : 'Od',
      'to' : 'Do',
      'durationSuffix' : 'min',
      'quickButtonSuffix' : 'min',
      'room' : 'Místnost',
      'subject' : 'Předmět',
      'subjectPlaceholder' : 'Volitelné',
      'cancel' : 'Zrušit',
      'confirm' : 'Rezervovat',
      'todayBadge' : 'Dnes',
      'popup' : {
        'booking' : 'Rezervuji…',
        'success' : 'Hotovo ✓',
        'conflict' : 'Slot byl mezitím obsazen — vyberte jiný čas',
        'error' : 'Rezervaci se nepodařilo dokončit',
      },
    },

    'keyboard' : {
      'done' : 'Hotovo',
      'shift' : 'Shift',
      'digits' : '123',
      'letters' : 'ABC',
      'space' : '',
      'langToggle' : { 'cs' : 'CZ', 'en' : 'EN' },
    },
  },
};
