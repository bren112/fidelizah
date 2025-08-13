import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, message } from 'antd';
import InputMask from 'react-input-mask';
import { useNavigate } from 'react-router-dom';
import img from './imgLogin.png';
import './Login.css';
import { supabase } from "../../Supabase/createClient.js";


function Login() {
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate(); // Usando o useNavigate para redirecionamento

    useEffect(() => {
        // Verifica se o token está presente no localStorage
        const token = localStorage.getItem('token');
        if (token) {
            // Se o token existir, redireciona para a página /logado
            navigate('/logado');
        }
    }, [navigate]); // Este efeito será executado quando o componente for montado

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    // Função para cadastrar novo usuário
    const handleSubmit = async (values) => {
        const { nome, telefone, cpf, email, password, genero } = values;

        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ nome, telefone, cpf, email, password, genero }]);

        if (error) {
            message.error('Erro ao cadastrar usuário: ' + error.message);
        } else {
            message.success('Usuário cadastrado com sucesso!');
            form.resetFields();
            toggleModal();
        }
    };

    // Função de login
    const handleLogin = async (values) => {
        const { email, password } = values;

        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .limit(1); // Limita a 1 resultado

        if (error) {
            message.error('Erro ao fazer login: ' + error.message);
            return;
        }

        if (data.length === 0) {
            message.error('Email ou senha inválidos.');
        } else {
            message.success('Login realizado com sucesso!');
            const usuarioLogado = data[0];
            
            // Salvando o email do usuário no localStorage como token
            localStorage.setItem('token', usuarioLogado.email);
        
            // Marcando cliente como logado
            localStorage.setItem('clienteLogado', 'true');
        
            // Redirecionando para a página /logado após o login
            navigate('/logado');
        }
    };

    return (
        <div className="container">
            <div className="esq">
                <img src={img} id="img" alt="Login" />
            </div>
            <div className="dir">
                <h1 id="title">Faça seu Login!</h1>
                <br />
                <Form onFinish={handleLogin} layout="vertical">
            <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Por favor, insira seu email' }]}
            >
                <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
                name="password"
                label="Senha"
                rules={[{ required: true, message: 'Por favor, insira sua senha' }]}
            >
                <Input.Password placeholder="Senha" />
            </Form.Item>

            <div className="acoes" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button type="primary" id="buttonLogin" htmlType="submit">Login</Button>
                <a id="semconta" href="#" onClick={toggleModal}>Cadastrar</a>
            </div>
        </Form>

            </div>

            {/* Modal para cadastro de usuário */}
            <Modal
    title="Cadastre-se"
    open={showModal} // AntD v5 usa "open" no lugar de "visible"
    onCancel={toggleModal}
    footer={null}
    centered
>
    <div className="modal-content">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                name="nome"
                label="Nome Completo"
                rules={[{ required: true, message: 'Por favor, insira seu nome' }]}
            >
                <Input placeholder="Nome Completo" />
            </Form.Item>

            <Form.Item
                name="telefone"
                label="Telefone"
                rules={[{ required: true, message: 'Por favor, insira seu telefone' }]}
            >
                <InputMask mask="(99) 99999-9999">
                    {(inputProps) => <Input {...inputProps} placeholder="Número de Telefone" />}
                </InputMask>
            </Form.Item>

            <Form.Item
                name="cpf"
                label="CPF"
                rules={[{ required: true, message: 'Por favor, insira seu CPF' }]}
            >
                <InputMask mask="999.999.999-99">
                    {(inputProps) => <Input {...inputProps} placeholder="CPF" />}
                </InputMask>
            </Form.Item>

            <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Por favor, insira seu email' }]}
            >
                <Input placeholder="Email" type="email" />
            </Form.Item>

            <Form.Item
                name="password"
                label="Senha"
                rules={[{ required: true, message: 'Por favor, insira sua senha' }]}
            >
                <Input.Password placeholder="Senha" />
            </Form.Item>

            <Form.Item
                name="genero"
                label="Gênero"
                rules={[{ required: true, message: 'Por favor, selecione seu gênero' }]}
            >
                <Select placeholder="Selecione">
                    <Select.Option value="homem">Homem</Select.Option>
                    <Select.Option value="mulher">Mulher</Select.Option>
                    <Select.Option value="nenhum dos dois">Nenhum dos dois</Select.Option>
                </Select>
            </Form.Item>

            <div className="acoes" style={{ display: 'flex', gap: '8px' }}>
                <Button type="primary" htmlType="submit">Cadastrar</Button>
                <Button onClick={toggleModal}>Fechar</Button>
            </div>
        </Form>
    </div>
</Modal>

        </div>
    );
}

export default Login;
