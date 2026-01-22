"use client";

import React from "react";

interface Category {
  label: string;
  amount: number;
}

interface BudgetBreakdownChartProps {
  destination: string;
  total_budget: number;
  categories: Category[];
}

export default function BudgetBreakdownChart({
  destination,
  total_budget,
  categories,
}: BudgetBreakdownChartProps) {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#eab308", // yellow
    "#a855f7", // purple
    "#ec4899", // pink
    "#6366f1", // indigo
  ];

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const remaining = total_budget - totalAllocated;

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
          marginBottom: "8px",
          color: "#1f2937",
        }}
      >
        Trip Budget: {destination}
      </h2>
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#4b5563" }}>
            Total Budget
          </span>
          <span
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2563eb",
            }}
          >
            ${total_budget.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            backgroundColor: "#e5e7eb",
            borderRadius: "9999px",
            height: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: "#2563eb",
              height: "12px",
              borderRadius: "9999px",
              width: "100%",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {categories.map((category, index) => {
          const percentage = (category.amount / total_budget) * 100;
          const color = colors[index % colors.length];

          return (
            <div key={category.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  {category.label}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                  ${category.amount.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "9999px",
                  height: "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor: color,
                    height: "10px",
                    borderRadius: "9999px",
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                />
              </div>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                {percentage.toFixed(1)}% of total
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "24px",
          paddingTop: "16px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#4b5563" }}>
            Total Allocated
          </span>
          <span style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}>
            ${totalAllocated.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "4px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#4b5563" }}>
            Remaining
          </span>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: remaining >= 0 ? "#059669" : "#dc2626",
            }}
          >
            ${remaining.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
