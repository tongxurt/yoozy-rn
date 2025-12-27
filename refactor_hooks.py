import os
import re

root_dir = 'src'
extensions = {'.tsx', '.ts'}

# Semantic Mapping
MAPPING = {
    'background': 'colors.background',
    'background0': 'colors.card',
    'background1': 'colors.muted',
    'background2': 'colors.muted',
    'plain': 'colors.background',
    'grey0': 'colors.foreground',
    'grey1': "colors['muted-foreground']",
    'grey2': "colors['muted-foreground']",
    'grey3': "colors['muted-foreground']",
    'grey4': 'colors.border',
    'grey5': 'colors.input',
    'primary': 'colors.primary',
    'secondary': 'colors.secondary',
    'white': 'colors.background', # Based on analysis that white/black were inverted/backgrounds
    'black': 'colors.foreground',
    'searchBg': 'colors.input',
    'cardBg': 'colors.card',
    'divider': 'colors.border',
    'error': 'colors.destructive',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Check if useColors is used
    if 'useColors' not in content and 'useThemeColors' not in content:
        return

    # 2. Add useTailwindVars import if missing
    if 'useTailwindVars' not in content:
        # Try to insert after other hooks or imports
        # simplistic insertion
        if 'import useTailwindVars' not in content:
            content = re.sub(r'(import .*? from ["\'].*?["\'];)', r'\1\nimport useTailwindVars from "@/hooks/useTailwindVars";', content, count=1)

    # 3. Find destructuring: const { a, b } = useColors();
    # Regex to capture content inside { }
    # Handle multiline destructuring
    pattern = r'const\s*\{\s*([^}]+)\s*\}\s*=\s*(?:useColors|useThemeColors)\(\);?'
    
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in matches:
        full_match = match.group(0)
        vars_block = match.group(1)
        
        # Parse variables
        # Remove comments, split by comma
        vars_clean = re.sub(r'//.*', '', vars_block)
        vars_list = [v.strip() for v in vars_clean.split(',') if v.strip()]
        
        # Determine replacement line
        replacement_line = 'const { colors } = useTailwindVars();'
        
        # Replace the hook call line
        content = content.replace(full_match, replacement_line)
        
        # Now replace usages of each variable
        for var in vars_list:
            # handle aliasing: const { grey0: myColor } = ...
            if ':' in var:
                src_var, alias = [x.strip() for x in var.split(':')]
                target = MAPPING.get(src_var, f'colors.{src_var}') 
                # Replace alias usage? No, alias is defined by user.
                # const { grey0: myColor } = ... -> const { colors } = ...; const myColor = colors.foreground;
                # This is complex. Let's assume no aliasing for now or handle it simply.
                # If alias usage, we need to inject assignments.
                # fallback: just print warning?
                print(f"Warning: Aliasing found in {filepath}: {var}")
                continue
            
            src_var = var
            target = MAPPING.get(src_var)
            
            if target:
                # Replace whole word usages of src_var
                # Be careful not to replace object keys { grey0: ... } if it's not the variable
                # But here we assume `grey0` is the variable name.
                # Regex word boundary
                content = re.sub(r'\b' + re.escape(src_var) + r'\b', target, content)
            else:
                 # If no mapping, assume it maps to colors.varName (but likely invalid if not in mapping)
                 # e.g. 'success'
                 content = re.sub(r'\b' + re.escape(src_var) + r'\b', f'colors.{src_var}', content)

    # 4. Remove useColors import
    # import { useColors } from "@/hooks/uesColors";
    content = re.sub(r'import\s*\{[^}]*useColors[^}]*\}\s*from\s*["\'].*?["\'];?', '', content)
    content = re.sub(r'import\s*\{[^}]*useThemeColors[^}]*\}\s*from\s*["\'].*?["\'];?', '', content)

    if content != original_content:
        print(f"Refactored {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            try:
                process_file(os.path.join(subdir, file))
            except Exception as e:
                print(f"Error processing {file}: {e}")
