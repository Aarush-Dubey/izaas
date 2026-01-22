"use client";

import React, { useState, useEffect } from "react";

interface CurrencyExchangeWidgetProps {
  from_currency: string;
  to_currency: string;
  rate: number;
  last_updated: string;
}

export default function CurrencyExchangeWidget({
  from_currency,
  to_currency,
  rate,
  last_updated,
}: CurrencyExchangeWidgetProps) {
  const [amount, setAmount] = useState<number>(1);
  const [convertedAmount, setConvertedAmount] = useState<number>(rate);

  useEffect(() => {
    setConvertedAmount(amount * rate);
  }, [amount, rate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAmount(value);
  };

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1f2937",
          }}
        >
          Currency Converter
        </h2>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>
          Updated: {new Date(last_updated).toLocaleString()}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            From: {from_currency}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              style={{
                width: "100%",
                padding: "12px 80px 12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "18px",
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
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              {from_currency}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "8px",
              backgroundColor: "#f3f4f6",
              borderRadius: "50%",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            aria-label="Swap currencies"
          >
            <svg
              style={{ width: "24px", height: "24px", color: "#4b5563" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
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
            To: {to_currency}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              value={convertedAmount.toFixed(2)}
              readOnly
              style={{
                width: "100%",
                padding: "12px 80px 12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
                fontSize: "18px",
                fontWeight: "600",
                outline: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              {to_currency}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "#eff6ff",
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
            <span style={{ fontSize: "14px", color: "#4b5563" }}>Exchange Rate</span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              1 {from_currency} = {rate.toFixed(4)} {to_currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
