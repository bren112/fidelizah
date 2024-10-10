import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from "./pages/Home/Index";
import Sobre from "./pages/Sobre/Index";
import Login from "./pages/Login/Index";
import Cliente from "./pages/Cliente/Index";
import Adm from "./pages/Admin/Index";
import Criar from "./pages/Admin/Funcoes/Criar";
import Gerenciar from "./pages/Admin/Funcoes/Gerenciar";
import Empresa from "./pages/Admin/Funcoes/Empresa";
import Bonus from "./pages/Admin/Funcoes/Bonus";
function App() {
  return (
    <BrowserRouter>
      <div id="root">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logado" element={<Cliente />} />
            <Route path="/adm" element={<Adm />} />
            <Route path="/criar" element={<Criar />} />
            <Route path="/gc" element={<Gerenciar />} />
            <Route path="/empresalogada" element={<Empresa />} />
            <Route path="/bonus" element={<Bonus />} />

         
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
