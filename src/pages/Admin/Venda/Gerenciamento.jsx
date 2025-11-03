import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  message, 
  Modal, 
  Card, 
  Row, 
  Col, 
  AutoComplete, 
  Typography,
  Tag,
  Statistic,
  Steps,
  Avatar,
  Space,
  Divider
} from 'antd';
import { supabase } from '../../../Supabase/createClient';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { 
  PlusOutlined, 
  GiftOutlined, 
  UserOutlined, 
  DollarOutlined, 
  ShoppingOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  StarOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;
import './promocoes.css'
function Gerenciamento() {
  const [empresaId, setEmpresaId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [promocoes, setPromocoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteOptions, setClienteOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalPromocaoVisible, setModalPromocaoVisible] = useState(false);
  const [promoSelecionada, setPromoSelecionada] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [etapa, setEtapa] = useState(1);
  const [funcionarioNome, setFuncionarioNome] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [observacao, setObservacao] = useState('');

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
          .select('id, nome')
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={getAvatarUrl(c.genero)} size="small" />
            <div>
              <div style={{ fontWeight: 600 }}>{c.nome}</div>
              {c.cpf && <div style={{ fontSize: 12, color: '#666' }}>{c.cpf}</div>}
            </div>
          </div>
        ),
      }));
    setClienteOptions(options);
  };

  const onSelectCliente = (value) => {
    const cliente = clientes.find(c => c.id.toString() === value);
    setClienteSelecionado(cliente);
  };

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
      message.success({
        content: 'Promoção cadastrada com sucesso!',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });
      setIsModalVisible(false);
      fetchPromocoes(empresaId);
    } catch (error) {
      message.error('Erro ao cadastrar promoção: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const registrarBonus = async () => {
    if (!clienteSelecionado || !funcionarioNome || !valorCompra) {
      return message.warning('Preencha todos os campos.');
    }
  
    const valorCompraNum = parseFloat(valorCompra);
    const valorPromo = parseFloat(promoSelecionada.valor_venda);
    const bonusPromo = parseInt(promoSelecionada.bonus);
  
    if (isNaN(valorCompraNum) || valorCompraNum <= 0) return message.warning('Valor da compra inválido');
  
    const vezes = Math.floor(valorCompraNum / valorPromo);
    if (vezes <= 0) return message.warning('O valor da compra não atinge o mínimo da promoção');
  
    const bonusTotal = vezes * bonusPromo;
    const dataHora = dayjs().format('YYYY-MM-DD HH:mm:ss');
  
    const { error: bonusError } = await supabase
      .from('clientes')
      .update({ bonus_count: (parseInt(clienteSelecionado.bonus_count) || 0) + bonusTotal })
      .eq('id', clienteSelecionado.id);
  
    if (bonusError) return message.error('Erro ao atualizar bônus: ' + bonusError.message);
  
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
  
    message.success({
      content: `Bônus registrado com sucesso! Total: ${bonusTotal} bônus`,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
    
    setClienteSelecionado(null);
    setEtapa(1);
    setFuncionarioNome('');
    setValorCompra('');
    setObservacao('');
    setModalPromocaoVisible(false);
  };

  return (
    <div className="gerenciamento-moderno">
      {/* Header */}
      <Card className="header-card" bordered={false}>
        <div className="header-content">
          <Link to="/adm">
            <Button type="text" className="back-button" icon={<ArrowLeftOutlined />}>
              Voltar
            </Button>
          </Link>
          <div className="header-info">
            <div className="title-section">
              <Title level={2} className="main-title">
                <GiftOutlined /> Sistema de Bônus
              </Title>
              <Text type="secondary">Gerencie promoções e bônus dos clientes</Text>
            </div>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            className="new-promotion-btn"
            onClick={() => setIsModalVisible(true)}
            size="large"
          >
            Nova Promoção
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="Total de Promoções"
              value={promocoes.length}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="Clientes Cadastrados"
              value={clientes.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#f093fb' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="Promoção Mais Recente"
              value={promocoes.length > 0 ? 1 : 0}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#4fd1c5' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal de criação de promoção */}
      <Modal
        title={
          <div className="modal-title">
            <PlusOutlined /> Nova Promoção
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="promotion-modal"
        width={600}
      >
        <Form layout="vertical" onFinish={onFinish} className="modern-form">
          <Form.Item 
            name="nome_promocao" 
            label="Nome da Promoção" 
            rules={[{ required: true, message: 'Digite o nome da promoção' }]}
          >
            <Input 
              prefix={<GiftOutlined />}
              placeholder="Ex: A cada R$ 100 em compras ganhe 4 bônus"
              size="large"
              className="modern-input"
            />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="valor_venda" 
                label="Valor de Venda" 
                rules={[{ required: true, message: 'Digite o valor' }]}
              >
                <InputNumber 
                  placeholder="100.00" 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01}
                  prefix="R$"
                  size="large"
                  className="modern-input"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="bonus" 
                label="Bônus" 
                rules={[{ required: true, message: 'Digite a quantidade de bônus' }]}
              >
                <InputNumber 
                  placeholder="4" 
                  style={{ width: '100%' }} 
                  min={0}
                  prefix={<StarOutlined />}
                  size="large"
                  className="modern-input"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="imagem_url" label="URL da Imagem">
            <Input 
              placeholder="https://exemplo.com/imagem.jpg"
              prefix={<ShoppingOutlined />}
              size="large"
              className="modern-input"
            />
          </Form.Item>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            loading={loading}
            size="large"
            className="submit-button"
          >
            <PlusOutlined /> Cadastrar Promoção
          </Button>
        </Form>
      </Modal>

      {/* Modal de registrar bônus */}
      <Modal
        title={
          <div className="modal-title">
            <GiftOutlined /> {promoSelecionada?.nome_promocao || 'Registrar Bônus'}
          </div>
        }
        open={modalPromocaoVisible}
        onCancel={() => {
          setModalPromocaoVisible(false);
          setEtapa(1);
          setClienteSelecionado(null);
        }}
        footer={null}
        className="bonus-modal"
        width={600}
      >
        <Steps current={etapa - 1} className="bonus-steps">
          <Step title="Selecionar Cliente" />
          <Step title="Registrar Compra" />
        </Steps>

        <div className="steps-content">
          {etapa === 1 && (
         <div className="step-1">
         <Text strong style={{ display: 'block', marginBottom: 16 }}>
           Selecione o cliente:
         </Text>
         <AutoComplete
           options={clienteOptions}
           style={{ width: '100%' }}
           onSearch={handleSearchCliente}
           onSelect={onSelectCliente}
           placeholder="Digite o nome ou CPF do cliente"
           size="large"
         >
           <Input 
             className="modern-input"
             style={{ 
               borderRadius: '12px',
               border: '2px solid #e2e8f0',
               padding: '12px 16px',
               transition: 'all 0.3s ease'
             }}
           />
         </AutoComplete>
         <Button 
           type="primary" 
           style={{ marginTop: '2pc', width: '100%' }} 
           onClick={() => clienteSelecionado ? setEtapa(2) : message.warning('Selecione um cliente primeiro')}
           size="large"
           className="modern-button"
         >
           Continuar
         </Button>
       </div>
          )}

          {etapa === 2 && clienteSelecionado && (
            <div className="step-2">
              <div className="client-info">
                <Space size={16}>
                  <Avatar src={getAvatarUrl(clienteSelecionado.genero)} size={64} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{clienteSelecionado.nome}</Title>
                    <Text type="secondary">CPF: {clienteSelecionado.cpf}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="blue">
                        <StarOutlined /> {clienteSelecionado.bonus_count || 0} bônus
                      </Tag>
                    </div>
                  </div>
                </Space>
              </div>

              <Divider />

              <Form layout="vertical" className="modern-form">
                <Form.Item label="Valor da Compra">
                  <Input 
                    value={valorCompra} 
                    onChange={e => setValorCompra(e.target.value)} 
                    placeholder="Ex: 100.00"
                    prefix="R$"
                    size="large"
                    className="modern-input"
                  />
                </Form.Item>
                
                <Form.Item label="Descrição da Compra">
                  <Input.TextArea
                    value={observacao}
                    onChange={e => setObservacao(e.target.value)}
                    placeholder="Ex: 2 açaís de R$ 10,00 cada"
                    rows={3}
                    className="modern-textarea"
                  />
                </Form.Item>

                <Form.Item label="Funcionário Responsável">
                  <Input 
                    value={funcionarioNome} 
                    onChange={e => setFuncionarioNome(e.target.value)} 
                    placeholder="Nome do funcionário"
                    prefix={<UserOutlined />}
                    size="large"
                    className="modern-input"
                  />
                </Form.Item>
              </Form>

              <div className="action-buttons">
                <Button onClick={() => setEtapa(1)} size="large">
                  Voltar
                </Button>
                <Button type="primary" onClick={registrarBonus} size="large">
                  <CheckCircleOutlined /> Registrar Bônus
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Lista de promoções */}
      <div className="promotions-section">
        <Title level={3} className="title">
          <GiftOutlined /> Promoções Ativas
        </Title>
        
        {promocoes.length === 0 ? (
          <Card className="empty-card">
            <div className="empty-state">
              <GiftOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Text type="secondary">Nenhuma promoção cadastrada</Text>
              <Button 
                type="primary" 
                onClick={() => setIsModalVisible(true)}
                style={{ marginTop: 16 }}
              >
                <PlusOutlined /> Criar Primeira Promoção
              </Button>
            </div>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {promocoes.map((promo) => (
              <Col key={promo.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  className="promotion-card"
                  hoverable
                  cover={
                    <div className="promotion-image-container">
                      <img
                        alt={promo.nome_promocao}
                        src={promo.imagem_url}
                        className="promotion-image"
                        onClick={() => { 
                          setPromoSelecionada(promo); 
                          setModalPromocaoVisible(true); 
                          setEtapa(1); 
                          setClienteSelecionado(null); 
                        }}
                      />
                      <div className="promotion-overlay">
                        <Button 
                          type="primary" 
                          shape="round"
                          icon={<GiftOutlined />}
                          onClick={() => { 
                            setPromoSelecionada(promo); 
                            setModalPromocaoVisible(true); 
                            setEtapa(1); 
                            setClienteSelecionado(null); 
                          }}
                        >
                          Usar Promoção
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <div className="promotion-content">
                    <Title level={4} className="promotion-title">{promo.nome_promocao}</Title>
                    <div className="promotion-details">
                      <div className="promotion-item">
                        <DollarOutlined className="promotion-icon" />
                        <span>R$ {promo.valor_venda.toFixed(2)}</span>
                      </div>
                      <div className="promotion-item">
                        <StarOutlined className="promotion-icon bonus" />
                        <span>{promo.bonus} bônus</span>
                      </div>
                    </div>
                    <Tag color="green" className="promotion-tag">
                      Ativa
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

export default Gerenciamento;