"use client";
import { useState, useEffect } from "react";
import { C1Chat, ThemeProvider } from "@thesysai/genui-sdk";
import Onboarding from "@/components/Onboarding";
import Header from "@/components/Header";

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
      <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}>
        <Header
          onNewSession={() => window.location.reload()}
          onNavigate={(view: string) => console.log("Navigate to", view)}
          user={userData}
        />
        <ThemeProvider theme={stealthTheme as any}>
          <C1Chat
            apiUrl="/api/chat"
            agentName="Finance Co-Pilot"
            formFactor="full-page"
            processMessage={async ({ messages, threadId, responseId }) => {
              const lastMessage = messages[messages.length - 1];

              // Optimize context to prevent payload too large errors / server crashes
              const getOptimizedContext = (rawJson: string | null) => {
                if (!rawJson) return undefined;
                try {
                  const data = JSON.parse(rawJson);
                  // Assuming Splitwise structure usually has an 'expenses' array
                  if (data && data.expenses && Array.isArray(data.expenses)) {
                    // Keep only the most recent 20 expenses to reduce payload size
                    // Splitwise API usually returns newest first? If not, we take slice(0, 20).
                    // If the array is massive, this significantly reduces size.
                    const truncatedExpenses = data.expenses.slice(0, 20);
                    return JSON.stringify({
                      ...data,
                      expenses: truncatedExpenses,
                      _meta: "Context automatically truncated at client to prevent network errors."
                    });
                  }
                  // Fallback for other structures or huge strings
                  if (rawJson.length > 50000) {
                    return rawJson.substring(0, 50000) + "... [truncated]";
                  }
                  return rawJson;
                } catch (e) {
                  console.warn("Failed to parse/optimize context JSON", e);
                  // If parsing fails, safer to not send potentially garbage massive string
                  return undefined;
                }
              };

              const rawContext = localStorage.getItem('splitwise_context');
              const optimizedContext = getOptimizedContext(rawContext);

              const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prompt: lastMessage,
                  threadId,
                  responseId,
                  context: optimizedContext
                })
              });
              return res;
            }}
          />
        </ThemeProvider>
      </div>
    </div>
  );
}
