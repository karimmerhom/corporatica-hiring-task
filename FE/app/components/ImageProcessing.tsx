"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { imageProcessingService } from "../api/imageProcessingService";
import ColorHistogram from "../../components/ColorHistogram";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "bmp", "tiff", "webp"];

export default function ImageProcessing() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<
    { filename: string; file: File; segmentationMask: string }[]
  >([]);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [convertedFilename, setConvertedFilename] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState("300");
  const [height, setHeight] = useState("200");
  const [format, setFormat] = useState(ALLOWED_EXTENSIONS[0]);
  const [histogramData, setHistogramData] = useState<{
    red: number[];
    green: number[];
    blue: number[];
  } | null>(null);
  const [selectedUploadedImage, setSelectedUploadedImage] = useState<{
    filename: string;
    file: File;
    segmentationMask: string;
  } | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
      setProcessedImage(null);
      setConvertedFilename(null);
    }
  };

  const uploadImages = async () => {
    try {
      setLoading(true);
      const result = await imageProcessingService.uploadImages(selectedImages);
      const uploadedWithFiles = result.results.map(
        (item: any, index: number) => ({
          filename: item.filename,
          segmentationMask: item.segmentation_mask,
          file: selectedImages[index],
        })
      );
      setUploadedImages(uploadedWithFiles);
      if (uploadedWithFiles.length > 0) {
        setSelectedUploadedImage(uploadedWithFiles[0]);
      }
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(`Error uploading images: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUploadedImage = (image: {
    filename: string;
    file: File;
    segmentationMask: string;
  }) => {
    setSelectedUploadedImage(image);
    setProcessedImage(null);
    setConvertedFilename(null);
    setHistogramData(null);
  };

  const generateHistogram = async () => {
    if (!selectedUploadedImage) return;

    try {
      setLoading(true);
      const result = await imageProcessingService.generateHistogram(
        selectedUploadedImage.file
      );
      setHistogramData(result);
      toast.success("Histogram generated successfully");
    } catch (error) {
      console.error("Error generating histogram:", error);
      toast.error(`Error generating histogram: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = async () => {
    if (!selectedUploadedImage) return;

    try {
      setLoading(true);
      const result = await imageProcessingService.resizeImage(
        selectedUploadedImage.file,
        Number.parseInt(width),
        Number.parseInt(height)
      );
      setConvertedFilename(result.resized_filename);
      setProcessedImage(
        `http://localhost:5000/api/images/view/${result.resized_filename}`
      );
      toast.success("Image resized successfully");
    } catch (error) {
      console.error("Error resizing image:", error);
      toast.error(`Error resizing image: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const convertImage = async () => {
    if (!selectedUploadedImage) return;

    try {
      setLoading(true);
      const result = await imageProcessingService.convertImage(
        selectedUploadedImage.file,
        format
      );
      setConvertedFilename(result.converted_filename);
      setProcessedImage(
        `http://localhost:5000/api/images/view/${result.converted_filename}`
      );
      toast.success("Image converted successfully");
    } catch (error) {
      console.error("Error converting image:", error);
      toast.error(`Error converting image: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (convertedFilename) {
      window.open(
        `http://localhost:5000/api/images/download/${convertedFilename}`,
        "_blank"
      );
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload and Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              multiple
            />
            <Button
              onClick={uploadImages}
              disabled={selectedImages.length === 0 || loading}
            >
              {loading ? <LoadingSpinner size="small" /> : "Upload Images"}
            </Button>
          </div>
          {uploadedImages.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Uploaded Images:</h3>
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer border-2 p-1 ${
                      selectedUploadedImage?.filename === image.filename
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    onClick={() => handleSelectUploadedImage(image)}
                  >
                    <img
                      src={`http://localhost:5000/api/images/view/${image.filename}`}
                      alt={image.filename}
                      className="w-24 h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Processing Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={generateHistogram}
              disabled={!selectedUploadedImage || loading}
            >
              Generate Histogram
            </Button>
            <Input
              type="number"
              placeholder="Width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-20"
            />
            <Input
              type="number"
              placeholder="Height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-20"
            />
            <Button
              onClick={resizeImage}
              disabled={!selectedUploadedImage || loading}
            >
              Resize Image
            </Button>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {ALLOWED_EXTENSIONS.map((ext) => (
                  <SelectItem key={ext} value={ext}>
                    {ext}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={convertImage}
              disabled={!selectedUploadedImage || loading}
            >
              Convert Format
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Original Image</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUploadedImage ? (
                <img
                  src={`http://localhost:5000/api/images/view/${selectedUploadedImage.filename}`}
                  alt="Original"
                  className="max-w-full h-auto"
                />
              ) : (
                <p>No image selected</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Masked Image</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedUploadedImage ? (
                <img
                  src={`http://localhost:5000/api/images/view/${selectedUploadedImage.segmentationMask}`}
                  alt="Masked"
                  className="max-w-full h-auto"
                />
              ) : (
                <p>No image selected</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Processed Image / Histogram</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <LoadingSpinner />}
              {processedImage && (
                <div>
                  <img
                    src={processedImage || "/placeholder.svg"}
                    alt="Processed"
                    className="max-w-full h-auto mb-4"
                  />
                  <Button onClick={downloadImage} disabled={!convertedFilename}>
                    Download Processed Image
                  </Button>
                </div>
              )}
              {histogramData && <ColorHistogram data={histogramData} />}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
