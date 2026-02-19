/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI?: {
      selectFolder: () => Promise<string | null>;
      runBat: (batContent: string) => Promise<{
        success: boolean;
        output: string;
        exitCode: number;
        hadErrors: boolean;
      }>;
      onBatOutput: (callback: (data: string) => void) => () => void;
    };
  }
}

export {};
