"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabularDataAnalysis from "./components/TabularDataAnalysis";
import TextAnalysis from "./components/TextAnalysis";
import ImageProcessing from "./components/ImageProcessing";

export default function Home() {
  const [activeTab, setActiveTab] = useState("tabular");

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center mb-8"
      >
        Data Analysis Dashboard
      </motion.h1>
      <Tabs
        defaultValue="tabular"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tabular">Tabular Data</TabsTrigger>
          <TabsTrigger value="text">Text Analysis</TabsTrigger>
          <TabsTrigger value="image">Image Processing</TabsTrigger>
        </TabsList>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="tabular">
            <TabularDataAnalysis />
          </TabsContent>
          <TabsContent value="text">
            <TextAnalysis />
          </TabsContent>
          <TabsContent value="image">
            <ImageProcessing />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
