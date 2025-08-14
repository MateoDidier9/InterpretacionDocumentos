"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Escaneo de imágenes
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

  // Lectura de PDFs
  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setLoading(true);
    setText("Procesando PDF...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let pdfText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        pdfText += pageText + "\n\n";
      }

      setText(pdfText);
    } catch (error) {
      setText("Error al procesar PDF");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Escanear Documento</h1>

      {/* Input oculto para imágenes */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="fileInput"
      />

      {/* Botón imágenes */}
      <button
        onClick={() => document.getElementById("fileInput")?.click()}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px"
        }}
      >
        {loading ? "Procesando..." : "📷 Escanear Imagen"}
      </button>

      {/* Input oculto para PDF */}
      <input
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        style={{ display: "none" }}
        id="pdfInput"
      />

      {/* Botón PDF */}
      <button
        onClick={() => document.getElementById("pdfInput")?.click()}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {loading ? "Procesando..." : "📄 Cargar PDF"}
      </button>

      {/* Resultado */}
      <div style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        <strong>Texto detectado:</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}
