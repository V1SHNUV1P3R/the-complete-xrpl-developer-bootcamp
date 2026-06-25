import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./pages/Main";
import Send from "./pages/Send";
import ManageAccount from "./pages/ManageAccount";
import ImportAccount from "./pages/ImportAccount";
import GenerateAccount from "./pages/GenerateAccount";
import { ToastContainer } from "./components/Toast";

const routes = [
  { path: "/", element: <Main /> },
  { path: "/send", element: <Send /> },
  { path: "/manage-account", element: <ManageAccount /> },
  { path: "/import-account", element: <ImportAccount /> },
  { path: "/generate-account", element: <GenerateAccount /> },
];

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Header />
      <main>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={element}
            />
          ))}
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
