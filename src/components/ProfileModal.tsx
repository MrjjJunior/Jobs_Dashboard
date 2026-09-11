import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  MapPin, 
  Phone, 
  Linkedin, 
  Github, 
  Camera, 
  Trash2, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  Sparkles,
  Upload,
  ShieldCheck,
  Target,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_USER_PROFILE } from '../utils/storage';
import { api } from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  profile?: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
  onOpenGoalsModal?: () => void;
  initialMode?: 'profile' | 'login' | 'signup';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile: propUserProfile,
  profile: propProfile,
  onSaveProfile,
  onLogin,
  onLogout,
  onOpenGoalsModal,
  initialMode,
}) => {
  const userProfile = propUserProfile || propProfile || DEFAULT_USER_PROFILE;

  // Mode: 'profile' for editing current profile, 'auth' for login / sign up
  const [mode, setMode] = useState<'profile' | 'login' | 'signup'>(
    initialMode || (userProfile.isLoggedIn ? 'profile' : 'login')
  );

  // Profile Edit fields
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [role, setRole] = useState(userProfile.role);
  const [location, setLocation] = useState(userProfile.location || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [linkedin, setLinkedin] = useState(userProfile.linkedin || '');
  const [github, setGithub] = useState(userProfile.github || '');
  const [bio, setBio] = useState(userProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile.avatarUrl || null);

  // Auth fields
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Status feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setMode(initialMode);
      }
      setName(userProfile.name);
      setEmail(userProfile.email);
      setRole(userProfile.role);
      setLocation(userProfile.location || '');
      setPhone(userProfile.phone || '');
      setLinkedin(userProfile.linkedin || '');
      setGithub(userProfile.github || '');
      setBio(userProfile.bio || '');
      setAvatarUrl(userProfile.avatarUrl || null);
      setSavedSuccess(false);
      setAuthError(null);
    }
  }, [isOpen, userProfile, initialMode]);

  if (!isOpen) return null;

  // Resize and compress uploaded photo to 256x256 to fit nicely in storage
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Crop square from center
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Name and Email are required.');
      return;
    }

    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || 'Job Seeker',
      location: location.trim(),
      phone: phone.trim(),
      linkedin: linkedin.trim(),
      github: github.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl,
      isLoggedIn: userProfile.isLoggedIn,
    };

    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter your email and password.');
      return;
    }

    try {
      if (mode === 'signup') {
        if (!authName.trim()) {
          setAuthError('Please enter your full name.');
          return;
        }
        if (authPassword.length < 6) {
          setAuthError('Password must be at least 6 characters long.');
          return;
        }

        const res = await api.signup({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
        });
        onSaveProfile({ ...res.user, isLoggedIn: true });
        setSavedSuccess(true);
        setTimeout(() => {
          onClose();
            window.location.href = '/dashboard';
          }, 500);
      } else {
        const res = await api.login({
          email: authEmail.trim(),
          password: authPassword,
        });
        onSaveProfile({ ...res.user, isLoggedIn: true });
        setSavedSuccess(true);
        setTimeout(() => {
          onClose();
            window.location.href = '/dashboard';
          }, 500);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    setMode('login');
  };

  // Get user initials
  const initials = (name || userProfile.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className={`rounded-2xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          mode === 'profile'
            ? 'bg-white border-linen-200 text-pine-900'
            : 'bg-[#003B36] border-[#917C78]/40 text-[#F3E8EE]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#00302c] text-white flex items-center justify-between shrink-0 border-b border-[#917C78]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#90A955] to-[#ADFCF9] flex items-center justify-center text-[#003B36] font-bold text-sm shadow-md">
              <User className="w-4 h-4 text-[#003B36]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F3E8EE] tracking-tight">
                {mode === 'profile' ? 'Account & Profile Settings' : mode === 'login' ? 'Sign In to Jobbdash' : 'Create an Account'}
              </h2>
              <p className="text-xs text-[#ADFCF9]/80">
                {mode === 'profile' 
                  ? 'Manage your personal details, profile photo, and credentials.' 
                  : 'Access your synced job pipeline, ATS scores, and target goals.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#917C78] hover:text-[#F3E8EE] rounded-lg hover:bg-[#002824] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation if logged out or wanting to toggle mode */}
        {!userProfile.isLoggedIn ? (
          <div className="flex border-b border-[#917C78]/30 bg-[#002824] px-6 pt-2 overflow-x-auto">
            <button
              onClick={() => setMode('login')}
              className={`pb-2 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'border-[#90A955] text-[#ADFCF9]'
                  : 'border-transparent text-[#F3E8EE]/70 hover:text-[#F3E8EE]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`pb-2 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'border-[#90A955] text-[#ADFCF9]'
                  : 'border-transparent text-[#F3E8EE]/70 hover:text-[#F3E8EE]'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="bg-[#002824] px-6 py-2 border-b border-[#917C78]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#F3E8EE]/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#90A955]" />
              <span>Signed in as <strong className="text-[#ADFCF9]">{userProfile.name}</strong> ({userProfile.email})</span>
            </div>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:bg-rose-950/40 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}


        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {mode === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Profile Photo Section */}
              <div className="flex items-center gap-5 p-4 bg-linen-50 rounded-2xl border border-linen-200/80">
                <div className="relative group shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-pine-500/20"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pine-600 to-pine-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md ring-2 ring-pine-500/20">
                      {initials}
                    </div>
                  )}

                  <label 
                    className="absolute inset-0 bg-pine-900/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
                    title="Change profile photo"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Upload</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-pine-900 text-sm mb-0.5">Profile Photo</div>
                  <p className="text-xs text-taupe-500 mb-2.5">
                    Upload your picture (PNG, JPG, or WebP). Displayed on headers, resumes, and reports.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold bg-white text-pine-600 border border-pine-200 hover:bg-pine-50 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                        title="Remove custom photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-taupe-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-taupe-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-linen-200 rounded-lg font-medium text-pine-900 focus:outline-hidden focus:ring-2 focus:ring-pine-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-taupe-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-taupe-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-linen-200 rounded-lg font-medium text-pine-900 focus:outline-hidden focus:ring-2 focus:ring-pine-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-taupe-700 mb-1">
                      Professional Headline / Role
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 absolute left-3 top-2.5 text-taupe-400" />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Senior Full-Stack Engineer"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-linen-200 rounded-lg font-medium text-pine-900 focus:outline-hidden focus:ring-2 focus:ring-pine-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-taupe-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-taupe-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="San Francisco, CA (or Remote)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-linen-200 rounded-lg font-medium text-pine-900 focus:outline-hidden focus:ring-2 focus:ring-pine-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-taupe-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-taupe-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-linen-200 rounded-lg font-medium text-pine-900 focus:outline-hidden focus:ring-2 focus:ring-pine-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-taupe-700 mb-1">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-taupe-400" />
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-linen-200 rounded-lg font-medium text-pine-900 focus:outline-hidden focus:ring-2 focus:ring-pine-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-taupe-700 mb-1">
                    Bio / Search Summary
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief career highlight or technical specialization..."
                    className="w-full p-2.5 text-xs border border-linen-200 rounded-lg text-pine-900 focus:outline-hidden focus:ring-2 focus:ring-pine-500 resize-none"
                  />
                </div>
              </div>

              {/* Quick Actions Bar */}
              {onOpenGoalsModal && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGoalsModal();
                    }}
                    className="w-full py-2 px-3 bg-linen-100 hover:bg-linen-200/80 rounded-xl text-xs font-semibold text-taupe-700 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-pine-600" />
                      <span>Configure Search Targets & Monthly Goals</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-taupe-400" />
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-linen-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-taupe-600 hover:bg-linen-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-all flex items-center gap-1.5 ${
                      savedSuccess ? 'bg-olive-600' : 'bg-pine-600 hover:bg-pine-700'
                    }`}
                  >
                    {savedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Profile Saved!</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Login / Signup Form */
            <div className="space-y-4 py-2">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#90A955] to-[#ADFCF9] text-[#003B36] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#90A955]/20 font-bold">
                  <LogIn className="w-6 h-6 text-[#003B36]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#F3E8EE]">
                  {mode === 'login' ? 'Welcome Back to Jobbdash' : 'Start Tracking Your Career'}
                </h3>
                <p className="text-xs text-[#F3E8EE]/80 max-w-xs mx-auto mt-1 leading-snug">
                  {mode === 'login' 
                    ? 'Sign in to access your saved applications, custom resumes, and goals.'
                    : 'Create your personalized job search workspace with full ATS analytics.'}
                </p>
              </div>

              {authError && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2">
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-[#F3E8EE] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-3.5 py-2 text-xs bg-[#002824] border border-[#917C78]/40 rounded-xl font-medium text-[#F3E8EE] placeholder:text-[#917C78] focus:outline-hidden focus:border-[#90A955] focus:ring-2 focus:ring-[#90A955]/20 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#F3E8EE] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2 text-xs bg-[#002824] border border-[#917C78]/40 rounded-xl font-medium text-[#F3E8EE] placeholder:text-[#917C78] focus:outline-hidden focus:border-[#90A955] focus:ring-2 focus:ring-[#90A955]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F3E8EE] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs bg-[#002824] border border-[#917C78]/40 rounded-xl font-medium text-[#F3E8EE] placeholder:text-[#917C78] focus:outline-hidden focus:border-[#90A955] focus:ring-2 focus:ring-[#90A955]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#90A955] hover:bg-[#a2be64] active:bg-[#7e9647] text-[#00221f] rounded-xl text-xs font-bold shadow-md shadow-[#90A955]/20 transition-all cursor-pointer mt-2"
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
