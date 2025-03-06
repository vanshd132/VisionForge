from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import numpy as np
import cv2
import base64
import os

app = Flask(__name__)
CORS(app)

# Load YOLO models dynamically
loaded_models = {}


def load_model(model_name):
    """Load the YOLO model if not already loaded."""
    if model_name not in loaded_models:
        model_path = f"./models/{model_name}/runs/detect/train3/weights/best.pt"
        if not os.path.exists(model_path):
            return None
        loaded_models[model_name] = YOLO(model_path)
    return loaded_models[model_name]


@app.route("/models", methods=["GET"])
def get_models():
    """Return available models."""
    models = [folder for folder in os.listdir("./models") if os.path.isdir(f"./models/{folder}")]
    return jsonify({"models": models})


@app.route("/detect", methods=["POST"])
def detect():
    """Detect objects in the provided frame using the selected model."""
    data = request.json
    model_name = data.get("model")
    frame_data = data.get("frame")

    if not model_name or not frame_data:
        return jsonify({"error": "Missing model or frame data"}), 400

    # Decode the base64 frame
    
    frame_bytes = base64.b64decode(frame_data.split(",")[1])
    np_frame = np.frombuffer(frame_bytes, dtype=np.uint8)
    frame = cv2.imdecode(np_frame, cv2.IMREAD_COLOR)
    

    # Load and use the selected model
    model = load_model(model_name)
    if not model:
        
        return jsonify({"error": f"Model '{model_name}' not found"}), 404
        

    # Perform detection
    results = model.predict(frame)
    detections = []

    for box in results[0].boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        confidence = float(box.conf[0])
        class_name = model.names[int(box.cls[0])]
        detections.append({"x1": x1, "y1": y1, "x2": x2, "y2": y2, "confidence": confidence, "class": class_name})

    return jsonify({"detections": detections})


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3500, debug=True)
