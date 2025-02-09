"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  textAnalysisService,
  type Document,
  type TSNEResult,
} from "../api/textAnalysisService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "react-toastify";

export default function TextAnalysis() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [tsneResult, setTsneResult] = useState<TSNEResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDocumentLoading, setSelectedDocumentLoading] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [newDocumentContent, setNewDocumentContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedDocuments = await textAnalysisService.getDocuments();
      setDocuments(fetchedDocuments || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
      toast.error("Failed to fetch documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDocumentSelect = async (documentId: number) => {
    try {
      setSelectedDocumentLoading(true);
      const document = await textAnalysisService.getDocument(documentId);
      setSelectedDocument(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      setSelectedDocument(null);
      toast.error("Failed to fetch document. Please try again.");
    } finally {
      setSelectedDocumentLoading(false);
    }
  };

  const handleUpdateDocument = async () => {
    if (!selectedDocument) return;

    try {
      setLoading(true);
      await textAnalysisService.updateDocument(selectedDocument.id, {
        title: newDocumentTitle,
        text: newDocumentContent,
      });
      await fetchDocuments();
      await handleDocumentSelect(selectedDocument.id);
      setUpdateModalOpen(false);
      toast.success("Document updated successfully.");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      setLoading(true);
      await textAnalysisService.deleteDocument(selectedDocument.id);
      setSelectedDocument(null);
      await fetchDocuments();
      toast.success("Document deleted successfully.");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      setLoading(true);
      const newDocument = await textAnalysisService.createDocument({
        title: newDocumentTitle,
        text: newDocumentContent,
      });
      await fetchDocuments();
      setCreateModalOpen(false);
      setNewDocumentTitle("");
      setNewDocumentContent("");
      toast.success("Document created successfully.");
      handleDocumentSelect(newDocument.id);
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTSNE = async () => {
    try {
      setLoading(true);
      const texts = documents.map((doc) => doc.content);
      const result = await textAnalysisService.generateTSNE(texts);
      setTsneResult(result);
      toast.success("T-SNE visualization generated successfully.");
    } catch (error) {
      console.error("Error generating T-SNE:", error);
      toast.error("Failed to generate T-SNE visualization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const searchResults = await textAnalysisService.getDocuments(searchQuery);
      setDocuments(searchResults);
    } catch (error) {
      console.error("Error searching documents:", error);
      toast.error("Failed to search documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderTSNEVisualization = () => {
    if (!tsneResult) return null;

    const normalizeData = (data: number[], min: number, max: number) => {
      return data.map((val) => ((val - min) / (max - min)) * 100);
    };

    const xValues = tsneResult.coordinates.map((coord) => coord[0]);
    const yValues = tsneResult.coordinates.map((coord) => coord[1]);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const normalizedData = tsneResult.coordinates.map((coord, index) => ({
      x: normalizeData([coord[0]], xMin, xMax)[0],
      y: normalizeData([coord[1]], yMin, yMax)[0],
      name: documents[index].title,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="X"
            domain={[0, 100]}
            label={{
              value: "T-SNE Dimension 1",
              position: "bottom",
              offset: 20,
            }}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Y"
            domain={[0, 100]}
            label={{
              value: "T-SNE Dimension 2",
              angle: -90,
              position: "left",
              offset: 40,
            }}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ payload }) => {
              if (payload && payload.length > 0) {
                const xValue =
                  typeof payload[0]?.value === "number"
                    ? payload[0].value
                    : NaN;
                const yValue =
                  typeof payload[1]?.value === "number"
                    ? payload[1].value
                    : NaN;

                return (
                  <div className="bg-white p-2 border rounded shadow">
                    <p>{payload[0]?.payload.name}</p>
                    <p>
                      X: {isNaN(xValue) ? "Invalid value" : xValue.toFixed(2)}
                    </p>
                    <p>
                      Y: {isNaN(yValue) ? "Invalid value" : yValue.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Scatter name="Documents" data={normalizedData} fill="#8884d8">
            {normalizedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(${(index * 360) / normalizedData.length}, 70%, 60%)`}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Text Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search documents"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : "Search"}
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>Create Document</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                  <DialogDescription>
                    Enter the title and content for the new document.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Document Title"
                  value={newDocumentTitle}
                  onChange={(e) => setNewDocumentTitle(e.target.value)}
                  className="mb-4"
                />
                <Textarea
                  placeholder="Document Content"
                  value={newDocumentContent}
                  onChange={(e) => setNewDocumentContent(e.target.value)}
                  className="mb-4"
                />
                <Button onClick={handleCreateDocument} disabled={loading}>
                  Create
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Available Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : documents && documents.length > 0 ? (
                <ul className="space-y-4">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <Button
                        variant={
                          selectedDocument?.id === doc.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleDocumentSelect(doc.id)}
                        className="w-full text-left justify-start py-6"
                      >
                        <div>
                          <div className="font-medium">
                            {doc.title || "Untitled"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Category: {doc.category || "Uncategorized"}
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No documents available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Document Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDocumentLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : selectedDocument ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        <strong>Title:</strong> {selectedDocument.title}
                      </p>
                      <p>
                        <strong>Category:</strong>{" "}
                        {selectedDocument.category || "Uncategorized"}
                      </p>
                      <p>
                        <strong>Created At:</strong>{" "}
                        {new Date(selectedDocument.created_at).toLocaleString()}
                      </p>
                      <p>
                        <strong>Content:</strong> {selectedDocument.content}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sentiment Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>
                        <strong>Sentiment Score:</strong>{" "}
                        {selectedDocument.sentiment_score.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside">
                        {selectedDocument.keywords.map((keyword, index) => (
                          <li key={index}>{keyword}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedDocument.summary}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p>
                  No document selected. Please select a document to view its
                  analysis.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {selectedDocument && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Document Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Dialog
                  open={updateModalOpen}
                  onOpenChange={setUpdateModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">Update Document</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Document</DialogTitle>
                      <DialogDescription>
                        Edit the document title and content.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      placeholder="Document Title"
                      value={
                        newDocumentTitle ||
                        (selectedDocument ? selectedDocument.title : "")
                      }
                      onChange={(e) => setNewDocumentTitle(e.target.value)}
                      className="mb-4"
                    />
                    <Textarea
                      placeholder="Document Content"
                      value={
                        newDocumentContent ||
                        (selectedDocument ? selectedDocument.content : "")
                      }
                      onChange={(e) => setNewDocumentContent(e.target.value)}
                      className="mb-4"
                    />
                    <Button onClick={handleUpdateDocument} disabled={loading}>
                      Update
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  onClick={handleDeleteDocument}
                  disabled={loading}
                >
                  Delete Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>T-SNE Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateTSNE}
              disabled={loading || !documents || documents.length === 0}
              className="mb-4"
            >
              Generate T-SNE
            </Button>
            {tsneResult && renderTSNEVisualization()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
