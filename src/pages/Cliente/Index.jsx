import React, { useEffect, useState } from 'react';
import { Button, message, Collapse } from 'antd';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Supabase/createClient.js'; // Importando o Supabase
import './Cliente.css';

const { Panel } = Collapse; // Importa o Panel do Collapse

function Cliente() {
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [bonusCount, setBonusCount] = useState(0);
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
    const [selectedBonusCount, setSelectedBonusCount] = useState(0);
    const [selectedEmpresaImagem, setSelectedEmpresaImagem] = useState('');
    const [maxBonus, setMaxBonus] = useState(0); // Para armazenar o máximo de bônus
    const navigate = useNavigate();
    const bonusImageUrl = 'https://i.pinimg.com/564x/a6/1c/8d/a61c8dd18d112d20a3e959071077ab10.jpg';

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
                return;
            }

            const cpfUsuarioLogado = usuarioData.cpf;

            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('*')
                .eq('cpf', cpfUsuarioLogado);

            if (clienteError) {
                message.error('Erro ao verificar CPF do cliente: ' + clienteError.message);
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
                } else if (empresasData.length > 0) {
                    const empresaIds = empresasData.map(empresa => empresa.empresa_id);
                    const { data: empresasDetalhes, error: detalhesError } = await supabase
                        .from('empresas')
                        .select('id, nome, imagem, max_bonus') // Incluindo o max_bonus
                        .in('id', empresaIds);

                    if (detalhesError) {
                        message.error('Erro ao buscar detalhes das empresas: ' + detalhesError.message);
                    } else {
                        setEmpresas(empresasDetalhes);
                    }
                }
            } else {
                message.info('Nenhum cliente encontrado com esse CPF.');
            }
        };

        verificarCPF();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleSelectEmpresa = async (empresaId) => {
        if (selectedEmpresaId === empresaId) {
            setSelectedEmpresaId(null);
            setSelectedBonusCount(0);
            setSelectedEmpresaImagem('');
            setMaxBonus(0); // Resetar maxBonus
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
                setMaxBonus(selectedEmpresa.max_bonus || 0); // Definindo o máximo de bônus
            }
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

    return (
        <div>           
            <br />
            <div className="user">
                <div className="pessoa">
                    {clienteEncontrado && (
                        <img src={getImageUrl(clienteEncontrado.genero)} alt="Avatar do cliente" />
                    )}
                    <h1><span id='span'>{clienteEncontrado ? clienteEncontrado.nome : ''}!</span></h1>
                </div>
                <Button type="primary" id='red' onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                    </svg>
                </Button>
            </div>
            <br />

            {clienteEncontrado ? (
                <div className='container'>
                    <div>
                        <h2 id='h2'>Seus Bônus!</h2>
                        <br />
                        <ul>
                            {empresas.map(empresa => (
                                <div className='empresa' key={empresa.id}>
                                    <li 
                                        id='li'
                                        onClick={() => handleSelectEmpresa(empresa.id)} 
                                        className='empresa'
                                    >
                                        <img 
                                            src={empresa.imagem} 
                                            className={selectedEmpresaId === empresa.id ? 'empresa-img selected' : 'empresa-img'} 
                                        />
                                        {empresa.nome}
                                    </li>
                                </div>
                            ))}
                        </ul>
                    </div>
                    <div className='dir'>
                        {selectedEmpresaId && (
                            <div>
                                <p><span id='span'>{selectedBonusCount}/{maxBonus}</span></p>
                                <Collapse accordion>
                                    <Panel header="Ver Tickets" key="1">
                                        <div className='tickets'>
                                            {Array(selectedBonusCount).fill(0).map((_, index) => (
                                                <img 
                                                    key={index} 
                                                    src='https://jrbpwisclowinultbehj.supabase.co/storage/v1/object/public/ticket/ticket.png' // URL da imagem do ticket
                                                    alt={`Bônus ${index + 1}`} 
                                                    className="bonus-image_cliente" 
                                                />
                                            ))}
                                        </div>
                                    </Panel>
                                </Collapse>
                                {selectedBonusCount >= maxBonus && (
                                    <div>
                                        <p id='ganho'>🎉 Parabéns! Você ganhou o <span id='span'>Bônus!</span></p>
                                   
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p>Nenhum cliente encontrado.</p>
            )}
        </div>
    );
}

export default Cliente;
