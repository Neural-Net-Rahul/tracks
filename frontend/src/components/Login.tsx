import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../recoil/recoil";
import { useRecoilValue } from "recoil";
import { z } from "zod"
import axios from "axios";
import {toast} from 'react-toastify';
import '../design/Login.css'

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const Login = () => {
  const [darkMode, setDarkMode] = useState(true);
  const isAuth = useRecoilValue(isAuthenticated);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if(!email || !password){
      alert("Email and password are compulsory");
      return;
    }
    const data = {
      email,
      password,
    };

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      alert(result.error.issues.map((issue) => issue.message).join("\n"));
      return;
    }

    try{
      setLoading(true);
      const response = await axios.post('https://tracks-2qce.onrender.com/api/users/login',{email, password});
      if(response.status === 200){
        localStorage.setItem('token',response.data.token);
        navigate("/");
        toast.success("Login Successful!", {
          className: "custom-toast",
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    }
    catch(e:any){
      setLoading(false);
      alert(e.response.data.message);
    }
  }

    const generateRandomPassword = (length = 12) => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(()=>{
    if(isAuth){
      navigate('/home');
    }
  },[isAuth])

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: darkMode ? "#121212" : "#f8f9fa",
        color: darkMode ? "#ffffff" : "#333",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Left Half */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
          fontFamily: "Outfit",
          position: "relative",
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            padding: "8px 15px",
            borderRadius: "20px",
            backgroundColor: darkMode ? "#f1c40f" : "#34495e",
            color: darkMode ? "#000" : "#fff",
            fontSize: "0.9rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s ease, color 0.3s ease",
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <div style={{ fontSize: "36px" }}>Welcome back 👋</div>
        <p style={{ fontSize: "1rem", marginBottom: "20px" }}>
          Sign in to start managing your tracks
        </p>

        <div style={{ width: "100%", maxWidth: "300px" }}>
          <label style={{ fontSize: "0.9rem" }}>Email</label>
          <input
            type="email"
            value={email}
            style={{
              width: "100%",
              padding: "10px",
              margin: "5px 0 15px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: darkMode ? "#222" : "#fff",
              color: darkMode ? "#fff" : "#000",
              transition: "border-color 0.3s",
            }}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="example@xyz.com"
            onFocus={(e) => (e.target.style.borderColor = "#007bff")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />

          <label style={{ fontSize: "0.9rem" }}>Password</label>
          <input
            type="password"
            value={password}
            style={{
              width: "100%",
              padding: "10px",
              margin: "5px 0 15px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: darkMode ? "#222" : "#fff",
              color: darkMode ? "#fff" : "#000",
              transition: "border-color 0.3s",
            }}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="At least 8 characters"
            onFocus={(e) => (e.target.style.borderColor = "#007bff")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />

          <button
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "25px",
              backgroundColor: "#007bff",
              color: "#fff",
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor =
                "#0056b3")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLAnchorElement).style.backgroundColor =
                "#007bff")
            }
            onClick={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            Sign In
          </button>

          <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#007bff",
                textDecoration: "none",
                transition: "text-decoration 0.3s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.textDecoration =
                  "underline")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.textDecoration = "none")
              }
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {loading && <div className="loader"></div>}

      {/* Right Half */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "url('https://images.pexels.com/photos/8422252/pexels-photo-8422252.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          margin: "20px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      ></div>
    </div>
  );
};

export default Login;
