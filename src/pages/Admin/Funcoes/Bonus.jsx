import React, { useEffect, useState } from 'react';
import { supabase } from "../../../Supabase/createClient.js";
import { message, Modal, Button, Input } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import './Client.css';

function ClienteList() {
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [bonusModalVisible, setBonusModalVisible] = useState(false);
    const [funcionarioNome, setFuncionarioNome] = useState('');
    const [bonusQuantidade, setBonusQuantidade] = useState(1); // Valor padrão de 1
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchClientes = async () => {
            const email = localStorage.getItem('token');
            if (!email) {
                message.error('Você não está logado.');
                return;
            }

            const { data: empresaData, error: empresaError } = await supabase
                .from('empresas')
                .select('*')
                .eq('email', email)
                .single();

            if (empresaError) {
                message.error('Erro ao buscar a empresa: ' + empresaError.message);
                return;
            }

            setEmpresa(empresaData);

            const { data: clientesData, error: clientesError } = await supabase
                .from('clientes')
                .select('*')
                .eq('empresa_id', empresaData.id);

            if (clientesError) {
                message.error('Erro ao buscar clientes: ' + clientesError.message);
                return;
            }

            setClientes(clientesData);
            setFilteredClientes(clientesData);
        };

        fetchClientes();
    }, []);

    const handleClienteClick = (cpf) => {
        const cliente = clientes.find((c) => c.cpf === cpf);
        setClienteSelecionado(cliente);
        setBonusModalVisible(true);
    };

    const handleBonusConfirm = async () => {
        if (!funcionarioNome) {
            message.error('Por favor, insira o nome do funcionário.');
            return;
        }

        const dataHora = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const novoBonusCount = (parseInt(clienteSelecionado.bonus_count) || 0) - Math.abs(parseInt(bonusQuantidade)); // Subtrai a quantidade de bônus

        // Atualiza o bonus_count do cliente na tabela `clientes`
        const { error: bonusError } = await supabase
            .from('clientes')
            .update({ bonus_count: novoBonusCount })
            .eq('cpf', clienteSelecionado.cpf);

        if (bonusError) {
            message.error('Erro ao atualizar o bônus no cliente: ' + bonusError.message);
            return;
        }

        // Insere dados no relatório
        const { error: relatorioError } = await supabase
            .from('relatorios')
            .insert({
                empresa_id: empresa.id,
                cliente_nome: clienteSelecionado.nome,
                funcionario_nome: funcionarioNome,
                data_hora: dataHora,
                bonus_dado: -Math.abs(bonusQuantidade) // Armazena a quantidade de bônus como negativa no relatório
            });

        if (relatorioError) {
            message.error('Erro ao registrar no relatório: ' + relatorioError.message);
        } else {
            message.success('Bônus atualizado e registrado com sucesso!');
        }

        setBonusModalVisible(false);
        setFuncionarioNome('');
        setBonusQuantidade(1);
        setClienteSelecionado(null);
    };

    const handleSearch = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        const filtered = clientes.filter((cliente) =>
            cliente.nome.toLowerCase().includes(searchValue)
        );

        setFilteredClientes(filtered);
    };

    const getImageUrl = (genero) => {
        if (genero === 'Masculino') {
            return 'https://i.pinimg.com/564x/50/f2/91/50f2915c4f23c9643efb1c8f05020f2b.jpg';
        } else if (genero === 'Feminino') {
            return 'https://i.pinimg.com/564x/01/6a/34/016a34bbf9dc95a43f2003c78964a543.jpg';
        } else {
            return 'https://i.pinimg.com/564x/6c/35/c5/6c35c525c3c0f1abef4c1b8b3c820727.jpg';
        }
    };

    return (
        <>
          <br/>
            <Link to="/adm">
                <Button  id='voltar'>Voltar</Button>
            </Link>
          <br/>

        <div id="cliente-list-container">
            <h2>Clientes da Empresa {empresa?.nome}</h2>
            <Input
                placeholder="Pesquisar pelo nome"
                value={searchTerm}
                onChange={handleSearch}
                className="input-search"
            />
            <br/>
            <br/>

            <ul id="cliente-list">
                {filteredClientes.map((cliente, index) => (
                    <li 
                        key={index} 
                        onClick={() => handleClienteClick(cliente.cpf)} 
                        className="cliente-item"
                    >
                        <img 
                            src={getImageUrl(cliente.genero)} 
                            alt={`Imagem de ${cliente.nome}`} 
                            className="cliente-avatar"
                        />
                        <span className="cliente-nome">{cliente.nome}</span>
                    </li>
                ))}
            </ul>

            {clienteSelecionado && (
                <Modal
                    title="Registrar Bônus"
                    visible={bonusModalVisible}
                    onOk={handleBonusConfirm}
                    onCancel={() => setBonusModalVisible(false)}
                >
                    <p><strong>Cliente:</strong> {clienteSelecionado.nome}</p>
                    <p><strong>Funcionário:</strong></p>
                    <Input
                        placeholder="Nome do funcionário"
                        value={funcionarioNome}
                        onChange={(e) => setFuncionarioNome(e.target.value)}
                    />
                    <p><strong>Quantidade de Bônus:</strong></p>
                    <Input
                        type="number"
                        min={1}
                        value={bonusQuantidade}
                        onChange={(e) => setBonusQuantidade(e.target.value)}
                    />
                    <p><strong>Data e Hora:</strong> {dayjs().format('DD/MM/YYYY HH:mm')}</p>
                </Modal>
            )}
        </div>
        </>
    );
}

export default ClienteList;
