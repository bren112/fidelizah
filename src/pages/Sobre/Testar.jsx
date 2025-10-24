import { useState } from 'react';
import conta from './imgs/senhas.png';
import user from './imgs/user.png';
import adm from './imgs/adm.png';
import './Sobre.css';

function Testar() {
    const slides = [
        {
          img: conta,
          titulo: 'Quero Testar!',
          texto:
            'Disponibilizamos duas contas para testes! (de adm e como usuário)',
        },
        {
          img: user,
          titulo: 'Conta Usuário',
          texto:
            'Email: cliente@gmail.com | Senha:1010',
        },
        {
          img: adm,
          titulo: 'Conta Administrador',
          texto:
            'Email: acai@gmail.com | Senha: acai',
          style: { width: '20pc' } 
        }
      ];
      

  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="containerSobre">
        <br />
      <div className="esq">
      <img
            src={slides[index].img}
            alt=""
            style={slides[index].style || {}}
            />
      </div>
      <div className="dir">
        <div className="txt">
          <h1 id="title_h1">{slides[index].titulo}</h1>
          <p id="texto">{slides[index].texto}</p>
        </div>
        <div className="navegacao">
          <button onClick={prevSlide}>⬅ Anterior</button>
          <button onClick={nextSlide}>Próximo ➡</button>
        </div>
      </div>
    </div>
  );
}

export default Testar;
