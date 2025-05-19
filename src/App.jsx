import React from "react";
import Notepad from "./components/Notepad";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="font-[Orbitron] text-white bg-[#0B0C10] transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl text-[#C5C6C7] p-4 rounded shadow-lg transition-all duration-300 min-h-screen">
      <Notepad />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default App;
