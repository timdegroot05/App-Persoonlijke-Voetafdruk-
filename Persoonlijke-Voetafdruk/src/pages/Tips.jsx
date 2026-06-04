import MobilePageShell from "../components/MobilePageShell"
import { LuLeaf } from "react-icons/lu"
import { factsList, tipsList } from "../data/tips"

function Tips() {
  return (
    <MobilePageShell
      title="Tips & Feitjes"
      icon={<LuLeaf />}
      className="tips-page"
      contentClassName="tips-content"
    >
        <section className="calculator-card tips-hero-card">
          <p className="section-label dark">Slimme keuzes</p>
          <h1 className="calculator-title">Tips en feitjes voor minder uitstoot</h1>
          <p className="calculator-text">
            Op deze pagina staan praktische tips en korte feitjes die je helpen
            om bewuster te kiezen in je dagelijkse leven.
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

        <section className="tips-list">
          {factsList.map((fact, index) => (
            <article key={index} className="tips-list-card">
              <p className="section-label dark">Feitje</p>
              <h2>Wist je dat?</h2>
              <p>{fact}</p>
            </article>
          ))}
        </section>
    </MobilePageShell>
  )
}

export default Tips
