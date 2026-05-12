import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    uris = [
        ('mongodb+srv://hrishikeshshiralaskar_db_use:R0QhFmSKypYUnw2g@docintelligence.cymzuyh.mongodb.net/?appName=DocIntelligence', 'hrishi')
    ]
    for uri, name in uris:
        client = AsyncIOMotorClient(uri)
        try:
            await client.admin.command('ping')
            print(f'SUCCESS: {name}')
        except Exception as e:
            print(f'FAILED: {name} - {e}')

asyncio.run(test())
