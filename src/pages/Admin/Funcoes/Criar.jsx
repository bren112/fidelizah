import React, { useEffect, useState } from 'react';
import { Input, Button, Form, message, Select, Card, Row, Col, Typography, Avatar, Space } from 'antd';
import InputMask from 'react-input-mask';
import { supabase } from "../../../Supabase/createClient.js";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
    ArrowLeftOutlined, 
    UserAddOutlined, 
    UserOutlined, 
    PhoneOutlined, 
    IdcardOutlined,
    TeamOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import './Criar.css';

const { Option } = Select;
const { Title, Text } = Typography;
function Criar() {
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

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

    const handleSubmit = async (values) => {
        setSubmitting(true);
        const { nome, telefone, cpf, genero } = values;

        try {
            // Verificar se o CPF já existe
            const { data: existingClients, error: fetchError } = await supabase
                .from('clientes')
                .select('*')
                .eq('cpf', cpf)
                .eq('empresa_id', empresa.id);

            if (fetchError) {
                message.error('Erro ao verificar CPF: ' + fetchError.message);
                setSubmitting(false);
                return;
            }

            if (existingClients.length > 0) {
                message.error('Este CPF já está cadastrado para esta empresa.');
                setSubmitting(false);
                return;
            }

            // Inserir o cliente sem a coluna created_at
            const { data, error } = await supabase
                .from('clientes')
                .insert([{ 
                    nome, 
                    telefone, 
                    cpf, 
                    genero, 
                    empresa_id: empresa.id
                    // Removido created_at já que não existe na tabela
                }]);

            if (error) {
                message.error('Erro ao criar cliente: ' + error.message);
            } else {
                message.success({
                    content: 'Cliente criado com sucesso!',
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                });
                form.resetFields();
                
                // Feedback visual de sucesso
                setTimeout(() => {
                    navigate('/adm');
                }, 1500);
            }
        } catch (error) {
            message.error('Erro inesperado: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <Text>Carregando informações...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <Card className="error-card">
                    <div className="error-content">
                        <Text type="danger">{error}</Text>
                        <Link to="/adm">
                            <Button type="primary" className="back-button">
                                <ArrowLeftOutlined /> Voltar
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="criar-moderno">
            {/* Header */}
            <Card className="header-card" bordered={false}>
                <div className="header-content">
                    <Link to="/adm">
                        <Button type="text" className="back-button" icon={<ArrowLeftOutlined />}>
                            Voltar
                        </Button>
                    </Link>
                    <div className="header-info">
                        <div className="empresa-avatar">
                            {empresa?.imagem ? (
                                <Avatar 
                                    size={64} 
                                    src={empresa.imagem} 
                                    className="empresa-avatar-img"
                                />
                            ) : (
                                <Avatar size={64} icon={<TeamOutlined />} />
                            )}
                        </div>
                        <div className="empresa-details">
                            <Title level={4} className="empresa-name">{empresa?.nome}</Title>
                            <Text type="secondary">Cadastrar novo cliente</Text>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Main Content */}
            <Row justify="center" className="main-content">
                <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                    <Card 
                        className="form-card"
                        bordered={false}
                        title={
                            <div className="form-title">
                                <UserAddOutlined className="form-icon" />
                                <span>Novo Cliente</span>
                            </div>
                        }
                    >
                        <Form 
                            form={form} 
                            onFinish={handleSubmit} 
                            className="criar-form"
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                name="nome"
                                label="Nome Completo"
                                rules={[{ 
                                    required: true, 
                                    message: 'Por favor, insira o nome do cliente' 
                                }]}
                            >
                                <Input 
                                    prefix={<UserOutlined className="input-icon" />}
                                    placeholder="Digite o nome completo"
                                    className="modern-input"
                                />
                            </Form.Item>

                            <Form.Item
                                name="telefone"
                                label="Telefone"
                                rules={[{ 
                                    required: true, 
                                    message: 'Por favor, insira o telefone' 
                                }]}
                            >
                                <InputMask
                                    mask="(99) 99999-9999"
                                >
                                    {(inputProps) => (
                                        <Input 
                                            {...inputProps}
                                            prefix={<PhoneOutlined className="input-icon" />}
                                            placeholder="(00) 00000-0000"
                                            className="modern-input"
                                        />
                                    )}
                                </InputMask>
                            </Form.Item>

                            <Form.Item
                                name="cpf"
                                label="CPF"
                                rules={[{ 
                                    required: true, 
                                    message: 'Por favor, insira o CPF' 
                                }]}
                            >
                                <InputMask
                                    mask="999.999.999-99"
                                >
                                    {(inputProps) => (
                                        <Input 
                                            {...inputProps}
                                            prefix={<IdcardOutlined className="input-icon" />}
                                            placeholder="000.000.000-00"
                                            className="modern-input"
                                        />
                                    )}
                                </InputMask>
                            </Form.Item>

                            <Form.Item
                                name="genero"
                                label="Gênero"
                                rules={[{ 
                                    required: true, 
                                    message: 'Por favor, selecione o gênero' 
                                }]}
                            >
                                <Select 
                                    placeholder="Selecione o gênero"
                                    className="modern-select"
                                    suffixIcon={<UserOutlined />}
                                >
                                    <Option value="Masculino">👨 Masculino</Option>
                                    <Option value="Feminino">👩 Feminino</Option>
                                    <Option value="Outro">⚧ Outro</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item className="submit-item">
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    className="submit-button"
                                    loading={submitting}
                                    icon={<UserAddOutlined />}
                                    size="large"
                                    block
                                >
                                    {submitting ? 'Cadastrando...' : 'Cadastrar Cliente'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>

            {/* Info Footer */}
            <div className="info-footer">
                <Text type="secondary">
                    <TeamOutlined /> Todos os dados serão vinculados à empresa {empresa?.nome}
                </Text>
            </div>
        </div>
    );
}

export default Criar;