
# -*- mode: python ; coding: utf-8 -*-
import os
from PyInstaller.utils.hooks import collect_submodules, collect_data_files

project_root = os.getcwd()

pathex = [os.path.abspath('backend')]

# Collect all submodules from your app
app_hiddenimports = collect_submodules("app")

# Core dependencies
core_hiddenimports = [
    # Database related
    "aiosqlite",
    "sqlite3", 
    "sqlalchemy",
    "sqlalchemy.ext.asyncio",
    "sqlalchemy.dialects.sqlite.aiosqlite",
    "sqlalchemy.dialects.sqlite",
    "sqlalchemy.pool",
    "sqlalchemy.engine",
    "sqlalchemy.sql",
    "sqlalchemy.orm",
    
    # FastAPI and web framework
    "fastapi",
    "fastapi.routing",
    "fastapi.responses", 
    "fastapi.exceptions",
    "starlette",
    "starlette.routing",
    "starlette.responses",
    "starlette.middleware",
    "starlette.applications",
    
    # Pydantic
    "pydantic",
    "pydantic.fields",
    "pydantic.main",
    "pydantic.types",
    "pydantic_core",
    
    # HTTP client
    "httpx",
    "httpcore",
    "h11",
    "certifi",
    
    # Server
    "uvicorn",
    "uvicorn.logging",
    "uvicorn.protocols",
    "uvicorn.protocols.http.h11_impl",
    
    # Template engine
    "jinja2",
    "jinja2.ext",
    "jinja2.loaders",
    
    # Async utilities
    "anyio",
    "anyio._backends._asyncio",
    "sniffio",
    
    # Standard library and utilities
    "idna",
    "typing_extensions",
    "json",
    "email.mime.multipart",
    "email.mime.text",
]

# Combine all hidden imports
hiddenimports = app_hiddenimports + core_hiddenimports

a = Analysis(
    [os.path.join("app", "run.py")],
    pathex=[project_root],
    binaries=[],
    datas=[
        ('app/statics/project_templates.json', 'app/statics'),
    ],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "pysqlite2",
        "MySQLdb", 
        "psycopg2",
        "psycopg2-binary",
        "pymysql",
        "cx_Oracle",
        "pyodbc",
        # Exclude GUI libraries
        "tkinter",
        "matplotlib",
        "PyQt5",
        "PySide2",
    ],
    noarchive=False,
    optimize=0,
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