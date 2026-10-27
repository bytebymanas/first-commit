# """
# # ============================================================
# # First Commit — Kaggle Inference Kernel (Ollama edition)
# #
# # Runs Gemma 3 through Ollama on Kaggle's free T4 GPU.
# # No Hugging Face account, licence or token needed.
# # The API is exposed through ngrok or a Cloudflare quick tunnel
# # so your local Express server can call it.
# #
# # ── Setup ───────────────────────────────────────────────────
# # 1. Create a Kaggle notebook
# # 2. Settings -> Accelerator -> GPU T4 x2
# # 3. Settings -> Internet -> On   (required to install/pull)
# # 4. (Optional) Kaggle Secret NGROK_AUTH_TOKEN. Without it, a
# #    Cloudflare quick tunnel is used automatically.
# # 5. Paste this file into a cell and run it
# # 6. Copy the URL printed at the end
# # 7. Set KAGGLE_KERNEL_URL=<url> in your local .env
# # ============================================================
# """

# # ── Cell 1: Install dependencies ─────────────────────────────

# import subprocess


# def sh(cmd: str) -> None:
#     """Run a shell command, raising if it fails."""
#     subprocess.run(cmd, shell=True, check=True)


# sh("pip install -q fastapi uvicorn pyngrok requests")
# sh("apt-get update -qq && apt-get install -y -qq zstd pciutils")
# sh("curl -fsSL https://ollama.com/install.sh | sh")

# # ── Cell 2: Start Ollama and pull models ─────────────────────

# import os
# import re
# import time
# import threading
# from typing import Optional

# import requests
# import uvicorn
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

# OLLAMA_URL = "http://127.0.0.1:11434"

# # Public model names (used by your Express server) -> Ollama tags
# MODELS = {
#     "gemma-3-4b-it":  "gemma3:4b",
#     "gemma-3-12b-it": "gemma3:12b",
# }


# def start_ollama() -> subprocess.Popen:
#     """Launch `ollama serve` in the background and wait until it responds."""
#     env = {
#         **os.environ,
#         "OLLAMA_HOST": "127.0.0.1:11434",
#         "OLLAMA_KEEP_ALIVE": "-1",        # keep models resident in VRAM
#         "OLLAMA_MAX_LOADED_MODELS": "2",  # both Gemma sizes at once
#     }
#     proc = subprocess.Popen(
#         ["ollama", "serve"],
#         env=env,
#         stdout=subprocess.DEVNULL,
#         stderr=subprocess.DEVNULL,
#     )
#     for _ in range(60):
#         try:
#             if requests.get(f"{OLLAMA_URL}/api/tags", timeout=2).ok:
#                 return proc
#         except requests.RequestException:
#             time.sleep(1)
#     raise RuntimeError("Ollama server did not start within 60 seconds.")


# print("Starting Ollama...")
# ollama_proc = start_ollama()
# print("✓ Ollama running")

# for public_name, ollama_tag in MODELS.items():
#     print(f"Pulling {public_name} ({ollama_tag})...")
#     sh(f"ollama pull {ollama_tag}")
#     print(f"✓ {public_name} ready")

# # ── Cell 3: FastAPI app (same API as before) ─────────────────

# app = FastAPI(title="First Commit Gemma Inference API", version="1.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# class GenerateRequest(BaseModel):
#     prompt: str
#     system: Optional[str] = None
#     model: str = "gemma-3-4b-it"   # "gemma-3-4b-it" or "gemma-3-12b-it"
#     max_tokens: int = 2048
#     temperature: float = 0.25
#     json_mode: bool = False


# class GenerateResponse(BaseModel):
#     generated_text: str
#     model: str
#     latency_ms: int


# def build_messages(prompt: str, system: Optional[str]) -> list:
#     """Build the chat messages; Ollama applies Gemma's template itself."""
#     messages = []
#     if system:
#         messages.append({"role": "system", "content": system})
#     messages.append({"role": "user", "content": prompt})
#     return messages


