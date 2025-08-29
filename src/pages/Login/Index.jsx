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
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/logado');
        }
    }, [navigate]);

    const toggleModal = () => setShowModal(!showModal);

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

    const handleLogin = async (values) => {
        const { email, password } = values;

        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .limit(1);

        if (error) {
            message.error('Erro ao fazer login: ' + error.message);
            return;
        }

        if (data.length === 0) {
            message.error('Email ou senha inválidos.');
        } else {
            message.success('Login realizado com sucesso!');
            const usuarioLogado = data[0];
            
            // Salva token e marca cliente logado
            localStorage.setItem('token', usuarioLogado.email);
            localStorage.setItem('clienteLogado', 'true');

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
                        <Button type="primary" htmlType="submit">Login</Button>
                        <a id="semconta" href="#" onClick={toggleModal}>Cadastrar</a>
                    </div>
                </Form>
            </div>

            <Modal
                title="Cadastre-se"
                open={showModal}
                onCancel={toggleModal}
                footer={null}
                centered
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item name="nome" label="Nome Completo" rules={[{ required: true }]}>
                        <Input placeholder="Nome Completo" />
                    </Form.Item>

                    <Form.Item name="telefone" label="Telefone" rules={[{ required: true }]}>
                        <InputMask mask="(99) 99999-9999">
                            {(inputProps) => <Input {...inputProps} placeholder="Número de Telefone" />}
                        </InputMask>
                    </Form.Item>

                    <Form.Item name="cpf" label="CPF" rules={[{ required: true }]}>
                        <InputMask mask="999.999.999-99">
                            {(inputProps) => <Input {...inputProps} placeholder="CPF" />}
                        </InputMask>
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                        <Input placeholder="Email" type="email" />
                    </Form.Item>

                    <Form.Item name="password" label="Senha" rules={[{ required: true }]}>
                        <Input.Password placeholder="Senha" />
                    </Form.Item>

                    <Form.Item name="genero" label="Gênero" rules={[{ required: true }]}>
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
            </Modal>
        </div>
    );
}

export default Login;
