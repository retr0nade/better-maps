from fastapi import FastAPI
from backend.routes import router

app = FastAPI(title="Route Optimizer API", version="1.0.0")

# Include the routes
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Route Optimizer API running"}
