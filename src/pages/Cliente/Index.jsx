import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Supabase/createClient.js'; // Importando o Supabase
import './Cliente.css';

function Cliente() {
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [bonusCount, setBonusCount] = useState(0);
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
    const [selectedBonusCount, setSelectedBonusCount] = useState(0);
    const [selectedEmpresaImagem, setSelectedEmpresaImagem] = useState('');
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
                        .select('id, nome, imagem')
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
        }
    };

    return (
        <div>
            <br />
            <div className="user">
            <h1 style={{ textAlign: 'center' }}>Bem-vindo(a), <span id='span'>{clienteEncontrado ? clienteEncontrado.nome : ''}!</span></h1>
            <Button type="primary" id='red' onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
  <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
</svg>
            </Button>
            </div>
            <br />

            {/* <p id='p'>Aqui você vai ver todos seu bônus que você conseguiu até agora!</p> */}

            {clienteEncontrado ? (
                <div className='container'>
                    <div>
                        <h2 id='h2'>Seus Bônus <span id='span'><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-ticket-perforated" viewBox="0 0 16 16">
  <path d="M4 4.85v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9zm-7 1.8v.9h1v-.9zm7 0v.9h1v-.9z"/>
  <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3zM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.05a2.5 2.5 0 0 0 0 4.9v1.05a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-1.05a2.5 2.5 0 0 0 0-4.9z"/>
</svg></span></h2>
                       
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
                                <p><span id='span'>{selectedBonusCount}/9</span></p>
                                <div className='tickets'>
                                    {Array(selectedBonusCount).fill(0).map((_, index) => (
                                        <img 
                                            key={index} 
                                            src={bonusImageUrl} 
                                            alt={`Bônus ${index + 1}`} 
                                            className="bonus-image_cliente" 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p>Nenhum cliente encontrado com seu CPF.</p>
            )}

          
        </div>
    );
}

export default Cliente;
