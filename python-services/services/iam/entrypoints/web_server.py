import uvicorn
from services.iam.database.orm import start_mappers
from services.iam.web_server.app import get_app

start_mappers()
app = get_app()
uvicorn.run(app, host="0.0.0.0", port=9001)
