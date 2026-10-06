import re

with open('/tmp/repo_wb/wb_point_emulator.html', 'r', encoding='utf-8') as f:
    html = f.read()

pos = html.find('TopBar.tsx')
chunk = html[max(0, pos-80000):pos]
icons = re.findall(r'createLucideIcon\([^,]+,\s*\[([^\]]+)\]', chunk)
print('Found icons count:', len(icons))

# Let's inspect the TopBar code itself
topbar_code = html[pos:pos+11000]
print("--- TopBar Code ---")
print(topbar_code[:3000])
