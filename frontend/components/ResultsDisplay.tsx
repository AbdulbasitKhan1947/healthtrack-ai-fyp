"use client";

import { useState } from 'react';
import DiseaseDetailsModal from './DiseaseDetailsModal';

interface DiseasePrediction {
  disease: string;
  confidence: number;
  matching_symptoms: string[];
  total_symptoms: number;
  emergency: boolean;
}

interface AnalysisResponse {
  predictions: DiseasePrediction[];
  emergency_warning: string | null;
  disclaimer: string;
}

interface ResultsDisplayProps {
  results: AnalysisResponse;
  onFindDoctors?: (disease: string) => void;
  isLoggedIn?: boolean;
}

export default function ResultsDisplay({ 
  results, 
  onFindDoctors, 
  isLoggedIn = false 
}: ResultsDisplayProps) {
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { predictions, emergency_warning, disclaimer } = results;

  const handleDiseaseClick = (diseaseName: string) => {
    setSelectedDisease(diseaseName);
    setShowModal(true);
  };

  // Emergency warning display
  if (emergency_warning) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">🚨</div>
            <h3 className="text-xl font-bold text-red-800">Emergency Warning</h3>
          </div>
          <p className="text-red-700 font-medium mb-2">{emergency_warning}</p>
          <p className="text-red-600 text-sm">
            Please seek immediate medical attention. Do not ignore these symptoms.
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">{disclaimer}</p>
        </div>
      </div>
    );
  }

  // No predictions
  if (!predictions || predictions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🤔</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No matches found</h3>
        <p className="text-gray-600">
          The system could not find diseases matching your symptoms.
          Try adding more symptoms or consult a healthcare professional.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Disease Details Modal */}
      <DiseaseDetailsModal
        disease={selectedDisease || ''}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">
            Found <strong>{predictions.length}</strong> possible conditions matching your symptoms.
          </p>
        </div>

        {/* Predictions List */}
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className={`border rounded-xl p-4 ${
                prediction.emergency
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <button
                    onClick={() => handleDiseaseClick(prediction.disease)}
                    className="font-bold text-lg text-gray-800 hover:text-blue-600 transition-colors text-left flex items-center gap-2"
                  >
                    {prediction.disease}
                    <span className="text-blue-500 text-sm font-normal">(View Details)</span>
                    {prediction.emergency && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        ⚠️ EMERGENCY
                      </span>
                    )}
                  </button>
                  <p className="text-sm text-gray-600 mt-1">
                    Matched {prediction.matching_symptoms.length} of {prediction.total_symptoms} symptoms
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Confidence Score */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      prediction.confidence > 70 ? 'text-green-600' :
                      prediction.confidence > 40 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {prediction.confidence}%
                    </div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>

                  {/* Doctor Button */}
                  <button
                    onClick={() => onFindDoctors && onFindDoctors(prediction.disease)}
                    disabled={!isLoggedIn}
                    className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                      isLoggedIn 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span>🩺</span>
                    <span>{isLoggedIn ? 'Find Doctors' : 'Login Required'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      prediction.confidence > 70 ? 'bg-green-500' :
                      prediction.confidence > 40 ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(prediction.confidence, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Matching Symptoms */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Matching Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {prediction.matching_symptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Warning for low confidence */}
              {prediction.confidence < 30 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  ⚠️ Low confidence match. This disease only partially matches your symptoms.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-700 text-sm">{disclaimer}</p>
          <p className="text-gray-600 text-xs mt-2">
            Confidence scores are calculated based on symptom matches and severity.
            Higher scores indicate stronger matches but do not guarantee diagnosis.
          </p>
        </div>
      </div>
    </>
  );
}