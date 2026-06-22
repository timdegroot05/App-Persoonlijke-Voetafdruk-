import { FiTarget } from "react-icons/fi"
import MobilePageShell from "../components/MobilePageShell"
import ForestVisualization from "../components/forest/ForestVisualization"

function BosGame() {
  return (
    <MobilePageShell
      title="Missies"
      icon={<FiTarget />}
      className="forest-page"
      contentClassName="forest-shell-content"
    >
      <ForestVisualization mode="game" />
    </MobilePageShell>
  )
}

export default BosGame
