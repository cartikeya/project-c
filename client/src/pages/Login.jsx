import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  // Toggles between the Login and Sign Up screens
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // const endpoint = isLogin ? "/login" : "/register";

    // const payload = isLogin ? { email, password } : { name, email, password };

    // try {
    //   const response = await fetch(`http://localhost:3001${endpoint}`, {
    //     method: "POST",
    //     headers:{
    //       "Content-Type"
    //     }
    //   });
    // } catch (error) {}

    // NOTE: This is a placeholder! We will wire this up to the Express REST API next.
    console.log("Form Submitted:", { isLogin, name, email, password });

    // For now, bypass authentication and jump straight to the dashboard to test the routing
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center p-6 text-[#1d1d1f]">
      <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-md w-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        {/* Header Section */}
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-center">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-[#86868b] mb-8 font-medium text-center">
          {isLogin
            ? "Enter your details to access your dashboard."
            : "Sign up to start hosting your own mock auctions."}
        </p>

        {/* The Unified Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Only show the Name field if they are Signing Up */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-[#1d1d1f] mb-2 ml-2">
                Username
              </label>
              <input
                type="text"
                placeholder="cartikeyalavu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all text-[#1d1d1f] font-medium"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2 ml-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all text-[#1d1d1f] font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1d1d1f] mb-2 ml-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all text-[#1d1d1f] font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1d1d1f] text-white py-4 rounded-full font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-4"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* The Toggle Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#86868b] font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all"
            >
              {isLogin ? "Sign up now" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
