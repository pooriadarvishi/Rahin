"""Create a deployment-only ZIP and a separate editable source bundle."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
site_files = [root / name for name in ['index.html', 'style.css', 'content.js', 'script.js']]
site_files += [file for file in (root / 'assets').rglob('*') if file.is_file()]
site_files += [root / 'output/pdf' / f'RAHIN-Team-Portfolio-{lang}.pdf' for lang in ['FA', 'EN']]
source_files = site_files + [root / name for name in ['README.md', 'portfolio.html', 'portfolio-en.html', 'portfolio.css']]
for folder in ['docs', 'tools']:
    source_files += [file for file in (root / folder).rglob('*') if file.is_file() and '__pycache__' not in file.parts]
for filename, files in [('RAHIN-site-upload.zip', site_files), ('RAHIN-portfolio.zip', source_files)]:
    with ZipFile(root / 'output' / filename, 'w', ZIP_DEFLATED) as archive:
        for file in files:
            archive.write(file, file.relative_to(root))
    with ZipFile(root / 'output' / filename) as archive:
        assert archive.testzip() is None
        assert 'index.html' in archive.namelist()
        assert not any(name.startswith(('tmp/', 'qa/')) for name in archive.namelist())
    print(filename, len(files), 'files')
