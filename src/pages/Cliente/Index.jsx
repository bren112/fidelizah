import React, { useEffect, useState } from 'react';
import { 
    Button, 
    message, 
    Modal, 
    Card, 
    Row, 
    Col, 
    Typography, 
    Avatar, 
    Space, 
    Tag,
    Statistic,
    Skeleton
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Supabase/createClient.js';
import './Cliente.css';
import { Link } from 'react-router-dom';
import { 
    LogoutOutlined, 
    BookOutlined, 
    ShopOutlined, 
    TrophyOutlined,
    StarFilled,
    CrownOutlined,
    UserOutlined,
    TeamOutlined,
    GiftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

function Cliente() {
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [bonusCount, setBonusCount] = useState(0);
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
    const [selectedBonusCount, setSelectedBonusCount] = useState(0);
    const [selectedEmpresaImagem, setSelectedEmpresaImagem] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const navigate = useNavigate();

    // LÓGICA ORIGINAL MANTIDA
    useEffect(() => {
        const verificarCPF = async () => {
            const token = localStorage.getItem('token');
        
            if (!token) {
                message.error('Você não está logado.');
                navigate('/login');
                return;
            }
        
            const { data: usuarioData, error: usuarioError } = await supabase
                .from('usuarios')
                .select('cpf, nome, genero, email')
                .eq('email', token)
                .single();
        
            if (usuarioError) {
                message.error('Erro ao buscar dados do usuário: ' + usuarioError.message);
                setCarregando(false);
                return;
            }
        
            const cpfUsuarioLogado = usuarioData.cpf;
        
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('*')
                .eq('cpf', cpfUsuarioLogado);
        
            if (clienteError) {
                message.error('Erro ao verificar CPF do cliente: ' + clienteError.message);
                setCarregando(false);
            } else if (clienteData.length > 0) {
                const cliente = clienteData[0];
                setClienteEncontrado({ ...usuarioData, ...cliente });
                message.success('Cliente encontrado!');
        
                const { data: empresasData, error: empresasError } = await supabase
                    .from('clientes')
                    .select('empresa_id')
                    .eq('cpf', cpfUsuarioLogado);
        
                if (empresasError) {
                    message.error('Erro ao buscar dados das empresas: ' + empresasError.message);
                    setCarregando(false);
                } else if (empresasData.length > 0) {
                    const empresaIds = empresasData.map(empresa => empresa.empresa_id);
                    const { data: empresasDetalhes, error: detalhesError } = await supabase
                        .from('empresas')
                        .select('id, nome, imagem')
                        .in('id', empresaIds);
        
                    if (detalhesError) {
                        message.error('Erro ao buscar detalhes das empresas: ' + detalhesError.message);
                    } else {
                        setEmpresas(empresasDetalhes || []);
        
                        // Buscar bônus para cada empresa (mantido igual)
                        empresasDetalhes.forEach(async (empresa) => {
                            const { data: bonusData, error: bonusError } = await supabase
                                .from('clientes')
                                .select('bonus_count')
                                .eq('empresa_id', empresa.id)
                                .eq('cpf', cpfUsuarioLogado)
                                .single();
        
                            if (bonusError) {
                                console.error('Erro ao buscar bônus da empresa:', empresa.nome, bonusError.message);
                            } else {
                                console.log(`Empresa: ${empresa.nome}, Bônus: ${bonusData ? bonusData.bonus_count : 0}`);
                            }
                        });
                    }
                } else {
                    setEmpresas([]);
                }
            } else {
                message.info('Nenhum cliente encontrado com esse CPF.');
                setEmpresas([]);
            }
            
            setCarregando(false);
        };

        verificarCPF();
    }, [navigate]);

    // HANDLERS ORIGINAIS MANTIDOS
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        localStorage.setItem('clienteLogado', 'false');
    };

    const handleSelectEmpresa = async (empresaId) => {
        if (selectedEmpresaId === empresaId) {
            setSelectedEmpresaId(null);
            setSelectedBonusCount(0);
            setSelectedEmpresaImagem('');
        } else {
            setSelectedEmpresaId(empresaId);

            const { data: bonusData, error: bonusError } = await supabase
                .from('clientes')
                .select('bonus_count')
                .eq('empresa_id', empresaId)
                .eq('cpf', clienteEncontrado.cpf)
                .single();

            if (bonusError) {
                message.error('Erro ao buscar bônus da empresa: ' + bonusError.message);
            } else if (bonusData) {
                setSelectedBonusCount(bonusData.bonus_count || 0);
            }

            const selectedEmpresa = empresas.find(empresa => empresa.id === empresaId);
            if (selectedEmpresa) {
                setSelectedEmpresaImagem(selectedEmpresa.imagem);
            }

            setIsModalVisible(true);
        }
    };

    const handleEmpresaClick = (empresa) => {
        localStorage.setItem('selectedEmpresa', JSON.stringify(empresa));
        navigate('/produtos');
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleResgatarBonus = () => {
        message.success('Bônus resgatado com sucesso!');
        setIsModalVisible(false);
    };

    // FUNÇÃO ORIGINAL MANTIDA
    const getImageUrl = (genero) => {
        if (genero === 'Masculino') {
            return 'https://i.pinimg.com/564x/50/f2/91/50f2915c4f23c9643efb1c8f05020f2b.jpg';
        } else if (genero === 'Feminino') {
            return 'https://i.pinimg.com/564x/01/6a/34/016a34bbf9dc95a43f2003c78964a543.jpg';
        } else {
            return 'https://i.pinimg.com/564x/6c/35/c5/6c35c525c3c0f1abef4c1b8b3c820727.jpg';
        }
    };

    // Funções auxiliares para a nova estrutura
    const getCategoriaCor = (categoria) => {
        const cores = {
            'alimentacao': '#ff6b6b',
            'restaurante': '#ff6b6b',
            'vestuario': '#4ecdc4',
            'moda': '#4ecdc4',
            'tecnologia': '#45b7d1',
            'eletronicos': '#45b7d1',
            'beleza': '#ff9ff3',
            'cosmeticos': '#ff9ff3',
            'servicos': '#a4b0be',
            'outros': '#a4b0be'
        };
        return cores['outros'];
    };

    const getCategoriaIcon = () => {
        return '🏢';
    };

    return (
        <div className="cliente-dashboard">
            {/* Header Section */}
            <header className="dashboard-header">
                <div className="header-container">
                    <div className="user-profile-section">
                        <div className="user-avatar-container">
                            <Avatar 
                                size={80} 
                                src={clienteEncontrado ? getImageUrl(clienteEncontrado.genero) : ''}
                                icon={<UserOutlined />}
                                className="user-avatar"
                            />
                        </div>
                        <div className="user-info">
                            <Title level={2} className="user-greeting">
                                Olá, <span className="user-name">{clienteEncontrado ? clienteEncontrado.nome : 'Cliente'}!</span>
                            </Title>
                            <Text className="user-email">{clienteEncontrado?.email}</Text>
                            <div className="user-stats">
                                <Tag icon={<TeamOutlined />} color="blue">
                                    {empresas.length} empresas
                                </Tag>
                                <Tag icon={<StarFilled />} color="gold">
                                    {empresas.reduce((total, emp) => total + (emp.bonus_count || 0), 0)} bônus
                                </Tag>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <Space size="middle">
                            <Link to="/historico">
                                <Button 
                                    type="default" 
                                    icon={<BookOutlined />}
                                    size="large"
                                    className="action-button"
                                >
                                    Meu Histórico
                                </Button>
                            </Link>
                            <Button 
                                type="primary" 
                                danger
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                size="large"
                                className="logout-button"
                            >
                                Sair
                            </Button>
                        </Space>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="main-container">
                    {/* Statistics Section */}
                    {empresas.length > 0 && (
                        <section className="stats-section">
                            <Row gutter={[24, 24]}>
                                <Col xs={24} sm={8}>
                                    <Card className="stat-card" bordered={false}>
                                        <Statistic
                                            title="Empresas Parceiras"
                                            value={empresas.length}
                                            prefix={<ShopOutlined />}
                                            valueStyle={{ color: '#667eea' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Card className="stat-card" bordered={false}>
                                        <Statistic
                                            title="Bônus Acumulados"
                                            value={empresas.reduce((total, emp) => total + (emp.bonus_count || 0), 0)}
                                            prefix={<StarFilled />}
                                            valueStyle={{ color: '#ffd666' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Card className="stat-card" bordered={false}>
                                        <Statistic
                                            title="Programas Ativos"
                                            value={empresas.filter(emp => (emp.bonus_count || 0) > 0).length}
                                            prefix={<TrophyOutlined />}
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </section>
                    )}

                    {/* Empresas Section */}
                    <section className="empresas-section">
                        <div className="section-header">
                            <Title level={1} className="section-title">
                                <ShopOutlined /> Empresas que você participa!
                            </Title>
                            <Text className="section-subtitle">
                                Gerencie seus programas de fidelidade e resgate seus bônus
                            </Text>
                        </div>

                        {carregando ? (
                            <div className="loading-section">
                                <Row gutter={[24, 24]}>
                                    {[1, 2, 3].map(i => (
                                        <Col key={i} xs={24} sm={12} lg={8}>
                                            <Card>
                                                <Skeleton active avatar paragraph={{ rows: 3 }} />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ) : empresas.length > 0 ? (
                            <div className="empresas-grid">
                                <Row gutter={[24, 24]}>
                                    {empresas.map((empresa) => (
                                        <Col key={empresa.id} xs={24} sm={12} lg={8} xl={6}>
                                            <Card
                                                className="empresa-card"
                                                hoverable
                                                cover={
                                                    <div className="empresa-cover">
                                                        <img
                                                            alt={empresa.nome}
                                                            src={empresa.imagem}
                                                            className="empresa-image"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/150x150/667eea/ffffff?text=Empresa';
                                                            }}
                                                        />
                                                        <div className="empresa-overlay">
                                                            <div className="overlay-content">
                                                                <Button 
                                                                    type="primary" 
                                                                    shape="round"
                                                                    icon={<GiftOutlined />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSelectEmpresa(empresa.id);
                                                                    }}
                                                                >
                                                                    Ver Bônus
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                actions={[
                                                    <Button 
                                                        type="primary" 
                                                        onClick={() => handleEmpresaClick(empresa)}
                                                        block
                                                    >
                                                        Ver Produtos
                                                    </Button>
                                                ]}
                                            >
                                                <div className="empresa-content">
                                                    <div className="empresa-header">
                                                        <div className="categoria-avatar">
                                                            {getCategoriaIcon()}
                                                        </div>
                                                        <Title level={4} className="empresa-name">
                                                            {empresa.nome}
                                                        </Title>
                                                    </div>
                                                    <div className="empresa-meta">
                                                        <Tag color={getCategoriaCor()}>
                                                            Parceira
                                                        </Tag>
                                                        <div className="bonus-display">
                                                            <StarFilled className="bonus-icon" />
                                                            <Text strong>Bônus disponíveis</Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ) : (
                            <div className="empty-section">
                                <div className="empty-content">
                                    <CrownOutlined className="empty-icon" />
                                    <Title level={3}>Nenhuma empresa encontrada</Title>
                                    <Text>
                                        Você ainda não participa de nenhuma empresa.
                                        Entre em contato com as empresas para ser adicionado aos seus programas de fidelidade.
                                    </Text>
                                    <div className="empty-actions">
                                        <Button 
                                            type="primary" 
                                            size="large" 
                                            icon={<CrownOutlined />}
                                            onClick={() => message.info('Entre em contato com as empresas para se cadastrar!')}
                                        >
                                            Como Participar?
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Bonus Modal - Mantendo estrutura original */}
            <Modal
                title="Bônus da Empresa"
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={[
                    <Button key="resgatar" type="primary" onClick={handleResgatarBonus}>
                        Resgatar Bônus
                    </Button>,
                    <Button key="fechar" onClick={handleModalClose}>
                        Fechar
                    </Button>
                ]}
                className="bonus-modal"
            >
                {selectedEmpresaImagem && (
                    <div className="bonus-modal-content">
                        <div className="empresa-info">
                            <Avatar 
                                size={64} 
                                src={selectedEmpresaImagem}
                                className="empresa-avatar"
                            />
                            <div className="empresa-details">
                                <Title level={4}>
                                    {empresas.find(emp => emp.id === selectedEmpresaId)?.nome}
                                </Title>
                            </div>
                        </div>
                        
                        <div className="bonus-display-modal">
                            <div className="bonus-count-large">
                                {selectedBonusCount}
                            </div>
                            <Text className="bonus-label">bônus disponíveis</Text>
                        </div>

                        {selectedBonusCount > 0 ? (
                            <div className="bonus-actions">
                                <Text>Você pode resgatar seus bônus por produtos exclusivos!</Text>
                            </div>
                        ) : (
                            <div className="no-bonus-message">
                                <Text type="secondary">
                                    Você ainda não possui bônus nesta empresa.
                                    Continue comprando para acumular!
                                </Text>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Cliente;