import BottomNav from "../components/BottomNav"
import AppHeader from "../components/AppHeader"
import { LuTrees } from "react-icons/lu"

function BosVisualisatie() {
  return (
    <div className="calculator-page forest-page">
      <AppHeader title="Bos" icon={<LuTrees />} />

      <div className="calculator-card forest-card">
        <p className="section-label dark">Visualisatie</p>
        <h1 className="calculator-title">Jouw Bos</h1>
        <p className="calculator-text">
          Zie je impact als een klein groeiend bos. Hoe duurzamer je keuzes,
          hoe voller en gezonder het bos eruitziet.
        </p>

        <div className="forest-visual">
          <div className="forest-tree large">🌳</div>
          <div className="forest-tree">🌲</div>
          <div className="forest-tree small">🌱</div>
          <div className="forest-tree">🌳</div>
        </div>

        <div className="calculator-grid">
          <div className="calculator-metric">
            <span>Status</span>
            <strong>Groeiend ecosysteem</strong>
          </div>
          <div className="calculator-metric">
            <span>Focus</span>
            <strong>Minder vervoer uitstoot</strong>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default BosVisualisatie
