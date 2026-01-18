"use client";

import { useState } from 'react';

interface SymptomInputProps {
  onAnalyze: (symptoms: string[]) => void;
  isLoading: boolean;
}

const COMMON_SYMPTOMS = [
  "fever", "cough", "headache", "fatigue", "nausea",
  "chest pain", "shortness of breath", "dizziness",
  "abdominal pain", "sore throat", "runny nose", "body aches"
];

export default function SymptomInput({ onAnalyze, isLoading }: SymptomInputProps) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAddSymptom = () => {
    const symptom = inputValue.trim().toLowerCase();
    
    if (!symptom) {
      setError('Please enter a symptom');
      return;
    }
    
    if (symptoms.includes(symptom)) {
      setError('Symptom already added');
      return;
    }
    
    setSymptoms([...symptoms, symptom]);
    setInputValue('');
    setError('');
  };

  const handleRemoveSymptom = (index: number) => {
    const newSymptoms = [...symptoms];
    newSymptoms.splice(index, 1);
    setSymptoms(newSymptoms);
  };

  const handleQuickAdd = (symptom: string) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleAnalyze = () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }
    
    onAnalyze(symptoms);
  };

  const handleClearAll = () => {
    setSymptoms([]);
    setError('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Enter Your Symptoms
      </h2>

      {/* Input Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a symptom:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddSymptom();
              }
            }}
            placeholder="e.g., headache, fever, cough"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleAddSymptom}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Common Symptoms */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">Quick select common symptoms:</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              onClick={() => handleQuickAdd(symptom)}
              disabled={symptoms.includes(symptom)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                symptoms.includes(symptom)
                  ? 'bg-blue-100 text-blue-800 border border-blue-300 cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Symptoms */}
      {symptoms.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-gray-700">
              Selected Symptoms ({symptoms.length}):
            </p>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <div
                key={index}
                className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 flex items-center gap-2"
              >
                <span className="text-blue-800">{symptom}</span>
                <button
                  onClick={() => handleRemoveSymptom(index)}
                  className="text-blue-600 hover:text-blue-800 text-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || symptoms.length === 0}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
            isLoading || symptoms.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </span>
          ) : (
            'Analyze Symptoms'
          )}
        </button>
        
        <button
          onClick={handleClearAll}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Add multiple symptoms for more accurate results. 
          The system will analyze symptom patterns to suggest possible conditions.
        </p>
      </div>
    </div>
  );
}