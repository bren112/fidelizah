import React, { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Input, Form } from 'antd';
import { supabase } from '../../../Supabase/createClient';
// import './Gprodutos.css';
import { Link } from 'react-router-dom';
import '.././Adm.css';
function Gprodutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState(null);
  const [editingProduto, setEditingProduto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const email = localStorage.getItem('token');
        if (!email) {
          message.error('Você não está logado.');
          return;
        }

        // Busca o ID da empresa logada
        const { data: empresaData, error: empresaError } = await supabase
          .from('empresas')
          .select('id')
          .eq('email', email)
          .single();

        if (empresaError) {
          throw empresaError;
        }

        setEmpresaId(empresaData.id);

        // Busca os produtos da empresa logada
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('empresa_id', empresaData.id);

        if (error) {
          throw error;
        }

        setProdutos(data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error.message);
        message.error('Erro ao carregar os produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setProdutos((prevProdutos) => prevProdutos.filter((produto) => produto.id !== id));
      message.success('Produto excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir produto:', error.message);
      message.error('Erro ao excluir o produto.');
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditingProduto(null);
  };

  const handleModalOk = async (values) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update(values)
        .eq('id', editingProduto.id);

      if (error) {
        throw error;
      }

      setProdutos((prevProdutos) =>
        prevProdutos.map((produto) =>
          produto.id === editingProduto.id ? { ...produto, ...values } : produto
        )
      );

      message.success('Produto atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error.message);
      message.error('Erro ao atualizar o produto.');
    } finally {
      handleModalCancel();
    }
  };

  const columns = [
    {
      title: 'Imagem',
      dataIndex: 'imagem_url',
      key: 'imagem_url',
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="Produto"
            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
          />
        ) : (
          'Sem imagem'
        ),
    },
    {
      title: 'Nome do Produto',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao',
    },
    {
      title: 'Preço',
      dataIndex: 'preco',
      key: 'preco',
      render: (text) => `R$ ${Number(text).toFixed(2)}`,
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];
  

  return (
    <>
    <br/>
 <Link to="/adm">
        <Button id="voltar">Voltar</Button>
      </Link>
    <br/>
      <h2 id='title_gerenciar'>Gerenciar Produtos</h2>
    <br/>
<div className="margin">
      <Table
        dataSource={produtos}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 9}}
      />
</div>
      <Modal
        title="Editar Produto"
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          initialValues={editingProduto}
          onFinish={handleModalOk}
          layout="vertical"
        >
          <Form.Item
            name="nome"
            label="Nome"
            rules={[{ required: true, message: 'Por favor, insira o nome do produto.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="descricao"
            label="Descrição"
            rules={[{ required: true, message: 'Por favor, insira a descrição do produto.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="preco"
            label="Preço"
            rules={[{ required: true, message: 'Por favor, insira o preço do produto.' }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Salvar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Gprodutos;
