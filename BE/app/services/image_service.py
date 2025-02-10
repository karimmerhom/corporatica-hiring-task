import os
import cv2
import PIL
from PIL import Image
import uuid

class ImageService:
    """
    A service class for handling image processing tasks such as resizing,
    segmentation, format conversion, and batch processing.
    """
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'images')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

    @staticmethod
    def allowed_file(filename):
        """
        Check if the file has an allowed extension.
        
        :param filename: Name of the file
        :return: Boolean indicating if the file is allowed
        """
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ImageService.ALLOWED_EXTENSIONS

    @staticmethod
    def generate_unique_filename(filename):
        """
        Generate a unique filename to prevent overwriting.
        
        :param filename: Original filename
        :return: Unique filename
        """
        unique_id = uuid.uuid4().hex
        ext = filename.rsplit('.', 1)[1].lower()
        return f"{unique_id}.{ext}"

    @staticmethod
    def process_single_image(image_path):
        """
        Process a single image and extract key information such as dimensions,
        channels, and color histogram.
        
        :param image_path: Path to the image file
        :return: Dictionary containing image details
        """
        img = cv2.imread(image_path)
        height, width, channels = img.shape

        color_hist = {
            'red': cv2.calcHist([img], [2], None, [256], [0, 256]).flatten().tolist(),
            'green': cv2.calcHist([img], [1], None, [256], [0, 256]).flatten().tolist(),
            'blue': cv2.calcHist([img], [0], None, [256], [0, 256]).flatten().tolist()
        }

        return {
            'filename': os.path.basename(image_path),
            'dimensions': {'height': height, 'width': width},
            'channels': channels,
            'color_histogram': color_hist
        }

    @staticmethod
    def generate_segmentation_mask(image_path, method='simple'):
        """
        Generate a segmentation mask for an image using simple or adaptive thresholding.
        
        :param image_path: Path to the image file
        :param method: Segmentation method ('simple' or 'adaptive')
        :return: Path to the saved mask image
        """
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        if method == 'simple':
            _, mask = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        elif method == 'adaptive':
            mask = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )

        mask_path = image_path.replace('.', '_mask.')
        cv2.imwrite(mask_path, mask)
        return os.path.basename(mask_path)

    @staticmethod
    def batch_process_images(image_files):
        """
        Process multiple images in a batch.
        
        :param image_files: List of uploaded image files
        :return: List of processed image details
        """
        results = []
        for image_file in image_files:
            if image_file and ImageService.allowed_file(image_file.filename):
                filename = ImageService.generate_unique_filename(image_file.filename)
                filepath = os.path.join(ImageService.UPLOAD_FOLDER, filename)
                image_file.save(filepath)

                result = ImageService.process_single_image(filepath)
                result['segmentation_mask'] = ImageService.generate_segmentation_mask(filepath)
                results.append(result)

        return results

    @staticmethod
    def resize_image(image_path, width=None, height=None):
        """
        Resize an image while maintaining aspect ratio if only one dimension is provided.
        
        :param image_path: Path to the image file
        :param width: Desired width (optional)
        :param height: Desired height (optional)
        :return: Path to the resized image
        """
        img = Image.open(image_path)

        if width and height:
            img = img.resize((width, height), PIL.Image.LANCZOS)
        elif width:
            aspect_ratio = width / img.width
            new_height = int(img.height * aspect_ratio)
            img = img.resize((width, new_height), PIL.Image.LANCZOS)
        elif height:
            aspect_ratio = height / img.height
            new_width = int(img.width * aspect_ratio)
            img = img.resize((new_width, height), PIL.Image.LANCZOS)

        new_path = image_path.replace('.', f'_resized.')
        img.save(new_path)
        return new_path

    @staticmethod
    def convert_image_format(image_path, output_format='png'):
        """
        Convert an image to a specified format, handling transparency issues if needed.
        
        :param image_path: Path to the image file
        :param output_format: Desired output format ('png', 'jpg', etc.)
        :return: Path to the converted image
        """
        img = Image.open(image_path)

        if output_format.lower() in ['jpg', 'jpeg'] and img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background

        if output_format.lower() in ['jpg', 'jpeg']:
            img = img.convert('RGB')

        new_path = image_path.rsplit('.', 1)[0] + f'.{output_format}'
        img.save(new_path)
        return new_path
