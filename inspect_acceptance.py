with open('/tmp/user_repo_components/AcceptanceViewWB.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
titles = set(re.findall(r'[`"\']([А-Яа-яЁё0-9\s\.\,\!\?\:\;\-]{3,60})[`"\']', text))
print('AcceptanceViewWB strings count:', len(titles))
print(sorted(titles)[:25])

p = text.find('return(')
if p == -1: p = text.find('return (')
if p == -1: p = text.find('return')
print('AcceptanceViewWB return snippet:')
print(text[p:p+3000])
