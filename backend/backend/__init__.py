try:
    from ..main import app
except (ImportError, ValueError):
    try:
        from main import app
    except ImportError:
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from main import app
