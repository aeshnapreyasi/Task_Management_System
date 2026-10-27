
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";
import ProjectPage from "../components/ProjectPage";
import DirectAccessGuard from "../components/DirectAccessGaurd";

function AppRouter() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />

          {/* Protect dashboard */}
          <Route element={<DirectAccessGuard />}>
            <Route path="/dashboard" element={<ProjectPage />} />
          </Route>

          {/* Redirect unknown URLs to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
