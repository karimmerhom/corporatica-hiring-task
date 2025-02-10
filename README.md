# Full Stack Data Processing Application

## Overview

This repository contains both the **backend (BE)** and **frontend (FE)** for the Data Processing Application. The application is containerized using Docker, and a **Docker Compose** file is provided to manage both services easily.

### Important Notes

⚠️ **Backend Image Size & Startup Time** ⚠️
- The backend image is **large** due to the dependencies and pre-trained models included.
- **Initial startup will take a long time** because Flask downloads the required models before becoming operational.
- Please be patient after starting the containers, as it might take **several minutes** for the backend to be ready.

## Project Structure

```
├── backend/   # Flask API (Data Processing)
├── frontend/  # React-based frontend (or other framework used)
├── docker-compose.yml  # Manages backend & frontend services
```

## Running the Application with Docker Compose

### Prerequisites
- Install [Docker](https://docs.docker.com/get-docker/)
- Install [Docker Compose](https://docs.docker.com/compose/install/)

### Steps to Run

1. **Start the application using Docker Compose:**
   ```sh
   docker-compose up --build
   ```

   - The **backend** and **frontend** containers will be built and started.
   - The backend may take **several minutes** to be ready due to model downloads.

2. **Access the application:**
   - **Frontend UI**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`

3. **Stopping the containers:**
   ```sh
   docker-compose down
   ```


## Troubleshooting

1. **Backend is not responding immediately?**
   - This is expected! The backend downloads necessary models on the first run.
   - Wait **a few minutes** and try again.
   
2. **Docker Compose build is slow?**
   - The backend image is large; be patient during the build.
   - Consider optimizing by using a multi-stage build in the `Dockerfile`.

3. **Need to rebuild containers after code changes?**
   ```sh
   docker-compose up --build --force-recreate
   ```


