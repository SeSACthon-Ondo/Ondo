import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Onboarding from './pages/onboarding/Onboarding';
import Main from './pages/main/Main';
import Map from './pages/map/Map';

import './App.css';

function App() {
  return (
    <div className="container">
      <Router>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/main" element={<Main />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
