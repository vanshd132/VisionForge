from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import numpy as np
import cv2
import base64
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Store loaded YOLO models
loaded_models = {}

# Allowed file extensions
ALLOWED_EXTENSIONS = {"pt"}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_model(model_name):
    """Load the YOLO model if not already loaded."""
    if model_name not in loaded_models:
        model_path = f"./models/{model_name}/runs/detect/train3/weights/best.pt"
        if not os.path.exists(model_path):
            return None
        loaded_models[model_name] = YOLO(model_path)
    return loaded_models[model_name]


def load_user_model(model_id):
    model_path = f"./UserUploads/{model_id}/best.pt"
    if not os.path.exists(model_path):
        return None
    if model_id not in loaded_models:
        loaded_models[model_id] = YOLO(model_path)
    return loaded_models[model_id]


@app.route("/models", methods=["GET"])
def get_models():
    """Return available models."""
    models = []
    for folder in os.listdir("./models"):
        pt_path = f"./models/{folder}/runs/detect/train3/weights/best.pt"
        if os.path.exists(pt_path):
            models.append(folder)
    return jsonify({"models": models})


@app.route("/detect", methods=["POST"])
def detect():
    """Detect objects in the provided frame using the selected example model."""
    data = request.json
    model_name = data.get("model")
    frame_data = data.get("frame")

    if not model_name or not frame_data:
        return jsonify({"error": "Missing model or frame data"}), 400

    frame_bytes = base64.b64decode(frame_data.split(",")[1])
    np_frame = np.frombuffer(frame_bytes, dtype=np.uint8)
    frame = cv2.imdecode(np_frame, cv2.IMREAD_COLOR)

    model = load_model(model_name)
    if not model:
        return jsonify({"error": f"Model '{model_name}' not found"}), 404

    results = model.predict(frame)
    detections = []

    for box in results[0].boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        confidence = float(box.conf[0])
        class_name = model.names[int(box.cls[0])]
        detections.append({
            "x1": x1, "y1": y1, "x2": x2, "y2": y2,
            "confidence": confidence, "class": class_name
        })

    return jsonify({"detections": detections})


@app.route("/detect-user", methods=["POST"])
def detect_user():
    """Detect using user-uploaded model on the /upload page."""
    try:
        data = request.get_json()
        model_id = data.get('model_id')
        frame_data = data.get('frame')

        if not model_id or not frame_data:
            return jsonify({'error': 'model_id or frame missing'}), 400

        model = load_user_model(model_id)
        if model is None:
            return jsonify({'error': f'Model with ID {model_id} not found'}), 404

        frame_bytes = base64.b64decode(frame_data.split(',')[1])
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        results = model.predict(frame)
        detections = []
        for box in results[0].boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]

            detections.append({
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2,
                'confidence': conf,
                'class': cls_name
            })

        return jsonify({'detections': detections})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/upload-model", methods=["POST"])
def upload_model():
    """Upload a .pt file and store it in UserUploads folder."""
    if 'model' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['model']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        model_id = str(uuid.uuid4())[:8]
        model_folder = os.path.join("UserUploads", model_id)
        os.makedirs(model_folder, exist_ok=True)
        save_path = os.path.join(model_folder, "best.pt")
        file.save(save_path)

        loaded_models[model_id] = YOLO(save_path)

        return jsonify({
            "message": "Model uploaded successfully",
            "model_id": model_id
        }), 200

    return jsonify({"error": "Invalid file format. Only .pt files are allowed."}), 400
@app.route("/user-models", methods=["GET"])
def get_user_models():
    """Return all folders under UserUploads, assuming each is a user model."""
    models = []
    if os.path.exists("UserUploads"):
        for folder in os.listdir("UserUploads"):
            folder_path = os.path.join("UserUploads", folder)
            if os.path.isdir(folder_path):
                models.append(folder)  # folder name is the model ID
    return jsonify({"user_models": models})




if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3500, debug=True)
