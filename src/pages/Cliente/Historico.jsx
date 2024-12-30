import React, { useEffect, useState } from 'react';
import { supabase } from "../../Supabase/createClient.js";
import './Historico.css';  // Certifique-se de importar o estilo correto
import { Link } from 'react-router-dom';
function Historico() {
    const [userId, setUserId] = useState(null);
    const [produtosResgatados, setProdutosResgatados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            fetchUserData(storedToken);
        } else {
            setError("Token não encontrado. Por favor, faça login novamente.");
        }
    }, []);

    // Função para buscar dados do usuário
    const fetchUserData = async (token) => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('id')  // Seleciona o ID do usuário
                .eq('email', token)  // Considera o token como email
                .single();

            if (error) {
                console.error('Erro ao buscar dados do usuário:', error.message);
                setError('Usuário não encontrado.');
            } else {
                setUserId(data?.id);  // Define o ID do usuário no estado
                fetchProdutosResgatados(data?.id);  // Busca os produtos resgatados do usuário
            }
        } catch (error) {
            console.error('Erro inesperado ao buscar dados do usuário:', error);
            setError('Erro ao buscar usuário.');
        } finally {
            setLoading(false);
        }
    };

    // Função para buscar os produtos resgatados do usuário
    const fetchProdutosResgatados = async (usuarioId) => {
        try {
            const { data, error } = await supabase
                .from('produtos_resgatados')
                .select('*')  // Seleciona todos os dados da tabela
                .eq('usuario_id', usuarioId);  // Filtro para o usuario_id

            if (error) {
                console.error('Erro ao buscar produtos resgatados:', error.message);
                setError('Erro ao buscar produtos resgatados.');
            } else {
                console.log("Produtos resgatados:", data); // Verifique o retorno dos dados
                setProdutosResgatados(data);  // Define os produtos resgatados no estado
            }
        } catch (error) {
            console.error('Erro inesperado ao buscar produtos resgatados:', error);
            setError('Erro ao buscar produtos resgatados.');
        }
    };

    return (
        <>
            <div className="historico-container">
            <Link to='/logado'>
                    <button id='return'>Voltar</button>
                </Link>
                {error && <div className="error-message"><strong>{error}</strong></div>}

                <h1 className="historico-title">Histórico de Compras!</h1>

                {loading ? (
                    <div className="loading">Carregando...</div>
                ) : (
                    <>
                   

                        {/* Exibindo os produtos resgatados em uma tabela */}
                        <h2 className="produtos-title">Produtos Resgatados</h2>
                        {produtosResgatados.length > 0 ? (
                            <table className="produtos-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Data de Resgate</th>
                                        <th>Quantidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtosResgatados.map((produto) => (
                                        <tr key={produto.id}>
                                            <td>{produto.produto_nome}</td> {/* Nome do produto */}
                                            <td>{produto.data ? new Date(produto.data).toLocaleDateString() : 'Data não disponível'}</td> {/* Data de resgate */}
                                            <td>{produto.quantidade}</td> {/* Quantidade resgatada */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div>Nenhum produto resgatado encontrado.</div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default Historico;
