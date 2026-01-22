"use client";

import { C1Chat } from "@thesysai/genui-sdk";
import { ThemeProvider, themePresets } from "@crayonai/react-ui";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ThemeProvider {...themePresets.candy}>
      <div className="h-screen w-full bg-background">
        <C1Chat
          apiUrl="http://127.0.0.1:8000/ai_c1/chat"
          agentName="Finance Co-Pilot"
        />
      </div>
    </ThemeProvider>
  );
}
