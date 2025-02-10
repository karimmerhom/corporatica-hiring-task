# Flask Data Processing API

## Overview

This Flask application provides APIs for handling different types of data processing, including:

- **Tabular Data**: Uploading, retrieving, deleting, updating, and visualizing tabular data.
- **Text Processing**: Text analysis, t-SNE generation, document management.
- **Image Processing**: Uploading, resizing, format conversion, and histogram generation.

The application is structured using Flask blueprints and follows a modular service-oriented architecture.

## Features

### Tabular Data

- Upload tabular files
- Retrieve, update, and delete tabular data
- Generate statistics and visualizations
- Download tabular data

### Text Processing

- Analyze text for sentiment, keywords, and summary
- Generate t-SNE visualizations for text data
- Manage stored text documents

### Image Processing

- Upload images with format validation
- Retrieve image details
- Resize images
- Convert image formats
- Generate histograms and segmentation masks
- View and download stored images

## Installation

### Prerequisites

- Python 3.8+
- Virtual environment (venv)
- Flask and dependencies

### Setup

1. **Create and activate a virtual environment**

   ```sh
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   venv\Scripts\activate  # On Windows
   ```

2. **Install dependencies**

   ```sh
   pip install -r requirements.txt
   ```

3. **Set up environment variables**

   - Create a `.env` file and configure database settings and API keys if necessary.

4. **Initialize database**

   ```sh
   flask db upgrade
   ```

## Running the Application

**Note:** Running the application for the first time may take longer because it downloads necessary models for text and image processing.

```sh
flask run
```

## API Endpoints

### Tabular Data

| Method | Endpoint                                    | Description            |
| ------ | ------------------------------------------- | ---------------------- |
| POST   | `/api/tabular/upload`                       | Upload tabular data    |
| GET    | `/api/tabular/files`                        | Get all uploaded files |
| GET    | `/api/tabular/<int:data_id>`                | Retrieve tabular data  |
| PUT    | `/api/tabular/<int:data_id>`                | Update tabular data    |
| DELETE | `/api/tabular/<int:data_id>`                | Delete tabular data    |
| GET    | `/api/tabular/<int:data_id>/stats`          | Get data statistics    |
| GET    | `/api/tabular/<int:data_id>/visualizations` | Get visualizations     |

### Text Processing

| Method | Endpoint                           | Description                  |
| ------ | ---------------------------------- | ---------------------------- |
| POST   | `/api/text/analyze`                | Analyze text                 |
| POST   | `/api/text/tsne`                   | Generate t-SNE visualization |
| GET    | `/api/text/documents`              | Get all documents            |
| GET    | `/api/text/documents/<int:doc_id>` | Retrieve a document          |
| PUT    | `/api/text/documents/<int:doc_id>` | Update a document            |
| DELETE | `/api/text/documents/<int:doc_id>` | Delete a document            |

### Image Processing

| Method | Endpoint                            | Description          |
| ------ | ----------------------------------- | -------------------- |
| POST   | `/api/images/upload`                | Upload images        |
| GET    | `/api/images/<image_id>`            | Get image details    |
| POST   | `/api/images/histogram`             | Generate histogram   |
| POST   | `/api/images/resize`                | Resize image         |
| POST   | `/api/images/convert`               | Convert image format |
| GET    | `/api/images/view/<image_name>`     | View image           |
| GET    | `/api/images/download/<image_name>` | Download image       |

## Technologies Used

- **Flask**: Web framework
- **Flask SQLAlchemy**: ORM for database management
- **Flask Migrate**: Database migrations
- **Flask CORS**: Cross-origin resource sharing
- **OpenCV & PIL**: Image processing
- **NLTK & TextBlob**: Text analysis
- **Pandas & Matplotlib**: Tabular data handling

