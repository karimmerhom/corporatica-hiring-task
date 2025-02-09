"use client";

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ColorHistogramProps {
  data: {
    red: number[];
    green: number[];
    blue: number[];
  };
}

export default function ColorHistogram({ data }: ColorHistogramProps) {
  if (!data || !data.red || !data.green || !data.blue) {
    return <div>No histogram data available</div>;
  }

  const chartData = data.red.map((_, index) => ({
    intensity: index,
    red: data.red[index] ?? 0,
    green: data.green[index] ?? 0,
    blue: data.blue[index] ?? 0,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Color Histogram</CardTitle>
        <CardDescription>
          Distribution of color intensities in the image
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            red: {
              label: "Red",
              color: "hsl(0 100% 50%)",
            },
            green: {
              label: "Green",
              color: "hsl(120 100% 25%)",
            },
            blue: {
              label: "Blue",
              color: "hsl(240 100% 50%)",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="intensity" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="red"
                stroke="var(--color-red)"
                name="Red"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="green"
                stroke="var(--color-green)"
                name="Green"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="blue"
                stroke="var(--color-blue)"
                name="Blue"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
