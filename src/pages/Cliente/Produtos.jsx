import React, { useEffect, useState, useRef } from 'react';
import { supabase } from "../../Supabase/createClient.js";
import './Produtos.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { message, Modal, Button, Input } from 'antd';

import { Link } from 'react-router-dom';
function Produtos() {
    const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bonusCount, setBonusCount] = useState(0);
    const [userCPF, setUserCPF] = useState(null);
    const [userNome, setUserNome] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const modalRef = useRef(null);

    useEffect(() => {
        const storedEmpresa = localStorage.getItem('selectedEmpresa');
        if (storedEmpresa) setEmpresaSelecionada(JSON.parse(storedEmpresa));

        const token = localStorage.getItem('token');
        if (token) fetchUserData(token);
        else toast.error("Token não encontrado. Faça login.");
    }, []);

    useEffect(() => {
        if (empresaSelecionada) fetchProdutos();
    }, [empresaSelecionada]);

    useEffect(() => {
        if (userCPF && empresaSelecionada) fetchBonusCount(userCPF, empresaSelecionada.id);
    }, [userCPF, empresaSelecionada]);

    const fetchUserData = async (token) => {
        const { data, error } = await supabase
            .from('usuarios')
            .select('nome, cpf')
            .eq('email', token)
            .single();

        if (!error && data) {
            setUserCPF(data.cpf);
            setUserNome(data.nome);
        } else toast.error('Usuário não encontrado');
    };

    const fetchProdutos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('empresa_id', empresaSelecionada.id);

        if (!error && data) {
            const produtosComURL = data.map(prod => ({
                ...prod,
                imagemUrl: prod.imagem
                    ? supabase.storage.from('nome-do-bucket').getPublicUrl(prod.imagem).data.publicUrl
                    : null
            }));
            setProdutos(produtosComURL);
        }
        setLoading(false);
    };

    const fetchBonusCount = async (cpf, empresaId) => {
        const { data, error } = await supabase
            .from('clientes')
            .select('bonus_count')
            .eq('cpf', cpf)
            .eq('empresa_id', empresaId)
            .single();

        if (!error && data) setBonusCount(data?.bonus_count || 0);
    };

    // Modal
    const handleOpenModal = (produto) => { setSelectedProduct(produto); setQuantity(1); setModalOpen(true); };
    const handleCloseModal = () => { setModalOpen(false); setSelectedProduct(null); };
    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleResgatar = async () => {
        if (!selectedProduct) return;
        const totalPrice = selectedProduct.preco * quantity;

        if (bonusCount < totalPrice) {
            toast.error('Você não tem bônus suficientes.');
            handleCloseModal();
            return;
        }

        try {
            const empresaId = empresaSelecionada.id;

            const { data: empresaData, error: empresaError } = await supabase
                .from('empresas')
                .select('whats')
                .eq('id', empresaId)
                .single();

            if (empresaError || !empresaData) {
                toast.error('Erro ao obter informações da empresa.');
                handleCloseModal();
                return;
            }

            const whatsAppLink = `https://wa.me/${empresaData.whats}?text=Olá! Gostaria de resgatar o produto ${encodeURIComponent(selectedProduct.nome)} (${quantity}x) - Valor: ${totalPrice} bônus.`;

            const { error: updateError } = await supabase
                .from('clientes')
                .update({ bonus_count: bonusCount - totalPrice })
                .eq('cpf', userCPF)
                .eq('empresa_id', empresaId);

            if (updateError) {
                toast.error('Erro ao atualizar bônus.');
                handleCloseModal();
                return;
            }

            setBonusCount(bonusCount - totalPrice);
            toast.success(`Produto ${selectedProduct.nome} resgatado com sucesso!`);
            window.open(whatsAppLink, '_blank');

        } catch (error) {
            toast.error('Erro inesperado ao resgatar o produto.');
        } finally {
            handleCloseModal();
        }
    };

    useEffect(() => {
        if (modalOpen) {
            const handleClickOutside = (event) => {
                if (modalRef.current && !modalRef.current.contains(event.target)) handleCloseModal();
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [modalOpen]);

    return (<>
      <Link to="/logado">
                <Button id='voltar'>Voltar</Button>
            </Link>
            <br/>
            <br/>
        <div className="produtos-container">
           
            {/* Header */}
            <header className="produtos-header">
                <div className="empresa-info">
                    {empresaSelecionada?.imagem && (
                        <img 
                            src={empresaSelecionada.imagem} 
                            alt={empresaSelecionada.nome} 
                            className="empresa-img" 
                        />
                    )}
                    <span className="empresa-nome">{empresaSelecionada?.nome}</span>
                </div>
                <div className="user-info">
                    <span className="user-nome">{userNome}</span>
                    <span className="user-bonus"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
  <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
</svg> {bonusCount} bônus</span>
                </div>
            </header>
            <section>
    <h2 id='title' style={{ textAlign: 'center' }}>Produtos Disponíveis</h2>
    {loading && <p>Carregando produtos...</p>}

    <div className="produtos-grid">
        {produtos.map(prod => prod && (
            <div key={prod.id} className="produto-card" onClick={() => handleOpenModal(prod)}>
                <div className="produto-img-border">
                    <img src={prod.imagem_url} alt={prod.nome} className="produto-img" />
                </div>
                <h3>{prod.nome}</h3>
                <p>{prod.preco} bônus</p>
            </div>
        ))}
    </div>

    {modalOpen && selectedProduct && (
    <div className="modal-overlay">
    <div className="modal-content" ref={modalRef}>
        <button className="modal-close-x" onClick={handleCloseModal}>×</button>
        <h3>{selectedProduct.nome}</h3>
        <img src={selectedProduct.imagem_url} alt={selectedProduct.nome} className="modal-img" />
        <p>Preço: {selectedProduct.preco} bônus</p>
        <div className="modal-quantidade">
            <Button onClick={handleDecrement}>-</Button>
            <Input value={quantity} style={{ width: 50, textAlign: 'center' }} readOnly />
            <Button onClick={handleIncrement}>+</Button>
        </div>
        <Button className="modal-resgatar-btn" type="primary" onClick={handleResgatar}>Resgatar</Button>
    </div>
</div>

    )}

    <ToastContainer />
</section>

        </div>
        </>
    );
}

export default Produtos;
