"use client";

import React, { useRef, useState } from "react";
import { Paperclip, Loader2, Check, AlertCircle } from "lucide-react";

export default function UploadButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatus("idle");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/documents/", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setStatus("success");
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                console.error("Upload failed", await response.text());
                setStatus("error");
                setTimeout(() => setStatus("idle"), 3000);
            }
        } catch (error) {
            console.error("Upload error", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div style={{ pointerEvents: "auto" }}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
            />
            <button
                onClick={handleClick}
                disabled={uploading}
                title="Upload Document"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    background: "transparent",
                    border: "none",
                    color: status === "success" ? "#10b981" : status === "error" ? "#ef4444" : "#a1a1aa", // Zinc-400
                    cursor: uploading ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                }}
                className="hover:text-emerald-500"
            >
                {uploading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : status === "success" ? (
                    <Check size={20} />
                ) : status === "error" ? (
                    <AlertCircle size={20} />
                ) : (
                    <Paperclip size={20} />
                )}
            </button>
        </div>
    );
}
