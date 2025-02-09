from flask import Blueprint
from app.controllers.tabular_controller import TabularController

bp = Blueprint("tabular", __name__, url_prefix="/api/tabular")

bp.route("/upload", methods=["POST"])(TabularController.upload_tabular_data)
bp.route("/<int:data_id>", methods=["GET"])(TabularController.get_data)
bp.route("/<int:data_id>/stats", methods=["GET"])(TabularController.get_data_statistics)
bp.route("/<int:data_id>", methods=["DELETE"])(TabularController.delete_data)
bp.route("/<int:data_id>", methods=["PUT"])(TabularController.update_data)
bp.route("/<int:data_id>/download", methods=["GET"])(TabularController.download_data)
bp.route("/files", methods=["GET"])(TabularController.get_all_uploaded_files)
bp.route("/<int:data_id>/visualizations", methods=["GET"])(TabularController.get_visualizations)
