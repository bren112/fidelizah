import React, { useEffect, useState } from 'react';
import { supabase } from "../../../Supabase/createClient.js";
import { useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col } from 'antd';
import {
    GiftOutlined,
    UserAddOutlined,
    AppstoreAddOutlined,
    FileSearchOutlined,
    ShoppingOutlined,
    SettingOutlined,
    FileTextOutlined
} from '@ant-design/icons';

import './AcoesPage.css'; // Vamos criar este CSS

function AcoesPage() {
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        localStorage.setItem('admLogado', 'false');
        navigate('/adm');
    };

    // Array com todas as ações
    const acoes = [
        {
            id: 1,
            titulo: "Sistema de Bônus",
            descricao: "Crie Promoções e Bonifique seus clientes!",
            icone: <GiftOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
            rota: '/gerenciamento',
            cor: '#1890ff'
        },
        {
            id: 2,
            titulo: "Bônus Básico",
            descricao: "Bonifique facilmente seus clientes!",
            icone: <FileTextOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
            rota: '/bonus',
            cor: '#52c41a'
        },
        {
            id: 3,
            titulo: "Criar Cliente",
            descricao: "Cadastre novos clientes no sistema",
            icone: <UserAddOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
            rota: '/criar',
            cor: '#fa8c16'
        },
        {
            id: 4,
            titulo: "Criar Produto",
            descricao: "Adicione novos produtos ao catálogo",
            icone: <AppstoreAddOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
            rota: '/max',
            cor: '#722ed1'
        },
        {
            id: 5,
            titulo: "Relatório Bônus",
            descricao: "Visualize relatórios detalhados de bônus",
            icone: <FileSearchOutlined style={{ fontSize: '32px', color: '#fa541c' }} />,
            rota: '/gc',
            cor: '#fa541c'
        },
        {
            id: 6,
            titulo: "Relatório Produtos",
            descricao: "Acesse relatórios completos de produtos",
            icone: <ShoppingOutlined style={{ fontSize: '32px', color: '#13c2c2' }} />,
            rota: '/relatorio',
            cor: '#13c2c2'
        },
        {
            id: 7,
            titulo: "Gerenciar Produtos",
            descricao: "Edite e gerencie seus produtos cadastrados",
            icone: <SettingOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
            rota: '/gprodutos',
            cor: '#eb2f96'
        }
    ];

    if (loading) return <div className="loading-container">Carregando...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="acoes-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    {empresa?.imagem && (
                        <div className="empresa-image-container">
                            <img 
                                src={empresa.imagem} 
                                alt="Imagem da empresa" 
                                className="empresa-image" 
                            />
                        </div>
                    )}
                    <div className="header-text">
                        <h1 className="page-title">
                            Olá <span className="empresa-name">{empresa?.nome}</span>
                        </h1>
                        <p className="page-subtitle">Gerencie todas as funcionalidades do sistema</p>
                    </div>
                    <Button type="default" onClick={handleLogout} className="logout-button">
                        Sair
                    </Button>
                </div>
            </div>

            {/* Grid de Ações */}
            <div className="acoes-container">
                <h2 className="section-title">Minhas Ações</h2>
                <p className="section-description">
                    Selecione uma das ações abaixo para gerenciar seu negócio
                </p>
                
                <Row gutter={[24, 24]} className="cards-grid">
                    {acoes.map((acao) => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={acao.id}>
                            <Card 
                                className="acao-card"
                                hoverable
                                bordered={false}
                                style={{ 
                                    borderLeft: `4px solid ${acao.cor}`,
                                    borderRadius: '12px'
                                }}
                            >
                                <div className="card-content">
                                    <div className="card-icon">
                                        {acao.icone}
                                    </div>
                                    <h3 className="card-title">{acao.titulo}</h3>
                                    <p className="card-description">{acao.descricao}</p>
                                    <Button 
                                        type="primary" 
                                        onClick={() => navigate(acao.rota)}
                                        className="card-button"
                                        style={{ backgroundColor: acao.cor, borderColor: acao.cor }}
                                        block
                                    >
                                        Acessar
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
}

export default AcoesPage;