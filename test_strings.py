import re

with open('/tmp/Handover_extracted.js', 'r', encoding='utf-8') as f:
    text = f.read()

matches = set(re.findall(r'[`"\']([А-Яа-яЁё0-9\s\.,!?:;-]{3,80})[`"\']', text))
for m in sorted(matches):
    print(m)
