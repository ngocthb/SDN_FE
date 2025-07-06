import { useState } from 'react';
import { toast } from 'react-toastify';
import { IoMailOutline } from 'react-icons/io5';
import Navbar from '../components/Navbar';
import { useDispatch } from 'react-redux';
import { fetchForgetPasswordThunk } from '../redux/features/user/userThunk';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error('Please enter your email');
      setIsLoading(false);
      return;
    }

    const result = await dispatch(fetchForgetPasswordThunk({ email }));

    if (result.error) {
      toast.error(result.payload);
    } else {
      toast.success(result.message || 'OTP sent successfully! Please check your email.');
      navigate('/check-reset-otp', { state: { email } });
    }

    setIsLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl font-bold gradient-text mb-2">Forgot Password ✨</h2>
            <p className="text-white/70 text-lg">Enter your email to reset your password</p>
          </div>

          <div className="glass-card p-8 animate-slide-up glow-effect">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <IoMailOutline className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/40 text-lg" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input-glass pl-10"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full gradient-button flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Send OTP
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;