/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Practice from "@/pages/Practice";
import Scan from "@/pages/Scan";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import ActivityDetails from "@/pages/ActivityDetails";
import Activities from "@/pages/Activities";
import Login from "@/pages/Login";
import { useUser } from "@/context/UserContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="practice" element={<Practice />} />
          <Route path="scan" element={<Scan />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="activities" element={<Activities />} />
          <Route path="activity/:id" element={<ActivityDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
