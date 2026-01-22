"use client";

import React, { useState } from "react";

type ExpenseCategory = "Food" | "Transport" | "Stay";

interface ExpenseEntryFormProps {
  category?: ExpenseCategory;
  amount?: number;
  date?: string;
}

export default function ExpenseEntryForm({
  category: initialCategory,
  amount: initialAmount,
  date: initialDate,
}: ExpenseEntryFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>(
    initialCategory || "Food"
  );
  const [amount, setAmount] = useState<number>(initialAmount || 0);
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const categoryStyles = {
    Food: {
      bg: "#fef3c7",
      text: "#92400e",
      border: "#fbbf24",
      hover: "#fde68a",
    },
    Transport: {
      bg: "#dbeafe",
      text: "#1e40af",
      border: "#60a5fa",
      hover: "#bfdbfe",
    },
    Stay: {
      bg: "#e9d5ff",
      text: "#6b21a8",
      border: "#a78bfa",
      hover: "#ddd6fe",
    },
  };

  const categories: ExpenseCategory[] = ["Food", "Transport", "Stay"];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#1f2937",
        }}
      >
        Log Expense
      </h2>

      {submitted && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#d1fae5",
            border: "1px solid #34d399",
            color: "#065f46",
            borderRadius: "8px",
          }}
        >
          Expense logged successfully! ✓
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Category
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {categories.map((cat) => {
              const isSelected = category === cat;
              const style = categoryStyles[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: `2px solid ${isSelected ? style.border : "#d1d5db"}`,
                    fontWeight: "500",
                    backgroundColor: isSelected ? style.bg : "#f9fafb",
                    color: isSelected ? style.text : "#374151",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    outline: isSelected ? `2px solid ${style.border}40` : "none",
                    outlineOffset: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Amount
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              $
            </span>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                paddingLeft: "32px",
                paddingRight: "16px",
                paddingTop: "12px",
                paddingBottom: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2563eb";
                e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
            placeholder="e.g., Dinner at restaurant"
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontWeight: "600",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1d4ed8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
          }}
        >
          Add Expense
        </button>
      </form>

      {amount > 0 && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "14px", color: "#4b5563" }}>Preview</span>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                {category} • {new Date(date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
