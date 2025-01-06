import React, { useState, useEffect } from "react";
import { supabase } from "../../../Supabase/createClient.js";
import { message, Button, Input } from "antd";
import { useNavigate } from "react-router-dom";

function CadastroProduto() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagem, setImagem] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpresa = async () => {
      const email = localStorage.getItem("token");
      if (!email) {
        message.error("Você não está logado.");
        return;
      }

      const { data: empresaData, error: empresaError } = await supabase
        .from("empresas")
        .select("*")
        .eq("email", email)
        .single();

      if (empresaError) {
        message.error("Erro ao buscar a empresa: " + empresaError.message);
        return;
      }

      setEmpresa(empresaData);
    };

    fetchEmpresa();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!empresa) {
      message.error("Nenhuma empresa logada.");
      setLoading(false);
      return;
    }

    if (!imagem) {
      message.error("Por favor, selecione uma imagem.");
      setLoading(false);
      return;
    }

    try {
      let publicUrl = "";

      // Realiza o upload da imagem
      const uniqueName = `produtos/${Date.now()}_${nome}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("produto_foto")
        .upload(uniqueName, imagem, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error("Erro ao fazer upload da imagem.");
      }

      // Obtém a URL pública da imagem
      const { data: urlData } = supabase.storage.from("produto_foto").getPublicUrl(uniqueName);
      if (urlData && urlData.publicUrl) {
        publicUrl = urlData.publicUrl;
      } else {
        throw new Error("Erro ao obter a URL pública da imagem.");
      }

      // Inserir o produto no banco de dados com o ID da empresa logada
      const { data, error } = await supabase.from("produtos").insert([
        {
          nome,
          descricao,
          preco: parseFloat(preco),
          imagem_url: publicUrl,
          empresa_id: empresa.id, // ID da empresa logada
        },
      ]);

      if (error) {
        throw new Error("Erro ao inserir o produto no banco de dados.");
      }

      message.success("Produto cadastrado com sucesso!");
      setNome("");
      setDescricao("");
      setPreco("");
      setImagem(null);
      navigate("/adm");
    } catch (error) {
      console.error("Erro:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Cadastrar Produto</h2>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <Input
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
        <Input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
        />
        <Input
          type="file"
          onChange={(e) => setImagem(e.target.files[0])}
          required
        />
        <Button type="primary" htmlType="submit" loading={loading}>
          Cadastrar
        </Button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default CadastroProduto;
