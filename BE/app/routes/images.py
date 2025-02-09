from flask import Blueprint

from app.controllers.images_controller import ImageController


bp = Blueprint('image', __name__, url_prefix='/api/images')

bp.route('/upload', methods=['POST'])(ImageController.upload_images)
bp.route('/<image_id>', methods=['GET'])(ImageController.get_image_details)
bp.route('/histogram', methods=['POST'])(ImageController.generate_histogram)
bp.route('/resize', methods=['POST'])(ImageController.resize_image)
bp.route('/convert', methods=['POST'])(ImageController.convert_image_format)
bp.route('/view/<image_name>', methods=['GET'])(ImageController.get_image_by_name)
bp.route('/download/<image_name>', methods=['GET'])(ImageController.download_image)