# def generate(req: GenerateRequest) -> str:
#     """Run inference on the selected Gemma model via Ollama."""
#     model_key = req.model if req.model in MODELS else "gemma-3-4b-it"

#     payload = {
#         "model": MODELS[model_key],
#         "messages": build_messages(req.prompt, req.system),
#         "stream": False,
#         "options": {
#             "num_predict": req.max_tokens,
#             "temperature": req.temperature,
#             "repeat_penalty": 1.1,
#         },
#     }
#     if req.json_mode:
#         payload["format"] = "json"

#     response = requests.post(f"{OLLAMA_URL}/api/chat", json=payload, timeout=600)
#     response.raise_for_status()
#     return response.json()["message"]["content"].strip()


# # ── Endpoints ─────────────────────────────────────────────────

# @app.get("/health")
# def health():
#     try:
#         requests.get(f"{OLLAMA_URL}/api/tags", timeout=3).raise_for_status()
#         status = "ok"
#     except requests.RequestException:
#         status = "ollama_unreachable"
#     return {
#         "status": status,
#         "models": list(MODELS.keys()),
#         "device": "cuda (ollama)",
#     }


# @app.post("/generate", response_model=GenerateResponse)
# def generate_endpoint(req: GenerateRequest):
#     try:
#         start = time.time()
#         text = generate(req)
#         latency_ms = int((time.time() - start) * 1000)
#         print(f"[{req.model}] {latency_ms}ms | prompt={len(req.prompt)} chars | output={len(text)} chars")
#         return GenerateResponse(generated_text=text, model=req.model, latency_ms=latency_ms)
#     except Exception as e:
#         print(f"Error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))


# # ── Cell 4: Start server + expose via ngrok or Cloudflare ────

# def run_server():
#     uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")


# thread = threading.Thread(target=run_server, daemon=True)
# thread.start()
# time.sleep(3)  # wait for server to start

# public_url = None

# # OPTION A: ngrok, if a token exists in Kaggle Secrets
# try:
#     from kaggle_secrets import UserSecretsClient
#     from pyngrok import ngrok

#     ngrok_token = UserSecretsClient().get_secret("NGROK_AUTH_TOKEN")
#     if ngrok_token:
#         ngrok.set_auth_token(ngrok_token)
#         public_url = ngrok.connect(8000).public_url
#         print(f"✓ Connected via ngrok: {public_url}")
# except Exception:
#     pass

# # OPTION B: Cloudflare quick tunnel (no account or token needed)
# if not public_url:
#     print("Using Cloudflare Quick Tunnel (no signup/token needed)...")
#     sh("wget -q -nc https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared")
#     sh("chmod +x cloudflared")
#     cf_proc = subprocess.Popen(
#         ["./cloudflared", "tunnel", "--url", "http://localhost:8000"],
#         stdout=subprocess.DEVNULL,
#         stderr=subprocess.PIPE,
#         text=True,
#     )
#     for line in iter(cf_proc.stderr.readline, ""):
#         match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
#         if match:
#             public_url = match.group(0)
#             break

#     # Keep draining stderr so cloudflared never blocks on a full pipe
#     threading.Thread(
#         target=lambda: [None for _ in iter(cf_proc.stderr.readline, "")],
#         daemon=True,
#     ).start()

# print("=" * 60)
# print("✅ First Commit Gemma Cloud GPU API is LIVE!")
# print(f"   URL: {public_url}")
# print(f"   Health check: {public_url}/health")
# print("=" * 60)
# print("Add this to your local .env:")
# print("  AI_PROVIDER=kaggle")
# print(f"  KAGGLE_KERNEL_URL={public_url}")
# print("=" * 60)

# # Keep the kernel alive
# while True:
#     time.sleep(60)
#     print(f"[keepalive] Server running... endpoint: {public_url}")
