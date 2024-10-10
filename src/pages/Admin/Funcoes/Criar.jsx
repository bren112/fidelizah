import React, { useEffect, useState } from 'react';
import { Input, Button, Form, message } from 'antd';
import InputMask from 'react-input-mask'; // Importe o InputMask
import { supabase } from "../../../Supabase/createClient.js";
import { useNavigate } from 'react-router-dom';
import './Criar.css';

function Criar() {
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();

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

    const handleSubmit = async (values) => {
        const { nome, telefone, cpf, genero } = values;

        // Verifica se o CPF já está cadastrado para a empresa atual
        const { data: existingClients, error: fetchError } = await supabase
            .from('clientes')
            .select('*')
            .eq('cpf', cpf)
            .eq('empresa_id', empresa.id);

        if (fetchError) {
            message.error('Erro ao verificar CPF: ' + fetchError.message);
            return;
        }

        // Se já existir um cliente com esse CPF na empresa atual, não permite o cadastro
        if (existingClients.length > 0) {
            message.error('Este CPF já está cadastrado para esta empresa.');
            return;
        }

        // Insere o cliente no banco de dados
        const { data, error } = await supabase
            .from('clientes')
            .insert([{ nome, telefone, cpf, genero, empresa_id: empresa.id }]);

        if (error) {
            message.error('Erro ao criar cliente: ' + error.message);
        } else {
            message.success('Cliente criado com sucesso!');
            form.resetFields(); // Zera todos os inputs após a criação
        }
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="criar-container">
            <h1>Criar Cliente</h1>
            {empresa && (
                <>
                    <h2>Empresa: {empresa.nome}</h2>
                    <img src={empresa.imagem} alt={empresa.nome} className="empresa-imagem" />
                </>
            )}

            <Form form={form} onFinish={handleSubmit} className="criar-form">
                <Form.Item
                    name="nome"
                    rules={[{ required: true, message: 'Por favor, insira o nome do cliente' }]}>
                    <Input className="input-field" placeholder="Nome" />
                </Form.Item>
                <Form.Item
                    name="telefone"
                    rules={[{ required: true, message: 'Por favor, insira o telefone' }]}>
                    <InputMask
                        mask="(99) 99999-9999" // Máscara para o telefone
                        className="input-field"
                        placeholder="Telefone"
                    />
                </Form.Item>
                <Form.Item
                    name="cpf"
                    rules={[{ required: true, message: 'Por favor, insira o CPF' }]}>
                    <InputMask
                        mask="999.999.999-99" // Máscara para o CPF
                        className="input-field"
                        placeholder="CPF"
                    />
                </Form.Item>
                <Form.Item
                    name="genero"
                    initialValue="Outro"
                    rules={[{ required: true, message: 'Por favor, selecione o gênero' }]}>
                    <Input className="input-field" placeholder="Gênero" />
                </Form.Item>
                <Button type="primary" htmlType="submit" className="submit-button">Criar Cliente</Button>
            </Form>
        </div>
    );
}

export default Criar;
