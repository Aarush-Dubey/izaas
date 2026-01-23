"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";

interface ProfileDropdownProps {
    user?: any;
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("izaas_profile");
        window.location.reload();
    };

    const displayName = user?.name || "Guest Pilot";
    const displayHandle = user?.upi || "guest@uplink";
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

    const menuItemStyle = {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0.75rem",
        fontSize: "0.875rem",
        color: "var(--text-muted)",
        background: "transparent",
        border: "none",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        transition: "all 0.2s"
    };

    return (
        <div style={{ position: "relative" }} ref={dropdownRef}>
            {/* Trigger: Avatar */}
            <button
                onClick={toggleDropdown}
                style={{
                    position: "relative",
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    background: "var(--border-stealth)",
                    border: "1px solid var(--border-active)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "border-color 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-emerald)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-active)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: "bold" }}>{initials}</span>
                {/* Status Dot */}
                <span style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "0.5rem",
                    height: "0.5rem",
                    background: "var(--accent-emerald)",
                    borderRadius: "50%",
                    border: "1px solid #09090b"
                }}></span>
            </button>

            {/* Popover */}
            {isOpen && (
                <div style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "0.5rem",
                    width: "16rem",
                    background: "rgba(24, 24, 27, 0.95)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--border-stealth)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                    zIndex: 50,
                    animation: "fadeIn 0.2s ease-out"
                }}>
                    {/* Header */}
                    <div style={{ padding: "1rem", borderBottom: "1px solid rgba(39, 39, 42, 0.5)" }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, color: "white", fontSize: "0.875rem" }}>{displayName}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{displayHandle}</div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <button
                            style={menuItemStyle}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border-stealth)"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                        >
                            <User size={16} />
                            My Profile
                        </button>

                        <button
                            style={menuItemStyle}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border-stealth)"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                        >
                            <Settings size={16} />
                            Preferences
                        </button>

                        <div style={{ height: "1px", background: "var(--border-stealth)", margin: "0.25rem 0.5rem" }}></div>

                        <button
                            onClick={handleLogout}
                            style={{ ...menuItemStyle, color: "#f87171" }} // Red-400 equivalent
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
