# -*- mode: python ; coding: utf-8 -*-
import os
from PyInstaller.utils.hooks import collect_submodules

project_root = os.getcwd()

pathex = [os.path.abspath('backend')]
hiddenimports = (
    collect_submodules("app")
    + [
        "aiosqlite",
        "sqlalchemy.ext.asyncio",
        "sqlalchemy.dialects.sqlite.aiosqlite",
        "fastapi",
        "starlette",
        "pydantic",
        "httpx",
        "uvicorn",
        "jinja2",
        "anyio",
        "idna",
        "typing_extensions",
    ]
)

a = Analysis(
    [os.path.join("app", "run.py")],
    pathex=[project_root],
    binaries=[],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
    datas=[
        ('app/statics/project_templates.json', 'app/statics')
    ]
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='eleuteria-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    destdir=os.path.abspath('backend/dist'),
)
