import uvicorn
from services.emerson_gateway.web_server.app import get_app

app = get_app()
uvicorn.run(app, host="0.0.0.0", port=8001)
