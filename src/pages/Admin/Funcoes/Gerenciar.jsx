import React, { useEffect, useState } from 'react';
import { Button, message, Table } from 'antd';
import { supabase } from "../../../Supabase/createClient.js";
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import './Funcoes.css';
import './Gerenciar.css'; // Importando o arquivo CSS para estilos customizados

function Gerenciar() {
    const [relatorios, setRelatorios] = useState([]);
    const [empresaId, setEmpresaId] = useState(null);
    const [empresaNome, setEmpresaNome] = useState(''); // Novo estado para armazenar o nome da empresa

    useEffect(() => {
        const fetchRelatorios = async () => {
            const email = localStorage.getItem('token');
            if (!email) {
                message.error('Você não está logado.');
                return;
            }

            const { data: empresaData, error: empresaError } = await supabase
                .from('empresas')
                .select('id, nome') // Agora também seleciona o nome da empresa
                .eq('email', email)
                .single();

            if (empresaError) {
                message.error('Erro ao buscar a empresa: ' + empresaError.message);
                return;
            }

            setEmpresaId(empresaData.id);
            setEmpresaNome(empresaData.nome); // Armazena o nome da empresa

            const { data: relatoriosData, error: relatoriosError } = await supabase
                .from('relatorios')
                .select('*')
                .eq('empresa_id', empresaData.id);

            if (relatoriosError) {
                message.error('Erro ao buscar relatórios: ' + relatoriosError.message);
                return;
            }

            setRelatorios(relatoriosData);
        };

        fetchRelatorios();
    }, []);

    const columns = [
        {
            title: 'Nome do Cliente',
            dataIndex: 'cliente_nome',
            key: 'cliente_nome',
        },
        {
            title: 'Funcionário que Deu o Bônus',
            dataIndex: 'funcionario_nome',
            key: 'funcionario_nome',
        },
        {
            title: 'Bônus Dado',
            dataIndex: 'bonus_dado',
            key: 'bonus_dado',
        },
        {
            title: 'Data e Hora',
            dataIndex: 'data_hora',
            key: 'data_hora',
            render: (text) => {
                if (text) {
                    return format(new Date(text), 'dd/MM/yyyy HH:mm', { locale: ptBR });
                }
                return null;
            },
        },
    ];

    return (
        <>
            <br />
            <Link to="/adm">
                <Button id='voltar'>Voltar</Button>
            </Link>
            <br />
            <br />
            <h2 id='title_gerenciar'>Relatórios da Empresa {empresaNome}</h2>
            <br />
            <Table
                dataSource={relatorios}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }} // Número de itens por página
                className="custom-table" // Classe CSS personalizada
            />
        </>
    );
}

export default Gerenciar;
