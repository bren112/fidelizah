import React, { useEffect, useState } from 'react';
import { supabase } from "../../../Supabase/createClient.js";
import { useNavigate } from 'react-router-dom';
import { Input, Button, message, Modal } from 'antd';
import InputMask from 'react-input-mask'; 
import './Empresa.css';

function Empresa() {
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchCPF, setSearchCPF] = useState(''); // Estado para o CPF de busca
    const [clienteEncontrado, setClienteEncontrado] = useState(null); // Estado para armazenar o cliente encontrado
    const [showClienteInfo, setShowClienteInfo] = useState(false); // Estado para controlar a visibilidade das informações do cliente
    const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar a visibilidade do modal de links
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmpresa = async () => {
            const email = localStorage.getItem('token');

            if (!email) {
                setError('Você não está logado.');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                setError('Erro ao buscar informações da empresa: ' + error.message);
            } else {
                setEmpresa(data);
            }
            setLoading(false);
        };

        fetchEmpresa();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/adm');
    };

    const handleSearch = async () => {
        if (!searchCPF) {
            message.error('Por favor, insira um CPF para buscar.');
            return;
        }

        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('cpf', searchCPF) // Filtrar pelo CPF
            .eq('empresa_id', empresa.id);

        if (error) {
            message.error('Erro ao buscar cliente: ' + error.message);
        } else if (data.length === 0) {
            message.info('Nenhum cliente encontrado com esse CPF.');
            setClienteEncontrado(null); // Limpa o cliente encontrado se não houver
            setShowClienteInfo(false); // Oculta as informações do cliente
        } else {
            setClienteEncontrado(data[0]); // Armazena o primeiro cliente encontrado
            setShowClienteInfo(true); // Mostra as informações do cliente
            message.success('Cliente encontrado com sucesso!');
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

    // imagens de bônus
    const renderBonusImages = (bonusCount) => {
        const bonusImages = [];
        for (let i = 0; i < bonusCount; i++) {
            bonusImages.push(
                <img
                    key={i}
                    src="https://i.pinimg.com/564x/a6/1c/8d/a61c8dd18d112d20a3e959071077ab10.jpg"
                    alt="Imagem de bônus"
                    className="bonus-image"
                />
            );
        }
        return bonusImages;
    };

    const handleCloseClienteInfo = () => {
        setShowClienteInfo(false); // Oculta as informações do cliente
        setClienteEncontrado(null); // Limpa os dados do cliente
        setSearchCPF(''); // Limpa o campo de busca
    };

    const handleOpenLinksModal = () => {
        setIsModalVisible(true); // Abre o modal com os links
    };

    const handleCloseLinksModal = () => {
        setIsModalVisible(false); // Fecha o modal
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="tudo">
            <div className="container_empresa">
                <h1 id='tile'>Olá <span id='span'>{empresa.nome}</span></h1>
                <Button type="default" onClick={handleLogout} className="logout-button">Sair</Button>
            </div>

            <Button type="primary" onClick={handleOpenLinksModal} id='btnprincipal1' className="links-button">Minhas Ações</Button>

            <Modal
                title="Escolha sua Ação:"
                visible={isModalVisible}
                onCancel={handleCloseLinksModal}
                footer={null}
            >
                <ul>
                    <li><Button type="link" onClick={() => navigate('/bonus')}>Bonificar</Button></li>
                    <li><Button type="link" onClick={() => navigate('/criar')}>Criar Cliente</Button></li>
                    <li><Button type="link" onClick={() => navigate('/gc')}>GC</Button></li>
                </ul>
            </Modal>

            <div className="search-area">
                <h2>Buscar Cliente pelo CPF</h2>
                <InputMask
                    mask="999.999.999-99"
                    value={searchCPF}
                    onChange={(e) => setSearchCPF(e.target.value)}
                    placeholder="Digite o CPF"
                    className="input-cpf"
                />
                <Button type="primary" onClick={handleSearch} id='btnprincipal2' className="search-button">Buscar</Button>
            </div>

            {showClienteInfo && clienteEncontrado && (
                <div className="cliente-info">
                    <h3 id='centro'>Dados do Cliente:</h3>
                    <div className="container">
                        <div className="esquerda">
                    <p id='title'>{clienteEncontrado.nome}</p>
                    <img 
                        src={getImageUrl(clienteEncontrado.genero)} 
                        alt={`Imagem de ${clienteEncontrado.genero}`} 
                        className="cliente-image"
                    />
                    <p><strong>Telefone:</strong> {clienteEncontrado.telefone}</p>
                    <p><strong>CPF:</strong> {clienteEncontrado.cpf}</p>
                    <p><strong>Gênero:</strong> {clienteEncontrado.genero}</p>
                
                    </div>
                    <div className="dir">
                    <h3>Bônus do Cliente:</h3>
                    <div className="bonus-images-container">
                        {renderBonusImages(clienteEncontrado.bonus_count || 0)}
                    </div>
                    <Button type="default" onClick={handleCloseClienteInfo} className="close-button">Fechar</Button>
                </div>
                </div>
                </div>
            )}
        </div>
    );
}

export default Empresa;
