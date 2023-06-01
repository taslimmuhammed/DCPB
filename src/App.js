import "./styles/Home.css";
import { Route, Routes } from 'react-router-dom'
import HomePage from "./Pages/HomePage";
import StakingPage from "./Pages/StakingPage";
import ListPage from "./Pages/ListPage";
import AffiliatePage from "./Pages/AffiliatePage";
import AdminPage from "./Pages/AdminPage";

export default function Home() {
  return (
    <div className="main-screen">
     <div className="main-sub">
        <Routes>
          <Route exact path='/' element={< HomePage/>}></Route>
          <Route exact path='/stake' element={< StakingPage />}></Route>
          <Route exact path='/list' element={< ListPage />}></Route>
          <Route exact path='/affiliate' element={< AffiliatePage />}></Route>
          <Route exact path='/admin' element={< AdminPage />}></Route>
        </Routes>
     </div>
    </div>
  );
}
