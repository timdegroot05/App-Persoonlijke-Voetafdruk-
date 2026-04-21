export const initialProfileQuestions = [
  {
    id: "housingType",
    category: "wonen",
    title: "Wonen",
    summaryLabel: "Woning",
    question: "In wat voor woning woon je?",
    answers: [
      { text: "Appartement", impact: 3 },
      { text: "Rijtjeshuis", impact: 5 },
      { text: "Vrijstaand huis", impact: 8 },
      { text: "Studentenwoning", impact: 2 },
      { text: "Anders", impact: 4 },
    ],
  },
  {
    id: "householdSize",
    category: "wonen",
    title: "Wonen",
    summaryLabel: "Huishouden",
    question: "Uit hoeveel personen bestaat je huishouden?",
    answers: [
      { text: "1", impact: 4 },
      { text: "2", impact: 3 },
      { text: "3-4", impact: 2 },
      { text: "5+", impact: 3 },
    ],
  },
  {
    id: "primaryEnergySource",
    category: "energie",
    title: "Energie",
    summaryLabel: "Energiebron",
    question: "Wat is je belangrijkste energiebron thuis?",
    answers: [
      { text: "Grijze stroom", impact: 8 },
      { text: "Groene stroom", impact: 2 },
      { text: "Gas", impact: 7 },
      { text: "Warmtepomp", impact: 3 },
      { text: "Weet ik niet", impact: 5 },
    ],
  },
  {
    id: "hasSolarPanels",
    category: "energie",
    title: "Energie",
    summaryLabel: "Zonnepanelen",
    question: "Maak je gebruik van zonnepanelen?",
    answers: [
      { text: "Ja", impact: 1 },
      { text: "Nee", impact: 4 },
      { text: "Weet ik niet", impact: 3 },
    ],
  },
  {
    id: "usesGasAtHome",
    category: "energie",
    title: "Energie",
    summaryLabel: "Gas",
    question: "Gebruik je gas in huis?",
    answers: [
      { text: "Ja", impact: 6 },
      { text: "Nee", impact: 1 },
      { text: "Weet ik niet", impact: 4 },
    ],
  },
  {
    id: "hasCar",
    category: "transport",
    title: "Vervoer",
    summaryLabel: "Auto",
    question: "Heb je een auto?",
    answers: [
      { text: "Ja", impact: 5 },
      { text: "Nee", impact: 1 },
    ],
  },
  {
    id: "carType",
    category: "transport",
    title: "Vervoer",
    summaryLabel: "Autotype",
    question: "Zo ja, welk type auto rijd je?",
    showIf: (answers) => answers.hasCar?.text === "Ja",
    answers: [
      { text: "Benzine", impact: 8 },
      { text: "Diesel", impact: 9 },
      { text: "Elektrisch", impact: 2 },
      { text: "Hybride", impact: 5 },
    ],
  },
  {
    id: "homeInsulation",
    category: "wonen",
    title: "Wonen",
    summaryLabel: "Isolatie",
    question: "Hoe goed is je huis geïsoleerd?",
    answers: [
      { text: "Slecht", impact: 8 },
      { text: "Gemiddeld", impact: 5 },
      { text: "Goed", impact: 3 },
      { text: "Zeer goed", impact: 1 },
    ],
  },
]

