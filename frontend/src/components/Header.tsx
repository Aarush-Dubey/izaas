"use client";

import React from "react";
import Sidebar from "./Sidebar";
import ProfileDropdown from "./ProfileDropdown";

interface HeaderProps {
    onNewSession: () => void;
    onNavigate: (view: string) => void;
    user?: any;
}

export default function Header({ onNewSession, onNavigate, user }: HeaderProps) {
    return (
        <header
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4rem",
                padding: "0 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 30,
                background: "linear-gradient(to bottom, #09090b, transparent)",
                pointerEvents: "none"
            }}
        >
            {/* Pointer events auto for children so clicks pass through header background but hit buttons */}
            <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
                <Sidebar onNewSession={onNewSession} onNavigate={onNavigate} />
            </div>

            <div style={{
                pointerEvents: "auto",
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)"
            }}>
                <h1 style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    letterSpacing: "0.2em",
                    color: "rgba(113, 113, 122, 0.5)", // Zinc-500/50
                    userSelect: "none",
                    whiteSpace: "nowrap"
                }}>
                    Izaas
                </h1>
            </div>

            <div style={{ pointerEvents: "auto" }}>
                <ProfileDropdown user={user} />
            </div>
        </header>
    );
}
