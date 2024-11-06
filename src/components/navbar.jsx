import React, {useState} from 'react';
import './navbar.css'
import { Link } from 'react-router-dom';

function Navbar() {
    const [active , setActive] = useState("nav__menu");
    const [toggleIcon , setToggleIcon] = useState("nav__toggler"); 

    const navToggle = () =>{
        active === 'nav__menu' ? setActive('nav__menu nav__active') : setActive('nav__menu');

        toggleIcon === 'nav_toggler' ? 
        setToggleIcon('nav__toggler toggle')
        : setToggleIcon("nav__toggler")
    }


  return (
    <nav className='nav'>
      <div className="logo">
    <Link to="/" className="nav__brand" id='logo'>Fidelizah</Link>
      </div>
    <ul id='links' className={active}>
        <li className="nav__item"><Link to="/" className="nav__link">Home</Link></li>
        <li className="nav__item"><Link to="/sobre" className="nav__link">Como Funciona?</Link></li>
        <li className="nav__item"><Link to="/login" className="nav__link">Login</Link></li>
        {/* <li className="nav__item"><Link to="/logado" className="nav__link">Cliente</Link></li> */}
        <li className="nav__item"><Link to="/adm" className="nav__link">Adm</Link></li>
        {/* <li className="nav__item"><Link to="/teste" className="nav__link">Teste</Link></li> */}



    </ul>
    <div onClick={navToggle} className={toggleIcon}>
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
    </div>
</nav>
  )
}

export default Navbar;