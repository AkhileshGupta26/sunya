import os
import py_compile

def check_syntax(directory):
    print(f"Checking syntax for Python files in {directory}...")
    errors_found = False
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".py"):
                full_path = os.path.join(root, file)
                try:
                    py_compile.compile(full_path, doraise=True)
                    print(f"OK: {file}")
                except py_compile.PyCompileError as e:
                    print(f"ERROR: {file}\n{e}")
                    errors_found = True
                except Exception as e:
                    print(f"ERROR (Unknown): {file}\n{e}")
                    errors_found = True
    
    if errors_found:
        print("\n\nFAILED: Syntax errors detected.")
        exit(1)
    else:
        print("\n\nSUCCESS: No syntax errors found.")
        exit(0)

if __name__ == "__main__":
    check_syntax("backend")
