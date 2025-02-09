import json
import logging
from flask import request, jsonify, send_file
from app.services.tabular_service import TabularService
from app.utils.validators import validate_file_upload, validate_file_update

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TabularController:
    """
    Controller to handle operations on tabular data (CSV, Excel).
    """

    @staticmethod
    @validate_file_upload
    def upload_tabular_data():
        """
        Handles the upload of tabular data (CSV or Excel).
        
        Returns:
            JSON response with success or error message.
        """
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        file_type = None
        if file.filename.endswith(".csv"):
            file_type = "csv"
        elif file.filename.endswith((".xls", ".xlsx")):
            file_type = "excel"

        if not file_type:
            return jsonify({"error": "Unsupported file type"}), 400

        try:
            json_data = TabularService.process_file(file.read(), file_type)
            json_obj = json.loads(json_data)  # Ensure valid JSON
            if "error" in json_obj:
                return jsonify(json_obj), 400  # Return error from processing

            data_id = TabularService.save_tabular_data(file.filename, json_data)
            return jsonify({"message": "File uploaded successfully", "data_id": data_id}), 200

        except json.JSONDecodeError:
            logger.error("Invalid JSON format in processed file")
            return jsonify({"error": "Invalid JSON format"}), 400
        except Exception as e:
            logger.exception("Unexpected error during file upload")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_data(data_id):
        """
        Retrieves a dataset by its ID.
        
        Returns:
            JSON response with dataset details or an error message.
        """
        try:
            data_entry = TabularService.get_tabular_data(data_id)
            if not data_entry:
                return jsonify({"error": "Data not found"}), 404

            return jsonify({"id": data_entry.id, "filename": data_entry.filename, "data": data_entry.data}), 200
        except Exception as e:
            logger.exception(f"Error retrieving data with ID {data_id}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_data_statistics(data_id):
        """
        Computes and returns statistics for a dataset.
        
        Returns:
            JSON response with dataset statistics or an error message.
        """
        try:
            data_entry = TabularService.get_tabular_data(data_id)
            if not data_entry:
                return jsonify({"error": "Data not found"}), 404

            stats = TabularService.compute_statistics(data_entry.data)
            return jsonify({"filename": data_entry.filename, "statistics": stats}), 200
        except Exception as e:
            logger.exception(f"Error computing statistics for data ID {data_id}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_data(data_id):
        """
        Deletes a dataset by its ID.
        
        Returns:
            JSON response confirming deletion or an error message.
        """
        try:
            success = TabularService.delete_tabular_data(data_id)
            if not success:
                return jsonify({"error": "Data not found"}), 404

            return jsonify({"message": "Data deleted successfully"}), 200
        except Exception as e:
            logger.exception(f"Error deleting data with ID {data_id}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @validate_file_update
    def update_data(data_id):
        """
        Updates a dataset by replacing it with a new file.
        
        Returns:
            JSON response confirming update or an error message.
        """
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        file_extension = file.filename.rsplit(".", 1)[-1].lower()
        file_type = "csv" if file_extension == "csv" else "excel"

        try:
            json_data = TabularService.process_file(file.read(), file_type)
            data_entry = TabularService.update_tabular_data(data_id, file.filename, json_data)

            if not data_entry:
                return jsonify({"error": "Data not found"}), 404

            return jsonify({"message": "Data updated successfully", "data_id": data_entry.id}), 200
        except Exception as e:
            logger.exception(f"Error updating data with ID {data_id}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def download_data(data_id):
        """
        Allows downloading of a dataset in a specified format.
        
        Query Parameters:
            file_format (str): Desired file format (csv, excel).
        
        Returns:
            File download or error message.
        """
        file_format = request.args.get("file_format", default="csv").lower()
        try:
            data_entry = TabularService.get_tabular_data(data_id)
            if not data_entry:
                return jsonify({"error": "Data not found"}), 404

            output, mimetype, filename = TabularService.download_file_by_id(data_id, file_format)

            if not output:
                return jsonify({"error": "Unsupported file format"}), 400

            return send_file(output, mimetype=mimetype, as_attachment=True, download_name=filename)
        except Exception as e:
            logger.exception(f"Error downloading data with ID {data_id}")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_all_uploaded_files():
        """
        Retrieves metadata for all uploaded files.
        
        Returns:
            JSON response with a list of files or an error message.
        """
        try:
            files = TabularService.get_all_files()
            return jsonify({"files": files}), 200
        except Exception as e:
            logger.exception("Error retrieving all uploaded files")
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_visualizations(data_id):
        """
        Retrieves visualization data for charts and graphs.
        
        Returns:
            JSON response with visualization data or an error message.
        """
        try:
            viz_data = TabularService.get_visualization_data(data_id)
            if not viz_data:
                return jsonify({"error": "Data not found"}), 404
            return jsonify(viz_data), 200
        except Exception as e:
            logger.exception(f"Error retrieving visualizations for data ID {data_id}")
            return jsonify({"error": str(e)}), 500
