import AppHeader from "../components/AppHeader"
import BottomNav from "../components/BottomNav"
import { LuLeaf } from "react-icons/lu"

const tipsList = [
  {
    title: "Pak vaker de fiets",
    body: "Voor korte ritten is fietsen of lopen vaak de snelste manier om direct minder CO2 uit te stoten.",
  },
  {
    title: "Eet vaker plantaardig",
    body: "Een paar vegetarische dagen per week kunnen je persoonlijke voetafdruk al merkbaar omlaag brengen.",
  },
  {
    title: "Let op sluipverbruik",
    body: "Zet apparaten echt uit of gebruik een stekkerdoos met schakelaar om onnodig energieverbruik te voorkomen.",
  },
  {
    title: "Reis slimmer",
    body: "Vergelijk auto, trein en bus voor vaste routes. Vooral op weekbasis kan het verschil groot zijn.",
  },
]

function Tips() {
  return (
    <div className="calculator-page tips-page">
      <AppHeader title="Tips" icon={<LuLeaf />} />

      <div className="tips-content">
        <section className="calculator-card tips-hero-card">
          <p className="section-label dark">Slimme keuzes</p>
          <h1 className="calculator-title">Kleine acties, minder uitstoot</h1>
          <p className="calculator-text">
            Op deze pagina staan praktische tips die passen bij een CO2-app:
            snel toepasbaar, overzichtelijk en gericht op je dagelijkse keuzes.
          </p>

          <img
            className="tips-hero-image"
            src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80"
            alt="Groen landschap dat duurzame keuzes en minder CO2 uitstoot verbeeldt"
          />
        </section>

        <section className="tips-list">
          {tipsList.map((tip) => (
            <article key={tip.title} className="tips-list-card">
              <p className="section-label dark">Tip</p>
              <h2>{tip.title}</h2>
              <p>{tip.body}</p>
            </article>
          ))}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default Tips
