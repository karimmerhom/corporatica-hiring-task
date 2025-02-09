"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  ScatterChart,
  Scatter,
  Cell,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  tabularDataService,
  type File,
  type VisualizationData,
  type Statistics,
} from "../api/tabularDataService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TabularDataAnalysis() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [data, setData] = useState<VisualizationData | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const fetchedFiles = await tabularDataService.getFiles();
      setFiles(fetchedFiles);
    } catch (error) {
      toast.error("Failed to fetch files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileInput = event.target;
    const file = fileInput.files?.[0];
    if (!file) return;

    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (fileType !== "csv" && fileType !== "xlsx" && fileType !== "xls") {
      toast.error("Please upload a CSV or Excel file.");
      fileInput.value = ""; // Reset file input
      return;
    }

    try {
      setLoading(true);
      await tabularDataService.uploadFile(file);
      await fetchFiles();
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
      fileInput.value = ""; // Reset file input after upload attempt
    }
  };

  const handleFileSelect = async (fileId: number) => {
    try {
      setLoading(true);
      setSelectedFile(fileId);

      const visualizationPromise = tabularDataService.getVisualizations(fileId);
      const statsPromise = tabularDataService.getStatistics(fileId);

      const [visualizationData, statsData] = await Promise.allSettled([
        visualizationPromise,
        statsPromise,
      ]);

      if (visualizationData.status === "fulfilled") {
        setData(visualizationData.value);
      } else {
        console.error(
          "Visualization data fetch failed:",
          visualizationData.reason
        );
        toast.error("Failed to fetch visualization data.");
        setData(null);
      }

      if (statsData.status === "fulfilled") {
        setStatistics(statsData.value);
      } else {
        console.error(
          "Statistics data fetch failed:",
          (statsData as PromiseRejectedResult).reason
        );
        toast.error("Failed to fetch statistics data.");
        setStatistics(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedFile) return;

    try {
      setLoading(true);
      await tabularDataService.updateFile(selectedFile, file);
      await fetchFiles();
      await handleFileSelect(selectedFile);
      setUpdateModalOpen(false);
      toast.success("File updated successfully.");
    } catch (error) {
      console.error("Error updating file:", error);
      toast.error("Failed to update file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileFormat: "csv" | "xlsx") => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      const blob = await tabularDataService.downloadFile(
        selectedFile,
        fileFormat
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `file.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`File downloaded as ${fileFormat.toUpperCase()}.`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      await tabularDataService.deleteFile(selectedFile);
      await fetchFiles();
      setSelectedFile(null);
      setData(null);
      setStatistics(null);
      toast.success("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderBoxPlot = (variable: string) => {
    if (!data || !data.boxplot_data || !data.boxplot_data[variable])
      return null;

    const boxplotData = data.boxplot_data[variable];
    const chartData = [
      {
        name: variable,
        min: boxplotData.whiskers[0],
        q1: boxplotData.q1,
        median: boxplotData.median,
        q3: boxplotData.q3,
        max: boxplotData.whiskers[1],
      },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip
            content={({ payload }) => {
              if (payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border rounded shadow">
                    <p className="font-bold">{data.name}</p>
                    <p>Min: {data.min}</p>
                    <p>Q1: {data.q1}</p>
                    <p>Median: {data.median}</p>
                    <p>Q3: {data.q3}</p>
                    <p>Max: {data.max}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="min" fill="#8884d8" isAnimationActive={false} />
          <Bar dataKey="max" fill="#82ca9d" isAnimationActive={false} />
          <Bar dataKey="q1" fill="#8884d8" isAnimationActive={false} />
          <Bar dataKey="q3" fill="#82ca9d" isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="median"
            stroke="#ff7300"
            strokeWidth={2}
          />
          <ReferenceLine
            x={boxplotData.whiskers[0]}
            stroke="#666"
            label={{ value: "Min", position: "insideBottomLeft" }}
          />
          <ReferenceLine
            x={boxplotData.q1}
            stroke="#666"
            label={{ value: "Q1", position: "insideBottomLeft" }}
          />
          <ReferenceLine
            x={boxplotData.median}
            stroke="#ff7300"
            label={{ value: "Median", position: "insideBottomLeft" }}
          />
          <ReferenceLine
            x={boxplotData.q3}
            stroke="#666"
            label={{ value: "Q3", position: "insideBottomLeft" }}
          />
          <ReferenceLine
            x={boxplotData.whiskers[1]}
            stroke="#666"
            label={{ value: "Max", position: "insideBottomLeft" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderCorrelationHeatmap = () => {
    if (!data || !data.correlation_heatmap) return null;

    const heatmapData = Object.entries(data.correlation_heatmap).flatMap(
      ([row, values]) =>
        Object.entries(values).map(([col, value]) => ({
          x: row,
          y: col,
          value: value,
        }))
    );

    const colorScale = (value: number) => {
      const hue = ((1 - value) * 240).toString(10);
      return ["hsl(", hue, ",100%,50%)"].join("");
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis type="category" dataKey="x" name="x" />
          <YAxis type="category" dataKey="y" name="y" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ payload }) => {
              if (payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border rounded shadow">
                    <p>{`${data.x} - ${data.y}`}</p>
                    <p>{`Correlation: ${data.value.toFixed(2)}`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter data={heatmapData} shape="square">
            {heatmapData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorScale(entry.value)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const renderHistogram = () => {
    if (!data || !data.histogram_data) return null;

    return (
      <div className="space-y-4">
        {Object.entries(data.histogram_data).map(([key, value]) => (
          <div key={key}>
            <h4 className="text-lg font-semibold">{key}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart
                data={value.bins.map((bin, index) => ({
                  bin: value.values[index],
                  count: bin,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
                <Line type="monotone" dataKey="count" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    );
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statistic</TableHead>
                  {Object.keys(statistics.statistics.basic_stats.mean).map(
                    (key) => (
                      <TableHead key={key}>{key}</TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(statistics.statistics.basic_stats).map(
                  ([stat, values]) => (
                    <TableRow key={stat}>
                      <TableCell className="font-medium">{stat}</TableCell>
                      {Object.values(values).map((value, index) => (
                        <TableCell key={index}>
                          {typeof value === "number" ? value.toFixed(2) : value}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Correlation Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  {Object.keys(statistics.statistics.correlation_matrix).map(
                    (key) => (
                      <TableHead key={key}>{key}</TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(statistics.statistics.correlation_matrix).map(
                  ([variable, correlations]) => (
                    <TableRow key={variable}>
                      <TableCell className="font-medium">{variable}</TableCell>
                      {Object.values(correlations).map((value, index) => (
                        <TableCell key={index}>{value.toFixed(4)}</TableCell>
                      ))}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kurtosis and Skewness</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Kurtosis</TableHead>
                  <TableHead>Skewness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(statistics.statistics.kurtosis).map((variable) => (
                  <TableRow key={variable}>
                    <TableCell className="font-medium">{variable}</TableCell>
                    <TableCell>
                      {statistics.statistics.kurtosis[variable].toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {statistics.statistics.skewness[variable].toFixed(4)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quartiles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Q1</TableHead>
                  <TableHead>Q2 (Median)</TableHead>
                  <TableHead>Q3</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(statistics.statistics.quartiles).map(
                  ([variable, quartiles]) => (
                    <TableRow key={variable}>
                      <TableCell className="font-medium">{variable}</TableCell>
                      <TableCell>{quartiles.q1.toFixed(2)}</TableCell>
                      <TableCell>{quartiles.q2.toFixed(2)}</TableCell>
                      <TableCell>{quartiles.q3.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outliers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Lower Bound</TableHead>
                  <TableHead>Upper Bound</TableHead>
                  <TableHead>Values</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(statistics.statistics.outliers).map(
                  ([variable, outlierData]) => (
                    <TableRow key={variable}>
                      <TableCell className="font-medium">{variable}</TableCell>
                      <TableCell>{outlierData.count}</TableCell>
                      <TableCell>
                        {outlierData.lower_bound.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {outlierData.upper_bound.toFixed(2)}
                      </TableCell>
                      <TableCell>{outlierData.values.join(", ")}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              disabled={loading}
              className="w-64"
            />
            <Button
              onClick={() =>
                (
                  document.querySelector(
                    'input[type="file"]'
                  ) as HTMLInputElement | null
                )?.click()
              }
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" /> : "Upload File"}
            </Button>
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
              <CardTitle>Available Files</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length > 0 ? (
                <ul className="space-y-4">
                  {files.map((file) => (
                    <li key={file.id}>
                      <Button
                        variant={
                          selectedFile === file.id ? "default" : "outline"
                        }
                        onClick={() => handleFileSelect(file.id)}
                        className="w-full text-left justify-start py-6"
                      >
                        <div>
                          <div className="font-medium">{file.filename}</div>
                          <div className="text-sm text-gray-500">
                            Uploaded:{" "}
                            {new Date(file.uploaded_at).toLocaleString()}
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No files available</p>
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
              <CardTitle>Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              {data ? (
                <div className="space-y-8">
                  {Object.keys(data.boxplot_data).map((key) => (
                    <div key={key}>
                      <h3 className="text-xl font-semibold mb-2">
                        {key} Box Plot
                      </h3>
                      {renderBoxPlot(key)}
                    </div>
                  ))}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Correlation Heatmap
                    </h3>
                    {renderCorrelationHeatmap()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Histograms</h3>
                    {renderHistogram()}
                  </div>
                </div>
              ) : (
                <p>No data to visualize. Please select a file.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>File Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Dialog
                  open={updateModalOpen}
                  onOpenChange={setUpdateModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Update File
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update File</DialogTitle>
                      <DialogDescription>
                        Upload a new file to replace the current one.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      type="file"
                      onChange={handleUpdateFile}
                      accept=".csv,.xlsx,.xls"
                      disabled={loading}
                    />
                  </DialogContent>
                </Dialog>
                <Select onValueChange={handleDownloadFile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Download File" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download as CSV
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download as XLSX
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  onClick={handleDeleteFile}
                  className="flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete File
                </Button>
              </div>
            </CardContent>
          </Card>
          {renderStatistics()}
        </motion.div>
      )}
    </div>
  );
}
