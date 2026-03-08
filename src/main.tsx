import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { SEOProvider } from "./seo/SEOProvider.tsx";
import { ThemeProvider } from "./theme/ThemeProvider.tsx";
import "./index.css";
import "./styles/theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <SEOProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </SEOProvider>
    </ErrorBoundary>
  </StrictMode>,
);
