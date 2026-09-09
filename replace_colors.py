import os
import re

directory = 'src'
replacements = {
    'blue-': 'pine-',
    'indigo-': 'pine-',
    'emerald-': 'olive-',
    'teal-': 'aqua-',
    'purple-': 'aqua-',
    'slate-50': 'linen-50',
    'slate-100': 'linen-100',
    'slate-200': 'linen-200',
    'slate-300': 'taupe-200',
    'slate-400': 'taupe-400',
    'slate-500': 'taupe-500',
    'slate-600': 'taupe-600',
    'slate-700': 'taupe-700',
    'slate-800': 'pine-800',
    'slate-900': 'pine-900',
    'slate-950': 'pine-950'
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content
    # Sort keys by length descending to avoid partial matches
    for old, new in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
        new_content = new_content.replace(old, new)
        
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {filepath}')

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
