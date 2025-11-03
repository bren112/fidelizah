import React, { useEffect, useState } from 'react';
import { supabase } from "../../../Supabase/createClient.js";
import { useNavigate } from 'react-router-dom';
import { Input, Button, message, Modal, Select, AutoComplete, Card, Row, Col, Tag, Statistic } from 'antd';
import InputMask from 'react-input-mask'; 
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import {
    GiftOutlined,
    UserAddOutlined,
    AppstoreAddOutlined,
    FileSearchOutlined,
    ShoppingOutlined,
    SettingOutlined,
    FileTextOutlined,
    SearchOutlined,
    TeamOutlined,
    StarOutlined,
    RocketOutlined,
    LogoutOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';

import './EmpresaModern.css';

const { Option } = Select;

function Empresa() {
    const [searchNome, setSearchNome] = useState('');
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchCPF, setSearchCPF] = useState('');
    const [searchBy, setSearchBy] = useState('cpf');
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [showClienteInfo, setShowClienteInfo] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [clientesCount, setClientesCount] = useState(0);
    const navigate = useNavigate();
    const [options, setOptions] = useState([]);

    const handleSearchChange = async (value) => {
        setSearchCPF(value);
    
        if (searchBy === 'nome' && value) {
            const { data, error } = await supabase
                .from('clientes')
                .select('nome')
                .ilike('nome', `%${value}%`)
                .eq('empresa_id', empresa.id)
                .limit(5);
    
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
                // Buscar contagem de clientes
                const { count } = await supabase
                    .from('clientes')
                    .select('*', { count: 'exact', head: true })
                    .eq('empresa_id', data.id);
                setClientesCount(count || 0);
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

    // Dados para o gráfico de pizza
    const pieData = [
        { name: 'Tickets', value: clienteEncontrado?.bonus_count || 0 },
        { name: 'Restante', value: 10 - (clienteEncontrado?.bonus_count || 0) }
    ];

    const COLORS = ['#667eea', '#e2e8f0'];

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (error) return <div className="error-container">{error}</div>;

    const data = [
        { name: 'Tickets', value: clienteEncontrado?.bonus_count || 0 },
    ];

    return (
        <div className="empresa-modern">
            {/* Header */}
            <div className="modern-header">
                <div className="header-content">
                    <div className="empresa-info">
                        {empresa.imagem && (
                            <div className="empresa-avatar">
                                <img 
                                    src={empresa.imagem} 
                                    alt="Imagem da empresa" 
                                    className="avatar-image" 
                                />
                            </div>
                        )}
                        <div className="empresa-details">
                            <h1 className="welcome-title">
                                Bem-vindo, <span className="empresa-name">{empresa.nome}</span>
                            </h1>
                            <p className="welcome-subtitle">Gerencie seus clientes e promoções</p>
                        </div>
                    </div>
                    <Button 
                        type="primary" 
                        danger 
                        onClick={handleLogout} 
                        className="logout-btn"
                        icon={<LogoutOutlined />}
                    >
                        Sair
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={8}>
                    <Card className="stat-card" bordered={false}>
                        <Statistic
                            title="Total de Clientes"
                            value={clientesCount}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#667eea' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card" bordered={false}>
                        <Statistic
                            title="Ações Disponíveis"
                            value={7}
                            prefix={<RocketOutlined />}
                            valueStyle={{ color: '#f093fb' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card" bordered={false}>
                        <div className="quick-action">
                            <Link to='/direcacoes'>
                                <Button 
                                    type="primary" 
                                    className="action-btn"
                                    icon={<ArrowRightOutlined />}
                                    block
                                >
                                    Ver Todas as Ações
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Search Section */}
            <Card className="search-card" bordered={false}>
                <div className="search-header">
                    <h2 className="search-title">
                        <SearchOutlined /> Buscar Cliente
                    </h2>
                    <Tag color="blue" className="search-tag">
                        {searchBy === 'cpf' ? 'Busca por CPF' : 'Busca por Nome'}
                    </Tag>
                </div>
                
                <div className="search-controls">
                    <Select 
                        value={searchBy} 
                        onChange={setSearchBy} 
                        className="search-type-select"
                        size="large"
                    >
                        <Option value="cpf">CPF</Option>
                        <Option value="nome">Nome</Option>
                    </Select>
                    
                    {searchBy === 'cpf' ? (
                        <InputMask
                            mask="999.999.999-99"
                            value={searchCPF}
                            onChange={(e) => setSearchCPF(e.target.value)}
                            placeholder="Digite o CPF do cliente"
                            className="search-input"
                        >
                            {(inputProps) => <Input {...inputProps} size="large" />}
                        </InputMask>
                    ) : (
                        <AutoComplete
                            options={options}
                            onChange={handleSearchChange}
                            filterOption={false}
                            className="search-input"
                        >
                            <Input
                                value={searchNome}
                                onChange={(e) => setSearchNome(e.target.value)}
                                placeholder="Digite o nome do cliente"
                                size="large"
                            />
                        </AutoComplete>
                    )}
                    
                    <Button 
                        type="primary" 
                        onClick={handleSearch} 
                        className="search-button"
                        icon={<SearchOutlined />}
                        size="large"
                    >
                        Buscar Cliente
                    </Button>
                </div>
            </Card>

            {/* Client Info */}
            {showClienteInfo && clienteEncontrado && (
                <Card className="client-card" bordered={false}>
                    <div className="client-header">
                        <h2 className="client-title">
                            <StarOutlined /> Dados do Cliente
                        </h2>
                        <Button 
                            onClick={handleCloseClienteInfo} 
                            className="close-client-btn"
                        >
                            Fechar
                        </Button>
                    </div>
                    
                    <div className="client-content">
                        <div className="client-profile">
                            <div className="profile-image-container">
                                <img 
                                    src={getImageUrl(clienteEncontrado.genero)} 
                                    alt={`Imagem de ${clienteEncontrado.genero}`} 
                                    className="client-avatar"
                                />
                                <div className="profile-badge">
                                    {clienteEncontrado.genero}
                                </div>
                            </div>
                            <div className="profile-info">
                                <h3 className="client-name">{clienteEncontrado.nome}</h3>
                                <div className="client-details">
                                    <div className="detail-item">
                                        <strong>Telefone:</strong> {clienteEncontrado.telefone}
                                    </div>
                                    <div className="detail-item">
                                        <strong>CPF:</strong> {clienteEncontrado.cpf}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="client-stats">
                            <h4 className="stats-title">Bônus do Cliente</h4>
                            <div className="charts-container">
                                <div className="pie-chart">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="chart-label">
                                        <span className="tickets-count">
                                            {clienteEncontrado.bonus_count || 0} Tickets
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="bar-chart">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={data}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#667eea" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

export default Empresa;