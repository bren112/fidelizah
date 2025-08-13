import React, { useEffect, useState } from 'react';
import { Button, message, Table, Input, DatePicker, Space } from 'antd';
import { supabase } from "../../../Supabase/createClient.js";
import { Link } from 'react-router-dom';
import { format, isWithinInterval } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import './Funcoes.css';
import './Gerenciar.css';

const { RangePicker } = DatePicker;

function Gerenciar() {
    const [relatorios, setRelatorios] = useState([]);
    const [empresaId, setEmpresaId] = useState(null);
    const [empresaNome, setEmpresaNome] = useState('');
    const [filtroCliente, setFiltroCliente] = useState('');
    const [periodo, setPeriodo] = useState([null, null]); // Estado para data inicial e final

    useEffect(() => {
        const fetchRelatorios = async () => {
            const email = localStorage.getItem('token');
            if (!email) {
                message.error('Você não está logado.');
                return;
            }

            const { data: empresaData, error: empresaError } = await supabase
                .from('empresas')
                .select('id, nome')
                .eq('email', email)
                .single();

            if (empresaError) {
                message.error('Erro ao buscar a empresa: ' + empresaError.message);
                return;
            }

            setEmpresaId(empresaData.id);
            setEmpresaNome(empresaData.nome);

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

    // Filtra relatórios por nome e período
    const filtrarRelatorios = () => {
        return relatorios.filter((relatorio) => {
            const matchNome = filtroCliente
                ? relatorio.cliente_nome.toLowerCase().includes(filtroCliente.toLowerCase())
                : true;
    
            // Só filtra por data se tiver as duas datas definidas
            const matchData =
                Array.isArray(periodo) &&
                periodo[0] &&
                periodo[1]
                    ? isWithinInterval(new Date(relatorio.data_hora), {
                        start: periodo[0].startOf('day'),
                        end: periodo[1].endOf('day'),
                      })
                    : true;
    
            return matchNome && matchData;
        });
    };
    

    const columns = [
        { title: 'Nome do Cliente', dataIndex: 'cliente_nome', key: 'cliente_nome' },
        { title: 'Funcionário que Deu o Bônus', dataIndex: 'funcionario_nome', key: 'funcionario_nome' },
        { title: 'Bônus Dado', dataIndex: 'bonus_dado', key: 'bonus_dado' },
        {
            title: 'Data e Hora',
            dataIndex: 'data_hora',
            key: 'data_hora',
            render: (text) =>
                text ? format(new Date(text), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : null
        }
    ];

    return (
        <>
            <br />
            <Link to="/adm">
                <Button id='voltar'>Voltar</Button>
            </Link>
            <br /><br />
            <h2 id='title_gerenciar'>{empresaNome} <span id='spanBonus'>- Relatório Bônus</span></h2>
            <br />

            <Space style={{ marginBottom: 20 }}>
                <Input
                    id='minput'
                    placeholder="Filtrar por nome do cliente"
                    value={filtroCliente}
                    onChange={(e) => setFiltroCliente(e.target.value)}
                    style={{ width: 250 }}
                />
              <RangePicker
                format="DD/MM/YYYY"
                locale={ptBR}
                onChange={(dates) => setPeriodo(dates || [null, null])}
            />

            </Space>
<div className='marginTable'>
            <Table
            dataSource={[...filtrarRelatorios()].sort((a, b) => 
                new Date(b.data_hora) - new Date(a.data_hora)
            )}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 , showSizeChanger: true }}
            className="custom-table"
        />
</div>
        </>
    );
}

export default Gerenciar;
