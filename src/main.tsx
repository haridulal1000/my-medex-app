import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import { queryClient } from "@query/client";
import "./styles/global.scss";

const theme = createTheme({
  palette: {
    primary: { main: "#0b69ff" },
    background: { default: "#f7f8fa" },
  },
  shape: { borderRadius: 10 },
});

const root = ReactDOM.createRoot(document.getElementById("root")!);

function render(): void {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

async function enableMocking(): Promise<void> {
  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
  });
}

enableMocking()
  .then(render)
  .catch((err) => {
    // Render the app even if MSW failed — the API calls will fail
    // naturally and the user sees the error state with a retry, instead
    // of a blank page.
    console.error("[main] Failed to start mock API — rendering anyway", err);
    render();
  });
