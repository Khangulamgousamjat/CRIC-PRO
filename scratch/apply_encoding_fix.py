import os

replacements = {
    # Menu
    b'\xc3\xa2\xcb\x9c\xc2\xb0': '☰',
    # Arrows
    b'\xc3\xa2\xe2\x80\xa0\xe2\x80\x99': '→',
    b'\xc3\xa2\xe2\x80\xa0\xc2\x90': '←',
    # People/Objects
    b'\xc3\xb0\xc5\xb8\xe2\x80\x98\xc2\xa4': '👤',
    b'\xc3\xb0\xc5\xb8\xe2\x84\xa2\xcb\x86': '🙈',
    b'\xc3\xb0\xc5\xb8\xe2\x80\x9c\xc2\x8d': '📍',
    b'\xc3\xb0\xc5\xb8\xe2\x80\x9c\xe2\x80\xa6': '🗓️',
    b'\xc3\xb0\xc5\xb8\xc5\xa1\xc2\xa8': '🚨',
    # Symbols
    b'\xc3\xa2\xe2\x82\xac\xc2\xa2': '•',
    b'\xc3\xa2\xc5\xa1\xc2\xa1': '⚡',
    b'\xc3\xa2\xc5\x93\xe2\x80\xa2': '✖',
    b'\xc3\xb0\xc5\xb8\xc2\xa7\xc2\xbf': '🧿',
    # Complex ones (Shield/Eye)
    b'\xc3\xb0\xc5\xb8\xe2\x80\xba\xc2\xa1\xc3\xaf\xc2\xb8\xc2\x8f': '🛡️',
    b'\xc3\xb0\xc5\xb8\xe2\x80\x98\xc2\x81\xc3\xaf\xc2\xb8\xc2\x8f': '👁️',
}

# Special case for b'\xc3\xb0\xc5\xb8\xc2\x8f\xc2\x8f' which can be Trophy or Cricket Bat
TROPHY_HINT = b'Top Scorers'
CRICKET_HINT = b'Scheduled Matches'

def fix_files(root_dir):
    for file_name in os.listdir(root_dir):
        if not file_name.endswith('.html'):
            continue
        
        path = os.path.join(root_dir, file_name)
        with open(path, 'rb') as f:
            content = f.read()
        
        # Handle the ambiguous b'\xc3\xb0\xc5\xb8\xc2\x8f\xc2\x8f'
        ambiguous = b'\xc3\xb0\xc5\xb8\xc2\x8f\xc2\x8f'
        if ambiguous in content:
            if b'Scorers' in content or b'Leaderboard' in content:
                content = content.replace(ambiguous, '🏆'.encode('utf-8'))
            else:
                content = content.replace(ambiguous, '🏏'.encode('utf-8'))
        
        # Apply standard replacements
        for byte_seq, char in replacements.items():
            if byte_seq in content:
                content = content.replace(byte_seq, char.encode('utf-8'))
        
        # Remove BOM if present
        content = content.replace(b'\xef\xbb\xbf', b'')
        
        with open(path, 'wb') as f:
            f.write(content)
        print(f"Fixed {file_name}")

if __name__ == "__main__":
    fix_files('frontend')
