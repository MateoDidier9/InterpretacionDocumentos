"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setLoading(true);
    setText("Procesando imagen...");

    try {
      const { data: { text } } = await Tesseract.recognize(file, "spa");
      setText(text);
    } catch (error) {
      setText("Error al procesar la imagen");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Escanear Documento</h1>

      {/* Input oculto para abrir cámara */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="fileInput"
      />

      {/* Botón que abre el input */}
      <button
        onClick={() => document.getElementById("fileInput")?.click()}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {loading ? "Procesando..." : "📷 Escanear"}
      </button>

      {/* Resultado */}
      <div style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        <strong>Texto detectado:</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}
