from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os, base64, requests, json, io
from PIL import Image

app = FastAPI(title="Visual Chatbot Backend (HF Inference)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_TOKEN = os.environ.get("HF_TOKEN")  # required
HF_MODEL = os.environ.get("HF_MODEL", "microsoft/phi-3-vision-128k-instruct")

if not HF_TOKEN:
    print("WARNING: HF_TOKEN is not set. Set it in your deployment environment variables.")

@app.get("/")
def root():
    return {"status":"ok","model": HF_MODEL}

@app.post("/ask")
async def ask(image: UploadFile = File(...), question: str = Form(...)):
    """
    Receives an image + question, forwards to Hugging Face Inference API.
    Image is sent as base64 in JSON payload.
    """
    if not HF_TOKEN:
        return JSONResponse(status_code=500, content={"error":"HF_TOKEN not set on server. Create a Hugging Face token and set HF_TOKEN env var."})

    try:
        content = await image.read()
        # verify image can be opened (optional)
        try:
            Image.open(io.BytesIO(content)).convert("RGB")
        except Exception:
            return JSONResponse(status_code=400, content={"error":"Uploaded file is not a valid image."})

        b64 = base64.b64encode(content).decode()

        payload = {
            "inputs": {
                "question": question,
                "image": b64
            }
        }

        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        resp = requests.post(f"https://api-inference.huggingface.co/models/{HF_MODEL}", headers=headers, json=payload, timeout=120)

        if resp.status_code != 200:
            # forward HF error
            return JSONResponse(status_code=502, content={"error": f"HuggingFace inference error {resp.status_code}", "details": resp.text})

        data = resp.json()

        # normalize likely HF outputs to a simple string answer
        # common keys: 'generated_text', 'answer', 'output', 'result', 'text'
        def extract_text(obj):
            if isinstance(obj, str):
                return obj
            if isinstance(obj, dict):
                for k in ('generated_text','answer','output','result','text'):
                    if k in obj and isinstance(obj[k], str):
                        return obj[k]
                # sometimes nested fields
                for v in obj.values():
                    t = extract_text(v)
                    if t:
                        return t
            if isinstance(obj, list) and len(obj)>0:
                return extract_text(obj[0])
            return None

        answer = extract_text(data) or json.dumps(data)
        return {"answer": answer}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
