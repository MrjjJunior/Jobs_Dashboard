with open('src/components/ProfileModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''            <button
              onClick={() => setMode('profile')}
              className={pb-2 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer }
            >
              Guest Profile
            </button>'''

if target in content:
    content = content.replace(target + '\n', '')
    content = content.replace(target, '')
    with open('src/components/ProfileModal.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully removed Guest Profile tab')
else:
    print('Target string not found')
