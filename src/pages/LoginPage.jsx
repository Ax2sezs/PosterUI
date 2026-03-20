import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../api/api";
import { Lock, User, LogIn, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage({ onLoginSuccess, loadBrands }) {
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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-0 md:p-6 font-sans bg-grid-pattern">
      {/* Main Container */}
      <div className="max-w-5xl w-full bg-white md:rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Visual/Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-stone-900 relative p-12 flex-col justify-between overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-stone-800 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-stone-700 rounded-full blur-2xl opacity-30" />
          
          {/* <div className="relative z-10">
            <div className="flex items-center gap-2 text-white mb-8">
              <ShieldCheck className="text-stone-400" size={28} />
              <span className="font-bold tracking-widest uppercase text-sm">Super Menu Admin</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Manage your <br />
              <span className="text-stone-400">digital menu</span> <br />
              effortlessly.
            </h2>
          </div>

          <div className="relative z-10">
            <p className="text-stone-400 text-sm max-w-xs">
              The most advanced centralized menu management system for modern enterprises.
            </p>
          </div> */}

          {/* Background Image Overlay */}
          <img 
            src="banner.jpg" 
            alt="Banner" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-black text-stone-900 mb-2">Super Lnw Menu</h1>
              <p className="text-stone-500 font-medium">Please enter your credentials</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm animate-shake">
                <AlertCircle size={18} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Input */}
              <div className="group">
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2 ml-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={20} />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 text-gray-800 border-stone-50 rounded-2xl focus:bg-white focus:border-stone-900 outline-none transition-all placeholder:text-stone-300"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 text-gray-800 border-stone-50 rounded-2xl focus:bg-white focus:border-stone-900 outline-none transition-all placeholder:text-stone-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white font-bold py-4 rounded-2xl shadow-xl shadow-stone-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-8"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Login</span>
                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}