import imgum from './imgUmHome.png';
import imgdois from './imgDoisHome.png';
import './Sobre.css';

function Sobre(){
    return(
        <>
        <div className="container">
            <div className="esq">
                <img src={imgum} id='img' alt="" srcset="" />
            </div>
            <div className="dir">
                <div className="txt">
                <h1 id='title_h1'>Como Funciona?</h1>
                    <p id='texto'>
                        Imagine um mundo onde nunca mais precisará se preocupar em perder seu cartão de fidelidade ou esquecer de carimbá-lo. Apresentamos a Fidelizah, a empresa que está revolucionando a experiência de fidelidade do cliente.
                    </p>
                        <p id='title'>
                            Quem Somos:
                        </p>
                    <p id="texo">
                        Somos a Fidelizah, uma inovadora empresa que reconhece a importância da fidelidade do cliente. Nosso objetivo é simplificar e modernizar o processo de recompensas, eliminando a necessidade de cartões físicos de fidelidade.
                    </p>
                    <p id='title'>
                            O Problema:
                        </p>
                        <p id="texto">
                        Cartões de fidelidade tradicionais podem ser inconvenientes, perdidos facilmente e muitas vezes esquecidos pelos clientes. Isso resulta em oportunidades perdidas para as empresas e frustração para os consumidores.
                        </p>
                        <p id='title'>Nossa Solução:</p>
                        <p id="texto">
                        Transformamos os antigos cartões de fidelidade em experiências digitais fáceis e convenientes. Com o aplicativo Fidelizah, os clientes podem rastrear suas recompensas, receber ofertas exclusivas e participar de programas de fidelidade, tudo sem a necessidade de um cartão físico.
                        </p>
                </div>
            </div>
        </div>
        </>
    )
}
export default Sobre;