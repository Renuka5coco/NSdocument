import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path, override=True)

client = Groq(api_key=os.environ.get('GROQ_API_KEY'))
print([m.id for m in client.models.list().data])
