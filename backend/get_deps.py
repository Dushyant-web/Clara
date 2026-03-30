import os
import ast
import site
import sys

stdlib = set(sys.builtin_module_names)
# simplistic way to get stdlib modules
import distutils.sysconfig as sysconfig
std_lib = sysconfig.get_python_lib(standard_lib=True)
for top, dirs, files in os.walk(std_lib):
    for nm in files:
        if nm.endswith('.py'):
            stdlib.add(nm[:-3])

imports = set()
for dirpath, _, filenames in os.walk('.'):
    if 'venv' in dirpath or '__pycache__' in dirpath:
        continue
    for filename in filenames:
        if filename.endswith('.py'):
            try:
                with open(os.path.join(dirpath, filename), 'r') as f:
                    tree = ast.parse(f.read())
                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        for n in node.names:
                            imports.add(n.name.split('.')[0])
                    elif isinstance(node, ast.ImportFrom):
                        if node.module:
                            imports.add(node.module.split('.')[0])
            except:
                pass

print(sorted(list(imports - stdlib)))
