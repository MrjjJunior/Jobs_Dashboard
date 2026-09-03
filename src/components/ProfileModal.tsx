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

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  profile?: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
  onOpenGoalsModal?: () => void;
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
}) => {
  const userProfile = propUserProfile || propProfile || DEFAULT_USER_PROFILE;

  // Mode: 'profile' for editing current profile, 'auth' for login / sign up
  const [mode, setMode] = useState<'profile' | 'login' | 'signup'>(
    userProfile.isLoggedIn ? 'profile' : 'login'
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
      setMode(userProfile.isLoggedIn ? 'profile' : 'login');
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
  }, [isOpen, userProfile]);

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
      isLoggedIn: true,
    };

    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }
    const resolvedName = authName.trim() || authEmail.split('@')[0];
    onLogin(authEmail.trim(), resolvedName);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleQuickDemoLogin = () => {
    onLogin('alex.rivera@example.com', 'Alex Rivera');
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {mode === 'profile' ? 'Account & Profile Settings' : mode === 'login' ? 'Sign In to JobFlow' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'profile' 
                  ? 'Manage your personal details, profile photo, and credentials.' 
                  : 'Access your synced job pipeline, ATS scores, and target goals.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation if logged out or wanting to toggle mode */}
        {!userProfile.isLoggedIn ? (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
            <button
              onClick={() => setMode('login')}
              className={`pb-2 px-4 text-xs font-bold border-b-2 transition-colors ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`pb-2 px-4 text-xs font-bold border-b-2 transition-colors ${
                mode === 'signup'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="bg-slate-50/80 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed in as <strong className="text-slate-900">{userProfile.name}</strong> ({userProfile.email})</span>
            </div>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
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
              <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="relative group shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-blue-500/20"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md ring-2 ring-blue-500/20">
                      {initials}
                    </div>
                  )}

                  <label 
                    className="absolute inset-0 bg-slate-900/60 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
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
                  <div className="font-bold text-slate-900 text-sm mb-0.5">Profile Photo</div>
                  <p className="text-xs text-slate-500 mb-2.5">
                    Upload your picture (PNG, JPG, or WebP). Displayed on headers, resumes, and reports.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Professional Headline / Role
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Senior Full-Stack Engineer"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="San Francisco, CA (or Remote)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bio / Search Summary
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief career highlight or technical specialization..."
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
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
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>Configure Search Targets & Monthly Goals</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
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
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-all flex items-center gap-1.5 ${
                      savedSuccess ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
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
            <div className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                  <LogIn className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {mode === 'login' ? 'Welcome Back to JobFlow' : 'Start Tracking Your Career'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {mode === 'login' 
                    ? 'Sign in to access your saved applications, custom resumes, and goals.'
                    : 'Create your personalized job search workspace with full ATS analytics.'}
                </p>
              </div>

              {authError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors mt-2"
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-2">
                  <span>Or Quick Access</span>
                </div>
              </div>

              {/* 1-Click Demo Login */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Continue as Alex Rivera (Demo Profile)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
