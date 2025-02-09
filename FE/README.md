# Data Analysis Dashboard

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Usage](#usage)
  - [Tabular Data Analysis](#tabular-data-analysis)
  - [Text Analysis](#text-analysis)
  - [Image Processing](#image-processing)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Data Analysis Dashboard is a comprehensive web application that provides powerful tools for analyzing various types of data. It includes modules for tabular data analysis, text analysis, and image processing. This dashboard is built using Next.js and React, offering a modern and responsive user interface for data scientists, analysts, and researchers.

## Features

1. **Tabular Data Analysis**
   - Upload CSV and Excel files
   - Generate visualizations (box plots, correlation heatmaps, histograms)
   - Calculate and display statistical measures
   - Download processed data in CSV or Excel format

2. **Text Analysis**
   - Create, read, update, and delete text documents
   - Perform sentiment analysis on text
   - Extract keywords from documents
   - Generate document summaries
   - Visualize document relationships using T-SNE

3. **Image Processing**
   - Upload and process multiple image formats
   - Generate color histograms
   - Resize images
   - Convert images between different formats
   - Apply image segmentation masks

## Technologies Used

- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- Recharts for data visualization
- Framer Motion for animations
- Axios for API requests
- React Hot Toast for notifications

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A running backend server (Flask-based, see separate repository)

### Installation

1. Clone the repository:

