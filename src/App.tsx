import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CheckIn from "./pages/CheckIn";
import KeyResultDetails from "./pages/KeyResultDetails";
import InitiativeDetails from "./pages/InitiativeDetails";
import Archive from "./pages/Archive";
import KeyResultEdit from "./pages/KeyResultEdit";
import InitiativeEdit from "./pages/InitiativeEdit";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/check-in" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
          <Route path="/key-results/:id" element={<ProtectedRoute><KeyResultDetails /></ProtectedRoute>} />
          <Route path="/key-results/:id/edit" element={<ProtectedRoute><KeyResultEdit /></ProtectedRoute>} />
          <Route path="/initiatives/:id" element={<ProtectedRoute><InitiativeDetails /></ProtectedRoute>} />
          <Route path="/initiatives/:id/edit" element={<ProtectedRoute><InitiativeEdit /></ProtectedRoute>} />
          <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default App;
