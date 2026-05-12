import os
from groq import Groq
client = Groq(api_key=os.environ.get('GROQ_API_KEY'))
print([m.id for m in client.models.list().data])
