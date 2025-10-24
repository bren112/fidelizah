import React, { useEffect, useState } from 'react';
import { Button, message, Collapse, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Supabase/createClient.js';
import './Cliente.css';
import { Link } from 'react-router-dom';

import logo from './logo.png'

const { Panel } = Collapse;

function Cliente() {
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [bonusCount, setBonusCount] = useState(0);
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
    const [selectedBonusCount, setSelectedBonusCount] = useState(0);
    const [selectedEmpresaImagem, setSelectedEmpresaImagem] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [carregando, setCarregando] = useState(true); // Estado para controlar o carregamento
    const navigate = useNavigate();
    const bonusImageUrl = 'https://jrbpwisclowinultbehj.supabase.co/storage/v1/object/public/ticket/ticket.png';

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
                .select('cpf')
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
                setClienteEncontrado(cliente);
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
        
                        // Agora, buscamos o bônus de cada empresa
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
                    // Nenhuma empresa encontrada para o usuário
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

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleResgatarBonus = () => {
        message.success('Bônus resgatado com sucesso!');
        setIsModalVisible(false);
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
        <div>
            <br />
            <div className="user">
                <div className="pessoa">
                    {clienteEncontrado && (
                        <img src={getImageUrl(clienteEncontrado.genero)} alt="Avatar do cliente" />
                    )}
                    <h1 id='h1'><span id='span'>{clienteEncontrado ? clienteEncontrado.nome : ''}!</span></h1>
                </div>
                <div className="botoes2">
                    <Button type="primary" id='red' onClick={handleLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5.5 0 0 0 9.5 2h-8A1.5.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                        </svg>
                    </Button>
                    <Link to='/historico'>
                        <button type="primary" className=''>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-book" viewBox="0 0 16 16">
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
                            </svg>
                        </button>
                    </Link>
                </div>
            </div>
            <br />

            {clienteEncontrado ? (
                <div className='container'>
                    <div>
                        <h2 id='titulo' style={{ textAlign: 'center' }}>Empresas que você participa!</h2>
                        <br />
                        
                        {carregando ? (
                            <p>Buscando empresas...</p>
                        ) : empresas.length > 0 ? (
                            <div className="empresa-grid">
                                {empresas.map(empresa => (
                                    <div className='empresa' key={empresa.id}>
                                        <li id='li' className='empresa'>
                                            <div 
                                                className={selectedEmpresaId === empresa.id ? 'empresa-card selected' : 'empresa-card'}
                                                onClick={() => {
                                                    localStorage.setItem('selectedEmpresa', JSON.stringify(empresa));
                                                    navigate('/produtos');
                                                }}
                                            >
                                                <img 
                                                    src={empresa.imagem} 
                                                    className='empresa-img'
                                                    alt={empresa.nome}
                                                />
                                            </div>
                                            <span className="empresa-nome">{empresa.nome}</span>
                                        </li>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="nenhuma-empresa">
                                <div className="mensagem-vazia">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="64" 
                                        height="64" 
                                        fill="currentColor" 
                                        className="bi bi-building" 
                                        viewBox="0 0 16 16"
                                        style={{ color: '#ccc', marginBottom: '16px' }}
                                    >
                                        <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/>
                                        <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z"/>
                                    </svg>
                                    <h3 style={{ color: '#666', marginBottom: '8px' }}>
                                        Você ainda não participa de nenhuma empresa
                                    </h3>
                                    <p style={{ color: '#999', textAlign: 'center' }}>
                                        Entre em contato com as empresas para ser adicionado aos seus programas de fidelidade.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='dir'>
                        {/* {selectedEmpresaId && (
                            <div>
                                <p id='bonusp'>Bônus: {selectedBonusCount}</p>
                            </div>
                        )} */}
                    </div>
                </div>
            ) : (
                <div className="nenhuma-empresa">
                                <div className="mensagem-vazia">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="64" 
                                        height="64" 
                                        fill="currentColor" 
                                        className="bi bi-building" 
                                        viewBox="0 0 16 16"
                                        style={{ color: '#ccc', marginBottom: '16px' }}
                                    >
                                        <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/>
                                        <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z"/>
                                    </svg>
                                    <h3 style={{ color: '#666', marginBottom: '8px' }}>
                                        Você ainda não participa de nenhuma empresa
                                    </h3>
                                    <p style={{ color: '#999', textAlign: 'center' }}>
                                        Entre em contato com as empresas para ser adicionado aos seus programas de fidelidade.
                                    </p>
                                </div>
                            </div>
            )}
        </div>
    );
}

export default Cliente;