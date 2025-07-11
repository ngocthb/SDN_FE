import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchCheckResetOTPThunk, fetchForgetPasswordThunk } from '../redux/features/user/userThunk';
import Navbar from '../components/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';

function CheckResetOTP() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(600);
  const [isToastShown, setIsToastShown] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      toast.error('Unauthorized access. Please use Forgot Password to proceed.');
      navigate('/forgot-password');
    }
  }, [email]);

  useEffect(() => {
    let interval;
    if (!isToastShown) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            clearInterval(interval);
            toast.info('Time expired! Please resend OTP.');
            setIsToastShown(true);
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isToastShown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const otpCode = otp.join('');
    const result = await dispatch(fetchCheckResetOTPThunk({ email, otp: otpCode }));

    if (result.error) {
      toast.error(result.payload);
    } else {
      toast.success('OTP verified successfully!');
      navigate('/reset-password', { state: { email, otp: otpCode } });
    }

    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const result = await dispatch(fetchForgetPasswordThunk({ email }));
      if (result.error) {
        toast.error(result.payload);
      } else {
        toast.success('OTP resent successfully!');
        setTimer(600); // Đặt lại thời gian thành 10 phút
        setIsToastShown(false);
      }
    } catch {
      toast.error('Failed to resend OTP. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl font-bold gradient-text mb-2">Verify Reset OTP ✨</h2>
            <p className="text-white/70 text-lg">Enter the OTP sent to your email</p>
            <p className="text-white/70 text-sm mt-2">Email: <span className="font-bold">{email}</span></p>
          </div>

          <div className="glass-card p-8 animate-slide-up glow-effect">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-4">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    className="input-glass text-center w-12 h-12 text-lg font-bold"
                    value={value}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                ))}
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
                    Verify OTP
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              {timer > 0 ? (
                <p className="text-white/70 text-sm">
                  Resend OTP in{' '}
                  <span className="font-bold">
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckResetOTP;