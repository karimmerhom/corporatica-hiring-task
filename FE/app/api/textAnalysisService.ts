import axios from "axios"

const BASE_URL = "http://localhost:5000/api/text"

export interface Document {
  id: number
  title: string
  content: string
  created_at: string
  keywords: string[]
  sentiment_score: number
  summary: string
  category?: string
}

export interface AnalysisResult {
  sentiment: string
  sentiment_score: number
  keywords: string[]
  summary: string
}

export interface TSNEResult {
  coordinates: number[][]
}

export const textAnalysisService = {
  getDocuments: async (query = ""): Promise<Document[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/documents`, {
        params: { search: query },
      })
      return response.data || []
    } catch (error) {
      console.error("Error fetching documents:", error)
      throw error 
    }
  },

  getDocument: async (id: number): Promise<Document> => {
    try {
      const response = await axios.get(`${BASE_URL}/documents/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error)
      throw error
    }
  },

  updateDocument: async (id: number, data: { title: string; text: string }): Promise<Document> => {
    try {
      const response = await axios.put(`${BASE_URL}/documents/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating document ${id}:`, error)
      throw error
    }
  },

  deleteDocument: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/documents/${id}`)
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error)
      throw error
    }
  },

  generateTSNE: async (texts: string[]): Promise<TSNEResult> => {
    try {
      const response = await axios.post(`${BASE_URL}/tsne`, { texts })
      return response.data
    } catch (error) {
      console.error("Error generating t-SNE:", error)
      throw error
    }
  },

  createDocument: async (data: { title: string; text: string }): Promise<Document> => {
    try {
      const response = await axios.post(`${BASE_URL}/analyze`, data)
      return response.data
    } catch (error) {
      console.error("Error creating document:", error)
      throw error
    }
  },
}
