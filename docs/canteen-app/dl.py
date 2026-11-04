import urllib.request, os

base = r"C:\Users\ADMINN HP\Doubao\chats\2026-11-04\new-chat\canteen-app\assets"
items = [
    ("https://aka.doubaocdn.com/s/VLACUgFDTm", "hero.jpg"),
    ("https://aka.doubaocdn.com/s/G3XoYJ3H76", "chuan.jpg"),
    ("https://aka.doubaocdn.com/s/jT39Fhn8Uh", "shaola.jpg"),
    ("https://aka.doubaocdn.com/s/gtF4XxsLkP", "mian.jpg"),
    ("https://aka.doubaocdn.com/s/cdVQv8iK6L", "qingshi.jpg"),
    ("https://aka.doubaocdn.com/s/FL5C7eEK5E", "tangfen.jpg"),
]
hdr = {"User-Agent": "Mozilla/5.0"}
for url, name in items:
    dest = os.path.join(base, name)
    try:
        req = urllib.request.Request(url, headers=hdr)
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        with open(dest, "wb") as f:
            f.write(data)
        print(name, len(data), "bytes")
    except Exception as e:
        print(name, "FAIL", repr(e))
