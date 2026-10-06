with open('/tmp/user_repo_components/TopBar.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
titles = re.findall(r'title:(`[^`]+`|"[^"]+")', text)
print('Titles in TopBar:', titles)

p = text.find('header')
print('Header content:')
print(text[p:p+3500])
