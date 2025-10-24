import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import Historico from "./pages/Cliente/Historico";
import Gprodutos from "./pages/Admin/Funcoes/Gprodutos";
import RelatorioComp from "./pages/Admin/Funcoes/RelatorioComp";
import Gerenciamento from "./pages/Admin/Venda/Gerenciamento";
import Testar from "./pages/Sobre/Testar";

// Componente principal que envolve as rotas
function AppContent() {
  const location = useLocation();
  
  // Define em quais rotas o Navbar NÃO deve aparecer
  const hideNavbarRoutes = ['/logado' , '/produtos', '/historico'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div id="root">
      {shouldShowNavbar && <Navbar />}
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
          <Route path="/historico" element={<Historico />} />
          <Route path="/gprodutos" element={<Gprodutos />} />
          <Route path="/rp" element={<RelatorioComp />} />
          <Route path="/gerenciamento" element={<Gerenciamento />} />
          <Route path="/testar" element={<Testar />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;