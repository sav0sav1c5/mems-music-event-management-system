import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../shared/services/apiService';
import type { LoginDto } from '../../shared/services/apiService';
import { LogIn, Mail, Lock, Music, Sparkles } from 'lucide-react';
import Logo from '../../shared/components/Logo';
import { toast } from 'react-toastify'; 

const Login = () => {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const departmentColors = [
    { name: 'Ticket Sales', color: 'lime', gradient: 'from-lime-400 to-green-500' },
    { name: 'Event Organization', color: 'pink', gradient: 'from-pink-400 to-rose-500' },
    { name: 'Artist Communication', color: 'sky', gradient: 'from-sky-400 to-cyan-500' },
    { name: 'Media Campaign', color: 'purple', gradient: 'from-purple-400 to-violet-500' },
    { name: 'MEMS Client', color: 'orange', gradient: 'from-orange-400 to-amber-500' },
  ];

  const currentDepartment = departmentColors[currentColorIndex];

  useEffect(() => {
    // Rotate colors every 4 seconds
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % departmentColors.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDashboardRoute = (department: number): string => {
    switch (department) {
      case 1: return '/ticket-sales/dashboard';
      case 2: return '/event-organization/dashboard';
      case 3: return '/performer-communication/dashboard';
      case 4: return '/media-campaign/dashboard';
      case 5: return '/client/browse-events';
      default: return '/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      
      if (response.success && response.user) {
        // Sačuvaj user i token
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Toast success
        toast.success(`Welcome back, ${response.user.firstName}!`);
        
        // Redirect na dashboard
        const dashboardRoute = getDashboardRoute(response.user.department);
        navigate(dashboardRoute);
      } else {
        setError(response.message || 'Login failed');
        toast.error(response.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.Message || 
                          'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Log za debugging
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center p-4 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br from-${currentDepartment.color}-900/20 to-${currentDepartment.color}-950/10 transition-all duration-1000`}></div>
        <div className="ml-50 items-center animate-pulse">
          <Logo />
        </div>
      <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800/50 rounded-3xl p-8 ml-50 w-full max-w-sm shadow-2xl relative z-10 transform transition-all duration-500 hover:scale-[1.02]">
        {/* Success message */}
        {location.state?.message && (
          <div className={`mb-6 text-center p-3 bg-${currentDepartment.color}-500/10 border border-${currentDepartment.color}-500/30 rounded-xl`}>
            <p className={`text-${currentDepartment.color}-400 text-sm font-medium`}>
              {location.state.message}
            </p>
          </div>
        )}

        {/* Header with animated elements */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentDepartment.gradient} shadow-lg transform transition-all duration-1000`}>
              <div className="relative">
                <Music className="w-8 h-8 text-white" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-white animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="text-3xl font-black text-white mb-2 tracking-tight">
            Welcome to <span className={`text-${currentDepartment.color}-400 transition-colors duration-1000`}>MEMS</span>!
          </div>
          
          {/* Animated gradient line */}
          <div className={`w-74 h-1 bg-gradient-to-r ${currentDepartment.gradient} rounded-full mx-auto mb-3 transition-all duration-1000`}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-100 w-4 h-4 group-focus-within:text-white transition-colors" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full pl-12 pr-4 py-4 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-${currentDepartment.color}-400 focus:border-transparent transition-all duration-300 focus:bg-neutral-800`}
              placeholder="Email address"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-100 w-4 h-4 group-focus-within:text-white transition-colors" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full pl-12 pr-4 py-4 bg-neutral-800/80 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-${currentDepartment.color}-400 focus:border-transparent transition-all duration-300 focus:bg-neutral-800`}
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-950/50 backdrop-blur-sm border border-red-900/50 py-3 px-4 rounded-xl animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r ${currentDepartment.gradient} hover:shadow-lg hover:shadow-${currentDepartment.color}-500/25 disabled:opacity-70 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-neutral-500 text-sm">
            New to MEMS?{' '}
            <Link 
              to="/register" 
              className={`text-${currentDepartment.color}-400 hover:text-${currentDepartment.color}-300 font-medium transition-all duration-300 hover:underline`}
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Department indicator */}
        <div className="mt-2 flex justify-center gap-2">
          {departmentColors.map((dept, index) => (
            <div
              key={dept.name}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentColorIndex 
                  ? `bg-${dept.color}-400 scale-125` 
                  : 'bg-neutral-600 scale-100'
              }`}
            ></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;