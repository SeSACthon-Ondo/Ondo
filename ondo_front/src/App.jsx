import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Onboarding from './pages/onboarding/Onboarding';
import Main from './pages/main/Main';
import Map from './pages/map/Map';
import Send_address_Test from "./pages/test/Send_address_Test.jsx";
import FoodDescription from './pages/main/FoodDescription.jsx';
import CultureDescription from './pages/main/CultureDescription.jsx';

import './App.css';

function App() {
  return (
    <div className="container">
      <Router>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/main" element={<Main />} />
          <Route path="/map" element={<Map />} />
          <Route path="/test" element={<Send_address_Test />} />
          <Route path="/fooddescription" element={<FoodDescription />} />
          <Route path="/culturedescription" element={<CultureDescription />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
