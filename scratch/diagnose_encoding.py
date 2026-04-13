import os
import re

def find_corruptions(root_dir):
    files = [f for f in os.listdir(root_dir) if f.endswith('.html')]
    for file_name in files:
        path = os.path.join(root_dir, file_name)
        with open(path, 'rb') as f:
            content = f.read()
        
        # Find sequences of high-byte characters
        matches = re.findall(rb'[\x80-\xff]+', content)
        if matches:
            unique_matches = sorted(list(set(matches)), key=len, reverse=True)
            print(f"File: {file_name}")
            for m in unique_matches:
                try:
                    # Try to see how it looks in CP1252 or similar
                    print(f"  {m} -> {m.decode('utf-8', errors='replace')} (utf-8) | {m.decode('cp1252', errors='replace')} (cp1252)")
                except:
                    print(f"  {m}")
            print("-" * 20)

if __name__ == "__main__":
    find_corruptions('frontend')
