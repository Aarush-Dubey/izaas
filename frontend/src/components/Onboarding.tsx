"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ArrowRight, ShieldCheck, Lock, Users, User, CreditCard } from "lucide-react";

// Types
type OnboardingPhase = "BOOT" | "TREASURY" | "PROFILE" | "NETWORK";

interface OnboardingProps {
    onComplete: (data: any) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [phase, setPhase] = useState<OnboardingPhase>("BOOT");

    // Data State
    const [phone, setPhone] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [streamData, setStreamData] = useState<{ label: string, value: string }[]>([]);

    const [profile, setProfile] = useState({
        name: "",
        upi: "@okhdfc",
        rentDate: 1,
        household: "SOLO",
    });

    const [splitwiseConnected, setSplitwiseConnected] = useState(false);

    // --- PHASE 0: BOOT SEQUENCE ---
    useEffect(() => {
        if (phase === "BOOT") {
            const timer = setTimeout(() => {
                setPhase(current => current === "BOOT" ? "TREASURY" : current);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    // Restore state and check integrations
    useEffect(() => {
        const savedState = localStorage.getItem('temp_onboarding_state');
        const integrations = localStorage.getItem("royal_pilot_integrations");

        if (savedState) {
            const parsed = JSON.parse(savedState);
            setPhone(parsed.phone || "");
            setProfile(parsed.profile || { name: "", upi: "@okhdfc", rentDate: 1, household: "SOLO" });
            if (parsed.phase) setPhase(parsed.phase);
        }

        if (integrations) {
            const parsed = JSON.parse(integrations);
            if (parsed.splitwise) {
                setSplitwiseConnected(true);
            }
        }
    }, []);


    // --- PHASE 1: TREASURY LINK ---
    const handleAuthenticate = () => {
        if (phone.length < 10) return;
        setIsAuthenticating(true);

        // Cyberpunk Handshake Logs
        const logs = [
            { label: "socket_status", value: "secure" },
            { label: "protocol", value: "anumati_aa_v2" },
            { label: "encryption", value: "AES-256-GCM" },
            { label: "handshake", value: "verified" },
            { label: "stream", value: "active" }
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i >= logs.length) {
                clearInterval(interval);
                setTimeout(() => {
                    setPhase("PROFILE");
                }, 1500);
                return;
            }

            const currentLog = logs[i];
            if (currentLog) {
                setStreamData((prev) => [...prev, currentLog]);
            }
            i++;
        }, 600);
    };

    // --- PHASE 3: NETWORK BRIDGE ---
    const handleConnectSplitwise = async () => {
        try {
            // Save state before redirect
            const stateToSave = {
                phase: "NETWORK",
                phone,
                profile
            };
            localStorage.setItem('temp_onboarding_state', JSON.stringify(stateToSave));

            const { SplitwiseService } = await import("@/services/splitwise");
            const { url, oauth_token_secret } = await SplitwiseService.getAuthUrl();
            localStorage.setItem('splitwise_temp_secret', oauth_token_secret);
            window.location.href = url;
        } catch (e) {
            console.error("Sync failed", e);
            alert("Failed to initiate Splitwise Sync");
        }
    };

    const handleLaunch = () => {
        localStorage.removeItem('temp_onboarding_state');
        onComplete({ ...profile, splitwiseConnected });
    };


    // --- RENDER HELPERS ---

    if (phase === "BOOT") {
        return (
            <div className="stealth-container">
                <div className="grid-pattern"></div>
                <div style={{ zIndex: 10, textAlign: 'center' }}>
                    <div className="text-emerald animate-pulse-slow font-mono text-sm tracking-widest mb-4">
                        {'>'} INITIALIZING_SYSTEM...
                    </div>
                    <div className="h-1 w-32 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[width_2s_ease-out_forwards]" style={{ width: '0%', animationName: 'growWidth' }}></div>
                    </div>
                </div>
                <style jsx>{`
            @keyframes growWidth { to { width: 100%; } }
         `}</style>
            </div>
        );
    }

    return (
        <div className="stealth-container">
            <div className="grid-pattern"></div>

            <div className="card-terminal fade-in">
                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-stealth)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
                        <Terminal size={16} />
                        <span className="font-mono text-xs tracking-widest uppercase">Secure Uplink v1.0</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <div className="w-2 h-2 bg-zinc-700 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-zinc-700 rounded-full"></div>
                    </div>
                </div>

                {/* --- PHASE 1: TREASURY --- */}
                {phase === 'TREASURY' && (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Link Treasury</h1>
                            <p className="text-muted text-sm font-mono">Enter Anumati AA Handle to stream transactions.</p>
                        </div>

                        <div className="input-terminal-wrapper group">
                            <span className="input-chevron">{'>'}</span>
                            <input
                                type="text"
                                placeholder="9827250609@aa"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input-terminal"
                                autoFocus
                            />
                            <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center', paddingRight: '0.5rem', pointerEvents: 'none' }}>
                                <span className="cursor-blink"></span>
                            </div>
                        </div>

                        <button
                            onClick={handleAuthenticate}
                            className="btn-stealth"
                            disabled={isAuthenticating}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
                                {isAuthenticating ? "ESTABLISHING HANDSHAKE..." : "AUTHENTICATE"}
                                {!isAuthenticating && <ArrowRight size={16} />}
                            </div>
                        </button>

                        {/* LOG STREAM */}
                        {streamData.length > 0 && (
                            <div className="mt-6 font-mono text-[10px] space-y-1">
                                {streamData.map((log, i) => (
                                    <p key={i} className="text-dim">
                                        {log.label}: <span className="text-emerald">{log.value}</span>
                                    </p>
                                ))}
                            </div>
                        )}
                    </>
                )}


                {/* --- PHASE 2: PILOT PROFILE --- */}
                {phase === 'PROFILE' && (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Pilot Identity</h1>
                            <p className="text-muted text-sm font-mono">Configure operations profile.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="text-xs font-mono text-dim uppercase mb-1 block">Alias</label>
                                <div className="input-terminal-wrapper" style={{ marginBottom: 0 }}>
                                    <span className="input-chevron"><User size={14} /></span>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        placeholder="CALLSIGN"
                                        className="input-terminal"
                                        style={{ fontSize: '1rem', paddingLeft: '2rem' }}
                                    />
                                </div>
                            </div>

                            {/* Household */}
                            <div>
                                <label className="text-xs font-mono text-dim uppercase mb-2 block">Unit Type</label>
                                <div className="grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <button
                                        onClick={() => setProfile({ ...profile, household: "SOLO" })}
                                        className={`btn-outline-stealth ${profile.household === 'SOLO' ? 'active' : ''}`}
                                    >
                                        SOLO
                                    </button>
                                    <button
                                        onClick={() => {
                                            setProfile({ ...profile, household: "SHARED" });
                                            setTimeout(() => setPhase("NETWORK"), 400);
                                        }}
                                        className={`btn-outline-stealth ${profile.household === 'SHARED' ? 'active' : ''}`}
                                    >
                                        SHARED
                                    </button>
                                </div>
                            </div>

                            {profile.household === 'SOLO' && (
                                <button
                                    onClick={() => setTimeout(() => setPhase("NETWORK"), 200)}
                                    className="btn-stealth"
                                    style={{ marginTop: '3rem' }}
                                >
                                    CONFIRM
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* --- PHASE 3: NETWORK BRIDGE --- */}
                {phase === 'NETWORK' && (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Network Sync</h1>
                            <p className="text-muted text-sm font-mono">Ledger resolution required.</p>
                        </div>

                        <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-stealth)', borderRadius: '6px', padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="text-sm font-mono text-muted">Splitwise Status:</span>
                                <span className={`text-xs font-mono uppercase ${splitwiseConnected ? 'text-emerald' : 'text-dim'}`}>
                                    {splitwiseConnected ? '[ ONLINE ]' : '[ OFFLINE ]'}
                                </span>
                            </div>
                        </div>

                        {!splitwiseConnected ? (
                            <>
                                <button
                                    onClick={handleConnectSplitwise}
                                    className="btn-outline-stealth"
                                    style={{ width: '100%', borderColor: 'var(--border-stealth)', color: 'white' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Users size={14} />
                                        ESTABLISH LINK
                                    </div>
                                </button>
                                <button
                                    onClick={handleLaunch}
                                    className="text-xs font-mono text-dim hover:text-white transition-colors mt-4 mx-auto block"
                                    style={{ opacity: 0.6 }}
                                >
                                    [ BYPASS LINK ]
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="font-mono text-[10px] text-zinc-600 space-y-1">
                                    <p className="text-dim">{'>'} Found: <span className="text-white">Sarah (Roommate)</span></p>
                                    <p className="text-dim">{'>'} Found: <span className="text-white">John (Roommate)</span></p>
                                </div>
                                <button
                                    onClick={handleLaunch}
                                    className="btn-stealth"
                                >
                                    INITIALIZE DASHBOARD
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}
