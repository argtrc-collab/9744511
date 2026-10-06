with open('/tmp/user_repo_components/ReturnViewWB.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'\[[a-zA-Z0-9_]+,\s*l\]\s*=\s*\(0,_\.useState\)\([^)]*\)', text)
print('l definition:', matches)

p = text.find('onClick:()=>l(!0)')
if p == -1: p = text.find('l(!0)')
print('Context around l(!0):')
print(text[p-200:p+300])

# Find where l is used to render a modal
pos = 0
while True:
    pos = text.find('&&', pos)
    if pos == -1: break
    snippet = text[max(0, pos-20):pos+80]
    if any(c in snippet for c in ['l&&', 'l &&', 'c&&']):
        print('Conditional modal:', snippet)
    pos += 2
