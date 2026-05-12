import asyncio
from file_processor import process_file
from ai_extractor import extract_data

with open("test.png", "wb") as f:
    f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")

with open("test.png", "rb") as f:
    b = f.read()

try:
    p = process_file(b, "test.png", "image/png")
    print("Process success:", p["type"])
    res = extract_data(p, "Auto-detect")
    print("Extract success:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
