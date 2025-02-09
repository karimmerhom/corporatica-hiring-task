from operator import or_
from flask import request, jsonify
from app.services.text_service import TextService
from app.models.text import TextDocument
from app.models.database import db
from app.utils.validators import validate_document_update, validate_text_input, validate_doc_id, validate_tsne_input

text_service = TextService()

class TextController:

    @staticmethod
    @validate_text_input
    def analyze_text():
        data = request.get_json()
        analysis = text_service.analyze_text(data['text'])

        doc = TextDocument(
            content=data['text'],
            title=data.get('title', 'Untitled'),
            sentiment_score=analysis['sentiment_score'],
            keywords=analysis['keywords'],
            summary=analysis['summary'],
            category=analysis['category']
        )

        db.session.add(doc)
        db.session.commit()

        return jsonify(analysis)

    @staticmethod
    @validate_tsne_input
    def generate_tsne():
        data = request.get_json()
        tsne_result = text_service.generate_tsne(data['texts'])
        return jsonify({'coordinates': tsne_result})

    @staticmethod
    def get_documents():
        search_query = request.args.get('search', '').strip()
        
        query = TextDocument.query
        if search_query:
            query = query.filter(or_(
                TextDocument.title.ilike(f"%{search_query}%"),
                TextDocument.content.ilike(f"%{search_query}%")
            ))

        documents = query.all()
        
        return jsonify([{
            'id': doc.id,
            'title': doc.title,
            'content': doc.content,
            'created_at': doc.created_at.isoformat(),
            'category': doc.category,
            'sentiment_score': doc.sentiment_score,
            'keywords': doc.keywords,
            'summary': doc.summary
        } for doc in documents])

    @staticmethod
    @validate_doc_id
    def get_document(doc_id):
        doc = TextDocument.query.get_or_404(doc_id)
        return jsonify({
            'id': doc.id,
            'title': doc.title,
            'content': doc.content,
            'created_at': doc.created_at.isoformat(),
            'category': doc.category,
            'sentiment_score': doc.sentiment_score,
            'keywords': doc.keywords,
            'summary': doc.summary
        })

    @staticmethod
    @validate_document_update
    @validate_doc_id
    def update_document(doc_id):
        doc = TextDocument.query.get_or_404(doc_id)
        data = request.get_json()

        if 'content' in data:
            analysis = text_service.analyze_text(data['content'])
            doc.content = data['content']
            doc.sentiment_score = analysis['sentiment_score']
            doc.keywords = analysis['keywords']
            doc.summary = analysis['summary']

        if 'title' in data:
            doc.title = data['title']
        if 'category' in data:
            doc.category = data['category']

        db.session.commit()
        return jsonify({'message': 'Document updated successfully'})

    @staticmethod
    @validate_doc_id
    def delete_document(doc_id):
        doc = TextDocument.query.get_or_404(doc_id)
        db.session.delete(doc)
        db.session.commit()
        return jsonify({'message': 'Document deleted successfully'})
