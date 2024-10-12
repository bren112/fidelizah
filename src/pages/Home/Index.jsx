import './Home.css';
import img from './imgHome.png';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="container">
            <div className="esq">
                <h1 id="title_home">
                    Conheça a <span id='span_home'>Fidelizah</span>
                    <br />
                    Seu Cartão,
                    <br />
                    Suas Recompensas
                </h1>
                <img src={img} id='imgHomeMobile' alt="imgHome" />

                <br />
                <Link to="/login">
                    <button id='buttonHome'>Meus Bônus!</button>
                </Link>
            </div>
            <div className="dir">
                <img src={img} id='imgHome' alt="imgHome" />
            </div>
        </div>
    );
}

export default Home;
