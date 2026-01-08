import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../api/api";
import { Lock, User, LogIn, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage({ onLoginSuccess,loadBrands }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/api/auth/login`, { username, password });
      localStorage.setItem("accessToken", res.data.token);
      localStorage.setItem("userRole", res.data.role);
      navigate("/", { replace: true });
      loadBrands();
    } catch (err) {
      setError(err.response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-white to-stone-200 p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-900 text-white rounded-2xl mb-4 shadow-lg">
              <LogIn size={32} />
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Welcome Super Menu</h1>
            <p className="text-stone-500 mt-2 font-medium">Centralize Menu System</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 ml-1">Username</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 text-gray-900 border border-stone-200 rounded-xl focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all placeholder:text-stone-400"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 ml-1">Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors">
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 text-gray-900 border border-stone-200 rounded-xl focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all placeholder:text-stone-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}