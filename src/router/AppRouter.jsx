import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";

function AppRouter() {
  return (
    <BrowserRouter>
      <div>
        {/* <nav>
          <Link to="/"> Register </Link>
          <Link to="/login">Login</Link>
        </nav> */}

        <Routes>
          <Route path="/" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
