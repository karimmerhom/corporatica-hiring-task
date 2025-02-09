from functools import wraps
import os
from flask import request, jsonify

def validate_file_upload(f):
    """Decorator to validate file upload requests."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        file_extension = file.filename.rsplit(".", 1)[-1].lower()
        if file_extension not in ['csv', 'xlsx', 'xls']:
            return jsonify({"error": "Unsupported file format. Only CSV and Excel files are allowed."}), 400

        return f(*args, **kwargs)

    return decorated_function

def validate_file_update(f):
    """Decorator to validate file update requests."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        file_extension = file.filename.rsplit(".", 1)[-1].lower()
        if file_extension not in ['csv', 'xlsx', 'xls']:
            return jsonify({"error": "Unsupported file format. Only CSV and Excel files are allowed."}), 400

        return f(*args, **kwargs)

    return decorated_function


def validate_text_input(f):
    """Decorator to validate text input in POST requests."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        return f(*args, **kwargs)
    return decorated_function


def validate_document_update(f):
    """Decorator to validate document update input."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided for update'}), 400
        return f(*args, **kwargs)
    return decorated_function

def validate_image_upload(f):
    """Decorator to validate image upload requests."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if files are present
        if 'files' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        files = request.files.getlist('files')
        
        # Check if files list is empty
        if not files or files[0].filename == '':
            return jsonify({"error": "No selected files"}), 400
        
        # Validate each file
        for file in files:
            if file.filename == '':
                return jsonify({"error": "One or more files have no filename"}), 400
            
            # Get file extension
            file_extension = file.filename.rsplit(".", 1)[-1].lower()
            
            # Allowed image extensions
            ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
            
            # Check file extension
            if file_extension not in ALLOWED_EXTENSIONS:
                return jsonify({
                    "error": f"Unsupported file format. Allowed formats are: {', '.join(ALLOWED_EXTENSIONS)}"
                }), 400
            
            # Optional: Check file size (e.g., limit to 10MB)
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)  # Reset file pointer
            
            if file_size > 100 * 1024 * 1024:  # 10MB
                return jsonify({"error": "File size exceeds 100MB limit"}), 400
        
        return f(*args, **kwargs)
    return decorated_function

def validate_single_image_upload(f):
    """Decorator to validate single image upload requests."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if image is present
        if 'image' not in request.files:
            return jsonify({"error": "No image part"}), 400
        
        file = request.files['image']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({"error": "No selected image"}), 400
        
        # Get file extension
        file_extension = file.filename.rsplit(".", 1)[-1].lower()
        
        # Allowed image extensions
        ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
        
        # Check file extension
        if file_extension not in ALLOWED_EXTENSIONS:
            return jsonify({
                "error": f"Unsupported file format. Allowed formats are: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Optional: Check file size (e.g., limit to 10MB)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        if file_size > 100 * 1024 * 1024:  # 10MB
            return jsonify({"error": "File size exceeds 100MB limit"}), 400
        
        return f(*args, **kwargs)
    return decorated_function

def validate_tsne_input(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        data = request.get_json()
        if not data or 'texts' not in data or not isinstance(data['texts'], list) or not all(isinstance(t, str) for t in data['texts']):
            return jsonify({'error': 'Invalid input: "texts" must be a list of non-empty strings'}), 400
        return func(*args, **kwargs)
    return wrapper

def validate_doc_id(func):
    @wraps(func)
    def wrapper(doc_id, *args, **kwargs):
        if not str(doc_id).isdigit():
            return jsonify({'error': 'Invalid document ID'}), 400
        return func(doc_id, *args, **kwargs)
    return wrapper