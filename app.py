from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from PIL import Image
import numpy as np
from skimage.metrics import structural_similarity as ssim
import io
import zipfile
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production
jwt = JWTManager(app)

# Ensure uploads directory exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# In-memory user storage (replace with database in production)
users = {}

def calculate_image_similarity(img1_path, img2_path):
    # Load and resize images
    img1 = Image.open(img1_path).convert('RGB').resize((100, 100))
    img2 = Image.open(img2_path).convert('RGB').resize((100, 100))
    
    # Convert to numpy arrays
    img1_array = np.array(img1)
    img2_array = np.array(img2)
    
    # Calculate SSIM
    similarity = ssim(img1_array, img2_array, multichannel=True)
    return similarity

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username in users:
        return jsonify({'error': 'Username already exists'}), 400
    
    users[username] = generate_password_hash(password)
    return jsonify({'message': 'User registered successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username not in users or not check_password_hash(users[username], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=username)
    return jsonify({'access_token': access_token})

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_photo():
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo provided'}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        return jsonify({'message': 'Photo uploaded successfully', 'filename': unique_filename})

@app.route('/api/find-similar', methods=['POST'])
@jwt_required()
def find_similar_photos():
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo provided'}), 400
    
    sample_file = request.files['photo']
    similarity_threshold = float(request.form.get('threshold', 0.8))
    
    # Save sample photo temporarily
    sample_path = os.path.join(UPLOAD_FOLDER, 'temp_sample.jpg')
    sample_file.save(sample_path)
    
    similar_photos = []
    for filename in os.listdir(UPLOAD_FOLDER):
        if filename != 'temp_sample.jpg':
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            similarity = calculate_image_similarity(sample_path, file_path)
            if similarity >= similarity_threshold:
                similar_photos.append({
                    'filename': filename,
                    'path': file_path,
                    'similarity': float(similarity)
                })
    
    # Clean up temporary file
    os.remove(sample_path)
    
    return jsonify({'similar_photos': similar_photos})

@app.route('/api/download', methods=['POST'])
@jwt_required()
def download_photos():
    data = request.get_json()
    photo_paths = data.get('photo_paths', [])
    
    if not photo_paths:
        return jsonify({'error': 'No photos selected'}), 400
    
    # Create zip file in memory
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w') as zf:
        for path in photo_paths:
            zf.write(path, os.path.basename(path))
    
    memory_file.seek(0)
    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name='similar_photos.zip'
    )

if __name__ == '__main__':
    app.run(debug=True) 