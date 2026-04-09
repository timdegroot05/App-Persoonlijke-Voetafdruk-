export const questions = [

  // ======================
  // VOEDING
  // ======================

  {
    category: "voeding",
    title: "Voeding",
    question: "Hoe vaak eet je vlees per week?",
    answers: [
      { text: "Elke dag", impact: 10 },
      { text: "3-5 keer per week", impact: 7 },
      { text: "1-2 keer per week", impact: 4 },
      { text: "Nooit", impact: 1 }
    ]
  },
 
  {
    category: "voeding",
    title: "Voeding",
    question: "Hoe vaak consumeer je zuivel per week?",
    answers: [
      { text: "Elke dag", impact: 10 },
      { text: "3-5 keer per week", impact: 7 },
      { text: "1-2 keer per week", impact: 4 },
      { text: "Nooit", impact: 1 }
    ]
  },

  {
    category: "voeding",
    title: "Voeding",
    question: "Koop je lokale producten?",
    answers: [
      { text: "Altijd", impact: 2 },
      { text: "Vaak", impact: 5 },
      { text: "Soms", impact: 7 },
      { text: "Nooit", impact: 10 }
    ]
  },

  {
    category: "voeding",
    title: "Voeding",
    question: "Hoe vaak eet je plantaardig per week?",
    answers: [
      { text: "Elke dag", impact: 1 },
      { text: "3-5 keer per week", impact: 4 },
      { text: "1-2 keer per week", impact: 7 },
      { text: "Nooit", impact: 10 }
    ]
  },

  // ======================
  // TRANSPORT
  // ======================

  {
    category: "transport",
    title: "Transport",
    question: "Hoe ga je meestal naar werk/school?",
    answers: [
      { text: "Auto", impact: 10 },
      { text: "OV", impact: 6 },
      { text: "Fiets", impact: 2 },
      { text: "Lopen", impact: 1 }
    ]
  },

  {
    category: "transport",
    title: "Transport",
    question: "Welk type auto rijd je (indien van toepassing)?",
    answers: [
      { text: "Elektrisch", impact: 3 },
      { text: "Hybride", impact: 6 },
      { text: "Benzine", impact: 8 },
      { text: "Diesel", impact: 10 },
      { text: "Geen auto", impact: 1 }
    ]
  },

  {
    category: "transport",
    title: "Transport",
    question: "Hoeveel kilometer rijd je ongeveer per week met de auto?",
    answers: [
      { text: "0-50 km", impact: 3 },
      { text: "50-150 km", impact: 6 },
      { text: "150-300 km", impact: 8 },
      { text: "300+ km", impact: 10 },
      { text: "Ik gebruik geen auto", impact: 1 }
    ]
  },

  {
    category: "transport",
    title: "Transport",
    question: "Ga je wel eens met de auto op vakantie?",
    answers: [
      { text: "Ja", impact: 5},
      { text: "Nee", impact: 1}
    ]
  },
  
  {
    category: "transport",
    title: "Transport",
    question: "Hoe vaak vlieg je gemiddeld per jaar?",
    answers: [
      { text: "Nooit", impact: 1},
      { text: "1 keer of minder", impact: 5},
      { text: "1-2 keer", impact: 10},
      { text: "3-4 keer", impact: 15},
      { text: "5+ keer", impact: 23}
    ]
  },

  {
    category: "transport",
    title: "Transport",
    question: "Waar vlieg je meestal naartoe?",
    answers: [
      { text: "Binnen Europa", impact: 9},
      { text: "Buiten Europa", impact: 6},
      { text: "Beide", impact: 12},
      { text: "Ik vlieg niet", impact: 0}
      ]
  },

  // ======================
  // ENERGIE
  // ======================

  {
    category: "energie",
    title: "Energie en Wonen",
    question: "Wat is je belangrijkste energiebron thuis?",
    answers: [
      { text: "Grijze stroom", impact: 9 },
      { text: "Gas", impact: 8 },
      { text: "Warmtepomp", impact: 6 },
      { text: "Groene stroom", impact: 1 },
      { text: "Weet ik niet/Anders", impact: 5 }
    ]
  },

  {
    category: "energie",
    title: "Energie en Wonen",
    question: "Uit hoeveel personen bestaat je huishouden?",
    answers: [
      { text: "1-2", impact: 3 },
      { text: "3-4", impact: 6 },
      { text: "5+", impact: 8 },
    ]
  },

  {
    category: "energie",
    title: "Energie en Wonen",
    question: "Woon je in een:",
    answers: [
      { text: "Appartement", impact: 4 },
      { text: "Rijtjeshuis", impact: 7 },
      { text: "Vrijstaand huis", impact: 9 },
      { text: "Anders", impact: 7 }
    ]
  },

  {
    category: "energie",
    title: "Energie en Wonen",
    question: "Hoe lang douche je gemiddeld per dag?",
    answers: [
      { text: "0-5 minuten", impact: 3 },
      { text: "5-10 minuten", impact: 6 },
      { text: "10-15 minuten", impact: 9 },
      { text: "15+ minuten", impact: 11 }
    ]
  },

  {
    category: "energie",
    title: "Energie en Wonen",
    question: "Hoe vaak zet je de verwarming aan in de winter",
    answers: [
      { text: "Altijd aan", impact: 10 },
      { text: "Meestal aan", impact: 7 },
      { text: "Af en toe", impact: 4 },
      { text: "Bijna nooit", impact: 2 }
    ]
  },

  // =====================
  // CONSUMPTIE
  // =====================

  {
    category: "consumptie",
    title: "Consumptie",
    question: "Hoe vaak koop je 'nieuw' nieuwe kleding",
    answers: [
      { text: "Wekelijks", impact: 10 },
      { text: "Maandelijks", impact: 7 },
      { text: "Elk seizoen", impact: 4 },
      { text: "Een paar keer per jaar", impact: 3 },
      { text: "Zelden", impact: 1 }
    ]
  },

  {
    category: "consumptie",
    title: "Consumptie",
    question: "Hoe vaak koop je 'nieuw' nieuwe elektronica",
    answers: [
      { text: "Wekelijks", impact: 10 },
      { text: "Maandelijks", impact: 7 },
      { text: "Elk seizoen", impact: 4 },
      { text: "Een paar keer per jaar", impact: 3 },
      { text: "Zelden", impact: 1 }
    ]
  },

  {
    category: "consumptie",
    title: "Consumptie",
    question: "Koop je tweedehands spullen?",
    answers: [
      { text: "Altijd", impact: 1 },
      { text: "Vaak", impact: 3 },
      { text: "Soms", impact: 6 },
      { text: "Nooit", impact: 9}
    ]
  }
]



