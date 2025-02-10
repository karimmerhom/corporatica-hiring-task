import mimetypes
import os
from flask import jsonify, request, send_file, send_from_directory
from app.services.image_service import ImageService
from app.utils.validators import validate_image_upload, validate_single_image_upload

class ImageController:
    """
    Controller for handling image-related operations such as uploading, processing, retrieving, and converting images.
    """
    
    @staticmethod
    @validate_image_upload
    def upload_images():
        """
        Handle image uploads, including batch processing.
        Ensures the upload directory exists before saving files.
        
        Returns:
            JSON response with the number of processed images and their details.
        """
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
        """
        Retrieve details for a specific image.
        
        Args:
            image_id (str): Unique identifier for the image.
        
        Returns:
            JSON response containing image details or an error message if not found.
        """
        image_path = os.path.join(ImageService.UPLOAD_FOLDER, f'{image_id}')
        
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404
        
        details = ImageService.process_single_image(image_path)
        return jsonify(details), 200

    @staticmethod
    @validate_single_image_upload
    def generate_histogram():
        """
        Generate a color histogram for an uploaded image.
        
        Returns:
            JSON response containing the color histogram data.
        """
        image_file = request.files['image']
        filename = ImageService.generate_unique_filename(image_file.filename)
        filepath = os.path.join(ImageService.UPLOAD_FOLDER, filename)
        image_file.save(filepath)
        
        details = ImageService.process_single_image(filepath)
        return jsonify(details['color_histogram']), 200

    @staticmethod
    @validate_single_image_upload
    def resize_image():
        """
        Resize an uploaded image based on the given width and height.
        
        Returns:
            JSON response containing the original and resized image filenames.
        """
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
        """
        Convert an uploaded image to a specified format (default: PNG).
        
        Returns:
            JSON response containing the original and converted image filenames.
        """
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
        """
        Retrieve and return an image by its name.
        
        Args:
            image_name (str): Name of the image file.
        
        Returns:
            The image file with the correct MIME type or an error message if not found.
        """
        image_path = os.path.join(ImageService.UPLOAD_FOLDER, image_name)
        image_path = os.path.normpath(image_path)
        
        if not os.path.exists(image_path):
            return jsonify({'error': f'Image not found at {image_path}'}), 404

        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type:
            mime_type = 'application/octet-stream'

        try:
            return send_file(image_path, mimetype=mime_type), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    @staticmethod
    def download_image(image_name):
        """
        Download an image by its name.
        
        Args:
            image_name (str): Name of the image file.
        
        Returns:
            The image file as an attachment for download or an error message if not found.
        """
        image_path = os.path.join(ImageService.UPLOAD_FOLDER, image_name)
        
        if not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 404
        
        try:
            return send_from_directory(
                ImageService.UPLOAD_FOLDER,
                image_name,
                as_attachment=True
            ), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
