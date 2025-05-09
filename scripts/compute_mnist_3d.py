import os
import json
import numpy as np
from PIL import Image
from sklearn.manifold import TSNE

# Paths
SAMPLE_DIR = "public/mnist-sample"
META_PATH = os.path.join(SAMPLE_DIR, "meta.json")
OUT_PATH = os.path.join(SAMPLE_DIR, "coords.json")

# Load meta.json to get file order
with open(META_PATH, "r") as f:
    meta = json.load(f)

# Read and flatten all PNGs
images = []
for item in meta:
    img_path = os.path.join(SAMPLE_DIR, item["file"])
    img = Image.open(img_path).convert("L").resize((28, 28))
    arr = np.array(img).astype(np.float32).flatten() / 255.0
    images.append(arr)
images = np.stack(images)

# Run t-SNE (3D)
print("Running t-SNE...")
tsne = TSNE(n_components=3, random_state=42, init="random", perplexity=30)
coords = tsne.fit_transform(images)

# Save coordinates as a list of [x, y, z]
coords_list = coords.tolist()
with open(OUT_PATH, "w") as f:
    json.dump(coords_list, f)
print(f"Saved 3D coordinates to {OUT_PATH}")
