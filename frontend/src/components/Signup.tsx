import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../recoil/recoil";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { z } from "zod";
import '../design/Signup.css'

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});


const Signup = () => {
  const [darkMode, setDarkMode] = useState(true);
  const isAuth = useRecoilValue(isAuthenticated);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(()=>{
    if(isAuth){
        navigate('/home');
    }
  },[isAuth])

  const handleSignup = async ()=>{
      if(!username || !password || !email){
        alert('Name, Email and Password are compulsory.');
        return;
      }

      const data = {
        name:username,
        email,
        password,
      };

      const result = registerSchema.safeParse(data);
      if (!result.success) {
        alert(result.error.issues.map((issue) => issue.message).join("\n"));
        return;
      }

      const formData = new FormData();
      formData.append('name',username);
      formData.append('email',email);
      formData.append('password',password);
      if(image){
        formData.append('profilePic',image);
      }
      try{
        setLoading(true);
        const response = await axios.post('https://tracks-2qce.onrender.com/api/users/register',formData,  {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if(response.status === 200){
          localStorage.setItem('token',response.data.token);
          navigate("/");
          toast.success("Signup Successful!", {
            className: "custom-toast",
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
          });
        }
      }
      catch(e){
        setLoading(false);
        if((e as unknown as any).status === 409){
          alert('User already exists with this email');
          return;
        }
        console.log('Error occurred',e);
        toast.error("Something went wrong! Please try later", {
          className: "custom-error-toast",
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
  }

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
        <div style={{ fontSize: "36px" }}>Create an account 🚀</div>
        <p style={{ fontSize: "1rem", marginBottom: "20px" }}>
          Join us and start your journey
        </p>

        <div style={{ width: "100%", maxWidth: "300px" }}>
          <label style={{ fontSize: "0.9rem" }}>Name</label>
          <input
            type="text"
            value={username}
            style={{
              width: "100%",
              padding: "10px",
              margin: "5px 0 15px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: darkMode ? "#222" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
            placeholder="Your name"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            required
          />

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
            }}
            placeholder="example@xyz.com"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />

          <label style={{ fontSize: "0.9rem" }}>Password</label>
          <input
            type="password"
            value={password}
            style={{
              width: "100%",
              padding: "10px",
              margin: "5px 0 10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: darkMode ? "#222" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
            placeholder="At least 8 characters"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
          />

          <label style={{ fontSize: "0.9rem" }}>Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                setImage(e.target.files[0]);
              }
            }}
            style={{
              width: "100%",
              padding: "10px",
              margin: "5px 0 15px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: darkMode ? "#222" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
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
            onClick={(e) => {
              e.preventDefault();
              handleSignup();
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor =
                "#0056b3")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLAnchorElement).style.backgroundColor =
                "#007bff")
            }
          >
            Sign up
          </button>

          <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#007bff",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.textDecoration =
                  "underline")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.textDecoration = "none")
              }
            >
              Sign in
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

export default Signup;
