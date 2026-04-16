const CO2_CONFIG = {
  // Indirecte uitstoot die niet direct door de vragenlijst wordt gemeten,
  // zoals infrastructuur, publieke diensten en overige achtergrondconsumptie.
  achtergrondimpact: 75,
  housingBase: {
    Studentenwoning: 12,
    Appartement: 18,
    Rijtjeshuis: 28,
    "Vrijstaand huis": 42,
    Anders: 24,
  },
  householdFactor: {
    "1": 1,
    "2": 1.8,
    "3-4": 3.2,
    "5+": 4.6,
  },
  energyMultiplier: {
    "Grijze stroom": 1.15,
    "Groene stroom": 0.9,
    Gas: 1.2,
    Warmtepomp: 0.75,
    "Weet ik niet": 1,
  },
  insulationMultiplier: {
    Slecht: 1.35,
    Gemiddeld: 1.1,
    Goed: 0.9,
    "Zeer goed": 0.7,
  },
  solarMultiplier: {
    Ja: 0.85,
    Nee: 1,
    "Weet ik niet": 1,
  },
  gasMultiplier: {
    Ja: 1.15,
    Nee: 0.9,
    "Weet ik niet": 1,
  },
  showerMultiplier: {
    "0-5 min": 0.95,
    "5-10 min": 1,
    "10-15 min": 1.08,
    "15+ min": 1.18,
  },
  heatingMultiplier: {
    Niet: 0.85,
    "Af en toe": 1,
    "Elke avond": 1.12,
    "Hele dag": 1.25,
  },
  energySavingMultiplier: {
    Altijd: 0.92,
    Vaak: 0.97,
    Soms: 1,
    Nooit: 1.07,
  },
  carKilometers: {
    "0 km": 0,
    "0-50 km": 25,
    "50-150 km": 100,
    "150-300 km": 225,
    "300+ km": 400,
  },
  carEmissionFactor: {
    Benzine: 0.124,
    Diesel: 0.18,
    Elektrisch: 0.067,
    Hybride: 0.124,
  },
  publicTransportDays: {
    "0 keer": 0,
    "1-3 keer": 2,
    "4-7 keer": 5.5,
    Dagelijks: 7,
  },
  publicTransportMinutes: {
    "10-30 minuten": 20,
    "30-60 minuten": 45,
    "1-1.5 uur": 75,
    "1.5-2 uur": 105,
    "2+ uur": 135,
  },
  publicTransportSpeedKmPerHour: 45,
  publicTransportEmissionPerKm: 0.014,
  food: {
    meat: {
      "0 keer": 0,
      "1-2 keer": 3,
      "3-5 keer": 8,
      "6-7 keer": 13,
    },
    dairy: {
      Niet: 0,
      "1-3 keer": 1,
      "4-7 keer": 2.5,
      "Dagelijks meerdere keren": 4,
    },
    plantBased: {
      Niet: 0,
      "1-2 keer": -0.5,
      "3-5 keer": -1.5,
      "6-7 keer": -3,
    },
  },
  consumption: {
    clothing: {
      Nee: 0,
      "1 item": 6,
      "2-3 items": 15,
      "4+ items": 30,
    },
    electronics: {
      Nee: 0,
      "Klein product (accessoire etc.)": 8,
      "Groot product (telefoon/laptop etc.)": 60,
    },
    secondHand: {
      Ja: -8,
      Nee: 0,
    },
  },
  transportModeCorrection: {
    Auto: 1.03,
    "Openbaar vervoer": 0.99,
    "Fiets/lopend": 0.97,
  },
}

function getAnswerText(answers, questionId) {
  return answers?.[questionId]?.text ?? null
}

function getMappedValue(mapping, key, fallback = 0) {
  if (!key || !(key in mapping)) {
    return fallback
  }

  return mapping[key]
}

function roundKg(value) {
  return Number(Math.max(0, value).toFixed(2))
}

// Onboarding answers work as housing proxies because exact household meter data is unavailable.
export function calculateHousingBase(profileAnswers = {}) {
  const housingType = getAnswerText(profileAnswers, "housingType")
  const householdSize = getAnswerText(profileAnswers, "householdSize")
  const energySource = getAnswerText(profileAnswers, "primaryEnergySource")
  const solarPanels = getAnswerText(profileAnswers, "hasSolarPanels")
  const usesGas = getAnswerText(profileAnswers, "usesGasAtHome")
  const insulation = getAnswerText(profileAnswers, "homeInsulation")

  const housingBase = getMappedValue(CO2_CONFIG.housingBase, housingType, 24)
  const householdFactor = getMappedValue(CO2_CONFIG.householdFactor, householdSize, 1.8)
  const energyMultiplier = getMappedValue(CO2_CONFIG.energyMultiplier, energySource, 1)
  const insulationMultiplier = getMappedValue(CO2_CONFIG.insulationMultiplier, insulation, 1.1)
  const solarMultiplier = getMappedValue(CO2_CONFIG.solarMultiplier, solarPanels, 1)
  const gasMultiplier = getMappedValue(CO2_CONFIG.gasMultiplier, usesGas, 1)

  return roundKg(
    (housingBase / householdFactor) *
      energyMultiplier *
      insulationMultiplier *
      solarMultiplier *
      gasMultiplier
  )
}

