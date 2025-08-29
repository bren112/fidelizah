import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  const [active, setActive] = useState("nav__menu");
  const [toggleIcon, setToggleIcon] = useState("nav__toggler");
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmLogado = localStorage.getItem('admLogado') === 'true';
  const isClienteLogado = localStorage.getItem('clienteLogado') === 'true';

  const navToggle = () => {
    setActive(prev => prev === 'nav__menu' ? 'nav__menu nav__active' : 'nav__menu');
    setToggleIcon(prev => prev === 'nav__toggler' ? 'nav__toggler toggle' : 'nav__toggler');
  };

  const handleOverlayClick = () => {
    setActive('nav__menu');
    setToggleIcon('nav__toggler');
  };

  const logout = () => {
    localStorage.setItem('admLogado', 'false');
    localStorage.setItem('clienteLogado', 'false');
    navigate('/');
  };

  const isLogado = location.pathname === '/logado';
  const isEmpresalogada = location.pathname === '/empresalogada';
  const isProdutos = location.pathname === '/produtos';
  const isRestrictedPath = ['/bônus','/criar','/max','/gc','/relatorio'].includes(location.pathname);

  return (
    <>
      <nav className={`nav ${isAdmLogado ? 'nav-adm' : ''}`}>
        <div className="logo">
          {isAdmLogado 
            ? <Link to="/" className="nav__brand" id='logo'>Admin</Link>
            : <Link to="/" className="nav__brand" id='logo'>Fidelizah</Link>
          }
        </div>

        {/* Menu */}
        {isClienteLogado ? (
          <ul id='links' className={active}>
            {location.pathname === '/sobre' ? (
              <li className="nav__item">
                <Link to="/login" className="nav__link">Voltar</Link>
              </li>
            ) : (
              <li className="nav__item">
                <Link to="/sobre" className="nav__link">Como Funciona?</Link>
              </li>
            )}
            <li className="nav__item">
              {/* <button onClick={logout} className="nav__link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button> */}
            </li>
          </ul>
        ) : (
          !isAdmLogado && (
            <ul id='links' className={active}>
              <li className="nav__item"><Link to="/" className="nav__link">Home</Link></li>
              <li className="nav__item"><Link to="/sobre" className="nav__link">Como Funciona?</Link></li>

              {!isLogado && !isEmpresalogada && !isRestrictedPath && (
                <li className="nav__item"><Link to="/login" className="nav__link">Login</Link></li>
              )}

              {!isEmpresalogada && !isLogado && !isProdutos && (
                <li className="nav__item"><Link to="/adm" className="nav__link">Adm</Link></li>
              )}

              <li className="nav__item">
                <button onClick={logout} className="nav__link" style={{ background: 'none', border: 'none', cursor: 'pointer', color:'white' }}>x</button>
              </li>
            </ul>
          )
        )}

        <div onClick={navToggle} className={toggleIcon}>
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>
      </nav>

      {/* Overlay para fechar menu */}
      <div className={`nav-overlay ${active.includes('nav__active') ? 'active' : ''}`} onClick={handleOverlayClick}></div>
    </>
  );
}

export default Navbar;
