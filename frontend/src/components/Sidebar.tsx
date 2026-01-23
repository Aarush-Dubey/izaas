"use client";

import React, { useState } from "react";
import { Menu, X, Plus, LayoutDashboard, Home, Link as LinkIcon } from "lucide-react";

interface SidebarProps {
    onNewSession: () => void;
    onNavigate: (view: string) => void;
}

export default function Sidebar({ onNewSession, onNavigate }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Mock History Data
    const recentHistory = [
        { title: "Grocery Run", date: "Oct 24" },
        { title: "Rent Split", date: "Oct 01" },
        { title: "Unsplit Bills", date: "Todo" },
    ];

    // Helper Styles
    const buttonStyle = {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0.75rem",
        color: "var(--text-muted)",
        background: "transparent",
        border: "none",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "left" as const,
    };

    const sectionHeaderStyle = {
        fontSize: "0.75rem",
        fontFamily: "var(--font-mono)",
        color: "var(--text-dim)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.1em",
        marginBottom: "0.5rem",
    };

    return (
        <>
            {/* Trigger */}
            <button
                onClick={toggleSidebar}
                style={{
                    color: "var(--text-muted)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem"
                }}
                aria-label="Open Menu"
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        zIndex: 40,
                        backdropFilter: "blur(4px)"
                    }}
                />
            )}

            {/* Drawer */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "250px",
                    zIndex: 50,
                    background: "#09090b",
                    borderRight: "1px solid var(--border-stealth)",
                    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease-in-out",
                    display: "flex",
                    flexDirection: "column"
                }}
            >

                {/* Helper Header inside Sidebar to close it */}
                <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-stealth)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}>COMMAND CENTER</span>
                    <button
                        onClick={toggleSidebar}
                        style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* SECTION 1: ACTIONS */}
                    <div style={{ padding: "1rem", borderBottom: "1px solid var(--border-stealth)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <button
                            onClick={() => { onNewSession(); toggleSidebar(); }}
                            className="btn-stealth" // Reusing defined class
                            style={{
                                justifyContent: "center",
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.75rem",
                                background: "var(--bg-panel-stealth)",
                                color: "white",
                                fontFamily: "var(--font-sans)",
                                fontWeight: "600",
                                borderRadius: "var(--radius-md)",
                                transition: "background 0.2s",
                                border: "none",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-panel-hover)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-panel-stealth)"}
                        >
                            <Plus size={16} />
                            New Session
                        </button>

                        <button
                            onClick={() => { onNavigate('dashboard'); toggleSidebar(); }}
                            style={{
                                ...buttonStyle,
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.875rem",
                                borderRadius: "var(--radius-md)"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-emerald)"; e.currentTarget.style.background = "var(--bg-panel-stealth)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </button>
                    </div>

                    {/* SECTION 2: RECENT HISTORY */}
                    <div style={{ flex: 1, padding: "1rem", overflowY: "auto", borderBottom: "1px solid var(--border-stealth)" }}>
                        <div style={{ ...sectionHeaderStyle, marginBottom: "0.75rem" }}>Recent Uplinks</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            {recentHistory.map((item, idx) => (
                                <button
                                    key={idx}
                                    style={{
                                        ...buttonStyle,
                                        padding: "0.5rem",
                                        borderRadius: "var(--radius-md)",
                                        display: "block",
                                        color: "var(--text-muted)"
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-panel-stealth)"; e.currentTarget.style.color = "white"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                                >
                                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>{item.title}</span>
                                    <span style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{item.date}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 3: SYSTEM */}
                    <div style={{ padding: "1rem", background: "rgba(24, 24, 27, 0.5)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <div style={{ ...sectionHeaderStyle, marginBottom: "0.5rem" }}>System</div>

                        <button
                            style={{ ...buttonStyle, borderRadius: "var(--radius-md)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "var(--bg-panel-stealth)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        >
                            <Home size={16} />
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem" }}>221B Baker St</span>
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const { SplitwiseService } = await import("@/services/splitwise");
                                    const { url, oauth_token_secret } = await SplitwiseService.getAuthUrl();
                                    // Store secret provided by our backend for the callback step
                                    localStorage.setItem('splitwise_temp_secret', oauth_token_secret);
                                    window.location.href = url;
                                } catch (e) {
                                    console.error("Sync failed", e);
                                    alert("Failed to initiate Splitwise Sync");
                                }
                            }}
                            style={{ ...buttonStyle, borderRadius: "var(--radius-md)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "var(--bg-panel-stealth)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        >
                            <LinkIcon size={16} />
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem" }}>Sync Splitwise</span>
                        </button>
                    </div>

                    {/* FOOTER */}
                    <div style={{ padding: "1rem", textAlign: "center" }}>
                        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>v1.0.4 // ROYAL_OS</span>
                    </div>

                </div>
            </div>
        </>
    );
}
