import os
from huggingface_hub import InferenceClient
from langchain.prompts import PromptTemplate


class LLMService:
    def __init__(self):
        self.client = InferenceClient(
            model="Qwen/Qwen2.5-72B-Instruct",
            token=os.getenv("HF_TOKEN"),
        )

    def summarize_text(self, text: str, lang: str) -> str:
        template = (
            "You are an expert assistant. Your task is to summarize the following text "
            "and translate the summary to the requested language: {lang}.\n\n"
            "Return ONLY the translated summary, without any introductions, quotes, or extra text.\n\n"
            "Text to summarize:\n{text}"
        )

        prompt = PromptTemplate(
            input_variables=["text", "lang"],
            template=template
        )

        formatted_prompt = prompt.format(text=text, lang=lang)

        response = self.client.chat_completion(
            messages=[{"role": "user", "content": formatted_prompt}],
            temperature=0.5,
            top_p=0.7,
            max_tokens=500,
        )

        return response.choices[0].message.content.strip()
