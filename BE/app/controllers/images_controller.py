import mimetypes
import os
from flask import jsonify, request, send_file, send_from_directory
from app.services.image_service import ImageService
from app.utils.validators import validate_image_upload, validate_single_image_upload

class ImageController:
    @staticmethod
    @validate_image_upload
    def upload_images():
        """Handle image uploads, including batch processing"""
        # Ensure upload directory exists
        os.makedirs(ImageService.UPLOAD_FOLDER, exist_ok=True)
        
        files = request.files.getlist('files')
        
        try:
            results = ImageService.batch_process_images(files)
            return jsonify({
                'message': f'Processed {len(results)} images',
                'results': results
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def get_image_details(image_id):
        """Retrieve details for a specific image"""
        image_path = os.path.join(ImageService.UPLOAD_FOLDER, f'{image_id}')
        
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404
        
        details = ImageService.process_single_image(image_path)
        return jsonify(details), 200

    @staticmethod
    @validate_single_image_upload
    def generate_histogram():
        """Generate color histogram for an image"""
        image_file = request.files['image']
        filename = ImageService.generate_unique_filename(image_file.filename)
        filepath = os.path.join(ImageService.UPLOAD_FOLDER, filename)
        image_file.save(filepath)
        
        details = ImageService.process_single_image(filepath)
        return jsonify(details['color_histogram']), 200

    @staticmethod
    @validate_single_image_upload
    def resize_image():
        """Resize an uploaded image"""
        image_file = request.files['image']
        filename = ImageService.generate_unique_filename(image_file.filename)
        filepath = os.path.join(ImageService.UPLOAD_FOLDER, filename)
        image_file.save(filepath)
        
        width = request.form.get('width', type=int)
        height = request.form.get('height', type=int)
        
        resized_path = ImageService.resize_image(filepath, width, height)
        
        return jsonify({
            'original_filename': filename,
            'resized_filename': os.path.basename(resized_path)
        }), 200

    @staticmethod
    @validate_single_image_upload
    def convert_image_format():
        """Convert image format"""
        image_file = request.files['image']
        filename = ImageService.generate_unique_filename(image_file.filename)
        filepath = os.path.join(ImageService.UPLOAD_FOLDER, filename)
        image_file.save(filepath)
        
        output_format = request.form.get('format', 'png').lower()
        converted_path = ImageService.convert_image_format(filepath, output_format)
        
        return jsonify({
            'original_filename': filename,
            'converted_filename': os.path.basename(converted_path)
        }), 200
        
    @staticmethod
    def get_image_by_name(image_name):
        """Retrieve and return a specific image"""
        # Get the absolute path for uploads
        image_path = os.path.join(ImageService.UPLOAD_FOLDER, image_name)
        
        # Normalize the path for the current OS
        image_path = os.path.normpath(image_path)

        # Ensure path uses forward slashes for web access
        web_path = image_path.replace("\\", "/")  # Convert backslashes to forward slashes

        print(f"Looking for image at: {image_path}")
        print(f"Web path: {web_path}")

        # Check if the file exists at the specified path
        if not os.path.exists(image_path):
            return jsonify({'error': f'Image not found at {image_path}'}), 404

        # Dynamically detect MIME type
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type:
            mime_type = 'application/octet-stream'  # Fallback MIME type

        try:
            # Send the image to the client with the correct MIME type
            return send_file(image_path, mimetype=mime_type), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    @staticmethod
    def download_image(image_name):
        """Download a specific image by its name"""
        image_path = os.path.join(ImageService.UPLOAD_FOLDER, image_name)
        
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404
        
        try:
            # Send the image file for download
            return send_from_directory(
                ImageService.UPLOAD_FOLDER,
                image_name,
                as_attachment=True
            ), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
