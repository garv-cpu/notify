import React from "react";
import { Routes, Route } from "react-router-dom";
import Notepad from "./components/Notepad";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="font-[Orbitron] text-white bg-[#0B0C10] transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl text-[#C5C6C7] p-4 rounded shadow-lg transition-all duration-300 min-h-screen">
      <Routes>
        <Route path="/" element={<Notepad />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default App;
