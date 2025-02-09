from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.manifold import TSNE
import numpy as np
from textblob import TextBlob

class TextService:
    """
    A service for analyzing, summarizing, categorizing, and searching text data.
    This class provides methods for sentiment analysis, keyword extraction,
    text summarization, text categorization, T-SNE visualization, and document search.
    """
    def __init__(self):
        """Initialize pipelines and vectorizers."""
        try:
            self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
            self.classifier = pipeline("zero-shot-classification")
            self.vectorizer = TfidfVectorizer()
        except Exception as e:
            raise RuntimeError(f"Error initializing pipelines: {e}")
    
    def analyze_text(self, text):
        """
        Perform comprehensive text analysis, including sentiment analysis,
        keyword extraction, summarization, and categorization.
        
        Args:
            text (str): The input text to analyze.
        
        Returns:
            dict: Analysis results including sentiment score, keywords, summary, and category.
        """
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Input text must be a non-empty string.")

        try:
            blob = TextBlob(text)
            sentiment_score = blob.sentiment.polarity
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            sentiment_score = None

        try:
            tfidf_matrix = self.vectorizer.fit_transform([text])
            feature_names = self.vectorizer.get_feature_names_out()
            sorted_items = self._sort_tfidf_features(tfidf_matrix, feature_names)
            keywords = [item[0] for item in sorted_items[:10]]
        except Exception as e:
            print(f"TF-IDF keyword extraction error: {e}")
            keywords = []

        summary = self._generate_summary(text)
        
        try:
            category = self._categorize_text(text)
        except Exception as e:
            print(f"Categorization error: {e}")
            category = None
        
        return {
            'sentiment_score': sentiment_score,
            'keywords': keywords,
            'summary': summary,
            'category': category
        }
    
    def generate_tsne(self, texts):
        """
        Generate T-SNE visualization data for multiple texts.
        
        Args:
            texts (list of str): List of text documents.
        
        Returns:
            list: A list of 2D coordinates representing the texts in T-SNE space.
        """
        if not isinstance(texts, list) or len(texts) < 2:
            raise ValueError("Need at least 2 texts for T-SNE visualization.")

        try:
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            perplexity = min(30, len(texts) - 1)
            tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42)
            tsne_result = tsne.fit_transform(tfidf_matrix.toarray())
            return tsne_result.tolist()
        except Exception as e:
            raise RuntimeError(f"T-SNE generation error: {e}")
    
    def _generate_summary(self, text):
        """
        Generate a summary of the input text using BART model.
        
        Args:
            text (str): Input text to summarize.
        
        Returns:
            str: Summarized text.
        """
        if len(text.split()) < 50:
            return text
        
        try:
            summary = self.summarizer(text, max_length=50, min_length=20, do_sample=False)
            return summary[0]['summary_text']
        except Exception as e:
            print(f"Summary generation error: {e}")
            return text
    
    def _categorize_text(self, text):
        """
        Categorize the input text using a zero-shot classification model.
        
        Args:
            text (str): The input text to classify.
        
        Returns:
            str: Best matching category or 'Uncategorized'.
        """
        candidate_labels = [
            "Technology", "Science", "Business", "Politics", "Entertainment", "Sports",
            "Health", "Education", "Environment"
        ]
        
        try:
            results = self.classifier(text, candidate_labels)
            best_category = results["labels"][0] if results["scores"][0] > 0.3 else "Uncategorized"
            return best_category
        except Exception as e:
            print(f"Text classification error: {e}")
            return "Uncategorized"
    
    def _sort_tfidf_features(self, tfidf_matrix, feature_names):
        """
        Sort TF-IDF features by importance.
        
        Args:
            tfidf_matrix: The TF-IDF matrix.
            feature_names: Feature names from TF-IDF vectorization.
        
        Returns:
            list: Sorted features with importance scores.
        """
        try:
            importance = np.squeeze(tfidf_matrix.toarray())
            feature_importance = list(zip(feature_names, importance))
            return sorted(feature_importance, key=lambda x: x[1], reverse=True)
        except Exception as e:
            print(f"TF-IDF sorting error: {e}")
            return []
    
    def search_texts(self, query, documents):
        """
        Search through documents using TF-IDF similarity.
        
        Args:
            query (str): The query text.
            documents (list): List of document objects with a 'content' attribute.
        
        Returns:
            list: Sorted list of relevant documents with similarity scores.
        """
        if not query or not isinstance(query, str):
            raise ValueError("Query must be a non-empty string.")
        
        if not documents or not isinstance(documents, list):
            return []
        
        try:
            all_texts = [doc.content for doc in documents if hasattr(doc, 'content') and isinstance(doc.content, str)]
            if not all_texts:
                return []
            
            self.vectorizer.fit(all_texts)
            query_vector = self.vectorizer.transform([query])
            doc_vectors = self.vectorizer.transform(all_texts)
            similarities = (query_vector * doc_vectors.T).toarray()[0]
            results = [(doc, score) for doc, score in zip(documents, similarities) if score > 0.1]
            return sorted(results, key=lambda x: x[1], reverse=True)
        except Exception as e:
            print(f"Search error: {e}")
            return []
