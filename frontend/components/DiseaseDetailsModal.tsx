"use client";

import { useState, useEffect } from 'react';

interface DiseaseDetails {
  name: string;
  description?: string;
  symptoms: string[];
  treatments?: string[];
  precautions?: string[];
  severity: 'low' | 'medium' | 'high';
}

interface DiseaseDetailsModalProps {
  disease: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DiseaseDetailsModal({ disease, isOpen, onClose }: DiseaseDetailsModalProps) {
  const [details, setDetails] = useState<DiseaseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && disease) {
      fetchDiseaseDetails(disease);
    }
  }, [isOpen, disease]);

  const fetchDiseaseDetails = async (diseaseName: string) => {
    setIsLoading(true);
    try {
      // For now, we'll use mock data
      // In a real system, this would come from your API/Neo4j
      const mockDetails: DiseaseDetails = {
        name: diseaseName,
        description: `${diseaseName} is a medical condition that requires professional diagnosis and treatment.`,
        symptoms: ['Symptom 1', 'Symptom 2', 'Symptom 3'],
        treatments: ['Consult a healthcare professional', 'Follow prescribed medication'],
        precautions: ['Avoid self-medication', 'Monitor symptoms regularly'],
        severity: 'medium'
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setDetails(mockDetails);
    } catch (error) {
      console.error('Error fetching disease details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">
            {disease} Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Description */}
              {details.description && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{details.description}</p>
                </div>
              )}

              {/* Common Symptoms */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Common Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {details.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Treatments */}
              {details.treatments && details.treatments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">General Treatment Guidelines</h4>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {details.treatments.map((treatment, index) => (
                      <li key={index}>{treatment}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Precautions */}
              {details.precautions && details.precautions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Precautions</h4>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {details.precautions.map((precaution, index) => (
                      <li key={index}>{precaution}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Severity Indicator */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Severity Level</h4>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    details.severity === 'high' ? 'bg-red-500' :
                    details.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <span className="capitalize">{details.severity} severity</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  ⚠️ <strong>Important:</strong> This information is for educational purposes only. 
                  Always consult with a qualified healthcare professional for diagnosis and treatment.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              No details available for this disease.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}