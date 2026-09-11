with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''    const handleUpdateProfile = (updated: UserProfile) => {
      // Write to localStorage FIRST so getActiveUserId() returns the correct ID
      // when the data-loading useEffect fires (before the localStorage-sync useEffect runs)
      saveStoredUserProfile(updated);
      setUserProfile(updated);
      if (updated.isLoggedIn && !userProfile.isLoggedIn) {
        navigateTo('dashboard');
      }
      api.saveProfile(updated).catch((e) => console.warn('Could not sync profile to backend:', e));
    };'''

new_content = '''    const handleUpdateProfile = (updated: UserProfile) => {
      // Write to localStorage FIRST so getActiveUserId() returns the correct ID
      // when the data-loading useEffect fires (before the localStorage-sync useEffect runs)
      saveStoredUserProfile(updated);
      setUserProfile(updated);
      
      // Force navigation to dashboard if they are on the landing page and have an ID
      if (currentRoute === 'landing' && (updated.isLoggedIn || updated.id)) {
        navigateTo('dashboard');
      } else if (updated.isLoggedIn && !userProfile.isLoggedIn) {
        navigateTo('dashboard');
      }
      
      api.saveProfile(updated).catch((e) => console.warn('Could not sync profile to backend:', e));
    };'''

content = content.replace(target, new_content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
