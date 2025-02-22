import React, { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import { supabase } from '../../../Supabase/createClient.js';
import { Link } from 'react-router-dom';
// import './Clientes.css';

function RelatorioComp() {
    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        const fetchClientes = async () => {
            const { data, error } = await supabase.from('clientes').select('*').eq('empresa_id', 4);
            if (error) {
                message.error('Erro ao buscar clientes: ' + error.message);
                return;
            }
            setClientes(data);
        };

        fetchClientes();
    }, []);

    return (
        <>
            <br />
            <Link to="/adm">
                <Button id='voltar'>Voltar</Button>
            </Link>
            <br />
            <br />
            <h2 id='title_clientes'>Lista de Clientes</h2>
            <br />

            <table border="1">
                <thead>
                    <tr>
                        {clientes.length > 0 && Object.keys(clientes[0]).map((key) => (
                            <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((cliente) => (
                        <tr key={cliente.id}>
                            {Object.values(cliente).map((value, index) => (
                                <td key={index}>{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default RelatorioComp;
