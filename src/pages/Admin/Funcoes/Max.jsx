import React, { useEffect, useState } from 'react';
import { supabase } from '../../../Supabase/createClient.js'; // Ajuste o caminho para seu arquivo Supabase
import { useNavigate } from 'react-router-dom'; // Para navegação
import './Max.css'; // Importa o arquivo CSS

function Max() {
    const [maxBonus, setMaxBonus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMaxBonus, setNewMaxBonus] = useState(''); // Estado para o novo valor de max_bonus
    const navigate = useNavigate(); // Hook para navegação

    useEffect(() => {
        const fetchMaxBonus = async () => {
            const token = localStorage.getItem('token'); // Pegando o token do localStorage (pode ser o e-mail)

            if (!token) {
                setError('Nenhuma empresa logada.');
                setLoading(false);
                return;
            }

            // Buscando a empresa logada e o max_bonus
            const { data, error } = await supabase
                .from('empresas')
                .select('max_bonus')
                .eq('email', token) // Ou outro campo correspondente ao token
                .single(); // Para buscar uma única empresa

            if (error) {
                setError('Erro ao buscar dados da empresa: ' + error.message);
            } else {
                setMaxBonus(data.max_bonus);
            }
            setLoading(false);
        };

        fetchMaxBonus();
    }, []);

    // Função para atualizar o max_bonus no banco de dados
    const updateMaxBonus = async () => {
        const token = localStorage.getItem('token'); // Pegando o token do localStorage

        if (!token) {
            setError('Nenhuma empresa logada.');
            return;
        }

        if (newMaxBonus < 0) {
            setError('O valor não pode ser negativo.');
            return;
        }

        const { data, error } = await supabase
            .from('empresas')
            .update({ max_bonus: newMaxBonus }) // Atualizando o max_bonus
            .eq('email', token); // Usando o token como referência para a empresa

        if (error) {
            setError('Erro ao atualizar max_bonus: ' + error.message);
        } else {
            setMaxBonus(newMaxBonus); // Atualiza o estado com o novo valor
            setNewMaxBonus(''); // Limpa o campo de input após atualização
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Impedir valores negativos
        if (value >= 0) {
            setNewMaxBonus(value);
        }
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <br />
            <button id='voltar' onClick={() => navigate('/adm')}>Voltar</button>

            <div className="max-container">
                <h1>Max de Bônus p/ Ganhar!</h1>
                <p><strong>Máximo de Bônus Atual:</strong> {maxBonus}</p>

                {/* Input para alterar o max_bonus */}
                <input
                    type="number"
                    value={newMaxBonus}
                    onChange={handleInputChange} // Validação de valor negativo
                    placeholder="Novo valor de max_bonus"
                    className="max-input"
                />
                <button onClick={updateMaxBonus} className="max-button">Alterar Max de Bônus</button>
            </div>
        </>
    );
}

export default Max;
