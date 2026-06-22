import { LuTrees } from "react-icons/lu"
import AppHeader from "../components/AppHeader"
import BottomNav from "../components/BottomNav"
import ForestVisualization from "../components/forest/ForestVisualization"

function Bos() {
  return (
    <main className="forest-game-page">
      <AppHeader title="Bos" icon={<LuTrees />} />
      <ForestVisualization />
      <BottomNav />
    </main>
  )
}

export default Bos
