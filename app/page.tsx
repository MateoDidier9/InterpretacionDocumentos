"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Manejo de imágenes
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setLoading(true);
    setText("Procesando imagen...");

    try {
      // Redimensionar imagen para mejorar OCR
      const resizedBlob = await resizeImage(file);
      const { data: { text } } = await Tesseract.recognize(resizedBlob, "spa");
      setText(text);
    } catch (error) {
      setText("Error al procesar la imagen");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de PDFs
  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setLoading(true);
    setText("Procesando PDF...");

    try {
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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

  // Función para redimensionar imagen
  const resizeImage = (file: File, maxWidth = 1024, maxHeight = 1024): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/jpeg", 0.9);
      };
      img.src = URL.createObjectURL(file);
    });
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

      {/* Input oculto para PDFs */}
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
