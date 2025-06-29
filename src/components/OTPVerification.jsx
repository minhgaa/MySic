import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OTPVerification = ({ onVerify, onResend, isLoading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // If all digits are filled, verify OTP
    if (index === 5 && value) {
      const completeOtp = newOtp.join('');
      console.log('Complete OTP:', completeOtp); // Log the complete OTP
      onVerify(completeOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Only allow numbers
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = digit;
        }
      }
    });
    
    setOtp(newOtp);

    // If we have all 6 digits, verify
    if (digits.length >= 6) {
      const completeOtp = newOtp.join('');
      console.log('Complete OTP from paste:', completeOtp); // Log the complete OTP
      onVerify(completeOtp);
    } else {
      // Focus the next empty input
      const nextEmptyIndex = digits.length;
      if (nextEmptyIndex < 6 && inputRefs.current[nextEmptyIndex]) {
        inputRefs.current[nextEmptyIndex].focus();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Email Verification
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400"
        >
          Please enter the OTP code sent to your email
        </motion.p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {otp.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <input
              ref={el => inputRefs.current[index] = el}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-xl font-semibold rounded-lg 
                bg-zinc-800/50 text-white border-2 
                focus:outline-none focus:ring-2 focus:ring-orange-600
                transition-all duration-200 border-transparent
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            />
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-gray-400 text-sm">
            Resend code in <span className="text-white">{countdown}s</span>
          </p>
        ) : (
          <motion.button
            onClick={() => {
              onResend();
              setCountdown(60);
              setOtp(['', '', '', '', '', '']);
              if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
              }
            }}
            className="text-blue-500 hover:text-blue-400 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            Resend Code
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default OTPVerification; 