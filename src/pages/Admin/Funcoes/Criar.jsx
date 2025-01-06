import React, { useEffect, useState } from 'react';
import { Input, Button, Form, message, Select } from 'antd'; // Importe o Select
import InputMask from 'react-input-mask';
import { supabase } from "../../../Supabase/createClient.js";
import { useNavigate } from 'react-router-dom';
import './Criar.css';
import { Link } from 'react-router-dom';
const { Option } = Select; // Destructure para usar Option

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

        const { data: existingClients, error: fetchError } = await supabase
            .from('clientes')
            .select('*')
            .eq('cpf', cpf)
            .eq('empresa_id', empresa.id);

        if (fetchError) {
            message.error('Erro ao verificar CPF: ' + fetchError.message);
            return;
        }

        if (existingClients.length > 0) {
            message.error('Este CPF já está cadastrado para esta empresa.');
            return;
        }

        const { data, error } = await supabase
            .from('clientes')
            .insert([{ nome, telefone, cpf, genero, empresa_id: empresa.id }]);

        if (error) {
            message.error('Erro ao criar cliente: ' + error.message);
        } else {
            message.success('Cliente criado com sucesso!');
            form.resetFields();
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
              <br/>
            <Link to="/adm">
                <Button id='voltar'>Voltar</Button>
            </Link>
          <br/>
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
                        mask="(99) 99999-9999"
                        className="input-field"
                        placeholder="Telefone"
                    />
                </Form.Item>
                <Form.Item
                    name="cpf"
                    rules={[{ required: true, message: 'Por favor, insira o CPF' }]}>
                    <InputMask
                        mask="999.999.999-99"
                        className="input-field"
                        placeholder="CPF"
                    />
                </Form.Item>
                <Form.Item
                    name="genero"
                    rules={[{ required: true, message: 'Por favor, selecione o gênero' }]}>
                    <Select className="input-field" placeholder="Selecione o gênero">
                        <Option value="Masculino">Masculino</Option>
                        <Option value="Feminino">Feminino</Option>
                        <Option value="Outro">Outro</Option>
                    </Select>
                </Form.Item>
                <Button type="primary" htmlType="submit" className="submit-button">Criar Cliente</Button>
            </Form>
        </div></>
    );
}

export default Criar;