// Weekly behavior adjusts the base housing estimate up or down instead of replacing it.
export function calculateAdjustedHousingEmission(profileAnswers = {}, weeklyAnswers = {}) {
  const housingBase = calculateHousingBase(profileAnswers)
  const shower = getAnswerText(weeklyAnswers, "showerDuration")
  const heating = getAnswerText(weeklyAnswers, "heatingUsage")
  const energySaving = getAnswerText(weeklyAnswers, "energySaving")

  const showerMultiplier = getMappedValue(CO2_CONFIG.showerMultiplier, shower, 1)
  const heatingMultiplier = getMappedValue(CO2_CONFIG.heatingMultiplier, heating, 1)
  const energySavingMultiplier = getMappedValue(
    CO2_CONFIG.energySavingMultiplier,
    energySaving,
    1
  )

  return roundKg(
    housingBase * showerMultiplier * heatingMultiplier * energySavingMultiplier
  )
}

export function calculateCarEmission(profileAnswers = {}, weeklyAnswers = {}) {
  if (getAnswerText(profileAnswers, "hasCar") !== "Ja") {
    return 0
  }

  const carType = getAnswerText(profileAnswers, "carType")
  const carKilometers = getAnswerText(weeklyAnswers, "carKilometers")
  const kilometers = getMappedValue(CO2_CONFIG.carKilometers, carKilometers, 0)
  const factor = getMappedValue(CO2_CONFIG.carEmissionFactor, carType, 0.124)

  return roundKg(kilometers * factor)
}

export function calculatePublicTransportEmission(weeklyAnswers = {}) {
  const frequency = getAnswerText(weeklyAnswers, "publicTransportFrequency")

  if (!frequency || frequency === "0 keer") {
    return 0
  }

  const duration = getAnswerText(weeklyAnswers, "publicTransportDuration")
  const daysPerWeek = getMappedValue(CO2_CONFIG.publicTransportDays, frequency, 0)
  const minutesPerDay = getMappedValue(CO2_CONFIG.publicTransportMinutes, duration, 0)
  const kilometers =
    daysPerWeek *
    (minutesPerDay / 60) *
    CO2_CONFIG.publicTransportSpeedKmPerHour

  return roundKg(kilometers * CO2_CONFIG.publicTransportEmissionPerKm)
}

export function calculateFoodEmission(weeklyAnswers = {}) {
  const meat = getAnswerText(weeklyAnswers, "meatFrequency")
  const dairy = getAnswerText(weeklyAnswers, "dairyFrequency")
  const plantBased = getAnswerText(weeklyAnswers, "plantBasedFrequency")

  const meatScore = getMappedValue(CO2_CONFIG.food.meat, meat, 0)
  const dairyScore = getMappedValue(CO2_CONFIG.food.dairy, dairy, 0)
  const plantBasedCorrection = getMappedValue(CO2_CONFIG.food.plantBased, plantBased, 0)

  return roundKg(Math.max(0, meatScore + dairyScore + plantBasedCorrection))
}

export function calculateConsumptionEmission(weeklyAnswers = {}) {
  const clothing = getAnswerText(weeklyAnswers, "newClothing")
  const electronics = getAnswerText(weeklyAnswers, "electronicsPurchase")
  const secondHand = getAnswerText(weeklyAnswers, "secondHandPurchase")

  const clothingScore = getMappedValue(CO2_CONFIG.consumption.clothing, clothing, 0)
  const electronicsScore = getMappedValue(
    CO2_CONFIG.consumption.electronics,
    electronics,
    0
  )
  const secondHandCorrection = getMappedValue(
    CO2_CONFIG.consumption.secondHand,
    secondHand,
    0
  )

  return roundKg(Math.max(0, clothingScore + electronicsScore + secondHandCorrection))
}

// Main transport mode adds only a tiny consistency correction and never replaces the real transport logic.
function applyTransportModeCorrection(transportEmission, weeklyAnswers = {}) {
  const mainTransportMode = getAnswerText(weeklyAnswers, "mainTransportMode")
  const correction = getMappedValue(CO2_CONFIG.transportModeCorrection, mainTransportMode, 1)

  return roundKg(transportEmission * correction)
}

export function calculateImpact(profileAnswers = {}, weeklyAnswers = {}) {
  const achtergrondimpact = CO2_CONFIG.achtergrondimpact
  const aangepaste_woninguitstoot = calculateAdjustedHousingEmission(
    profileAnswers,
    weeklyAnswers
  )
  const auto_uitstoot = calculateCarEmission(profileAnswers, weeklyAnswers)
  const ov_uitstoot = calculatePublicTransportEmission(weeklyAnswers)
  const voeding_uitstoot = calculateFoodEmission(weeklyAnswers)
  const consumptie_uitstoot = calculateConsumptionEmission(weeklyAnswers)
  const transport_uitstoot = applyTransportModeCorrection(
    auto_uitstoot + ov_uitstoot,
    weeklyAnswers
  )
  const totale_weekuitstoot = roundKg(
    achtergrondimpact +
      aangepaste_woninguitstoot +
      transport_uitstoot +
      voeding_uitstoot +
      consumptie_uitstoot
  )

  return {
    achtergrondimpact,
    totale_weekuitstoot,
    aangepaste_woninguitstoot,
    auto_uitstoot,
    ov_uitstoot,
    voeding_uitstoot,
    consumptie_uitstoot,
    total: totale_weekuitstoot,
    categories: {
      achtergrondimpact,
      wonen: aangepaste_woninguitstoot,
      transport: transport_uitstoot,
      voeding: voeding_uitstoot,
      consumptie: consumptie_uitstoot,
    },
  }
}
