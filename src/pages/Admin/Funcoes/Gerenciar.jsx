import React, { useEffect, useState } from 'react';
import { Button, message, Table } from 'antd';
import { supabase } from "../../../Supabase/createClient.js";
import { Link } from 'react-router-dom';
import { format } from 'date-fns'; // Importando a função format
import ptBR from 'date-fns/locale/pt-BR'; // Importando o locale para português do Brasil
import './Funcoes.css';

function Gerenciar() {
    const [relatorios, setRelatorios] = useState([]);
    const [empresaId, setEmpresaId] = useState(null); // Para armazenar o ID da empresa logada

    useEffect(() => {
        const fetchRelatorios = async () => {
            const email = localStorage.getItem('token');
            if (!email) {
                message.error('Você não está logado.');
                return;
            }

            // Busca o ID da empresa logada
            const { data: empresaData, error: empresaError } = await supabase
                .from('empresas')
                .select('id')
                .eq('email', email)
                .single();

            if (empresaError) {
                message.error('Erro ao buscar a empresa: ' + empresaError.message);
                return;
            }

            setEmpresaId(empresaData.id); // Salva o ID da empresa logada

            // Busca os relatórios da empresa logada
            const { data: relatoriosData, error: relatoriosError } = await supabase
                .from('relatorios')
                .select('*')
                .eq('empresa_id', empresaData.id); // Supondo que a tabela relatorios tenha empresa_id

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
            dataIndex: 'cliente_nome', // Ajuste o nome do campo conforme sua tabela
            key: 'cliente_nome',
        },
        {
            title: 'Funcionário que Deu o Bônus',
            dataIndex: 'funcionario_nome', // Corrigido para usar funcionario_nome
            key: 'funcionario_nome',
        },
        {
            title: 'Bônus Dado',
            dataIndex: 'bonus_dado', // Usando a coluna bonus_dado
            key: 'bonus_dado',
        },
        {
            title: 'Data e Hora',
            dataIndex: 'data_hora', // Ajuste o nome do campo conforme sua tabela
            key: 'data_hora',
            render: (text) => {
                if (text) {
                    // Formata a data para o formato brasileiro
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

            <h2>Relatórios da Empresa</h2>
            <br />

            <Table dataSource={relatorios} columns={columns} rowKey="id" />
        </>
    );
}

export default Gerenciar;
