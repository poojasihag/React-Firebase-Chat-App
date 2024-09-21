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
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { fetchUserInfo } = useUserStore();
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
    showLoader();
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (!avatar || !avatar.file) {
        throw new Error("Please select an avatar.");
      }
      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      fetchUserInfo(res.user.uid);

      toast.success("Account created! You can login now!");
    } catch (error) {
      console.log(error);
      
      toast.error(error.message);
    } finally {
      hideLoader();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    showLoader();

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      fetchUserInfo(user.user.uid);
    } catch (error) {

      toast.error(error.message);
    } finally {
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
    <section className="flex-1  bg-transparent min-h-full flex box-border justify-center items-center">
      <div className="bg-blue-950 rounded-2xl flex w-full h-full p-5 items-center">
        <div className="md:w-1/2 px-8">
          {isLogin ? (
            <>
              {/* Login Form */}
              <h2 className="font-bold text-3xl text-white">Login</h2>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  className="p-2 mt-8 rounded-xl border"
                  type="email"
                  name="email"
                  placeholder="Email"
                />
                <div className="relative">
                  <input
                    className="p-2 rounded-xl border w-full"
                    type={showPassword ? "text" : "password"} // Change input type based on state
                    name="password"
                    placeholder="Password"
                  />
                  {/* Password toggle */}
                  <svg
                    onClick={togglePasswordVisibility} // Call toggle function on click
                    className="bi bi-eye absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer z-20"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="gray"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"></path>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"></path>
                  </svg>
                  {/* Optionally add an eye slash icon for when the password is visible */}
                  {showPassword && (
                    <svg
                      onClick={togglePasswordVisibility} // Call toggle function on click
                      className="bi bi-eye-slash-fill absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer z-20"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="gray"
                      viewBox="0 0 16 16"
                    >
                      <path d="M10.79 12.912l-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"></path>
                      <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"></path>
                    </svg>
                  )}
                </div>
                <button
                  className="bg-[#002D74] text-white py-2 rounded-xl hover:scale-105 duration-300 hover:bg-[#206ab1] font-medium"
                >
                  Login
                </button>
              </form>

              <div className="hidden mt-10 text-sm border-b border-gray-500 py-5">
                Forgot password?
              </div>

              <div className="mt-4 text-sm flex justify-between items-center">
                <p>If you don't have an account...</p>
                <button
                  onClick={toggleForm}
                  className="bg-[#002D74] text-white p-1 px-2 rounded-xl hover:bg-[#002c7424] hover:scale-110 font-semibold duration-300"
                >
                  Signup
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Signup Form */}
              <h2 className="font-bold text-3xl text-white mb-3">Signup</h2>
              

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <label htmlFor="file" className="block mb-4">
                  <img
                    src={avatar.url || "./avatar.png"}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full mx-auto"
                  />
                  <span className="block text-center text-blue-500">
                    Upload an Image
                  </span>
                  <input
                    type="file"
                    id="file"
                    style={{ display: "none" }}
                    onChange={handleAvatar}
                  />
                </label>
                <input
                  className="p-2 mt-8 rounded-xl border "
                  type="text"
                  name="username"
                  placeholder="Username"
                />
                <input
                  className="p-2 mt-4 rounded-xl border"
                  type="email"
                  name="email"
                  placeholder="Email"
                />
                <div className="relative">
                  <input
                    className="p-2 rounded-xl border w-full"
                    type={showPassword ? "text" : "password"} // Change input type based on state
                    name="password"
                    placeholder="Password"
                  />
                  {/* Password toggle */}
                  <svg
                    onClick={togglePasswordVisibility} // Call toggle function on click
                    className="bi bi-eye absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer z-20"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="gray"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"></path>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"></path>
                  </svg>
                  {/* Optionally add an eye slash icon for when the password is visible */}
                  {showPassword && (
                    <svg
                      onClick={togglePasswordVisibility} // Call toggle function on click
                      className="bi bi-eye-slash-fill absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer z-20"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="gray"
                      viewBox="0 0 16 16"
                    >
                      <path d="M10.79 12.912l-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"></path>
                      <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"></path>
                    </svg>
                  )}
                </div>
                <button
                  className="bg-[#002D74] text-white py-2 rounded-xl hover:scale-105 duration-300 hover:bg-[#206ab1] font-medium"
                >
                  Signup
                </button>
              </form>

              <div className="mt-10 text-sm border-b border-gray-500 py-5">
                Already have an account?
              </div>

              <div className="mt-4 text-sm flex justify-between items-center">
                <p>Go back to login...</p>
                <button
                  onClick={toggleForm}
                  className="bg-[#002D74] text-white py-2 px-5 rounded-xl hover:bg-[#002c7424] hover:scale-110 font-semibold duration-300"
                >
                  Login
                </button>
              </div>
            </>
          )}
        </div>
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl max-h-[1600px]"
            src="https://images.unsplash.com/photo-1552010099-5dc86fcfaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxmcmVzaHxlbnwwfDF8fHwxNzEyMTU4MDk0fDA&ixlib=rb-4.0.3&q=80&w=1080"
            alt="login form image"
          />
        </div>
      </div>
    </section>
  );
};

export default Login;
// return (
//   <div className="login">
//     <div className="item">
//       <h2>Welcome back</h2>
//       <form onSubmit={handleLogin}>
//         <input type="text" placeholder="Email" name="email" />
//         <input type="password" placeholder="Password" name="password" />
//         <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
//       </form>
//     </div>
//     <div className="separator"></div>
//     <div className="item">
//       <h2>Create an Account</h2>
//       <form onSubmit={handleRegister}>
//         <label htmlFor="file">
//           <img src={avatar.url || "./avatar.png"} />
//           Upload an image
//         </label>
//         <input
//           type="file"
//           id="file"
//           style={{ display: "none" }}
//           onChange={handleAvatar}
//         />
//         <input type="text" placeholder="Username" name="username" />
//         <input type="text" placeholder="Email" name="email" />
//         <input type="password" placeholder="Password" name="password" />
//         <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
//       </form>
//     </div>
//   </div>
// );
