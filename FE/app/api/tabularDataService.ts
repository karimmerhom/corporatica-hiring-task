import axios from "axios"

const BASE_URL = "http://localhost:5000/api/tabular"

export interface File {
  id: number
  filename: string
  columns: string[]
  uploaded_at: string
}

export interface BoxplotData {
  [key: string]: {
    median: number
    q1: number
    q3: number
    whiskers: [number, number]
  }
}

export interface CorrelationHeatmapData {
  [key: string]: {
    [key: string]: number
  }
}

export interface HistogramData {
  [key: string]: {
    bins: number[]
    values: number[]
  }
}

export interface VisualizationData {
  boxplot_data: BoxplotData
  correlation_heatmap: CorrelationHeatmapData
  histogram_data: HistogramData
}

export interface Statistics {
  filename: string
  statistics: {
    basic_stats: {
      mean: { [key: string]: number }
      median: { [key: string]: number }
      mode: { [key: string]: number }
      std: { [key: string]: number }
    }
    correlation_matrix: { [key: string]: { [key: string]: number } }
    kurtosis: { [key: string]: number }
    outliers: {
      [key: string]: {
        count: number
        lower_bound: number
        upper_bound: number
        values: number[]
      }
    }
    quartiles: {
      [key: string]: {
        q1: number
        q2: number
        q3: number
      }
    }
    skewness: { [key: string]: number }
  }
}

export const tabularDataService = {
  getFiles: async (): Promise<File[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/files`)
      return response.data.files || []
    } catch (error) {
      console.error("Error fetching files:", error)
      throw error
    }
  },

  uploadFile: async (file: File | Blob): Promise<any> => {
    try {
      const formData = new FormData()
      formData.append("file", file as Blob)
      const response = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  },

  getVisualizations: async (fileId: number): Promise<VisualizationData> => {
    try {
      const response = await axios.get(`${BASE_URL}/${fileId}/visualizations`)
      return response.data
    } catch (error) {
      console.error(`Error fetching visualizations for file ${fileId}:`, error)
      throw error
    }
  },

  getStatistics: async (fileId: number): Promise<Statistics> => {
    try {
      const response = await axios.get(`${BASE_URL}/${fileId}/stats`)
      return response.data
    } catch (error) {
      console.error(`Error fetching statistics for file ${fileId}:`, error)
      throw error
    }
  },

  updateFile: async (fileId: number, file: File | Blob): Promise<any> => {
    try {
      const formData = new FormData()
      formData.append("file", file as Blob)
      const response = await axios.put(`${BASE_URL}/${fileId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error(`Error updating file ${fileId}:`, error)
      throw error
    }
  },

  downloadFile: async (fileId: number, fileFormat: "csv" | "xlsx"): Promise<Blob> => {
    try {
      const response = await axios.get(`${BASE_URL}/${fileId}/download`, {
        params: { file_format: fileFormat },
        responseType: "blob",
      })
      return response.data
    } catch (error) {
      console.error(`Error downloading file ${fileId} as ${fileFormat}:`, error)
      throw error
    }
  },

  deleteFile: async (fileId: number): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/${fileId}`)
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error)
      throw error
    }
  },
}
