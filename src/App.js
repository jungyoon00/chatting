import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/Login";
import Home from "./pages/Home";
import useGlobalState from "./store/zustandStore";

function App() {
  const activate = useGlobalState((state) => state.activate);

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Page */}
        <Route path="/" element={<Main />} />
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        {/* Private Home */}
        <Route path="/home" element={activate ? <Home /> : <Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
