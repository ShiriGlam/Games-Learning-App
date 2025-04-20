import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Start from './Start';
import Option from './Option';
import Login from './Login/Login';
import Home from './Home/Home';
import SetPage from './Home/SetPage';


import CreateSet from './Home/CreateSet'; 
import Gamer from './Gamer/Gamer';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/home" element={<Home />} />
          <Route path="/option" element={<Option />} />
          <Route path="/gamer" element={<Gamer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/set/:setName" element={<SetPage />} />        
        <Route path="/create-set" element={<CreateSet />} /> {/* Add the CreateSet route */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;
