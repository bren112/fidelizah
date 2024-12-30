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
import Teste from "./pages/test/Teste";
import Max from "./pages/Admin/Funcoes/Max";
import Produtos from "./pages/Cliente/Produtos";
import RelatorioProduto from "./pages/Admin/Funcoes/RelatorioProduto";
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
            <Route path="/teste" element={<Teste />} />
            <Route path="/max" element={<Max />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/relatorio" element={<RelatorioProduto />} />

         
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
