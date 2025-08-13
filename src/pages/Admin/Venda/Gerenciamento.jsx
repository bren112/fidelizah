import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, message, Modal, Card, Row, Col, AutoComplete } from 'antd';
import { supabase } from '../../../Supabase/createClient';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
function Gerenciamento() {
  const [empresaId, setEmpresaId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [promocoes, setPromocoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteOptions, setClienteOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal de criação
  const [modalPromocaoVisible, setModalPromocaoVisible] = useState(false); // Modal de registrar bônus
  const [promoSelecionada, setPromoSelecionada] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [etapa, setEtapa] = useState(1); 
  const [funcionarioNome, setFuncionarioNome] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [observacao, setObservacao] = useState('');

  // Buscar empresa e promoções/clientes
  useEffect(() => {
    const fetchEmpresaId = async () => {
      const email = localStorage.getItem('token'); 
      if (!email) {
        message.error('Empresa não logada');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('id')
          .eq('email', email)
          .single();

        if (error) throw error;
        setEmpresaId(data.id);
        fetchPromocoes(data.id);
        fetchClientes(data.id);
      } catch (error) {
        message.error('Erro ao buscar empresa');
      }
    };

    fetchEmpresaId();
  }, []);

  const fetchPromocoes = async (id) => {
    try {
      const { data, error } = await supabase
        .from('sistemavenda')
        .select('*')
        .eq('empresa_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPromocoes(data);
    } catch (error) {
      message.error('Erro ao buscar promoções: ' + error.message);
    }
  };

  const fetchClientes = async (empresaId) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nome', { ascending: true });
      if (error) throw error;
      setClientes(data);
    } catch (error) {
      message.error('Erro ao buscar clientes: ' + error.message);
    }
  };

  const getAvatarUrl = (genero) => {
    if (genero === 'Masculino') return 'https://i.pinimg.com/564x/50/f2/91/50f2915c4f23c9643efb1c8f05020f2b.jpg';
    if (genero === 'Feminino') return 'https://i.pinimg.com/564x/01/6a/34/016a34bbf9dc95a43f2003c78964a543.jpg';
    return 'https://i.pinimg.com/564x/6c/35/c5/6c35c525c3c0f1abef4c1b8b3c820727.jpg';
  };

  const handleSearchCliente = (value) => {
    const options = clientes
      .filter(c => c.nome.toLowerCase().includes(value.toLowerCase()) || (c.cpf && c.cpf.includes(value)))
      .map(c => ({
        value: c.id.toString(),
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={getAvatarUrl(c.genero)} alt={c.nome} style={{ width: 30, height: 30, borderRadius: '50%' }} />
            <span>{c.nome}{c.cpf ? ` - ${c.cpf}` : ''}</span>
          </div>
        ),
      }));
    setClienteOptions(options);
  };

  const onSelectCliente = (value) => {
    const cliente = clientes.find(c => c.id.toString() === value);
    setClienteSelecionado(cliente);
  };

  // Cadastro de nova promoção
  const onFinish = async (values) => {
    if (!empresaId) return message.error('Empresa não encontrada');
    setLoading(true);
    try {
      const { error } = await supabase.from('sistemavenda').insert([
        {
          empresa_id: empresaId,
          nome_promocao: values.nome_promocao,
          valor_venda: parseFloat(values.valor_venda),
          bonus: parseInt(values.bonus),
          imagem_url: values.imagem_url,
        },
      ]);
      if (error) throw error;
      message.success('Promoção cadastrada com sucesso!');
      setIsModalVisible(false);
      fetchPromocoes(empresaId);
    } catch (error) {
      message.error('Erro ao cadastrar promoção: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Registrar bônus no cliente
  const registrarBonus = async () => {
    if (!clienteSelecionado || !funcionarioNome || !valorCompra) {
      return message.warning('Preencha todos os campos.');
    }
  
    const valorCompraNum = parseFloat(valorCompra);
    const valorPromo = parseFloat(promoSelecionada.valor_venda);
    const bonusPromo = parseInt(promoSelecionada.bonus);
  
    if (isNaN(valorCompraNum) || valorCompraNum <= 0) return message.warning('Valor da compra inválido');
  
    // Calcula quantas vezes o valor da compra atinge o valor da promoção
    const vezes = Math.floor(valorCompraNum / valorPromo);
    if (vezes <= 0) return message.warning('O valor da compra não atinge o mínimo da promoção');
  
    const bonusTotal = vezes * bonusPromo;
    const dataHora = dayjs().format('YYYY-MM-DD HH:mm:ss');
  
    // Atualiza bonus_count do cliente
    const { error: bonusError } = await supabase
      .from('clientes')
      .update({ bonus_count: (parseInt(clienteSelecionado.bonus_count) || 0) + bonusTotal })
      .eq('id', clienteSelecionado.id);
  
    if (bonusError) return message.error('Erro ao atualizar bônus: ' + bonusError.message);
  
    // Insere no relatório
    const { error: relatorioError } = await supabase
      .from('relatorios')
      .insert([{
        empresa_id: empresaId,
        cliente_nome: clienteSelecionado.nome,
        funcionario_nome: funcionarioNome,
        data_hora: dataHora,
        bonus_dado: bonusTotal,
        desccompra: promoSelecionada.nome_promocao
      }]);
  
    if (relatorioError) return message.error('Erro ao registrar no relatório: ' + relatorioError.message);
  
    message.success(`Bônus registrado com sucesso! Total: ${bonusTotal} bônus`);
    setClienteSelecionado(null);
    setEtapa(1);
    setFuncionarioNome('');
    setValorCompra('');
    setObservacao('');
    setModalPromocaoVisible(false);
  };
  
  return (
    <div style={{ padding: 20 }}>
      
      <h1 id='title' style={{ textAlign: 'center' , color: 'var(--rosa)',  fontSize: '2pc'}}>Gerenciamento de Promoções</h1>

      {/* Botão criar promoção */}
      <Button type="primary" style={{ marginBottom: 20, backgroundColor:'black'}} onClick={() => setIsModalVisible(true)}>
        Cadastrar Nova Promoção
      </Button>

      {/* Modal de criação de promoção */}
      <Modal
        title="Cadastrar Promoção"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="nome_promocao" label="Nome da Promoção" rules={[{ required: true }]}>
            <Input placeholder="Ex: 100 Reais em compras ganha 4 bônus" />
          </Form.Item>
          <Form.Item name="valor_venda" label="Valor de Venda" rules={[{ required: true }]}>
            <InputNumber placeholder="100.00" style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="bonus" label="Bônus" rules={[{ required: true }]}>
            <InputNumber placeholder="4" style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="imagem_url" label="URL da Imagem">
            <Input placeholder="https://..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Cadastrar Promoção
          </Button>
        </Form>
      </Modal>

      {/* Modal de registrar bônus */}
      <Modal
        title={promoSelecionada?.nome_promocao || 'Promoção'}
        open={modalPromocaoVisible}
        onCancel={() => setModalPromocaoVisible(false)}
        footer={null}
      >
        {etapa === 1 && (
          <>
            <AutoComplete
              options={clienteOptions}
              style={{ width: '100%' }}
              onSearch={handleSearchCliente}
              onSelect={onSelectCliente}
              placeholder="Digite o nome ou CPF do cliente"
            />
            <Button style={{ marginTop: 10 }} type="primary" onClick={() => clienteSelecionado ? setEtapa(2) : message.warning('Selecione um cliente primeiro')}>
              Continuar
            </Button>
          </>
        )}

        {etapa === 2 && clienteSelecionado && (
          <>
         
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={getAvatarUrl(clienteSelecionado.genero)} alt={clienteSelecionado.nome} style={{ width: 50, height: 50, borderRadius: '50%' }} />
              <span style={{ fontWeight: 'bold', fontSize: 16 }}>{clienteSelecionado.nome}</span>
            </div>

            <Form layout="vertical" style={{ marginTop: 20 }}>
              <Form.Item label="Valor da Compra">
                <Input value={valorCompra} onChange={e => setValorCompra(e.target.value)} placeholder="Ex: R$ 100,00" />
              </Form.Item>
              <Form.Item label="Descrição da compra">
                <Input.TextArea
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  placeholder="Ex: 2 açaís de 10 reais cada"
                  rows={4} // você pode ajustar a quantidade de linhas visíveis
                />
              </Form.Item>

              <Form.Item label="Funcionário">
                <Input value={funcionarioNome} onChange={e => setFuncionarioNome(e.target.value)} placeholder="Nome do funcionário" />
              </Form.Item>
            </Form>

            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <Button onClick={() => setEtapa(1)}>Voltar</Button>
              <Button type="primary" onClick={registrarBonus}>Registrar Bônus</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Lista de promoções */}
      <Row gutter={[16, 16]}>
        {promocoes.map((promo) => (
          <Col key={promo.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={promo.nome_promocao}
              style={{ textAlign: 'center' }}
              hoverable
              cover={
                <img
                  alt={promo.nome_promocao}
                  src={promo.imagem_url}
                  style={{ cursor: 'pointer', height: 200, objectFit: 'cover' }}
                  onClick={() => { setPromoSelecionada(promo); setModalPromocaoVisible(true); setEtapa(1); setClienteSelecionado(null); }}
                />
              }
            >
              <p>A cada: <span style={{ color: 'var(--primary)' , fontWeight: '400'}}> R${promo.valor_venda.toFixed(2)}</span> gastos</p>
              <p>Ganha: <span style={{ color: 'var(--rosa)' , fontWeight: '400'}}> {promo.bonus} </span>bônus </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Gerenciamento;
