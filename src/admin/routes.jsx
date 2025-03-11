import { createHashRouter } from "react-router-dom";
import Settings from "./pages/settings";
import ErrorPage from "./pages/error/Error";

import Chat from "./pages/chat";


export const router = createHashRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Chat />,
      },
     
      {
        path: "settings",
        element: <Settings />,
      },
     
    ],
  },
]);
