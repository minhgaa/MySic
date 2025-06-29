import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import OTPVerification from '../components/OTPVerification';
import axios from '../lib/axios';
import { useAuth } from '../hooks/authContext';

const pageVariants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = useParams();
  const { updateAuthState } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get registration data from location state
  const registrationData = location.state?.registrationData;

  if (!email || !registrationData) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleVerifyOTP = async (otp) => {
    setLoading(true);
    try {
      const decodedEmail = decodeURIComponent(email);

      // Verify OTP
      const response = await axios.post('/api/auth/confirm-otp', {
        email: decodedEmail,
        otp: otp.toString() // Ensure OTP is sent as string
      });

      console.log('OTP verification response:', response.data);

      // If successful, update auth state and redirect
      if (response.data.token) {
        updateAuthState(response.data.user || { email: decodedEmail });
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('OTP Verification error:', err);
      console.error('Error response:', err.response?.data);
      
      // Set error message from response
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         'Invalid OTP code. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const decodedEmail = decodeURIComponent(email).trim();
      
      // Log the exact format of data being sent
      console.log('Resend OTP Request Data:', {
        email: decodedEmail,
        type: typeof decodedEmail
      });

      // Clean and validate email
      if (!decodedEmail || typeof decodedEmail !== 'string') {
        throw new Error('Invalid email format');
      }

      const response = await axios.post('/api/auth/resend-otp', {
        email: decodedEmail
      });

      console.log('Resend OTP Response:', response.data);
      
      setError(''); // Clear any existing errors
      const successMessage = 'New OTP has been sent to your email';
      setError(successMessage);
    } catch (err) {
      console.error('Resend OTP Error Details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.message === 'Invalid email format') {
        setError('Invalid email format. Please try again.');
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors
          .map(error => error.msg || error.message || error.error || JSON.stringify(error))
          .join('\n');
        setError(errorMessages);
      } else {
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           'Failed to resend OTP. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen flex items-center justify-center bg-[#0C0E15] p-4"
    >
      <div className="w-full max-w-md">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-lg text-sm text-center ${
              error === 'New OTP has been sent to your email'
                ? 'bg-green-500/10 border border-green-500/50 text-green-500'
                : 'bg-red-500/10 border border-red-500/50 text-red-500'
            }`}
          >
            {error}
          </motion.div>
        )}

        <div className="text-center mb-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400"
          >
            Please enter the verification code sent to:
            <br />
            <span className="text-white font-medium">{decodeURIComponent(email)}</span>
          </motion.p>
        </div>

        <OTPVerification
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          isLoading={loading}
        />

        <motion.button
          onClick={handleBackToLogin}
          className="mt-6 text-gray-400 hover:text-gray-300 text-sm w-full text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Back to Login
        </motion.button>
      </div>
    </motion.div>
  );
} 