export const weeklyQuestions = [
  {
    id: "meatFrequency",
    category: "voeding",
    title: "Voeding",
    summaryLabel: "Vlees",
    question: "Hoe vaak heb je vlees gegeten deze week?",
    answers: [
      { text: "0 keer", impact: 1 },
      { text: "1-2 keer", impact: 3 },
      { text: "3-5 keer", impact: 6 },
      { text: "6-7 keer", impact: 8 },
    ],
  },
  {
    id: "dairyFrequency",
    category: "voeding",
    title: "Voeding",
    summaryLabel: "Zuivel",
    question: "Hoe vaak heb je zuivel gegeten deze week?",
    answers: [
      { text: "Niet", impact: 1 },
      { text: "1-3 keer", impact: 3 },
      { text: "4-7 keer", impact: 5 },
      { text: "Dagelijks meerdere keren", impact: 7 },
    ],
  },
  {
    id: "plantBasedFrequency",
    category: "voeding",
    title: "Voeding",
    summaryLabel: "Plantaardig",
    question: "Hoe vaak heb je plantaardig gegeten deze week?",
    answers: [
      { text: "Niet", impact: 8 },
      { text: "1-2 keer", impact: 6 },
      { text: "3-5 keer", impact: 3 },
      { text: "6-7 keer", impact: 1 },
    ],
  },
  {
    id: "carKilometers",
    category: "transport",
    title: "Vervoer",
    summaryLabel: "Autokilometers",
    question: "Hoeveel km heb je deze week met de auto gereden?",
    answers: [
      { text: "0 km", impact: 1 },
      { text: "0-50 km", impact: 3 },
      { text: "50-150 km", impact: 5 },
      { text: "150-300 km", impact: 7 },
      { text: "300+ km", impact: 9 },
    ],
  },
  {
    id: "publicTransportFrequency",
    category: "transport",
    title: "Vervoer",
    summaryLabel: "OV",
    question: "Hoe lang heb je het OV gebruikt deze week?",
    answers: [
      { text: "0 keer", impact: 1 },
      { text: "1-3 keer", impact: 3 },
      { text: "4-7 keer", impact: 4 },
      { text: "Dagelijks", impact: 5 },
    ],
  },
  {
    id: "publicTransportDuration",
    category: "transport",
    title: "Vervoer",
    summaryLabel: "OV-tijd",
    question: "Hoe lang heb je per dag het OV gebruikt?",
    showIf: (answers) => answers.publicTransportFrequency?.text !== "0 keer",
    answers: [
      { text: "10-30 minuten", impact: 2 },
      { text: "30-60 minuten", impact: 3 },
      { text: "1-1.5 uur", impact: 4 },
      { text: "1.5-2 uur", impact: 5 },
      { text: "2+ uur", impact: 6 },
    ],
  },
  {
    id: "mainTransportMode",
    category: "transport",
    title: "Vervoer",
    summaryLabel: "Hoofdvervoer",
    question: "Welk vervoermiddel heb je het meest gebruikt deze week?",
    answers: [
      { text: "Auto", impact: 8 },
      { text: "Openbaar vervoer", impact: 4 },
      { text: "Fiets/lopend", impact: 1 },
    ],
  },
  {
    id: "newClothing",
    category: "consumptie",
    title: "Consumptie",
    summaryLabel: "Kleding",
    question: "Heb je deze week nieuw nieuwe kleding gekocht?",
    answers: [
      { text: "Nee", impact: 1 },
      { text: "1 item", impact: 3 },
      { text: "2-3 items", impact: 5 },
      { text: "4+ items", impact: 8 },
    ],
  },
  {
    id: "electronicsPurchase",
    category: "consumptie",
    title: "Consumptie",
    summaryLabel: "Elektronica",
    question: "Heb je deze week elektronica gekocht?",
    answers: [
      { text: "Nee", impact: 1 },
      { text: "Klein product (accessoire etc.)", impact: 4 },
      { text: "Groot product (telefoon/laptop etc.)", impact: 8 },
    ],
  },
  {
    id: "secondHandPurchase",
    category: "consumptie",
    title: "Consumptie",
    summaryLabel: "Tweedehands",
    question: "Heb je tweedehands gekocht deze week?",
    answers: [
      { text: "Ja", impact: 1 },
      { text: "Nee", impact: 4 },
    ],
  },
  {
    id: "showerDuration",
    category: "energie",
    title: "Energie & dagelijks gedrag",
    summaryLabel: "Douchen",
    question: "Hoe lang douche je gemiddeld per dag deze week?",
    answers: [
      { text: "0-5 min", impact: 1 },
      { text: "5-10 min", impact: 3 },
      { text: "10-15 min", impact: 5 },
      { text: "15+ min", impact: 7 },
    ],
  },
  {
    id: "heatingUsage",
    category: "energie",
    title: "Energie & dagelijks gedrag",
    summaryLabel: "Verwarming",
    question: "Hoe vaak stond de verwarming aan deze week?",
    answers: [
      { text: "Niet", impact: 1 },
      { text: "Af en toe", impact: 3 },
      { text: "Elke avond", impact: 5 },
      { text: "Hele dag", impact: 7 },
    ],
  },
  {
    id: "energySaving",
    category: "energie",
    title: "Energie & dagelijks gedrag",
    summaryLabel: "Besparen",
    question: "Hoe vaak heb je bewust energie bespaard deze week?",
    answers: [
      { text: "Altijd", impact: 1 },
      { text: "Vaak", impact: 2 },
      { text: "Soms", impact: 4 },
      { text: "Nooit", impact: 7 },
    ],
  },
]

export function getVisibleQuestions(questions, answers = {}) {
  return questions.filter((question) => {
    if (typeof question.showIf !== "function") {
      return true
    }

    return question.showIf(answers)
  })
}
