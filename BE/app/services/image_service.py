import os
import cv2
import PIL
from PIL import Image
import uuid

class ImageService:
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'images')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

    @staticmethod
    def allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ImageService.ALLOWED_EXTENSIONS

    @staticmethod
    def generate_unique_filename(filename):
        """Generate a unique filename to prevent overwriting"""
        unique_id = uuid.uuid4().hex
        ext = filename.rsplit('.', 1)[1].lower()
        return f"{unique_id}.{ext}"

    @staticmethod
    def process_single_image(image_path):
        """Process a single image and extract key information"""
        img = cv2.imread(image_path)
        
        # Basic image info
        height, width, channels = img.shape
        
        # Color histogram
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
        """Generate segmentation mask for an image"""
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        if method == 'simple':
            # Simple thresholding
            _, mask = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        elif method == 'adaptive':
            # Adaptive thresholding
            mask = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
        
        # Save mask
        mask_path = image_path.replace('.', '_mask.')
        cv2.imwrite(mask_path, mask)
        
        return os.path.basename(mask_path)

    @staticmethod
    def batch_process_images(image_files):
        """Process multiple images in a batch"""
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
        """Resize an image with optional width/height"""
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
        """Convert image to specified format with mode handling"""
        img = Image.open(image_path)
        
        # Handle RGBA to RGB conversion for formats that don't support transparency
        if output_format.lower() in ['jpg', 'jpeg'] and img.mode == 'RGBA':
            # Create a white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            
            # Paste the PNG with transparency onto the white background
            background.paste(img, mask=img.split()[3])  # 3 is the alpha channel
            img = background
        
        # Ensure correct mode for different formats
        if output_format.lower() in ['jpg', 'jpeg']:
            img = img.convert('RGB')
        
        new_path = image_path.rsplit('.', 1)[0] + f'.{output_format}'
        img.save(new_path)
        return new_path