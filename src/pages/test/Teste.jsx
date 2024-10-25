import React, { useEffect, useState } from 'react';
import { supabase } from "../../Supabase/createClient.js";
import './Teste.css'; // Adicione este CSS para estilizar os componentes

function Teste() {
    const [empresa, setEmpresa] = useState(null);
    const [funcionarios, setFuncionarios] = useState([]);
    const [bonus, setBonus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFuncionario, setSelectedFuncionario] = useState('');
    const [bonusValor, setBonusValor] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [bonusNome, setBonusNome] = useState('');
    const [bonusImagem, setBonusImagem] = useState('');
    const [bonusDescricao, setBonusDescricao] = useState('');
    const [bonusMax, setBonusMax] = useState('');
    const [bonusUnitValor, setBonusUnitValor] = useState('');
    const [selectedBonus, setSelectedBonus] = useState(null); // Novo estado para o bônus selecionado
    const [clientes, setClientes] = useState([]); // Estado para clientes disponíveis

    useEffect(() => {
        const fetchEmpresaAndData = async () => {
            const email = localStorage.getItem('token');

            if (!email) {
                setError('Você não está logado.');
                setLoading(false);
                return;
            }

            const { data: empresaData, error: empresaError } = await supabase
                .from('empresas')
                .select('*')
                .eq('email', email)
                .single();

            if (empresaError) {
                setError('Erro ao buscar informações da empresa: ' + empresaError.message);
                setLoading(false);
                return;
            } else {
                setEmpresa(empresaData);
            }

            // Buscar funcionários da empresa
            const { data: funcionariosData, error: funcionariosError } = await supabase
                .from('funcionarios')
                .select('*')
                .eq('empresa_id', empresaData.id);

            if (funcionariosError) {
                setError('Erro ao buscar funcionários: ' + funcionariosError.message);
            } else {
                setFuncionarios(funcionariosData);
            }

            // Buscar bônus da empresa
            const { data: bonusData, error: bonusError } = await supabase
                .from('bonus')
                .select('*')
                .eq('empresa_id', empresaData.id);

            if (bonusError) {
                setError('Erro ao buscar bônus: ' + bonusError.message);
            } else {
                setBonus(bonusData);
            }

            setLoading(false);
        };

        fetchEmpresaAndData();
    }, []);

    // Função para buscar clientes da empresa
    const fetchClientes = async () => {
        const { data: clientesData, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('empresa_id', empresa.id); // Ajuste se a coluna de identificação da empresa for diferente

        if (error) {
            alert('Erro ao buscar clientes: ' + error.message);
        } else {
            setClientes(clientesData);
        }
    };

    const handleBonificarCliente = async (clienteId) => {
        if (!selectedFuncionario || !bonusValor) {
            alert('Por favor, selecione um funcionário e informe o valor do bônus.');
            return;
        }
    
        const { error } = await supabase
            .from('bonus')
            .insert([{
                nome: selectedBonus.nome,
                descricao: `Bônus dado por ${selectedFuncionario}`,
                valor: bonusValor,
                id_funcionario: selectedFuncionario,
                id_cliente: clienteId,
                hora: new Date().toISOString() 
            }]);
    
        if (error) {
            alert('Erro ao registrar bônus: ' + error.message);
        } else {
            alert('Bônus registrado com sucesso!');
            setShowModal(false);
        }
    };
    

    const handleCreateBonus = async () => {
        if (!bonusNome || !bonusImagem || !bonusDescricao || !bonusMax || !bonusUnitValor) {
            alert('Por favor, preencha todos os campos para criar um bônus.');
            return;
        }
    
   
        const maxBonusNumber = parseFloat(bonusMax);
        console.log('maxBonusNumber:', maxBonusNumber);
    
        const { error } = await supabase
            .from('bonus')
            .insert([{
                nome: bonusNome,
                imagem: bonusImagem,
                descricao: bonusDescricao,
                max_bonus: maxBonusNumber, // Use o valor numérico
                valor: bonusUnitValor,
                empresa_id: empresa.id,
            }]);
    
        if (error) {
            alert('Erro ao criar bônus: ' + error.message);
        } else {
            alert('Bônus criado com sucesso!');
            setBonusNome('');
            setBonusImagem('');
            setBonusDescricao('');
            setBonusMax('');
            setBonusUnitValor('');
            // Atualize a lista de bônus se necessário
            const { data: bonusData, error: bonusError } = await supabase
                .from('bonus')
                .select('*')
                .eq('empresa_id', empresa.id);
            if (!bonusError) {
                setBonus(bonusData);
            }
        }
    };
    

    const handleBonusClick = async (bonus) => {
        setSelectedBonus(bonus); // Armazena o bônus selecionado
        fetchClientes(); // Busca os clientes da empresa
        setShowModal(true); // Mostra o modal
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="container">
            {empresa ? (
                <>
                    <h2>Bônus da Empresa:</h2>
                    <div className="bonus-list">
                        {bonus.length > 0 ? (
                            bonus.map(b => (
                                <div 
                                    key={b.id} 
                                    className="bonus-card" 
                                    onClick={() => handleBonusClick(b)} // Passa o bônus completo
                                >
                                    <img src={b.imagem} alt={b.nome} />
                                    <h3>{b.nome}</h3>
                                    <p>{b.descricao}</p>
                                    <p>Valor: {b.valor}</p>
                                </div>
                            ))
                        ) : (
                            <p>Nenhum bônus encontrado.</p>
                        )}
                    </div>

                    {/* Modal para bonificação */}
                    {showModal && selectedBonus && (
                        <div className="modal">
                            <h2>Bonificar Cliente com {selectedBonus.nome}</h2>

                            <label>Funcionário que deu o bônus:</label>
                            <select value={selectedFuncionario} onChange={(e) => setSelectedFuncionario(e.target.value)}>
                                <option value="">Selecione um funcionário</option>
                                {funcionarios.map(funcionario => (
                                    <option key={funcionario.id} value={funcionario.id}>
                                        {funcionario.nome}
                                    </option>
                                ))}
                            </select>

                            <label>Valor do Bônus:</label>
                            <input 
                                type="number" 
                                value={bonusValor} 
                                onChange={(e) => setBonusValor(e.target.value)} 
                                required 
                            />

                            <h3>Clientes Disponíveis para Bonificação:</h3>
                            <ul>
                                {clientes.length > 0 ? (
                                    clientes.map(cliente => (
                                        <li key={cliente.id}>
                                            {cliente.nome}
                                            <button onClick={() => handleBonificarCliente(cliente.id)}>Bonificar</button>
                                        </li>
                                    ))
                                ) : (
                                    <p>Nenhum cliente disponível.</p>
                                )}
                            </ul>

                            <button onClick={() => setShowModal(false)}>Fechar</button>
                        </div>
                    )}

                    {/* Área para criar novo bônus */}
                    <h2>Criar Novo Bônus</h2>
                    <div className="create-bonus-form">
                        <label>Nome do Bônus:</label>
                        <input 
                            type="text" 
                            value={bonusNome} 
                            onChange={(e) => setBonusNome(e.target.value)} 
                            required 
                        />

                        <label>Imagem do Bônus (URL):</label>
                        <input 
                            type="text" 
                            value={bonusImagem} 
                            onChange={(e) => setBonusImagem(e.target.value)} 
                            required 
                        />

                        <label>Descrição:</label>
                        <input 
                            type="text" 
                            value={bonusDescricao} 
                            onChange={(e) => setBonusDescricao(e.target.value)} 
                            required 
                        />

                        <label>Máximo de Bônus que o cliente pode acumular:</label>
                        <input 
                            type="number" 
                            value={bonusMax} 
                            onChange={(e) => setBonusMax(e.target.value)} 
                            required 
                        />

                        <label>Valor do Bônus:</label>
                        <input 
                            type="number" 
                            value={bonusUnitValor} 
                            onChange={(e) => setBonusUnitValor(e.target.value)} 
                            required 
                        />

                        <button onClick={handleCreateBonus}>Criar Bônus</button>
                    </div>
                </>
            ) : (
                <p>Nenhuma empresa logada.</p>
            )}
        </div>
    );
}

export default Teste;
