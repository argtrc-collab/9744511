with open('/tmp/user_repo_components/AcceptanceViewWB.js', 'r', encoding='utf-8') as f:
    text = f.read()

p = text.find('return(')
if p == -1: p = text.find('return (')
if p == -1: p = text.find('return')
print(text[p+3000:p+7000])
