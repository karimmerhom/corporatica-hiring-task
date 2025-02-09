import axios from "axios"

const BASE_URL = "http://localhost:5000/api/images"

export const imageProcessingService = {
  uploadImages: async (files: File[]) => {
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))
      const response = await axios.post(`${BASE_URL}/upload`, formData)
      return response.data
    } catch (error) {
      console.error("Error uploading images:", error)
      throw error
    }
  },

  getImageDetails: async (filename: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/${filename}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching details for image ${filename}:`, error)
      throw error
    }
  },

  generateHistogram: async (image: File): Promise<{ red: number[]; green: number[]; blue: number[] }> => {
    try {
      const formData = new FormData()
      formData.append("image", image)
      const response = await axios.post(`${BASE_URL}/histogram`, formData)
      return response.data
    } catch (error) {
      console.error("Error generating histogram:", error)
      throw error
    }
  },

  resizeImage: async (image: File, width: number, height: number) => {
    try {
      const formData = new FormData()
      formData.append("image", image)
      formData.append("width", width.toString())
      formData.append("height", height.toString())
      const response = await axios.post(`${BASE_URL}/resize`, formData)
      return response.data
    } catch (error) {
      console.error("Error resizing image:", error)
      throw error
    }
  },

  convertImage: async (image: File, format: string) => {
    try {
      const formData = new FormData()
      formData.append("image", image)
      formData.append("format", format)
      const response = await axios.post(`${BASE_URL}/convert`, formData)
      return response.data
    } catch (error) {
      console.error("Error converting image:", error)
      throw error
    }
  },
}
