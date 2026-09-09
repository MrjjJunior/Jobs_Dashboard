import os

replacements = {
    'JobFlow Pro': 'Jobbdash',
    'JobFlow': 'Jobbdash',
    'jobflow.app': 'jobbdash.app',
    'Job Application Dashboard': 'jobbdash',
}

files_to_update = [
    'src/components/LandingPage.tsx',
    'src/components/ProfileModal.tsx',
    'src/components/ResumeBuilderView.tsx',
    'src/components/Sidebar.tsx',
    'index.html'
]

for filepath in files_to_update:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
print('Done replacements')
