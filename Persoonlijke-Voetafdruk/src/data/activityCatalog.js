export const ACTIVITY_SECTIONS = [
  {
    id: "transport",
    label: "Transport",
    items: [
      { id: "auto", label: "Auto", unit: "km", emissionFactor: 0.124, resultCategory: "transport" },
      { id: "trein", label: "Trein", unit: "km", emissionFactor: 0.014, resultCategory: "transport" },
      { id: "bus", label: "Bus", unit: "km", emissionFactor: 0.014, resultCategory: "transport" },
      { id: "tram", label: "Tram", unit: "km", emissionFactor: 0.014, resultCategory: "transport" },
      { id: "metro", label: "Metro", unit: "km", emissionFactor: 0.014, resultCategory: "transport" },
      { id: "ander-ov", label: "Ander OV", unit: "km", emissionFactor: 0.014, resultCategory: "transport" },
    ],
  },
  {
    id: "vluchten",
    label: "Vluchten",
    items: [
      { id: "korte-vlucht", label: "Korte vlucht", unit: "passagier-km", emissionFactor: 0.234, resultCategory: "transport" },
      { id: "middellange-vlucht", label: "Middellange vlucht", unit: "passagier-km", emissionFactor: 0.172, resultCategory: "transport" },
      { id: "lange-vlucht", label: "Lange vlucht", unit: "passagier-km", emissionFactor: 0.157, resultCategory: "transport" },
    ],
  },
  {
    id: "voeding",
    label: "Voeding",
    items: [
      { id: "rundvlees", label: "Rundvlees", unit: "gram", emissionFactor: 0.027, resultCategory: "food" },
      { id: "varkensvlees", label: "Varkensvlees", unit: "gram", emissionFactor: 0.012, resultCategory: "food" },
      { id: "kip", label: "Kip", unit: "gram", emissionFactor: 0.007, resultCategory: "food" },
      { id: "zuivel", label: "Zuivel", unit: "liter", emissionFactor: 1.4, resultCategory: "food" },
    ],
  },
  {
    id: "kleding",
    label: "Kleding",
    items: [
      { id: "t-shirt", label: "T-shirt", unit: "stuk", emissionFactor: 7, resultCategory: "consumption" },
      { id: "broek", label: "Broek", unit: "stuk", emissionFactor: 33, resultCategory: "consumption" },
      { id: "schoenen", label: "Schoenen", unit: "paar", emissionFactor: 14, resultCategory: "consumption" },
      { id: "jas", label: "Jas", unit: "stuk", emissionFactor: 25, resultCategory: "consumption" },
      { id: "hoodie", label: "Hoodie", unit: "stuk", emissionFactor: 12, resultCategory: "consumption" },
    ],
  },
  {
    id: "elektronica",
    label: "Elektronica",
    items: [
      { id: "smartphone", label: "Smartphone", unit: "stuk", emissionFactor: 70, resultCategory: "consumption" },
      { id: "laptop", label: "Laptop", unit: "stuk", emissionFactor: 300, resultCategory: "consumption" },
      { id: "televisie", label: "Televisie", unit: "stuk", emissionFactor: 400, resultCategory: "consumption" },
      { id: "tablet", label: "Tablet", unit: "stuk", emissionFactor: 120, resultCategory: "consumption" },
      { id: "gameconsole", label: "Gameconsole", unit: "stuk", emissionFactor: 90, resultCategory: "consumption" },
      { id: "desktop-pc", label: "Desktop PC", unit: "stuk", emissionFactor: 600, resultCategory: "consumption" },
      { id: "monitor", label: "Monitor", unit: "stuk", emissionFactor: 200, resultCategory: "consumption" },
    ],
  },
  {
    id: "overig",
    label: "Overige consumptie",
    items: [
      {
        id: "kleine-aankoop",
        label: "Kleine nieuwe aankoop",
        unit: "stuk",
        emissionFactor: 3,
        resultCategory: "consumption",
        examples: "CD, computermuis, oplader, boek",
      },
      {
        id: "middel-aankoop",
        label: "Middel nieuwe aankoop",
        unit: "stuk",
        emissionFactor: 15,
        resultCategory: "consumption",
        examples: "koptelefoon, toetsenbord, rugzak",
      },
      {
        id: "grote-aankoop",
        label: "Grote nieuwe aankoop",
        unit: "stuk",
        emissionFactor: 80,
        resultCategory: "consumption",
        examples: "stoel, meubel, apparaat",
      },
    ],
  },
]

export function getAllActivityItems() {
  return ACTIVITY_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      sectionId: section.id,
      sectionLabel: section.label,
    }))
  )
}
