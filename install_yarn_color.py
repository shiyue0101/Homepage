#!/usr/bin/env python3
"""Match the intro yarn ball's body color to the winding trail (#ac7082)."""
from pathlib import Path
from datetime import datetime
import shutil
import sys

root = Path(__file__).resolve().parent
source = root / 'yarn-ball-rose.png'
assets = root / 'cat_entrance_assets'
dest = assets / 'yarn-ball.png'
js = assets / 'cat-entrance.js'
if not source.is_file():
    sys.exit('缺少 yarn-ball-rose.png：请把安装包内的图片和本脚本一起放在 Homepage 根目录。')
if not js.is_file():
    sys.exit('找不到 cat_entrance_assets/cat-entrance.js：请在 Homepage 根目录执行。')
code = js.read_text(encoding='utf-8')
if 'yarn-ball.png' not in code:
    sys.exit('当前开场 JS 尚未引用 yarn-ball.png。请先安装上一版的 replace_opening_yarn_ball.py，本脚本没有修改任何文件。')
stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
if dest.exists():
    backup = assets / f'yarn-ball.png.backup-{stamp}'
    shutil.copy2(dest, backup)
    print('旧图片已备份到:', backup.name)
shutil.copy2(source, dest)
# Cache-bust only the existing asset URL; no animation behavior is changed.
old = "new URL('yarn-ball.png', scriptUrl)"
if old in code:
    updated = code.replace(old, "new URL('yarn-ball.png?v=rose-20261018', scriptUrl)")
    if updated != code:
        shutil.copy2(js, assets / f'cat-entrance.js.backup-yarn-{stamp}')
        js.write_text(updated, encoding='utf-8')
print('完成：毛线球主体已更换为与轨迹线 #ac7082 一致的玫瑰色。')
print('白色缠绕纹路和原有动画逻辑不变。请使用 Cmd + Shift + R 刷新。')
