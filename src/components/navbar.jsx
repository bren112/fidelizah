import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  const [active, setActive] = useState("nav__menu");
  const [toggleIcon, setToggleIcon] = useState("nav__toggler");
  const navigate = useNavigate();

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

  return (
    <>
      <nav className="nav">
        <div className="logo">
          <Link to="/" className="nav__brand" id='logo'>Fidelizah</Link>
        </div>

        {/* Menu sempre visível */}
        <ul id='links' className={active}>
          <li className="nav__item"><Link to="/" className="nav__link">Home</Link></li>
          <li className="nav__item"><Link to="/sobre" className="nav__link">Como Funciona?</Link></li>
          <li className="nav__item"><Link to="/login" className="nav__link">Login</Link></li>
          <li className="nav__item"><Link to="/adm" className="nav__link">Adm</Link></li>
          <li className="nav__item"><Link to="/testar" className="nav__link">Testar</Link></li>
          <li className="nav__item">
            {/* <button onClick={logout} className="nav__link" style={{ background: 'none', border: 'none', cursor: 'pointer', color:'white' }}>x</button> */}
          </li>
        </ul>

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
