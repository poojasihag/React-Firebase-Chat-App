import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { useLoader } from "../../lib/LoaderProvider";
import { useUserStore } from "../../lib/userStore";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const { showLoader, hideLoader } = useLoader();
  const { fetchUserInfo } = useUserStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    // Form Validation
    if (!username || !email || !password) {
      toast.error("Please fill out all fields!");
      return;
    }

    if (!avatar.file) {
      toast.error("Please upload an avatar image!");
      return;
    }

    setIsSubmitting(true);
    showLoader();

    try {
      // 1. Compress the image to base64 (instant, no network)
      const imgUrl = await upload(avatar.file);

      // 2. Create auth user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 3. Write Firestore documents immediately
      await Promise.all([
        setDoc(doc(db, "users", res.user.uid), {
          username,
          email,
          avatar: imgUrl,
          id: res.user.uid,
          blocked: [],
        }),
        setDoc(doc(db, "userchats", res.user.uid), {
          chats: [],
        }),
      ]);

      // Explicitly fetch user info to trigger navigation
      await fetchUserInfo(res.user.uid);
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    if (!email || !password) {
      toast.error("Please enter email and password!");
      return;
    }

    setIsSubmitting(true);
    showLoader();

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // Explicitly fetch user info to update Zustand state immediately
      // This ensures navigation happens even if onAuthStateChanged has timing issues
      await fetchUserInfo(res.user.uid);
      toast.success("Welcome back!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="loginContainer">
      {/* Left Splash Pane: Styled like the mockup middle splash screen */}
      <div className="splashPane">
        <h1 className="splashLogo">Chattie</h1>
        
        {/* SVG Illustration of two people chatting on a globe */}
        <div className="splashIllustration">
          <svg viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {/* Background elements */}
            <circle cx="250" cy="280" r="130" fill="#EADCF2" opacity="0.4" />
            <circle cx="250" cy="280" r="110" fill="#8E82B2" opacity="0.8" />
            
            {/* Earth lines details */}
            <path d="M140 280 H360" stroke="#7C729D" strokeWidth="2" opacity="0.3" />
            <path d="M150 240 C 200 270, 300 270, 350 240" fill="none" stroke="#7C729D" strokeWidth="2" opacity="0.3" />
            <path d="M150 320 C 200 290, 300 290, 350 320" fill="none" stroke="#7C729D" strokeWidth="2" opacity="0.3" />
            <path d="M250 170 C 220 220, 220 340, 250 390" fill="none" stroke="#7C729D" strokeWidth="2" opacity="0.3" />
            <path d="M250 170 C 280 220, 280 340, 250 390" fill="none" stroke="#7C729D" strokeWidth="2" opacity="0.3" />

            {/* Left Character (Coral) */}
            <g transform="translate(140, 210)">
              {/* Body/Coat */}
              <path d="M40 70 L15 130 H75 L50 70 Z" fill="#EB8B8E" />
              {/* Pants */}
              <rect x="25" y="130" width="12" height="35" rx="3" fill="#FFFFFF" />
              <rect x="43" y="130" width="12" height="35" rx="3" fill="#FFFFFF" />
              {/* Shoes */}
              <ellipse cx="31" cy="165" rx="10" ry="5" fill="#EADCF2" />
              <ellipse cx="49" cy="165" rx="10" ry="5" fill="#EADCF2" />
              {/* Face/Head */}
              <circle cx="40" cy="40" r="18" fill="#F8C3B1" />
              {/* Hair */}
              <path d="M22 40 C 22 20, 58 20, 58 40 C 58 28, 22 28, 22 40" fill="#635985" />
              <rect x="28" y="24" width="24" height="12" rx="4" fill="#635985" />
              {/* Arm/Phone */}
              <path d="M45 80 Q 75 90 60 110" fill="none" stroke="#F8C3B1" strokeWidth="8" strokeLinecap="round" />
              <rect x="58" y="105" width="8" height="14" rx="2" fill="#2D253D" transform="rotate(-15 58 105)" />
            </g>

            {/* Right Character (Pink hair sitting) */}
            <g transform="translate(280, 215)">
              {/* Legs sitting */}
              <rect x="10" y="115" width="14" height="50" rx="3" fill="#FFFFFF" transform="rotate(30 10 115)" />
              <rect x="25" y="110" width="14" height="50" rx="3" fill="#FFFFFF" transform="rotate(15 25 110)" />
              {/* Shoes */}
              <ellipse cx="43" cy="160" rx="9" ry="5" fill="#EADCF2" />
              <ellipse cx="28" cy="162" rx="9" ry="5" fill="#EADCF2" />
              {/* Body */}
              <path d="M10 65 L-10 120 H50 L30 65 Z" fill="#DF7679" />
              {/* Face/Head */}
              <circle cx="20" cy="35" r="18" fill="#F8C3B1" />
              {/* Hair */}
              <path d="M2 35 C 2 12, 38 12, 38 35 C 38 45, 2 45, 2 35" fill="#EB8B8E" />
              <path d="M10 18 Q 30 18 32 30" fill="none" stroke="#EB8B8E" strokeWidth="6" strokeLinecap="round" />
              {/* Arm/Phone */}
              <path d="M20 75 Q -5 95 10 115" fill="none" stroke="#F8C3B1" strokeWidth="8" strokeLinecap="round" />
              <rect x="5" y="108" width="12" height="6" rx="1" fill="#FFFFFF" transform="rotate(30 5 108)" />
            </g>

            {/* Speech bubbles */}
            <path d="M210 150 C 210 130, 240 130, 240 150 C 240 160, 210 160, 210 150 Z" fill="#FFFFFF" />
            <path d="M280 130 C 280 110, 310 110, 310 130 C 310 140, 280 140, 280 130 Z" fill="#FFFFFF" opacity="0.8" />
            <rect x="215" y="138" width="20" height="4" rx="2" fill="#8E82B2" />
            <rect x="215" y="146" width="12" height="4" rx="2" fill="#8E82B2" />
            <rect x="285" y="118" width="20" height="4" rx="2" fill="#EB8B8E" />
          </svg>
        </div>
        
        <p className="splashText">
          A world without communication is meaningless. So, you have to message everyone now!
        </p>
      </div>

      {/* Right Auth Pane */}
      <div className="authPane">
        <div className="authCard">
          {isLogin ? (
            <>
              <h2 className="authTitle">Welcome Back</h2>
              <p className="authSubtitle">Connect with friends instantly</p>

              <form onSubmit={handleLogin} className="authForm">
                <div className="inputGroup">
                  <span className="inputIcon">✉</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="authInput"
                  />
                </div>
                
                <div className="inputGroup">
                  <span className="inputIcon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="authInput"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="passwordToggle"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <button type="submit" className="authButton" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Start Messaging"}
                </button>
              </form>

              <div className="authFooter">
                <span>New to Chattie?</span>
                <button onClick={toggleForm} className="switchBtn">
                  Create an account
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="authTitle">Create Account</h2>
              <p className="authSubtitle">Get started in minutes</p>

              <form onSubmit={handleRegister} className="authForm">
                {/* Avatar Uploader */}
                <div className="avatarUploadGroup">
                  <label htmlFor="file" className="avatarLabel">
                    <div className="avatarPreviewWrapper">
                      <img
                        src={avatar.url || "./avatar.png"}
                        alt="Avatar"
                        className="avatarPreview"
                      />
                      <div className="avatarOverlay">
                        <span className="plusIcon">+</span>
                      </div>
                    </div>
                    <span className="avatarLabelText">Upload Photo</span>
                  </label>
                  <input
                    type="file"
                    id="file"
                    style={{ display: "none" }}
                    onChange={handleAvatar}
                    accept="image/*"
                  />
                </div>

                <div className="inputGroup">
                  <span className="inputIcon">👤</span>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="authInput"
                  />
                </div>

                <div className="inputGroup">
                  <span className="inputIcon">✉</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="authInput"
                  />
                </div>

                <div className="inputGroup">
                  <span className="inputIcon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="authInput"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="passwordToggle"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <button type="submit" className="authButton" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <div className="authFooter">
                <span>Already have an account?</span>
                <button onClick={toggleForm} className="switchBtn">
                  Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
