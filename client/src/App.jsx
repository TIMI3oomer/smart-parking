import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { useAuth } from "./context/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;