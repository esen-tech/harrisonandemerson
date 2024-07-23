import uvicorn

from services.marketing.database.orm import start_mappers
from services.marketing.web_server.app import get_app

start_mappers()
app = get_app()
uvicorn.run(app, host="0.0.0.0", port=9006)
