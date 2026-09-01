import React from "react";
import { Link } from "react-router-dom";
const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-5xl font-black mb-6">IPL Mock Auction</h1>
      <p className="text-xl mb-8">Host custom multiplayer bidding wars.</p>

      {/* Use React Router's <Link> instead of <a href> so the page doesn't reload */}
      <Link
        to="/login"
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
      >
        Login to Start
      </Link>
    </div>
  );
};

export default Login;
