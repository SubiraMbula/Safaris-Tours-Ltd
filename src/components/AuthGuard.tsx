import React from 'react';
import { useAuth } from './AuthProvider';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signIn, logout, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-safari-sand">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safari-green"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-safari-sand p-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <h1 className="text-4xl mb-4 text-safari-green">Staff Portal</h1>
          <p className="text-stone-600 mb-8 italic">Safaris&Tours Ltd CRM Access</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={signIn}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
          <p className="mt-6 text-xs text-stone-400">
            Access is restricted to authorized Safaris&Tours staff only.
          </p>
          <div className="mt-4 pt-4 border-t border-stone-100">
            <a 
              href="https://github.com/your-repo/USER_MANUAL.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-safari-green hover:underline font-medium"
            >
              View User Manual & Login Guide
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has a valid role
  if (profile && !['admin', 'sales', 'support', 'sales_manager', 'marketing_manager'].includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-safari-sand p-4">
        <div className="max-w-md w-full glass-card p-8 text-center border-red-100">
          <h1 className="text-3xl mb-4 text-red-600">Access Denied</h1>
          <p className="text-stone-600 mb-8">
            Your account ({user.email}) is not authorized to access the CRM system. 
            Please contact the administrator if you believe this is an error.
          </p>
          <button 
            onClick={logout}
            className="btn-secondary w-full"
          >
            Logout & Return Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
