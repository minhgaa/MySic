import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { FiUser } from "react-icons/fi";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authContext';

const pageVariants = {
  initial: { 
    opacity: 0,
    scale: 0.95
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

const formVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      delay: 0.2
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    console.log('Starting Google login redirect...');
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };

        console.log('Sending register request with data:', registerData);
        await axios.post('http://localhost:3000/api/auth/register', registerData);
        // After registration, automatically log in
        await login({ email: formData.email, password: formData.password });
        navigate('/');
      } else {
        const loginData = {
          email: formData.email,
          password: formData.password
        };
        console.log('Sending login request with data:', loginData);
        await login(loginData);
        navigate('/');
      }
    } catch (err) {
      console.error(isRegister ? 'Registration error:' : 'Login error:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="login-page"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen flex items-center justify-center bg-[#0C0E15] p-4"
      >
        <motion.div 
          variants={formVariants}
          className="w-full max-w-md"
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Welcome to MySic</h1>
            <p className="text-gray-400">
              {isRegister ? "Create an account to start listening" : "Sign in to continue listening"}
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-800 py-3 px-4 rounded-lg mb-4 flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <FcGoogle className="text-xl" />
            <span>Continue with Google</span>
          </motion.button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0C0E15] text-gray-400">or continue with email</span>
            </div>
          </div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            variants={formVariants}
          >
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden"
                >
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-800/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      required={isRegister}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="relative"
              variants={formVariants}
            >
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-800/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              />
            </motion.div>

            <motion.div 
              className="relative"
              variants={formVariants}
            >
              <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-zinc-800/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden"
                >
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-zinc-800/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      required={isRegister}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={loading}
              className={`w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
            </motion.button>
          </motion.form>

          <motion.p 
            className="mt-6 text-center text-gray-400"
            variants={formVariants}
          >
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <motion.button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                });
              }}
              className="text-orange-600 hover:text-orange-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </motion.button>
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}