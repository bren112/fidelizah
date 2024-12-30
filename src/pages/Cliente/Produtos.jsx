import React, { useEffect, useState, useRef } from 'react';
import { supabase } from "../../Supabase/createClient.js";
import './Produtos.css';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Importando a biblioteca
import 'react-toastify/dist/ReactToastify.css'; // Importando o estilo do toast

function Produtos() {
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [bonusCount, setBonusCount] = useState(0);
    const [userName, setUserName] = useState(null);
    const [userCPF, setUserCPF] = useState(null);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Referência para o modal
    const modalRef = useRef(null);

    useEffect(() => {
        const storedEmpresa = localStorage.getItem('selectedEmpresa');
        if (storedEmpresa) {
            setEmpresaSelecionada(JSON.parse(storedEmpresa));
        }

        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            fetchUserData(storedToken);
        } else {
            setError("Token não encontrado. Por favor, faça login novamente.");
        }
    }, []);

    useEffect(() => {
        if (empresaSelecionada) {
            fetchProdutos();
        }
    }, [empresaSelecionada]);

    useEffect(() => {
        if (userCPF) {
            fetchBonusCount(userCPF);
        }
    }, [userCPF]);

    // Fechar o modal ao clicar fora dele
    useEffect(() => {
        if (modalOpen) {
            const handleClickOutside = (event) => {
                if (modalRef.current && !modalRef.current.contains(event.target)) {
                    handleCloseModal();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [modalOpen]);

    const fetchProdutos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('produtos')
                .select('*')
                .eq('empresa_id', empresaSelecionada.id);

            if (error) {
                console.error('Erro ao buscar produtos:', error.message);
            } else {
                setProdutos(data);
            }
        } catch (error) {
            console.error('Erro inesperado ao buscar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async (token) => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('nome, cpf')
                .eq('email', token)
                .single();

            if (error) {
                console.error('Erro ao buscar dados do usuário:', error.message);
                setError('Usuário não encontrado.');
            } else {
                setUserName(data?.nome);
                setUserCPF(data?.cpf);
            }
        } catch (error) {
            console.error('Erro inesperado ao buscar dados do usuário:', error);
            setError('Erro ao buscar usuário.');
        }
    };

    const fetchBonusCount = async (cpf) => {
        try {
            const { data, error } = await supabase
                .from('clientes')
                .select('bonus_count')
                .eq('cpf', cpf)
                .single();

            if (error) {
                console.error('Erro ao buscar número de bônus:', error.message);
                setError('Erro ao buscar bônus.');
            } else {
                setBonusCount(data?.bonus_count || 0);
            }
        } catch (error) {
            console.error('Erro inesperado ao buscar número de bônus:', error);
            setError('Erro ao buscar bônus.');
        }
    };

    const handleOpenModal = (produto) => {
        setSelectedProduct(produto);
        setQuantity(1);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
    };

    const handleIncrement = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };

    const handleResgatar = async () => {
        if (!selectedProduct) return;

        const totalPrice = selectedProduct.preco * quantity;

        if (bonusCount < totalPrice) {
            toast.error('Você não tem bônus suficientes para resgatar este produto.');
            handleCloseModal();
            return;
        }

        try {
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('id')
                .eq('cpf', userCPF)
                .single();

            if (userError || !userData) {
                console.error('Erro ao obter o ID do usuário:', userError?.message || 'Usuário não encontrado.');
                toast.error('Erro ao obter informações do usuário. Tente novamente.');
                handleCloseModal();
                return;
            }

            const userId = userData.id;

            const { error: insertError } = await supabase
                .from('produtos_resgatados')
                .insert([{
                    produto_nome: selectedProduct.nome,
                    usuario_id: userId,
                    empresa_id: empresaSelecionada.id,
                    quantidade: quantity,
                    data: new Date().toISOString().split('T')[0],
                    hora: new Date().toISOString().split('T')[1].split('.')[0],
                }]);

            if (insertError) {
                console.error('Erro ao registrar o resgate:', insertError.message);
                toast.error('Erro ao registrar o resgate. Tente novamente.');
                handleCloseModal();
                return;
            }

            const { error: updateError } = await supabase
                .from('clientes')
                .update({ bonus_count: bonusCount - totalPrice })
                .eq('cpf', userCPF);

            if (updateError) {
                console.error('Erro ao atualizar número de bônus:', updateError.message);
                toast.error('Erro ao atualizar o número de bônus. Tente novamente.');
                handleCloseModal();
                return;
            }

            setBonusCount(bonusCount - totalPrice);
            toast.success(`Produto ${selectedProduct.nome} resgatado com sucesso!`);
        } catch (error) {
            console.error('Erro inesperado ao resgatar o produto:', error);
            toast.error('Erro ao resgatar o produto. Tente novamente.');
        } finally {
            handleCloseModal();
        }
    };

    return (
        <>
            <div className="back">
                <Link to='/logado'>
                    <button id='return'>Voltar</button>
                </Link>
            </div>

            <div className='produtos_container'>
                {error && <alert><strong>{error}</strong></alert>}

                {userName && !error && (
                    <div className="header_produtos">
                        <h1 id='userLogado'>{userName}</h1>
                        <div className="bonusTd">
                            <svg id='svgCoin' xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
  <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
</svg><p id='coin'>{bonusCount}</p>
                        </div>
                    </div>
                )}

                {loading ? <p>Carregando produtos...</p> : (
                    <div className="produtos_list">
                        {produtos.map(produto => (
                            <div key={produto.id} className="produto_card">
                                           <div className="bonusTd" id='mbn'>

<svg id='svgCoin' xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
<path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
<path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
</svg>
<p id='coin'>{produto.preco}</p>
</div>
                                <img src={produto.imagem} alt={produto.nome} className="produto_imagem" />
                                <h3>{produto.nome}</h3>
             
                                <button onClick={() => handleOpenModal(produto)}>Resgatar</button>
                              
                            </div>
                        ))}
                        
                    </div>
                )}
            </div>

            {modalOpen && selectedProduct && (
                <div className="modal" ref={modalRef}>
                    <div className="modal_content">
                    <button id='cancelar' onClick={handleCloseModal}>X</button>
                    <div className="centroModal">
                    <h3 id='nomeModal'>{selectedProduct.nome}</h3>
                        <img src={selectedProduct.imagem} alt={selectedProduct.nome} className="produto_modal_imagem" />
                        <p id='desc'>{selectedProduct.descricao}</p>
                        
                        {/* <p>Preço unitário: {selectedProduct.preco} bônus</p> */}
                        <div className="quantity_control">
                            <button onClick={handleDecrement}>-</button>
                            <input type="text" value={quantity} readOnly className="quantity_input" />
                            <button onClick={handleIncrement}>+</button>
                        </div>
                        <br/>
                        <p id='total'>Total:ㅤ{selectedProduct.preco * quantity}<svg id='svgCoin' xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
<path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
<path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
</svg> </p>

                        <button onClick={handleResgatar}>Confirmar</button>
                        </div>
                        
                    </div>
                </div>
            )}

            {/* Adicionando o ToastContainer */}
            <ToastContainer />
        </>
    );
}

export default Produtos;
