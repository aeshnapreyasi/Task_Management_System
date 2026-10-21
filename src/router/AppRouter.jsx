import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";
import ProjectPage from "../components/ProjectPage";
import DirectAccessGuard from "../components/DirectAccessGaurd"; // NEW: Import guard

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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function NotFoundRedirect() {
  return <Navigate to = "/dashboard" replace />;
  <Route path="*" element = {<NotFoundRedirect />} />
  
}

export default AppRouter;