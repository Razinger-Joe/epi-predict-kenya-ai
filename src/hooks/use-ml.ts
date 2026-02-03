/**
 * ML Prediction Service Hook
 *
 * React hook for calling ML prediction API endpoints
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:8000/api/v1/ml";

// Types matching backend models
export interface PredictionRequest {
  county: string;
  disease: "Malaria" | "Cholera" | "Flu" | "Typhoid" | "Dengue" | "COVID-19";
  temperature: number;
  humidity: number;
  rainfall: number;
  population_density: number;
  access_to_water: number;
  healthcare_coverage: number;
  previous_cases: number;
  vaccination_rate: number;
}

export interface PredictionResponse {
  county: string;
  disease: string;
  risk_level: "critical" | "high" | "medium" | "low";
  outbreak_probability: number;
  confidence_score: number;
  predicted_cases: number;
  model_version: string;
  created_at: string;
  recommendations: string[];
}

export interface ModelStatus {
  models: {
    [key: string]: {
      trained_at: string;
      accuracy: number;
      training_samples: number;
      features: number;
    };
  };
  last_update: string;
}

/**
 * Hook to make disease outbreak predictions
 *
 * Example:
 *   const { mutate: predict, isPending } = usePrediction();
 *   const handlePredict = () => {
 *     predict({
 *       county: "Nairobi",
 *       disease: "Malaria",
 *       temperature: 28.5,
 *       humidity: 65,
 *       ...
 *     });
 *   };
 */
export function usePrediction() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PredictionRequest) => {
      try {
        const response = await axios.post<{
          data: PredictionResponse;
          message: string;
        }>(`${API_BASE}/predict`, request);
        return response.data.data;
      } catch (error) {
        const err = error as AxiosError;
        throw new Error(
          err.response?.data?.toString() || "Prediction failed"
        );
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Prediction Complete",
        description: `${data.county}: ${data.risk_level.toUpperCase()} risk (${(data.outbreak_probability * 100).toFixed(0)}%)`,
      });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
    onError: (error) => {
      toast({
        title: "Prediction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to make batch predictions
 *
 * Example:
 *   const { mutate: batchPredict } = useBatchPrediction();
 *   const handleBatchPredict = () => {
 *     batchPredict([
 *       { county: "Nairobi", disease: "Malaria", ... },
 *       { county: "Mombasa", disease: "Cholera", ... }
 *     ]);
 *   };
 */
export function useBatchPrediction() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requests: PredictionRequest[]) => {
      try {
        const response = await axios.post<{
          data: PredictionResponse[];
          message: string;
        }>(`${API_BASE}/predict/batch`, requests);
        return response.data.data;
      } catch (error) {
        const err = error as AxiosError;
        throw new Error(
          err.response?.data?.toString() || "Batch prediction failed"
        );
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Batch Predictions Complete",
        description: `Generated ${data.length} predictions`,
      });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
    onError: (error) => {
      toast({
        title: "Batch Prediction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to get ML model status
 *
 * Example:
 *   const { data: modelStatus } = useModelStatus();
 */
export function useModelStatus() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["mlModelStatus"],
    queryFn: async () => {
      try {
        const response = await axios.get<{
          data: ModelStatus;
          message: string;
        }>(`${API_BASE}/model/status`);
        return response.data.data;
      } catch (error) {
        const err = error as AxiosError;
        toast({
          title: "Failed to Load Model Status",
          description:
            err.response?.data?.toString() || "Error loading model status",
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to train ML models
 *
 * Example:
 *   const { mutate: trainModel } = useTrainModel();
 *   const handleTrain = () => {
 *     trainModel({
 *       disease: "Malaria",
 *       test_size: 0.2,
 *       random_state: 42
 *     });
 *   };
 */
export function useTrainModel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      disease?: string;
      test_size?: number;
      random_state?: number;
    }) => {
      try {
        const response = await axios.post<{
          data: {
            model_version: string;
            accuracy: number;
            training_samples: number;
          };
          message: string;
        }>(`${API_BASE}/train`, request);
        return response.data.data;
      } catch (error) {
        const err = error as AxiosError;
        throw new Error(
          err.response?.data?.toString() || "Model training failed"
        );
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Model Training Complete",
        description: `Accuracy: ${(data.accuracy * 100).toFixed(1)}%`,
      });
      queryClient.invalidateQueries({ queryKey: ["mlModelStatus"] });
    },
    onError: (error) => {
      toast({
        title: "Training Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to get training data statistics
 *
 * Example:
 *   const { data: stats } = useTrainingDataStats();
 */
export function useTrainingDataStats() {
  return useQuery({
    queryKey: ["trainingDataStats"],
    queryFn: async () => {
      try {
        const response = await axios.get<{
          data: {
            total_records: number;
            by_disease: { [key: string]: number };
            by_county: { [key: string]: number };
            outbreaks: number;
            avg_temperature: number;
            avg_humidity: number;
            avg_rainfall: number;
          };
          message: string;
        }>(`${API_BASE}/training-data/statistics`);
        return response.data.data;
      } catch (error) {
        console.error("Error fetching training data stats:", error);
        throw error;
      }
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}
