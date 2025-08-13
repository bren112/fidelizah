import React, { useEffect, useState } from 'react';
import { supabase } from "../../../Supabase/createClient.js";
import { useNavigate } from 'react-router-dom';
import { Input, Button, message, Modal, Select, AutoComplete } from 'antd';
import InputMask from 'react-input-mask'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './Empresa.css';
const { Option } = Select;

function Empresa() {
    const [searchNome, setSearchNome] = useState('');
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchCPF, setSearchCPF] = useState('');
    const [searchBy, setSearchBy] = useState('cpf'); // ← Adicionado!
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [showClienteInfo, setShowClienteInfo] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();
    const [options, setOptions] = useState([]); // Para armazenar sugestões de nomes

    const handleSearchChange = async (value) => {
        setSearchCPF(value); // Atualiza o input
    
        if (searchBy === 'nome' && value) {
            // Busca parcial no Supabase conforme o usuário digita
            const { data, error } = await supabase
                .from('clientes')
                .select('nome')
                .ilike('nome', `%${value}%`)
                .eq('empresa_id', empresa.id)
                .limit(5); // limita as sugestões
    
            if (!error) {
                setOptions(data.map(cliente => ({ value: cliente.nome })));
            }
        }
    };
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
        localStorage.setItem('admLogado', 'false');
        navigate('/adm');
    };
    
    const handleSearch = async () => {
        if (!searchCPF) {
            message.error(`Por favor, insira um ${searchBy === 'cpf' ? 'CPF' : 'nome'} para buscar.`);
            return;
        }
    
        let query = supabase
            .from('clientes')
            .select('*')
            .eq('empresa_id', empresa.id);
    
        if (searchBy === 'cpf') {
            query = query.eq('cpf', searchCPF);
        } else {
            query = query.ilike('nome', `%${searchCPF}%`);
        }
    
        const { data, error } = await query;
    
        if (error) {
            message.error('Erro ao buscar cliente: ' + error.message);
        } else if (data.length === 0) {
            message.info(`Nenhum cliente encontrado com esse ${searchBy === 'cpf' ? 'CPF' : 'nome'}.`);
            setClienteEncontrado(null);
            setShowClienteInfo(false);
        } else {
            setClienteEncontrado(data[0]);
            setShowClienteInfo(true);
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

    const handleCloseClienteInfo = () => {
        setShowClienteInfo(false);
        setClienteEncontrado(null);
        setSearchCPF('');
    };

    const handleOpenLinksModal = () => {
        setIsModalVisible(true);
    };

    const handleCloseLinksModal = () => {
        setIsModalVisible(false);
    };

    if (loading) return <p>Carregando...</p>;
    if (error) return <p>{error}</p>;

    const data = [
        { name: 'Tickets', value: clienteEncontrado?.bonus_count || 0 },
    ];

    return (
        <div className="tudo">
            {empresa.imagem && (
                <div className="empresa-image-container">
                    <img 
                        id='-imgempresa'
                        src={empresa.imagem} 
                        alt="Imagem da empresa" 
                        className="empresa-image" 
                    />
                </div>
            )}
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
                    <li><Button type="link" onClick={() => navigate('/max')}>Criar Produto</Button></li>
                    <li><Button type="link" onClick={() => navigate('/gc')}>Relatório Bônus</Button></li>
                    <li><Button type="link" onClick={() => navigate('/relatorio')}>Relatório Produtos</Button></li>
                    <li><Button type="link" onClick={() => navigate('/gprodutos')}>Gerenciar Produtos</Button></li>
                </ul>
            </Modal>

            <div className="search-area">
                <h2>Buscar Cliente</h2>
<div className="searchTipo">
                <Select 
                    value={searchBy} 
                    onChange={setSearchBy} 
                    style={{ width: 120, marginRight: 10 }}
                >
                    <Option value="cpf">CPF</Option>
                    <Option value="nome">Nome</Option>
                </Select>
               <br />
        
               {searchBy === 'cpf' ? (
    <InputMask
        mask="999.999.999-99"
        value={searchCPF}
        onChange={(e) => setSearchCPF(e.target.value)}
        placeholder="Digite o CPF"
        className="input-cpf"
    />
) : searchBy === 'nome' ? (
    <AutoComplete
        options={options}
        onChange={handleSearchChange}
        filterOption={false}
        className="input-nome"
    >
        <Input
            value={searchNome}
            onChange={(e) => setSearchNome(e.target.value)}
            placeholder="Digite o nome"
            className="input_nome"
        />
    </AutoComplete>
) : null}

<br /></div>

                <Button 
                    type="primary" 
                    onClick={handleSearch} 
                    id='btnprincipal2' 
                    className="search-button"
                >
                    Buscar
                </Button>
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

                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#6c63ff" />
                                </BarChart>
                            </ResponsiveContainer>

                            <Button type="default" onClick={handleCloseClienteInfo} className="close-button">Fechar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Empresa;
