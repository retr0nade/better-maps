from fastapi import FastAPI

app = FastAPI(title="Route Optimizer API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Route Optimizer API running"}
