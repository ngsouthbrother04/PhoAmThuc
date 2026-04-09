import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "./hooks/useLanguageContext";
import { ToastProvider } from "./hooks/useToast";
import Toast from "./components/Toast";
createRoot(document.getElementById("root")).render(
  <StrictMode>
      <ToastProvider>
    <LanguageProvider>
      <BrowserRouter>
        <App />
                <Toast />
      </BrowserRouter>
    </LanguageProvider>
    </ToastProvider>
  </StrictMode>,
);
