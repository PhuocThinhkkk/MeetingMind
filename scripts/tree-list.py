import os

def generate_folder_structure(path, exclusions, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(path):
            dirs[:] = [d for d in dirs if d not in exclusions]

            level = root.replace(path, '').count(os.sep)
            indent = ' ' * 4 * level
            f.write(f'{indent}{os.path.basename(root)}/\n')

            subindent = ' ' * 4 * (level + 1)
            for file in files:
                f.write(f'{subindent}{file}\n')

if __name__ == "__main__":
    base_path = os.getcwd()  
    exclusions = ['node_modules', '.next', 'backups', '.git']
    output_file = 'folder_structure.txt'

    generate_folder_structure(base_path, exclusions, output_file)