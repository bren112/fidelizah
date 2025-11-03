import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, message, Card, Typography, Divider } from 'antd';
import InputMask from 'react-input-mask';
import { useNavigate } from 'react-router-dom';
import './LoginRedesign.css';
import { supabase } from "../../Supabase/createClient.js";
import { 
    UserOutlined, 
    LockOutlined, 
    MailOutlined, 
    PhoneOutlined, 
    IdcardOutlined,
    TeamOutlined,
    ArrowRightOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    CrownOutlined,
    GiftOutlined,
    StarFilled
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function Login() {
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm();
    const [loginForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/logado');
        }
    }, [navigate]);

    const toggleModal = () => setShowModal(!showModal);

    const handleSubmit = async (values) => {
        setRegisterLoading(true);
        const { nome, telefone, cpf, email, password, genero } = values;

        try {
            const { data, error } = await supabase
                .from('usuarios')
                .insert([{ nome, telefone, cpf, email, password, genero }]);

            if (error) {
                message.error('Erro ao cadastrar usuário: ' + error.message);
            } else {
                message.success('Usuário cadastrado com sucesso!');
                form.resetFields();
                toggleModal();
            }
        } catch (error) {
            message.error('Erro inesperado: ' + error.message);
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleLogin = async (values) => {
        setLoading(true);
        const { email, password } = values;

        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .limit(1);

            if (error) {
                message.error('Erro ao fazer login: ' + error.message);
                return;
            }

            if (data.length === 0) {
                message.error('Email ou senha inválidos.');
            } else {
                message.success('Login realizado com sucesso!');
                const usuarioLogado = data[0];
                
                localStorage.setItem('token', usuarioLogado.email);
                localStorage.setItem('clienteLogado', 'true');

                navigate('/logado');
            }
        } catch (error) {
            message.error('Erro inesperado: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-redesign">
            {/* Background Elements */}
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div>

            <div className="login-wrapper">
                {/* Left Panel - Brand & Features */}
                <div className="left-panel">
                    <div className="brand-section">
                        <div className="logo">
                            <CrownOutlined className="logo-icon" />
                            <span className="logo-text">Fidelix</span>
                        </div>
                        <Title level={1} className="main-headline">
                            Sua jornada de 
                            <span className="highlight"> fidelidade</span> 
                            começa aqui
                        </Title>
                        <Text className="sub-headline">
                            Acumule bônus, ganhe recompensas e viva experiências exclusivas
                        </Text>
                    </div>

                    <div className="features-list">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <GiftOutlined />
                            </div>
                            <div className="feature-content">
                                <Text strong>Bônus Exclusivos</Text>
                                <Text>Ganhe recompensas a cada compra</Text>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <StarFilled />
                            </div>
                            <div className="feature-content">
                                <Text strong>Promoções Personalizadas</Text>
                                <Text>Ofertas feitas especialmente para você</Text>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <UserOutlined />
                            </div>
                            <div className="feature-content">
                                <Text strong>Experiência Única</Text>
                                <Text>Benefícios que fazem a diferença</Text>
                            </div>
                        </div>
                    </div>

                
                </div>

                {/* Right Panel - Login Form */}
                <div className="right-panel">
                    <Card className="login-card" bordered={false}>
                        <div className="card-header">
                            <Title level={2} className="welcome-title">
                                Bem-vindo de volta
                            </Title>
                            <Text className="welcome-subtitle">
                                Entre em sua conta para continuar
                            </Text>
                        </div>

                        <Form 
                            form={loginForm} 
                            onFinish={handleLogin} 
                            layout="vertical"
                            className="login-form"
                            size="large"
                        >
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ 
                                    required: true, 
                                    message: 'Por favor, insira seu email',
                                    type: 'email'
                                }]}
                            >
                                <Input 
                                    prefix={<MailOutlined className="input-prefix" />}
                                    placeholder="seu@email.com"
                                    className="form-input"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Senha"
                                rules={[{ 
                                    required: true, 
                                    message: 'Por favor, insira sua senha' 
                                }]}
                            >
                                <Input.Password 
                                    prefix={<LockOutlined className="input-prefix" />}
                                    placeholder="Sua senha"
                                    className="form-input"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    className="login-btn"
                                    loading={loading}
                                    block
                                >
                                    {loading ? 'Entrando...' : 'Entrar na minha conta'}
                                    <ArrowRightOutlined />
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider className="form-divider">
                            <Text type="secondary">ou</Text>
                        </Divider>

                        <div className="register-cta">
                            <Text className="cta-text">Novo por aqui?</Text>
                            <Button 
                                type="default" 
                                className="register-btn"
                                onClick={toggleModal}
                                block
                            >
                                Criar conta gratuita
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Registration Modal */}
            <Modal
                title={
                    <div className="modal-title">
                        <UserOutlined />
                        <span>Criar Nova Conta</span>
                    </div>
                }
                open={showModal}
                onCancel={toggleModal}
                footer={null}
                centered
                className="register-modal"
                width={520}
            >
                <Form 
                    form={form} 
                    onFinish={handleSubmit} 
                    layout="vertical"
                    className="register-form"
                    size="large"
                >
                    <Form.Item 
                        name="nome" 
                        label="Nome Completo"
                        rules={[{ required: true, message: 'Por favor, insira seu nome completo' }]}
                    >
                        <Input 
                            prefix={<UserOutlined className="input-prefix" />}
                            placeholder="Como você gostaria de ser chamado?"
                            className="form-input"
                        />
                    </Form.Item>

                    <div className="form-row">
                        <Form.Item 
                            name="telefone" 
                            label="Telefone"
                            rules={[{ required: true, message: 'Por favor, insira seu telefone' }]}
                            className="form-half"
                        >
                            <InputMask mask="(99) 99999-9999">
                                {(inputProps) => (
                                    <Input 
                                        {...inputProps}
                                        prefix={<PhoneOutlined className="input-prefix" />}
                                        placeholder="(00) 00000-0000"
                                        className="form-input"
                                    />
                                )}
                            </InputMask>
                        </Form.Item>

                        <Form.Item 
                            name="cpf" 
                            label="CPF"
                            rules={[{ required: true, message: 'Por favor, insira seu CPF' }]}
                            className="form-half"
                        >
                            <InputMask mask="999.999.999-99">
                                {(inputProps) => (
                                    <Input 
                                        {...inputProps}
                                        prefix={<IdcardOutlined className="input-prefix" />}
                                        placeholder="000.000.000-00"
                                        className="form-input"
                                    />
                                )}
                            </InputMask>
                        </Form.Item>
                    </div>

                    <Form.Item 
                        name="email" 
                        label="Email"
                        rules={[{ 
                            required: true, 
                            message: 'Por favor, insira seu email',
                            type: 'email'
                        }]}
                    >
                        <Input 
                            prefix={<MailOutlined className="input-prefix" />}
                            placeholder="seu@email.com"
                            className="form-input"
                        />
                    </Form.Item>

                    <Form.Item 
                        name="password" 
                        label="Senha"
                        rules={[{ 
                            required: true, 
                            message: 'Por favor, insira sua senha',
                            min: 6,
                            message: 'A senha deve ter pelo menos 6 caracteres'
                        }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-prefix" />}
                            placeholder="Crie uma senha segura"
                            className="form-input"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item 
                        name="genero" 
                        label="Gênero"
                        rules={[{ required: true, message: 'Por favor, selecione seu gênero' }]}
                    >
                        <Select 
                            placeholder="Selecione seu gênero"
                            className="form-select"
                            suffixIcon={<TeamOutlined />}
                        >
                            <Option value="homem">👨 Homem</Option>
                            <Option value="mulher">👩 Mulher</Option>
                            <Option value="nenhum dos dois">⚧ Prefiro não informar</Option>
                        </Select>
                    </Form.Item>

                    <div className="modal-actions">
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            className="submit-btn"
                            loading={registerLoading}
                            block
                        >
                            {registerLoading ? 'Criando conta...' : 'Criar minha conta'}
                        </Button>
                        <Button 
                            onClick={toggleModal} 
                            className="cancel-btn"
                            block
                        >
                            Voltar para o login
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default Login;