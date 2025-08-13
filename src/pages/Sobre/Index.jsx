import { useState } from 'react';
import funciona from './imgs/funciona.png';
import problema from './imgs/problema.png';
import solucao from './imgs/solucao.png';
import team from './imgs/team.png';
import './Sobre.css';

function Sobre() {
    const slides = [
        {
          img: funciona,
          titulo: 'Como Funciona?',
          texto:
            'Imagine um mundo onde nunca mais precisará se preocupar em perder seu cartão de fidelidade ou esquecer de carimbá-lo. Apresentamos a Fidelizah, a empresa que está revolucionando a experiência de fidelidade do cliente.',
        },
        {
          img: problema,
          titulo: 'O Problema',
          texto:
            'Cartões de fidelidade tradicionais podem ser inconvenientes, perdidos facilmente e muitas vezes esquecidos pelos clientes. Isso resulta em oportunidades perdidas para as empresas e frustração para os consumidores.',
        },
        {
          img: solucao,
          titulo: 'Nossa Solução',
          texto:
            'Transformamos os antigos cartões de fidelidade em experiências digitais fáceis e convenientes. Com o aplicativo Fidelizah, os clientes podem rastrear suas recompensas, receber ofertas exclusivas e participar de programas de fidelidade, tudo sem a necessidade de um cartão físico.',
          style: { width: '20pc' } // 🔹 Aqui definimos só para esta imagem
        },
        {
          img: team,
          titulo: 'Quem Somos',
          texto:
            'Somos a Fidelizah, uma inovadora empresa que reconhece a importância da fidelidade do cliente. Nosso objetivo é simplificar e modernizar o processo de recompensas, eliminando a necessidade de cartões físicos de fidelidade.',
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

export default Sobre;
