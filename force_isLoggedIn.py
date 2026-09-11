with open('src/components/ProfileModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''          const res = await api.signup({
            name: authName.trim(),
            email: authEmail.trim(),
            password: authPassword,
          });
          onSaveProfile(res.user);''',
'''          const res = await api.signup({
            name: authName.trim(),
            email: authEmail.trim(),
            password: authPassword,
          });
          onSaveProfile({ ...res.user, isLoggedIn: true });'''
)

content = content.replace(
'''          const res = await api.login({
            email: authEmail.trim(),
            password: authPassword,
          });
          onSaveProfile(res.user);''',
'''          const res = await api.login({
            email: authEmail.trim(),
            password: authPassword,
          });
          onSaveProfile({ ...res.user, isLoggedIn: true });'''
)

with open('src/components/ProfileModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
