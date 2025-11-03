import './Home.css';
import img from './imgHome.png';
import { Link } from 'react-router-dom';
import { Button, Typography, Row, Col, Card } from 'antd';
import { 
    StarFilled, 
    TeamOutlined, 
    RocketOutlined, 
    GiftOutlined,
    ArrowRightOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

function Home() {
    return (
        <div className="home-modern">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} lg={12}>
                            <div className="hero-text">
                                <div className="badge">
                                    <StarFilled className="badge-icon" />
                                    <span>Sistema de Fidelidade Inteligente</span>
                                </div>
                                
                                <Title className="main-title">
                                    Conheça a <span className="brand-gradient">Fidelix</span>
                                </Title>
                                
                                <Title level={2} className="subtitle">
                                    Empresa e clientes,
                                    <br />
                                    <span className="highlight">conectados</span> ;)
                                </Title>
                                
                                <Text className="description">
                                    Transforme a experiência dos seus clientes com nosso sistema 
                                    de fidelidade moderno e intuitivo. Aumente o engajamento 
                                    e fortaleça o relacionamento com sua base.
                                </Text>

                                <div className="cta-section">
                                    <Link to="/login">
                                        <Button 
                                            type="primary" 
                                            size="large"
                                            className="cta-button"
                                            icon={<RocketOutlined />}
                                        >
                                            Acessar Meus Bônus
                                            <ArrowRightOutlined />
                                        </Button>
                                    </Link>
                                    
                                    <div className="feature-tags">
                                        <div className="feature-tag">
                                            <CheckCircleOutlined />
                                            <span>Fácil de usar</span>
                                        </div>
                                        <div className="feature-tag">
                                            <CheckCircleOutlined />
                                            <span>Seguro</span>
                                        </div>
                                        <div className="feature-tag">
                                            <CheckCircleOutlined />
                                            <span>Rápido</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        
                        <Col xs={24} lg={12}>
                            <div className="hero-image-container">
                                <img 
                                    src={img} 
                                    alt="Sistema de Fidelidade Fidelix" 
                                    className="hero-image"
                                />
                                <div className="floating-card card-1">
                                    <GiftOutlined />
                                    <div>
                                        <div className="card-value">+500</div>
                                        <div className="card-label">Bônus Diários</div>
                                    </div>
                                </div>
                                <div className="floating-card card-2">
                                    <TeamOutlined />
                                    <div>
                                        <div className="card-value">+1K</div>
                                        <div className="card-label">Clientes Fidelizados</div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                
                {/* Wave Separator */}
                <div className="wave-separator">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                    </svg>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <div className="container">
                    <div className="section-header">
                        <Title level={2} className="title">
                            Por que escolher a <span className="brand-gradient">Fidelix?</span>
                        </Title>
                        <Text className="section-description">
                            Oferecemos uma solução completa para gerenciar seu programa de fidelidade
                        </Text>
                    </div>
                    
                    <Row gutter={[32, 32]} className="features-grid">
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon-wrapper">
                                    <TeamOutlined className="feature-icon" />
                                </div>
                                <Title level={4}>Gestão de Clientes</Title>
                                <Text>
                                    Cadastre e gerencie seus clientes de forma simples e organizada, 
                                    com histórico completo de interações.
                                </Text>
                            </Card>
                        </Col>
                        
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon-wrapper">
                                    <GiftOutlined className="feature-icon" />
                                </div>
                                <Title level={4}>Sistema de Bônus</Title>
                                <Text>
                                    Crie promoções personalizadas e gerencie bônus de forma 
                                    automática e eficiente.
                                </Text>
                            </Card>
                        </Col>
                        
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon-wrapper">
                                    <RocketOutlined className="feature-icon" />
                                </div>
                                <Title level={4}>Relatórios Avançados</Title>
                                <Text>
                                    Acompanhe o desempenho do seu programa com relatórios 
                                    detalhados e insights valiosos.
                                </Text>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="bottom-cta">
                <div className="container">
                    <Card className="cta-card" bordered={false}>
                        <Row gutter={[48, 48]} align="middle">
                            <Col xs={24} lg={16}>
                                <Title level={3} className="cta-title">
                                    Pronto para transformar a fidelidade dos seus clientes?
                                </Title>
                                <Text className="cta-description">
                                    Junte-se a centenas de empresas que já utilizam nossa plataforma
                                </Text>
                            </Col>
                            <Col xs={24} lg={8}>
                                <Link to="/login">
                                    <Button 
                                        type="primary" 
                                        size="large"
                                        className="cta-button-secondary"
                                        block
                                    >
                                        Começar Agora
                                        <ArrowRightOutlined />
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Home;