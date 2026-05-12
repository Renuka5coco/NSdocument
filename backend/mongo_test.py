import os
import certifi
import traceback
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(override=True)
uri = os.environ.get('MONGO_URI')
print('URI=', uri)

try:
    client = MongoClient(uri, tls=True, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
    print('client created')
    print(client.server_info())
except Exception:
    traceback.print_exc()
