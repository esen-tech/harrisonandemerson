import uvicorn
from services.product.database.orm import start_mappers
from services.product.web_server.app import get_app

start_mappers()
app = get_app()
uvicorn.run(app, host="0.0.0.0", port=9007)
