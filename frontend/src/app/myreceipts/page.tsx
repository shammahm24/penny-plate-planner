"use client";
import { useState } from "react";
import { Upload as UploadIcon } from 'lucide-react';

function ReceiptUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ item: string; price: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setItems([]);
    const formData = new FormData();
    formData.append("receipt", file);
    try {
      const res = await fetch("http://localhost:4000/api/receipts/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
      } else {
        setError(data.error || "Failed to process receipt");
      }
    } catch (err: any) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpload} className="mt-8 p-4 border rounded-lg bg-white max-w-md mx-auto">
      <label className="block mb-2 font-semibold">Upload or Take a Photo of Your Receipt</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="mb-2"
      />
      {preview && (
        <img src={preview} alt="Receipt preview" className="mb-2 w-full max-h-64 object-contain border rounded" />
      )}
      <button
        type="submit"
        disabled={loading || !file}
        className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-green-700 transition mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UploadIcon className="w-5 h-5" />
        {loading ? "Processing..." : "Upload Receipt"}
      </button>
      {loading && <div className="w-full h-2 bg-gray-200 rounded"><div className="h-2 bg-green-500 rounded animate-pulse w-3/4"></div></div>}
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {items.length > 0 && (
        <ul className="mt-4 space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between border-b pb-1">
              <span>{item.item}</span>
              {item.price && <span className="font-mono">${item.price}</span>}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

export default function MyReceiptsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Upload Receipt</h1>
      <ReceiptUpload />
    </div>
  );
} 