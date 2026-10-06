import os
import zipfile
import re
import base64
import mimetypes
import json
import urllib.parse

def get_base64_data_uri(filepath):
    mime_type, _ = mimetypes.guess_type(filepath)
    if not mime_type:
        if filepath.endswith('.svg'):
            mime_type = 'image/svg+xml'
        elif filepath.endswith('.png'):
            mime_type = 'image/png'
        elif filepath.endswith('.jpg') or filepath.endswith('.jpeg'):
            mime_type = 'image/jpeg'
        elif filepath.endswith('.mp3'):
            mime_type = 'audio/mp3'
        elif filepath.endswith('.wav'):
            mime_type = 'audio/wav'
        elif filepath.endswith('.ttf'):
            mime_type = 'font/ttf'
        else:
            mime_type = 'application/octet-stream'

    with open(filepath, 'rb') as f:
        data = f.read()
    b64 = base64.b64encode(data).decode('utf-8')
    return f"data:{mime_type};base64,{b64}"

def main():
    if not os.path.exists('dist/index.html'):
        print('dist/index.html not found, skipping pack.')
        return

    dist_html = open('dist/index.html', encoding='utf-8').read()
    assets = os.listdir('dist/assets')
    css_files = [f for f in assets if f.endswith('.css')]
    js_files = [f for f in assets if f.endswith('.js')]

    if not css_files or not js_files:
        print('CSS or JS files not found in dist/assets.')
        return

    css_content = open(f'dist/assets/{css_files[0]}', encoding='utf-8').read()
    js_content = open(f'dist/assets/{js_files[0]}', encoding='utf-8').read()

    asset_map = {}
    sound_map = {}

    # Target specific UI asset folders to keep build fast and compact
    # 1. Root images and SVGs in public/
    if os.path.exists('public'):
        for f in os.listdir('public'):
            p = os.path.join('public', f)
            if os.path.isfile(p) and f.lower().endswith(('.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico')):
                try:
                    if os.path.getsize(p) < 400 * 1024:
                        uri = get_base64_data_uri(p)
                        for k in [f'/{f}', f'./{f}', f]:
                            asset_map[k] = uri
                except Exception:
                    pass

    # 2. Logos in public/logos/
    if os.path.exists('public/logos'):
        for f in os.listdir('public/logos'):
            p = os.path.join('public/logos', f)
            if os.path.isfile(p):
                try:
                    uri = get_base64_data_uri(p)
                    for k in [f'/logos/{f}', f'./logos/{f}', f'logos/{f}', f]:
                        asset_map[k] = uri
                except Exception:
                    pass

    # 3. Onboarding screenshots in public/onboarding/
    if os.path.exists('public/onboarding'):
        for f in os.listdir('public/onboarding'):
            p = os.path.join('public/onboarding', f)
            if os.path.isfile(p):
                try:
                    uri = get_base64_data_uri(p)
                    keys = [f'/onboarding/{f}', f'./onboarding/{f}', f'onboarding/{f}', f]
                    enc = urllib.parse.quote(f)
                    if enc != f:
                        keys.extend([f'/onboarding/{enc}', f'./onboarding/{enc}', f'onboarding/{enc}'])
                    for k in keys:
                        asset_map[k] = uri
                except Exception:
                    pass

    # 4. Essential sounds in public/sounds/ (embed core WB sound effects)
    essential_sounds = [
        'success_sound.mp3',
        'error_sound.mp3',
        'notification_sound.mp3',
        'check_goods_before_fitting.mp3',
        'box_accepted.mp3',
        'box_closed.mp3',
        'decline.mp3',
        'thanks_for_order_rate_pickpoint.mp3',
        'add_defect_mark.mp3',
        'payment_on_delivery.mp3',
        'try_on_after_payment.mp3',
        'goods.mp3',
        'new_cell_is.mp3',
        'add_checkbox_sound.mp3',
        'remove_checkbox_sound.mp3',
    ]
    if os.path.exists('public/sounds'):
        for f in essential_sounds:
            p = os.path.join('public/sounds', f)
            if os.path.exists(p):
                try:
                    uri = get_base64_data_uri(p)
                    for k in [f'/sounds/{f}', f'./sounds/{f}', f'sounds/{f}', f]:
                        sound_map[k] = uri
                except Exception:
                    pass

    # 5. Wildberries brand logos with reliable online fallbacks
    logo_fallbacks = {
        '/logos/wb_gradient_square.jpg': 'https://greenparknv.ru/wp-content/uploads/2025/12/photo_2025-12-03_16-44-55.jpg',
        './logos/wb_gradient_square.jpg': 'https://greenparknv.ru/wp-content/uploads/2025/12/photo_2025-12-03_16-44-55.jpg',
        '/logos/wildberries_logo_pink.png': 'https://brandlogos.net/wp-content/uploads/2026/08/wildberries-logo.png',
        './logos/wildberries_logo_pink.png': 'https://brandlogos.net/wp-content/uploads/2026/08/wildberries-logo.png',
    }

    # Ensure local base64 version takes precedence for logos
    for logo_path in ['public/logos/wb_gradient_square.jpg', 'public/logos/wildberries_logo_pink.png']:
        if os.path.exists(logo_path):
            try:
                rel = '/' + os.path.relpath(logo_path, 'public').replace('\\', '/')
                uri = get_base64_data_uri(logo_path)
                logo_fallbacks[rel] = uri
                logo_fallbacks['.' + rel] = uri
                asset_map[rel] = uri
                asset_map['.' + rel] = uri
            except Exception:
                pass

    # Escape </script> within strings
    js_safe = js_content.replace('</script>', '<\\/script>')

    # Remove external assets
    clean_html = re.sub(r'<link rel=\"stylesheet\"[^>]*href=\"\./assets/[^\"]*\"[^>]*>', '', dist_html)
    clean_html = re.sub(r'<script type=\"module\"[^>]*src=\"\./assets/[^\"]*\"[^>]*></script>', '', clean_html)

    asset_json = json.dumps(asset_map)
    sound_json = json.dumps(sound_map)
    logo_json = json.dumps(logo_fallbacks)

    offline_patch = f'''<script>
(function() {{
  var ASSET_MAP = {asset_json};
  var SOUND_MAP = {sound_json};
  var LOGO_MAP = {logo_json};

  window.__WB_ASSET_DATA__ = ASSET_MAP;
  window.__WB_SOUND_DATA__ = SOUND_MAP;
  window.__WB_LOGO_DATA__ = LOGO_MAP;

  function cleanKey(src) {{
    if (!src || typeof src !== 'string') return '';
    var s = src;
    try {{ s = decodeURIComponent(s); }} catch(e) {{}}
    s = s.split('?')[0].split('#')[0];
    return s;
  }}

  function resolveAssetUrl(src) {{
    if (!src || typeof src !== 'string') return src;
    if (src.startsWith('data:') || src.startsWith('blob:')) return src;

    var key = cleanKey(src);
    var rel = key;
    if (rel.startsWith('./')) rel = rel.substring(1);
    else if (!rel.startsWith('/')) rel = '/' + rel;

    if (ASSET_MAP[rel]) return ASSET_MAP[rel];
    if (ASSET_MAP[key]) return ASSET_MAP[key];
    if (LOGO_MAP[rel]) return LOGO_MAP[rel];
    if (LOGO_MAP[key]) return LOGO_MAP[key];

    var filename = key.split('/').pop();
    if (filename) {{
      if (ASSET_MAP['/' + filename]) return ASSET_MAP['/' + filename];
      if (ASSET_MAP[filename]) return ASSET_MAP[filename];
      if (LOGO_MAP['/' + filename]) return LOGO_MAP['/' + filename];
    }}

    return src;
  }}

  function resolveSoundUrl(src) {{
    if (!src || typeof src !== 'string') return src;
    if (src.startsWith('data:') || src.startsWith('blob:')) return src;

    var key = cleanKey(src);
    var rel = key;
    if (rel.startsWith('./')) rel = rel.substring(1);
    else if (!rel.startsWith('/')) rel = '/' + rel;

    if (SOUND_MAP[rel]) return SOUND_MAP[rel];
    if (SOUND_MAP[key]) return SOUND_MAP[key];

    var filename = key.split('/').pop();
    if (filename) {{
      if (SOUND_MAP['/sounds/' + filename]) return SOUND_MAP['/sounds/' + filename];
      if (SOUND_MAP[filename]) return SOUND_MAP[filename];
    }}

    return src;
  }}

  var origImgDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (origImgDesc && origImgDesc.set) {{
    Object.defineProperty(HTMLImageElement.prototype, 'src', {{
      get: function() {{ return origImgDesc.get.call(this); }},
      set: function(val) {{
        origImgDesc.set.call(this, resolveAssetUrl(val));
      }}
    }});
  }}

  var OrigAudio = window.Audio;
  if (OrigAudio) {{
    window.Audio = function(src) {{
      var resolved = resolveSoundUrl(src);
      var instance = new OrigAudio(resolved);
      return instance;
    }};
    window.Audio.prototype = OrigAudio.prototype;
  }}

  window.addEventListener('error', function(e) {{
    var el = e.target;
    if (el && el.tagName === 'IMG') {{
      var s = el.getAttribute('src');
      if (s) {{
        var resolved = resolveAssetUrl(s);
        if (resolved && resolved !== s && resolved.startsWith('data:')) {{
          el.src = resolved;
          return;
        }}
      }}
    }}
  }}, true);

  function unlockAll() {{
    try {{
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {{
        var ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
      }}
      if (window.speechSynthesis) {{
        window.speechSynthesis.resume();
      }}
    }} catch(e) {{}}
    window.removeEventListener('click', unlockAll);
    window.removeEventListener('keydown', unlockAll);
    window.removeEventListener('touchstart', unlockAll);
  }}
  window.addEventListener('click', unlockAll, {{ once: true }});
  window.addEventListener('keydown', unlockAll, {{ once: true }});
  window.addEventListener('touchstart', unlockAll, {{ once: true }});
}})();
</script>
'''

    inlined = clean_html.replace('</head>', f'{offline_patch}\n<style>\n{css_content}\n</style>\n</head>')
    inlined = inlined.replace('</body>', f'<script>\n{js_safe}\n</script>\n</body>')

    os.makedirs('public', exist_ok=True)
    with open('public/wb_point_emulator.html', 'w', encoding='utf-8') as f:
        f.write(inlined)

    with open('public/wb_point.html', 'w', encoding='utf-8') as f:
        f.write(inlined)

    zip_path = 'public/wb_point_project.zip'
    if os.path.exists(zip_path):
        try:
            os.remove(zip_path)
        except Exception:
            pass

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('index.html', inlined)
        zf.writestr('wb_point_emulator.html', inlined)
        zf.writestr('wb_point.html', inlined)

        bat_content = '@echo off\r\nchcp 65001 >nul\r\necho Запуск WB Point...\r\nstart "" "%~dp0index.html"\r\n'
        zf.writestr('START_EMULATOR.bat', bat_content.encode('utf-8'))

        sh_content = '#!/bin/bash\nDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"\nopen "$DIR/index.html" || xdg-open "$DIR/index.html"\n'
        zf.writestr('START_EMULATOR.command', sh_content.encode('utf-8'))

        readme = '''========================================================
Эмулятор рабочего места оператора ПВЗ Wildberries («WB Point»)
========================================================

ЗАПУСК:
- Распакуйте архив и дважды кликните по файлу "index.html" (или запустите "START_EMULATOR.bat").
- Все картинки, иконки, звуки и интерактивные регламенты работают автономно без сервера и без ошибок!

СБОРКА ДЛЯ РАЗРАБОТКИ:
- npm install
- npm run dev
'''
        zf.writestr('README.txt', readme.encode('utf-8'))

        # Add source code
        for root, dirs, files in os.walk('src'):
            for file in files:
                p = os.path.join(root, file)
                zf.write(p, p)

        for rf in ['package.json', 'vite.config.ts', 'tsconfig.json', 'metadata.json']:
            if os.path.exists(rf):
                zf.write(rf, rf)

        # Place target public assets (skip wb_assets to keep zip fast and manageable)
        for root, dirs, files in os.walk('public'):
            if 'wb_assets' in root:
                continue
            for file in files:
                if file in ['wb_point_project.zip', 'index.html', 'wb_point_emulator.html', 'wb_point.html']:
                    continue
                p = os.path.join(root, file)
                rel = os.path.relpath(p, 'public').replace('\\', '/')
                zf.write(p, rel)
                zf.write(p, f'public/{rel}')

    print(f'Done! Successfully packed public/wb_point_emulator.html, public/wb_point.html, and {zip_path}')

if __name__ == '__main__':
    main()
