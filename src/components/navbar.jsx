import React, { useState } from 'react';
import './navbar.css';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [active, setActive] = useState("nav__menu");
  const [toggleIcon, setToggleIcon] = useState("nav__toggler");
  const location = useLocation(); // Hook para pegar a URL atual

  const navToggle = () => {
    active === 'nav__menu' ? setActive('nav__menu nav__active') : setActive('nav__menu');
    toggleIcon === 'nav_toggler' ? 
      setToggleIcon('nav__toggler toggle') 
      : setToggleIcon("nav__toggler");
  };

  // Verifica a rota atual para decidir o que mostrar
  const isLogado = location.pathname === '/logado';
  const isEmpresalogada = location.pathname === '/empresalogada';
  const isProdutos = location.pathname === '/produtos'; // Verifica se está na página de produtos

  // Condições para não exibir o link Login
  const isRestrictedPath = [
    '/bônus',
    '/criar',
    '/max',
    '/gc',
    '/relatorio'
  ].includes(location.pathname);

  return (
    <nav className='nav'>
      <div className="logo">
        <Link to="/" className="nav__brand" id='logo'>Fidelizah</Link>
      </div>
      <ul id='links' className={active}>
        <li className="nav__item"><Link to="/" className="nav__link">Home</Link></li>
        <li className="nav__item"><Link to="/sobre" className="nav__link">Como Funciona?</Link></li>
        
        {/* Condicionalmente renderiza o link de Login ou Adm */}
        {!isLogado && !isEmpresalogada && !isRestrictedPath && (
          <li className="nav__item"><Link to="/login" className="nav__link">Login</Link></li>
        )}
        
        {/* Não exibe o link Adm se estiver em /empresalogada, /logado ou /produtos */}
        {!isEmpresalogada && !isLogado && !isProdutos && (
          <li className="nav__item"><Link to="/adm" className="nav__link">Adm</Link></li>
        )}

      </ul>
      <div onClick={navToggle} className={toggleIcon}>
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>
    </nav>
  );
}

export default Navbar;
