import { Routes, Route } from "react-router-dom"
import Welcome from "./pages/Welcome"
import Questionnaire from "./pages/Questionnaire"
import Result from "./pages/Result"
import Overzicht from "./pages/overzichtpages/Overzicht"
import DagelijkseUitstoot from "./pages/overzichtpages/DagelijkseUitstoot"
import WekelijkseUitstoot from "./pages/WekelijkseUitstoot"
import GemiddeldeWeek from "./pages/overzichtpages/GemiddeldeWeek"
import GemiddeldeJaar from "./pages/overzichtpages/GemiddeldeJaar"
import GrootsteCategorie from "./pages/overzichtpages/GrootsteCategorie"
import Activiteiten from "./pages/Activiteiten";
import FoodTasks from "./pages/tasks/Foodtasks";
import TransportTasks from "./pages/tasks/Transporttasks";
import EnergyTasks from "./pages/tasks/EnergyTasks";
import Home from "./pages/Home";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css"



function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/result" element={<Result />} />
        <Route path="/overzicht" element={<Overzicht />} />
        <Route path="/dagelijkse-uitstoot" element={<DagelijkseUitstoot />} />
        <Route path="/wekelijkse-uitstoot" element={<WekelijkseUitstoot />} />
        <Route path="/gemiddelde-week" element={<GemiddeldeWeek />} />
        <Route path="/gemiddelde-jaar" element={<GemiddeldeJaar />} />
        <Route path="/grootste-categorie" element={<GrootsteCategorie />} />
        <Route path="/activiteiten" element={<Activiteiten />} />
        <Route path="/foodTasks" element={<FoodTasks />} />
        <Route path="/transportTasks" element={<TransportTasks />} />
        <Route path="/energyTasks" element={<EnergyTasks />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  )
}

export default App
