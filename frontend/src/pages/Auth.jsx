import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password
        });

        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else {
        await api.post("/auth/register", form);
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password
        });
        localStorage.setItem("token", res.data.token);
        navigate("/");
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Something went wrong"
      );
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md text-body-md min-h-screen flex justify-center items-center relative">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-fixed opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary-fixed opacity-20 blur-3xl"></div>
      </div>
      
      {/* Centered Login Card */}
      <main className="relative z-10 w-full max-w-[440px] px-lg">
        {/* Branding Header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary mb-sm shadow-sm">
            <span className="material-symbols-outlined text-on-primary text-[24px]">receipt_long</span>
          </div>
          <h1 className="font-display text-display text-on-background tracking-tight">SplitWise Lite</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Intelligent Expense Reconciliation</p>
        </div>
        
        {/* Card Surface */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg card-shadow p-xl">
          <form className="space-y-md" onSubmit={handleSubmit}>
            
            {/* Name Field - Only show if registering */}
            {!isLogin && (
              <div>
                <label className="block font-label-sm text-label-sm text-on-secondary-container mb-xs" htmlFor="name">Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant opacity-70 text-[18px]">person</span>
                  </div>
                  <input 
                    className="block w-full pl-[36px] pr-sm py-[10px] bg-surface border border-outline-variant rounded-DEFAULT font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant input-focus transition-all duration-200" 
                    id="name" 
                    name="name" 
                    placeholder="Your Name" 
                    required 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label className="block font-label-sm text-label-sm text-on-secondary-container mb-xs" htmlFor="email">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant opacity-70 text-[18px]">mail</span>
                </div>
                <input 
                  className="block w-full pl-[36px] pr-sm py-[10px] bg-surface border border-outline-variant rounded-DEFAULT font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant input-focus transition-all duration-200" 
                  id="email" 
                  name="email" 
                  placeholder="you@company.com" 
                  required 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-xs">
                <label className="block font-label-sm text-label-sm text-on-secondary-container" htmlFor="password">Password</label>
                {isLogin && (
                  <a className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant opacity-70 text-[18px]">lock</span>
                </div>
                <input 
                  className="block w-full pl-[36px] pr-sm py-[10px] bg-surface border border-outline-variant rounded-DEFAULT font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant input-focus transition-all duration-200" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password" 
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              className="w-full flex justify-center py-[10px] px-sm border border-transparent rounded-DEFAULT shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 mt-lg" 
              type="submit"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          

          
          {/* Register Link */}
          <p className="mt-xl text-center font-body-sm text-body-sm text-on-surface-variant">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Auth;
