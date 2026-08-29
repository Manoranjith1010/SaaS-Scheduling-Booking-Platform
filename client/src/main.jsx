import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles.css";

import App from "./App";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/checkout/success", element: <CheckoutSuccess /> },
  { path: "/checkout/cancel", element: <CheckoutCancel /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
