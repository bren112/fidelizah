import React, { useEffect, useState } from 'react';
import { Input, Button, Form, message, Modal } from 'antd';
import InputMask from 'react-input-mask'; // Importando o InputMask
import { supabase } from "../../Supabase/createClient.js";
import { Link, useNavigate } from 'react-router-dom';
import img from './presente.png';
import './Funcoes/Criar.css';

function LoginCadastroEmpresa() {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/empresalogada'); 
        }
    }, [navigate]);

    const handleLogin = async (values) => {
        const { email, senha } = values;

        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('email', email)
            .eq('senha', senha)
            .single();

        if (error || !data) {
            message.error('Erro ao fazer login: ' + (error ? error.message : 'Dados inválidos.'));
        } else {
            message.success('Login realizado com sucesso!');
            localStorage.setItem('token', data.email); // Salva o email da empresa no localStorage
            navigate('/empresalogada'); // Redireciona para /empresalogada
        }
    };

    const handleSubmit = async (values) => {
        const { nome, descricao, imagem, email, senha, whats } = values;

        const { data, error } = await supabase
            .from('empresas')
            .insert([{ nome, descricao, imagem, email, senha, whats }]);

        if (error) {
            message.error('Erro ao cadastrar empresa: ' + error.message);
        } else {
            message.success('Empresa cadastrada com sucesso!');
            form.resetFields();
            setIsModalVisible(false);
        }
    };

    return (
        <div className="container">
            <div className='esq'>
                <h1 id='title_adm'>Bonifique com Fidelizah!</h1>
                <br />
                <img src={img} id='imgHome' alt="" srcset="" />
            </div>

            <div className='direita'>
                <h1>Realize seu Login!</h1>
                <br />
                <Form onFinish={handleLogin}>
                    <Form.Item name="email" rules={[{ required: true, message: 'Por favor, insira o e-mail da empresa' }, { type: 'email', message: 'O e-mail não é válido!' }]}>
                        <Input placeholder="E-mail" />
                    </Form.Item>
                    <Form.Item name="senha" rules={[{ required: true, message: 'Por favor, insira a senha' }]}>
                        <Input.Password placeholder="Senha" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Login</Button>
                    <Button type="link" onClick={() => setIsModalVisible(true)}>Cadastrar Minha Empresa</Button>
                </Form>

                <Modal
                    title="Cadastrar Empresa"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Form form={form} onFinish={handleSubmit}>
                        <Form.Item name="nome" rules={[{ required: true, message: 'Por favor, insira o nome da empresa' }]}>
                            <Input placeholder="Nome da Empresa" />
                        </Form.Item>
                        <Form.Item name="descricao" rules={[{ required: true, message: 'Por favor, insira a descrição do Bônus' }]}>
                            <Input.TextArea placeholder="Descrição do Bônus" />
                        </Form.Item>
                        <Form.Item name="imagem" rules={[{ required: true, message: 'Por favor, insira a URL da imagem da empresa' }]}>
                            <Input placeholder="URL da Imagem" />
                        </Form.Item>
                        <Form.Item name="email" rules={[{ required: true, message: 'Por favor, insira o e-mail da empresa' }, { type: 'email', message: 'O e-mail não é válido!' }]}>
                            <Input placeholder="E-mail" />
                        </Form.Item>
                        <Form.Item name="senha" className='senha' rules={[{ required: true, message: 'Por favor, insira a senha' }]}>
                            <Input.Password placeholder="Senha" />
                        </Form.Item>
                        <Form.Item name="whats" rules={[{ required: true, message: 'Por favor, insira o WhatsApp da empresa' }]}>
                            <InputMask mask="(99) 99999-9999" placeholder="WhatsApp" >
                                {(inputProps) => <Input {...inputProps} />}
                            </InputMask>
                        </Form.Item>
                        <Button type="primary" htmlType="submit">Cadastrar Empresa</Button>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}

export default LoginCadastroEmpresa;
