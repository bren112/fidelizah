import React, { useEffect, useState } from 'react';
import { supabase } from "../../../Supabase/createClient.js";
import { message, Modal, Button, Input } from 'antd';
import './Client.css'; // Importe o arquivo de estilo

function ClienteList() {
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
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
            setFilteredClientes(clientesData); // Inicializa a lista filtrada com todos os clientes
        };

        fetchClientes();
    }, []);

    const handleClienteClick = (cpf) => {
        const cliente = clientes.find((c) => c.cpf === cpf);
        setClienteSelecionado(cliente);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setClienteSelecionado(null);
    };

    const updateBonusCount = async (increment) => {
        const novoBonusCount = (parseInt(clienteSelecionado.bonus_count) || 0) + increment;

        const { data, error } = await supabase
            .from('clientes')
            .update({ bonus_count: novoBonusCount })
            .eq('cpf', clienteSelecionado.cpf);

        if (error) {
            message.error('Erro ao atualizar bônus: ' + error.message);
        } else {
            message.success('Bônus atualizado com sucesso!');
            setClienteSelecionado({ ...clienteSelecionado, bonus_count: novoBonusCount });
        }
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

    const handleSearch = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        const filtered = clientes.filter((cliente) =>
            cliente.nome.toLowerCase().includes(searchValue)
        );

        setFilteredClientes(filtered);
    };

    return (
        <div id="cliente-list-container">
            <div id="header">
                <h2 id="header-title">Clientes da Empresa {empresa?.nome}</h2>
            </div>

            <Input
                placeholder="Pesquisar pelo nome"
                value={searchTerm}
                onChange={handleSearch}
                className="input-search"
            />

            <ul id="cliente-list">
                <br/>
                {filteredClientes.map((cliente, index) => (
                    <li 
                        key={index} 
                        onClick={() => handleClienteClick(cliente.cpf)} 
                        className="cliente-item"
                        id={`cliente-${cliente.cpf}`}
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
                    title={`Dados do Cliente: ${clienteSelecionado.nome}`}
                    visible={modalVisible}
                    onCancel={handleModalClose}
                    footer={[
                        <Button key="close" onClick={handleModalClose}>
                            Fechar
                        </Button>
                    ]}
                >
                    <div id="modal-content">
                        <p><strong>Nome:</strong> {clienteSelecionado.nome}</p>
                        <p><strong>Telefone:</strong> {clienteSelecionado.telefone}</p>
                        <p><strong>CPF:</strong> {clienteSelecionado.cpf}</p>
                        <p><strong>Gênero:</strong> {clienteSelecionado.genero}</p>
                        <p><strong>Bônus Atual:</strong> {clienteSelecionado.bonus_count}</p>
                        <div id="bonus-buttons">
                            <Button onClick={() => updateBonusCount(1)} className="bonus-button">
                                +1
                            </Button>
                            <Button onClick={() => updateBonusCount(-1)} className="bonus-button">
                                -1
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ClienteList;
