# run_api.py
import uvicorn
from app.main import app 

if __name__ == "__main__":
    # Roda o servidor
    uvicorn.run(app, host="127.0.0.1", port=8000)