from flask import Blueprint
from app.controllers.text_controller import TextController

text_bp = Blueprint("text", __name__, url_prefix="/api/text")

text_bp.route("/analyze", methods=["POST"])(TextController.analyze_text)
text_bp.route("/tsne", methods=["POST"])(TextController.generate_tsne)
text_bp.route("/documents", methods=["GET"])(TextController.get_documents)
text_bp.route("/documents/<int:doc_id>", methods=["GET"])(TextController.get_document)
text_bp.route("/documents/<int:doc_id>", methods=["PUT"])(TextController.update_document)
text_bp.route("/documents/<int:doc_id>", methods=["DELETE"])(TextController.delete_document)
