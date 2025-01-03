import React, { useState } from "react";
import { supabase } from "../../../Supabase/createClient.js";
import { useNavigate } from "react-router-dom";

function CriarProduto() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const empresa = JSON.parse(localStorage.getItem("selectedEmpresa"));

    if (!empresa || !empresa.id) {
      setError("Nenhuma empresa logada.");
      setLoading(false);
      return;
    }

    if (!imagem) {
      setError("Por favor, selecione uma imagem.");
      setLoading(false);
      return;
    }

    try {
      let publicUrl = "";

      // Realiza o upload da imagem, se houver uma nova
      if (imagem) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("produto_foto")
          .upload(`produtos/${nome}.png`, imagem, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Obtém a URL pública da imagem após o upload
        const { data } = supabase
          .storage
          .from("produto_foto")
          .getPublicUrl(`produtos/${nome}.png`);
        publicUrl = data.publicUrl;
      }

      // Inserir o produto no banco de dados com a URL pública da imagem
      const { data, error } = await supabase.from("produtos").insert([
        {
          nome,
          descricao,
          preco: parseInt(preco, 10),
          imagem_url: publicUrl, // Usa a URL pública da imagem
          empresa_id: empresa.id,
        },
      ]);

      if (error) {
        throw error;
      }

      console.log("Produto inserido com sucesso:", data);
      setNome("");
      setDescricao("");
      setPreco("");
      setImagem(null);
      fetchProdutos(); // Se você quiser atualizar a lista de produtos
      navigate("/adm");
    } catch (error) {
      console.error("Erro ao inserir produto:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setImagem(e.target.files[0]);
  };

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase.from("produtos").select("*");
      if (error) {
        throw error;
      }
      console.log("Produtos:", data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error.message);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/adm")}>
        Voltar
      </button>
      <h1 style={styles.title}>Cadastrar Produto</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Nome</label>
        <input
          style={styles.input}
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label style={styles.label}>Descrição</label>
        <textarea
          style={styles.input}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />

        <label style={styles.label}>Preço</label>
        <input
          style={styles.input}
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
        />

        <label style={styles.label}>Imagem</label>
        <input
          style={styles.input}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />

        <button style={styles.submitButton} type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar Produto"}
        </button>

        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

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
  backButton: {
    fontFamily: "'MuseoModerno', cursive",
    color: "#878787",
    backgroundColor: "#f9f9f9",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "4px",
    marginBottom: "20px",
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
  label: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "5px",
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

export default CriarProduto;
