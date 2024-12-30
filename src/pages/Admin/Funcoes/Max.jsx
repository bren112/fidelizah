import React, { useEffect, useState } from 'react';
import { supabase } from '../../../Supabase/createClient.js';
import { useNavigate } from 'react-router-dom';

function CriarProduto() {
    const [empresaLogada, setEmpresaLogada] = useState(null); // Dados da empresa logada
    const [produto, setProduto] = useState({
        nome: '',
        descricao: '',
        preco: '',
        imagem: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmpresaLogada = async () => {
            const token = localStorage.getItem('token'); // Token da empresa logada

            if (!token) {
                setError('Nenhuma empresa logada.');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('empresas')
                .select('*')
                .eq('email', token)
                .single();

            if (error) {
                setError('Erro ao buscar dados da empresa: ' + error.message);
            } else {
                setEmpresaLogada(data);
            }

            setLoading(false);
        };

        fetchEmpresaLogada();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduto((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!empresaLogada) {
            setError('Nenhuma empresa logada.');
            return;
        }

        const { data, error } = await supabase
            .from('produtos')
            .insert({
                nome: produto.nome,
                descricao: produto.descricao,
                preco: produto.preco,
                imagem: produto.imagem,
                empresa_id: empresaLogada.id // ID da empresa logada
            });

        if (error) {
            setError('Erro ao cadastrar o produto: ' + error.message);
        } else {
            alert('Produto cadastrado com sucesso!');
            setProduto({ nome: '', descricao: '', preco: '', imagem: '' });
        }
    };

    if (loading) {
        return <p style={styles.loading}>Carregando...</p>;
    }

    if (error) {
        return <p style={styles.error}>{error}</p>;
    }

    return (
        <div style={styles.container}>
            <button style={styles.backButton} onClick={() => navigate('/adm')}>
                Voltar
            </button>
            <h1 style={styles.title}>Cadastrar Produto</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>
                    Nome do Produto:
                    <input
                        type="text"
                        name="nome"
                        value={produto.nome}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    Descrição:
                    <textarea
                        name="descricao"
                        value={produto.descricao}
                        onChange={handleChange}
                        style={{ ...styles.input, height: '100px' }}
                    />
                </label>
                <label style={styles.label}>
                    Preço:
                    <input
                        type="number"
                        name="preco"
                        value={produto.preco}
                        onChange={handleChange}
                        step="0.01"
                        required
                        style={styles.input}
                    />
                </label>
                <label style={styles.label}>
                    URL da Imagem:
                    <input
                        type="text"
                        name="imagem"
                        value={produto.imagem}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </label>
                <button type="submit" style={styles.submitButton}>
                    Cadastrar Produto
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "'Poppins', sans-serif",
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    backButton: {
        fontFamily: "'MuseoModerno', cursive",
        color: '#878787',
        backgroundColor: '#f9f9f9',

        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '4px',
        marginBottom: '20px',
    },
    title: {
        fontFamily: "'MuseoModerno', cursive",
        fontSize: '24px',
        color: '#333',
        textAlign: 'center',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    label: {
        fontSize: '16px',
        color: '#333',
        marginBottom: '5px',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    submitButton: {
        fontFamily: "'MuseoModerno', cursive",
        backgroundColor: 'var(--rosa)',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '4px',
        alignSelf: 'center',
    },
    loading: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: '18px',
        color: '#555',
        textAlign: 'center',
    },
    error: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: '18px',
        color: 'red',
        textAlign: 'center',
    },
};

export default CriarProduto;
