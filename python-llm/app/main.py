import sys
from dotenv import load_dotenv

load_dotenv()
sys.path = sys.path + ["./app"]

from fastapi import FastAPI
from pydantic import BaseModel, Field
from services.llm_service import LLMService

app = FastAPI()
llm_service = LLMService()


class TextData(BaseModel):
    text: str = Field(..., description="Texto a ser resumido")
    lang: str = Field(..., description="Idioma para o qual o resumo deve ser traduzido (ex: pt, en, es)")


@app.get("/")
async def root():
    return {"message": "API is running"}


@app.post("/summarize")
async def summarize(data: TextData):
    summary = llm_service.summarize_text(text=data.text, lang=data.lang)
    return {"summary": summary}
