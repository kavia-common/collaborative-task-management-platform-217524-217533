import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Boards from "./pages/Boards";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { PresenceProvider } from "./contexts/PresenceContext";
import { DemoProvider } from "./contexts/DemoContext";

// PUBLIC_INTERFACE
function App() {
  /**
   * App root with providers and router.
   */
  return (
    <AuthProvider>
      <DemoProvider>
        <PresenceProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<div role="region" aria-label="Welcome" style={{ padding: 12 }}>Welcome to TaskBoards. Use the navigation to access Boards and Calendar.</div>} />
                <Route path="/login" element={<Login />} />
                <Route path="/boards" element={<ProtectedRoute><Boards /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </PresenceProvider>
      </DemoProvider>
    </AuthProvider>
  );
}

export default App;
