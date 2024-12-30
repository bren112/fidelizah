import React, { useState, useEffect } from 'react';
import { Table, Button, message, Input } from 'antd';
import { supabase } from '../../../Supabase/createClient.js';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import './RelatorioProduto.css';

function RelatorioProduto() {
  const [relatorio, setRelatorio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessage] = useState('');
  const [empresaNome, setEmpresaNome] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState(''); // Estado para o filtro do nome do usuário

  useEffect(() => {
    const fetchRelatorio = async () => {
      try {
        const email = localStorage.getItem('token');
        if (!email) {
          message.error('Você não está logado.');
          return;
        }

        const { data: empresaData, error: empresaError } = await supabase
          .from('empresas')
          .select('id, nome')
          .eq('email', email)
          .single();

        if (empresaError) {
          message.error('Erro ao buscar a empresa: ' + empresaError.message);
          return;
        }

        setEmpresaNome(empresaData.nome);

        // Faz a consulta para obter os produtos resgatados, a data e a quantidade
        const { data, error } = await supabase
          .from('produtos_resgatados')
          .select('produto_nome, usuario_id, data, quantidade'); // Agora com a quantidade

        if (error) {
          throw error;
        }

        // Agora buscamos os dados dos usuários
        const relatorioCompleto = await Promise.all(
          data.map(async (item) => {
            const { data: usuarioData, error: usuarioError } = await supabase
              .from('usuarios')
              .select('nome')
              .eq('id', item.usuario_id)
              .single(); 

            if (usuarioError) {
              console.error('Erro ao buscar o usuário:', usuarioError.message);
              return null;
            }

            return {
              produto_nome: item.produto_nome,
              usuario_nome: usuarioData.nome,
              data_resgate: item.data,
              quantidade: item.quantidade, // Incluindo a quantidade
            };
          })
        );

        setRelatorio(relatorioCompleto.filter((item) => item !== null));
      } catch (error) {
        console.error('Erro ao carregar o relatório:', error.message);
        setMessage('Erro ao carregar o relatório.');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorio();
  }, []);

  // Função para filtrar os relatórios com base no nome do usuário
  const filtrarRelatorio = () => {
    if (!filtroUsuario) {
      return relatorio;
    }
    return relatorio.filter(item =>
      item.usuario_nome.toLowerCase().includes(filtroUsuario.toLowerCase())
    );
  };

  const columns = [
    {
      title: 'Nome do Produto',
      dataIndex: 'produto_nome',
      key: 'produto_nome',
    },
    {
      title: 'Nome do Usuário',
      dataIndex: 'usuario_nome',
      key: 'usuario_nome',
    },
    {
      title: 'Data do Resgate',
      dataIndex: 'data_resgate',
      key: 'data_resgate',
      render: (text) => {
        if (text) {
          return format(new Date(text), 'dd/MM/yyyy HH:mm', { locale: ptBR });
        }
        return null;
      },
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      key: 'quantidade',
    },
  ];

  return (
    <>
      <br />
      <Link to="/adm">
        <Button id="voltar">Voltar</Button>
      </Link>
      <br />
      <br />
      <h2 id="title_gerenciar">Relatório de Produtos Resgatados - {empresaNome}</h2>
      <br />
      
      {/* Campo de filtro para o nome do usuário */}
      <Input
      id='minput'
        placeholder="Filtrar por nome do usuário"
        value={filtroUsuario}
        onChange={(e) => setFiltroUsuario(e.target.value)}
        style={{ width: 300, marginBottom: 20 }}
      />

      {messageText && <p>{messageText}</p>}
      <Table
        dataSource={filtrarRelatorio()} // Usa o filtro aplicado
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={loading}
        className="custom-table"
      />
    </>
  );
}

export default RelatorioProduto;
