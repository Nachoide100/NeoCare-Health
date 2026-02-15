import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import BoardView from "./pages/BoardView";
import Report from "./pages/Report";
import Extras from "./pages/Extras";
import Header from "./components/Header";

function AppContent() {
  const location = useLocation();

  // Ocultar header en login
  const hideHeader = location.pathname === "/";

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/board" element={<BoardView />} />
        <Route path="/report" element={<Report />} />
        <Route path="/extras" element={<Extras />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;






