import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import InputMask from 'react-input-mask';
import { supabase } from "../../../Supabase/createClient.js";
import './Funcoes.css'
import { Link } from 'react-router-dom';

function Gerenciar() {
    const [cpf, setCpf] = useState('');
    const [cliente, setCliente] = useState(null);

    const handleSearch = async () => {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('cpf', cpf)
            .single();

        if (error) {
            message.error('Erro ao buscar cliente: ' + error.message);
            setCliente(null);
        } else {
            setCliente(data);
        }
    };

    const getImageUrl = (genero) => {
        switch (genero) {
            case 'Masculino':
                return 'https://i.pinimg.com/564x/c2/5b/2b/c25b2b0cd5673ba8dee127cf2a2ed340.jpg';
            case 'Feminino':
                return 'https://i.pinimg.com/564x/be/fc/a1/befca17ff3e353523f02f1e2431618ac.jpg';
            default:
                return 'https://i.pinimg.com/enabled/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg';
        }
    };

    return (
        <>
        <Link to="/adm">
        <button>Voltar</button>
        </Link>
        <div className="container">
           
            <h1 id='title_gerenciar'>Gerenciar Clientes</h1>
            <br/>
            <div className="cima">
            <InputMask
                mask="999.999.999-99"
                placeholder="Buscar pelo CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                style={{ width: 300, marginBottom: 10 }}
            />
            <Button type="primary" onClick={handleSearch}>Buscar</Button>
            <br/>

            </div> </div>

            {cliente && (
                <div className='relatorio'>

                    <div id="relatorio">
                        <div className="infos">
                    <p id='title_relatorio'>{cliente.nome}</p>
                    <img 
                        src={getImageUrl(cliente.genero)} 
                        alt={cliente.genero} 
                        id='img_relatorio'

                    />

                    <p><strong>CPF:</strong> {cliente.cpf}</p>
                    <p><strong>Telefone:</strong> {cliente.telefone}</p>
                    <p><strong>Gênero:</strong> {cliente.genero}</p>
                    </div>
                    </div>
                   
                </div>
                
            )}
       
        </>
    );
}

export default Gerenciar;
