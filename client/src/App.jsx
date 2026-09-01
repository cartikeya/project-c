import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AuctionRoom from "./pages/AuctionRoom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auction" element={<AuctionRoom />} />
        {/* <Route path="/auction/:roomId" element={<AuctionRoom />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
