with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''import { LandingPage } from './components/LandingPage';
import { CookieBanner } from './components/CookieBanner';''',
'''import { LandingPage } from './components/LandingPage';
import { CookieBanner } from './components/CookieBanner';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';'''
)

content = content.replace(
'''const getInitialRoute = (): 'landing' | 'dashboard' => {
  const path = window.location.pathname;
  const hash = window.location.hash;
  if (path === '/dashboard' || hash === '#/dashboard' || hash === '#dashboard') {
    return 'dashboard';
  }
  // Root URL / is always the landing page
  return 'landing';
};''',
'''const getInitialRoute = (): 'landing' | 'dashboard' | 'privacy' | 'terms' => {
  const path = window.location.pathname;
  const hash = window.location.hash;
  if (path === '/dashboard' || hash === '#/dashboard' || hash === '#dashboard') return 'dashboard';
  if (path === '/privacy' || hash === '#/privacy' || hash === '#privacy') return 'privacy';
  if (path === '/terms' || hash === '#/terms' || hash === '#terms') return 'terms';
  return 'landing';
};'''
)

content = content.replace(
'''  const [currentRoute, setCurrentRoute] = useState<'landing' | 'dashboard'>(getInitialRoute);

  const navigateTo = (route: 'landing' | 'dashboard') => {
    setCurrentRoute(route);
    const targetUrl = route === 'dashboard' ? '/dashboard' : '/';''',
'''  const [currentRoute, setCurrentRoute] = useState<'landing' | 'dashboard' | 'privacy' | 'terms'>(getInitialRoute);

  const navigateTo = (route: 'landing' | 'dashboard' | 'privacy' | 'terms') => {
    setCurrentRoute(route);
    let targetUrl = '/';
    if (route === 'dashboard') targetUrl = '/dashboard';
    else if (route === 'privacy') targetUrl = '/privacy';
    else if (route === 'terms') targetUrl = '/terms';'''
)

target_render = '''  if (currentRoute === 'landing') {
    return (
      <LandingPage
        userProfile={userProfile}
        jobs={jobs}
        onStartTracking={handleStartTracking}
        onGoToDashboard={() => navigateTo('dashboard')}
        onTryDemo={() => navigateTo('dashboard')}
      />
    );
  }'''

new_render = '''  if (currentRoute === 'privacy') {
    return <PrivacyPolicy onBack={() => navigateTo('landing')} />;
  }
  if (currentRoute === 'terms') {
    return <TermsOfService onBack={() => navigateTo('landing')} />;
  }
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        userProfile={userProfile}
        jobs={jobs}
        onStartTracking={handleStartTracking}
        onGoToDashboard={() => navigateTo('dashboard')}
        onTryDemo={() => navigateTo('dashboard')}
      />
    );
  }'''

content = content.replace(target_render, new_render)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
