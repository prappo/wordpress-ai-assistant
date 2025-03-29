import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ThemeProvider } from "@/components/theme-provider"
import { ModelInstanceProvider } from "@/contexts/ModelInstanceContext";

const el = document.getElementById("myplugin");

if (el) {
  ReactDOM.createRoot(el).render(
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ModelInstanceProvider>
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>
      </ModelInstanceProvider>
    </ThemeProvider>,
  );
}
