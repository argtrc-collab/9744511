with open('/tmp/user_repo_components/ReturnViewWB.js', 'r', encoding='utf-8') as f:
    text = f.read()

p = text.find('Возврат от клиента')
print(text[p-200:p+2000])
