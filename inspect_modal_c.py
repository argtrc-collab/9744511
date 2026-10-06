with open('/tmp/user_repo_components/ReturnViewWB.js', 'r', encoding='utf-8') as f:
    text = f.read()

p = text.find(',c&&')
if p == -1: p = text.find('c&&')
print(text[p:p+2500])
