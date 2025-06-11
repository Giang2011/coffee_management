import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api';

/**
 * Trang Đăng nhập / Đăng ký (v2)
 * - Thêm link "Quên mật khẩu?"
 * - Sau khi thành công => hiển thị thông báo & redirect sau 3s
 */
export default function Login() {
  const { login: ctxLogin, register: ctxRegister } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: nhập email, 2: trả lời, 3: đặt lại mk
  const [forgotEmail, setForgotEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = Object.fromEntries(new FormData(e.target));

    try {
      let user;
      if (mode === 'register') {
        user = await ctxRegister(form);        // ctxRegister return user
        setSuccess('Registration successful! Redirecting...');
      } else {
        user = await ctxLogin(form.email, form.password);
        setSuccess('Login successful! Redirecting...');
      }

      // Redirect sau 3 giây
      setTimeout(() => {
        navigate(user?.role === 'admin' ? '/admin' : '/', { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  // Xử lý forgot password qua câu hỏi bảo mật
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    try {
      if (forgotStep === 1) {
        // Gọi API lấy câu hỏi bảo mật
        const res = await authApi.recoverAccount(forgotEmail);
        let question = '';
        if (res && typeof res.data === 'object' && res.data !== null) {
          // Lấy value đầu tiên của object
          question = Object.values(res.data)[0];
        } else if (typeof res.data === 'string') {
          question = res.data.split('\n').pop().trim();
        }
        setSecurityQuestion(question);
        setForgotStep(2);
      } else if (forgotStep === 2) {
        // Gọi API kiểm tra câu trả lời
        const { data } = await authApi.recoverAccount2(forgotEmail, securityAnswer);
        if (data.user_id) {
          setUserId(data.user_id);
          setForgotStep(3);
        } else {
          setForgotError('Incorrect answer.');
        }
      } else if (forgotStep === 3) {
        if (!newPassword || newPassword !== confirmPassword) {
          setForgotError('Passwords do not match.');
          return;
        }
        // Gọi API đặt lại mật khẩu
        await authApi.resetPasswordWithUserId(userId, newPassword);
        setForgotSuccess('Password reset successfully! You can now login.');
        setTimeout(() => setShowForgot(false), 2000);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || err.toString());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        {/* Tabs */}
        <div className="mb-6 flex justify-center gap-6 text-lg font-semibold">
          <button
            className={mode === 'login' ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              required
              name="full_name"
              placeholder="Full name"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          )}

          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />

          <input
            required
            type="password"
            name="password"
            placeholder="Password"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />

          {mode === 'register' && (
            <input
              required
              type="password"
              name="password_confirmation"
              placeholder="Confirm password"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          )}

          {/* forgot password link only on login mode */}
          {mode === 'login' && (
            <div className="text-right text-xs">
              <button type="button" className="text-amber-600 hover:underline" onClick={() => setShowForgot(true)}>
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded bg-amber-600 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? 'Processing…' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        {/* Modal forgot password qua câu hỏi bảo mật */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={()=>setShowForgot(false)}>
            <div className="bg-white rounded-lg p-6 shadow w-full max-w-sm" onClick={e=>e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">Forgot Password</h3>
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotStep === 1 && (
                  <>
                    <input type="email" required value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="Enter your email" className="w-full rounded border px-3 py-2" />
                    <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white font-semibold">Next</button>
                  </>
                )}
                {forgotStep === 2 && (
                  <>
                    <label className="block text-sm font-medium mb-1">Security Question</label>
                    <input type="text" value={securityQuestion} readOnly className="w-full rounded border px-3 py-2 bg-gray-100 mb-2" />
                    <label className="block text-sm font-medium mb-1">Your Answer</label>
                    <input type="text" required value={securityAnswer} onChange={e=>setSecurityAnswer(e.target.value)} placeholder="Your answer" className="w-full rounded border px-3 py-2" />
                    <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white font-semibold mt-2">Next</button>
                  </>
                )}
                {forgotStep === 3 && (
                  <>
                    <input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded border px-3 py-2" />
                    <input type="password" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full rounded border px-3 py-2" />
                    <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white font-semibold">Reset Password</button>
                  </>
                )}
                {forgotError && <div className="text-red-600 text-sm">{forgotError}</div>}
                {forgotSuccess && <div className="text-green-600 text-sm">{forgotSuccess}</div>}
              </form>
              <button className="mt-4 text-xs text-gray-500 hover:underline" onClick={()=>setShowForgot(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
