import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from mangum import Mangum
from backend.app.main import app

handler = Mangum(app)