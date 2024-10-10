import React, { useState } from 'react';
import { Input, Button, Modal, Form, message } from 'antd';
import InputMask from 'react-input-mask';
import img from './imgLogin.png';
import './Login.css';
import { supabase } from "../../Supabase/createClient.js"

function Login() {
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm();

    const toggleModal = () => {
        setShowModal(!showModal);
    };

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
            .limit(1); // Limita a 1 resultado

        if (error) {
            message.error('Erro ao fazer login: ' + error.message);
            return;
        }

        if (data.length === 0) {
            message.error('Email ou senha inválidos.');
        } else {
            message.success('Login realizado com sucesso!');
            console.log('Usuário logado:', data[0]);
         
        }
    };

    return (
        <div className="container">
            <div className="esq">
                <img src={img} id="img" alt="" />
            </div>
            <div className="dir">
                <h1 id="title">Faça seu Login!</h1>
                <br />
                <Form onFinish={handleLogin}>
                    <Form.Item name="email" rules={[{ required: true, message: 'Por favor, insira seu email' }]}>
                        <Input placeholder="Email" className="ant-input" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Por favor, insira sua senha' }]}>
                        <Input.Password placeholder="Senha" className="ant-input" />
                    </Form.Item>
                    <div className="acoes">
                        <Button type="primary" id="buttonLogin" htmlType="submit">Login</Button>
                        <a id="semconta" href="#" onClick={toggleModal}>Cadastrar</a>
                    </div>
                </Form>
            </div>

            <Modal
                title="Cadastre-se"
                visible={showModal}
                onCancel={toggleModal}
                footer={null}
                centered
            >
                <div className="modal-content">
                    <Form form={form} onFinish={handleSubmit}>
                        <Form.Item name="nome" rules={[{ required: true, message: 'Por favor, insira seu nome' }]}>
                            <Input placeholder="Nome Completo" className="ant-input" />
                        </Form.Item>
                        <Form.Item name="telefone" rules={[{ required: true, message: 'Por favor, insira seu telefone' }]}>
                            <InputMask
                                mask="(99) 99999-9999"
                                className="ant-input"
                                placeholder="Número de Telefone"
                            />
                        </Form.Item>
                        <Form.Item name="cpf" rules={[{ required: true, message: 'Por favor, insira seu CPF' }]}>
                            <InputMask
                                mask="999.999.999-99"
                                className="ant-input"
                                placeholder="CPF"
                            />
                        </Form.Item>
                        <Form.Item name="email" rules={[{ required: true, message: 'Por favor, insira seu email' }]}>
                            <Input placeholder="Email" className="ant-input" />
                        </Form.Item>
                        <Form.Item name="password" rules={[{ required: true, message: 'Por favor, insira sua senha' }]}>
                            <Input.Password placeholder="Senha" className="ant-input" />
                        </Form.Item>
                        <Form.Item name="genero" rules={[{ required: true, message: 'Por favor, selecione seu gênero' }]}>
                            <select className="ant-input">
                                <option value="">Selecione</option>
                                <option value="homem">Homem</option>
                                <option value="mulher">Mulher</option>
                                <option value="nenhum dos dois">Nenhum dos dois</option>
                            </select>
                        </Form.Item>
                        <div className="acoes">
                            <Button type="primary" htmlType="submit">Cadastrar</Button>
                            <Button type="default" onClick={toggleModal}>Fechar</Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
}

export default Login;
