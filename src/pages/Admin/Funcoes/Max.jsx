import React, { useState, useEffect } from "react";
import { supabase } from "../../../Supabase/createClient.js";
import { message, Button, Input } from "antd";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontFamily: "'MuseoModerno', cursive",
    fontSize: "24px",
    color: "#333",
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  submitButton: {
    fontFamily: "'MuseoModerno', cursive",
    backgroundColor: "var(--rosa)",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "4px",
    alignSelf: "center",
  },
  error: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    color: "red",
    textAlign: "center",
  },
};

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
    <div style={styles.container}>
      <h2 style={styles.title}>Cadastrar Produto</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <Input
          placeholder="Nome do produto"
          value={nome}
          style={styles.input}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <Input
          placeholder="Descrição"
          value={descricao}
          style={styles.input}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
        <Input
          type="number"
          placeholder="Preço"
          value={preco}
          style={styles.input}
          onChange={(e) => setPreco(e.target.value)}
          required
        />
        <Input
          type="file"
          style={styles.input}
          onChange={(e) => setImagem(e.target.files[0])}
          required
        />
        <Button style={styles.submitButton} htmlType="submit" loading={loading}>
          Cadastrar
        </Button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

export default CadastroProduto;
