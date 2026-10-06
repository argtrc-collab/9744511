import os
import zipfile
import shutil

tmp_zip = '/tmp/wb_point_project.zip'
final_zip = 'public/wb_point_project.zip'

if os.path.exists(tmp_zip):
    os.remove(tmp_zip)

print('Creating project ZIP archive...')
with zipfile.ZipFile(tmp_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # 1. Root index.html and wb_point_emulator.html
    zipf.write('public/wb_point_emulator.html', 'index.html')
    zipf.write('public/wb_point_emulator.html', 'wb_point_emulator.html')

    # 2. Config files
    for root_file in ['package.json', 'tsconfig.json', 'vite.config.ts', 'metadata.json', '.env.example']:
        if os.path.exists(root_file):
            zipf.write(root_file, root_file)

    # 3. Add README.md
    readme_content = """# Эмулятор рабочего места оператора ПВЗ Wildberries (WB Point)

## Быстрый запуск (без установки и без сервера):
Просто откройте файл `index.html` (или `wb_point_emulator.html`) в любом современном веб-браузере (Chrome, Edge, Safari, Firefox, Яндекс.Браузер).

## Запуск режима разработчика (React + Vite + TypeScript):
1. Установите зависимости:
   ```bash
   npm install
   ```
2. Запустите локальный сервер разработки:
   ```bash
   npm run dev
   ```
3. Откройте в браузере: `http://localhost:3000`

## Сборка автономного файла HTML:
```bash
npm run build
```
"""
    zipf.writestr('README.md', readme_content)

    # 4. Source code folder (src/)
    for root, dirs, files in os.walk('src'):
        for file in files:
            full_path = os.path.join(root, file)
            zipf.write(full_path, full_path)

    # 5. Public assets (fonts, sounds, svgs, pngs, onboarding)
    for root, dirs, files in os.walk('public'):
        for file in files:
            if file.endswith('.zip') or file.startswith('.'):
                continue
            full_path = os.path.join(root, file)
            zipf.write(full_path, full_path)

shutil.move(tmp_zip, final_zip)
print(f'Done! Successfully created {final_zip}, size: {os.path.getsize(final_zip)} bytes')
