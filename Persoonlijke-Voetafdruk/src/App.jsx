import { useEffect } from "react";
import { Navigate, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Questionnaire from "./pages/Questionnaire";
import Result from "./pages/Result";
import Overzicht from "./pages/overzichtpages/Overzicht";
import DagelijkseUitstoot from "./pages/overzichtpages/DagelijkseUitstoot";
import WekelijkseUitstoot from "./pages/WekelijkseUitstoot";
import GemiddeldeWeek from "./pages/overzichtpages/GemiddeldeWeek";
import GemiddeldeJaar from "./pages/overzichtpages/GemiddeldeJaar";
import GrootsteCategorie from "./pages/overzichtpages/GrootsteCategorie";
import AchtergrondimpactInfo from "./pages/overzichtpages/AchtergrondimpactInfo"
import WekelijkseActiviteitGeschiedenis from "./pages/overzichtpages/WekelijkseActiviteitGeschiedenis"
import Activiteiten from "./pages/Activiteiten";
import ActiviteitToevoegen from "./pages/ActiviteitToevoegen";
import FoodTasks from "./pages/tasks/Foodtasks";
import TransportTasks from "./pages/tasks/Transporttasks";
import EnergyTasks from "./pages/tasks/EnergyTasks";
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import Bos from "./pages/Bos";
import BosVisualisatie from "./pages/BosVisualisatie";
import BosGame from "./pages/BosGame";
import BosMiniGame from "./pages/BosMiniGame";
import Tips from "./pages/Tips";
import Profile from "./pages/Profile";
import AccountGegevens from "./pages/AccountGegevens";
import QuestionnaireEditor from "./pages/QuestionnaireEditor";
import ScrollToTop from "./components/ScrollToTop";
import VerifyEmail from "./pages/VerifyEmail";
import { hasCompletedProfileQuestionnaire } from "./utils/questionnaireStorage";

import { loginAnoniem } from "./auth";
import { createUserDocument } from "./userService";

import Login from "./pages/Login"
import Register from "./pages/Register"

import "./App.css";

function RootRedirect() {
  return (
    <Navigate
      to={hasCompletedProfileQuestionnaire() ? "/bos" : "/welcome"}
      replace
    />
  );
}

function RequireProfileQuestionnaire({ children }) {
  if (!hasCompletedProfileQuestionnaire()) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
}

function App() {
  useEffect(() => {
    async function setupUser() {
      try {
        const user = await loginAnoniem();
        try {
          await createUserDocument(user);
        } catch (firestoreError) {
          console.warn("Firebase profielopslag overgeslagen:", firestoreError);
        }
        console.log("User klaar:", user.uid);
      } catch (error) {
        console.error("Fout bij auth setup:", error);
      }
    }

    setupUser();
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/questionnaire" element={<Questionnaire mode="profile" />} />
        <Route path="/weekly-questionnaire" element={<Questionnaire mode="weekly" />} />
        <Route path="/profile-edit" element={<QuestionnaireEditor mode="profile" />} />
        <Route path="/weekly-edit" element={<QuestionnaireEditor mode="weekly" />} />
        <Route path="/result" element={<Result />} />
        <Route path="/overzicht" element={<RequireProfileQuestionnaire><Overzicht /></RequireProfileQuestionnaire>} />
        <Route path="/dagelijkse-uitstoot" element={<RequireProfileQuestionnaire><DagelijkseUitstoot /></RequireProfileQuestionnaire>} />
        <Route path="/wekelijkse-uitstoot" element={<RequireProfileQuestionnaire><WekelijkseUitstoot /></RequireProfileQuestionnaire>} />
        <Route path="/gemiddelde-week" element={<RequireProfileQuestionnaire><GemiddeldeWeek /></RequireProfileQuestionnaire>} />
        <Route path="/gemiddelde-jaar" element={<RequireProfileQuestionnaire><GemiddeldeJaar /></RequireProfileQuestionnaire>} />
        <Route path="/grootste-categorie" element={<RequireProfileQuestionnaire><GrootsteCategorie /></RequireProfileQuestionnaire>} />
        <Route path="/achtergrondimpact-info" element={<RequireProfileQuestionnaire><AchtergrondimpactInfo /></RequireProfileQuestionnaire>} />
        <Route path="/wekelijkse-activiteit-geschiedenis" element={<RequireProfileQuestionnaire><WekelijkseActiviteitGeschiedenis /></RequireProfileQuestionnaire>} />
        <Route path="/activiteiten" element={<RequireProfileQuestionnaire><Activiteiten /></RequireProfileQuestionnaire>} />
        <Route path="/activiteit-toevoegen" element={<RequireProfileQuestionnaire><ActiviteitToevoegen /></RequireProfileQuestionnaire>} />
        <Route path="/foodTasks" element={<FoodTasks />} />
        <Route path="/transportTasks" element={<TransportTasks />} />
        <Route path="/energyTasks" element={<EnergyTasks />} />
        <Route path="/home" element={<RequireProfileQuestionnaire><Home /></RequireProfileQuestionnaire>} />
        <Route path="/calculator" element={<RequireProfileQuestionnaire><Calculator /></RequireProfileQuestionnaire>} />
        <Route path="/bos" element={<RequireProfileQuestionnaire><Bos /></RequireProfileQuestionnaire>} />
        <Route path="/bos-oud" element={<BosVisualisatie />} />
        <Route path="/missies" element={<RequireProfileQuestionnaire><BosGame /></RequireProfileQuestionnaire>} />
        <Route path="/bos-game" element={<Navigate to="/missies" replace />} />
        <Route path="/red-het-bos" element={<BosMiniGame />} />
        <Route path="/tips" element={<RequireProfileQuestionnaire><Tips /></RequireProfileQuestionnaire>} />
        <Route path="/profile" element={<RequireProfileQuestionnaire><Profile /></RequireProfileQuestionnaire>} />
        <Route path="/account-gegevens" element={<RequireProfileQuestionnaire><AccountGegevens /></RequireProfileQuestionnaire>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </>
  );
}

export default App;
