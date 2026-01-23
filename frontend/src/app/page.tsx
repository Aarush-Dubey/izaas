"use client";
import { useState, useEffect } from "react";
import { C1Chat, ThemeProvider } from "@thesysai/genui-sdk";
import Onboarding from "@/components/Onboarding";
import Header from "@/components/Header";
import UploadButton from "@/components/UploadButton";

const stealthTheme = {
  // ColorTheme
  backgroundFills: "#09090b", // Zinc 950
  containerFills: "rgba(24, 24, 27, 0.8)", // Zinc 900 (Glass)
  overlayFills: "rgba(0, 0, 0, 0.8)",
  elevatedFills: "#18181b", // Zinc 900
  sunkFills: "#000000",

  primaryText: "#f4f4f5", // Zinc 100
  secondaryText: "#a1a1aa", // Zinc 400
  disabledText: "#52525b", // Zinc 600
  accentPrimaryText: "#10b981", // Emerald 500
  linkText: "#10b981",

  interactiveDefault: "#27272a", // Zinc 800
  interactiveHover: "#3f3f46", // Zinc 700
  interactivePressed: "#18181b", // Zinc 900
  interactiveAccent: "#10b981", // Emerald 500
  interactiveAccentHover: "#059669", // Emerald 600

  strokeDefault: "#27272a", // Zinc 800
  strokeAccent: "#10b981", // Emerald 500

  chatContainerBg: "transparent",
  chatAssistantResponseBg: "transparent",
  chatUserResponseBg: "#27272a", // Zinc 800

  // TypographyTheme
  fontBody: '"JetBrains Mono", monospace',
  fontBodyHeavy: '"JetBrains Mono", monospace',
  fontHeadingLarge: '"Inter", sans-serif',
  fontHeadingMedium: '"Inter", sans-serif',
  fontHeadingSmall: '"Inter", sans-serif',

  // LayoutTheme
  roundedS: "2px",
  roundedM: "2px",
  roundedL: "4px",
  roundedXl: "4px",
  rounded2xl: "4px",
  rounded3xl: "4px",
  roundedClickable: "2px",
};

export default function Home() {
  const [dashboardReady, setDashboardReady] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProfile = localStorage.getItem("royal_pilot_profile");
    if (storedProfile) {
      setUserData(JSON.parse(storedProfile));
      setDashboardReady(true);
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (data: any) => {
    localStorage.setItem("royal_pilot_profile", JSON.stringify(data));
    setUserData(data);
    setDashboardReady(true);
  };

  if (isLoading) {
    return <div className="stealth-container"><div className="grid-pattern"></div></div>; // Simple loading state
  }

  if (!dashboardReady) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="stealth-container">
      <div className="grid-pattern"></div>
      {/* We can pass userData to the context or as initial context to the chat if supported, 
            or just let the user see the visual transition for now. 
            For the demo, we assume the backend handles the context or we hardcode the first message 
            via a hidden prompt mechanism if we had one, but standard C1Chat is simple. 
            We will start a fresh chat.
        */}
      <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
        <Header
          onNewSession={() => window.location.reload()}
          onNavigate={(view: string) => console.log("Navigate to", view)}
          user={userData}
        />
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <ThemeProvider theme={stealthTheme as any}>
            <C1Chat
              apiUrl="/api/chat"
              agentName="iZaas"
              formFactor="full-page"
              processMessage={async ({ messages, threadId, responseId }) => {
                const lastMessage = messages[messages.length - 1];
                const context = localStorage.getItem('splitwise_context');

                const res = await fetch('/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    prompt: lastMessage,
                    threadId,
                    responseId,
                    context: context || undefined
                  })
                });
                return res;
              }}
            />
          </ThemeProvider>
          {/* Upload Button overlaid near the input area */}
          <div style={{
            position: 'absolute',
            bottom: '26px',
            left: '20px',
            zIndex: 9999
          }}>
            <UploadButton />
          </div>
        </div>
      </div>
    </div>
  );
}
