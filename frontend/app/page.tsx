"use client";

import { useState, useEffect } from 'react';
import SymptomInput from '../components/SymptomInput';
import ResultsDisplay from '../components/ResultsDisplay';
import GraphVisualization from '../components/GraphVisualization';

// Common symptoms for quick selection
const COMMON_SYMPTOMS = [
  "fever", "cough", "headache", "fatigue", "nausea",
  "chest pain", "shortness of breath", "dizziness",
  "abdominal pain", "sore throat", "runny nose", "body aches"
];

export default function Home() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | ''>('');
  const [userGender, setUserGender] = useState<string>('');

  const handleAnalyze = async () => {
    if (symptoms.length === 0) {
      setError("Please add at least one symptom");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms,
          user_age: userAge || null,
          user_gender: userGender || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(`Failed to analyze symptoms: ${err.message}`);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymptom = (symptom: string) => {
    if (symptom.trim() && !symptoms.includes(symptom.trim())) {
      setSymptoms([...symptoms, symptom.trim()]);
    }
  };

  const handleRemoveSymptom = (index: number) => {
    const newSymptoms = [...symptoms];
    newSymptoms.splice(index, 1);
    setSymptoms(newSymptoms);
  };

  const handleClearAll = () => {
    setSymptoms([]);
    setResults(null);
    setError(null);
  };

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          console.log('✅ Backend connection successful');
        }
      } catch (err) {
        console.log('⚠️ Backend connection failed');
      }
    };
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          🩺 HealthTrack AI
        </h1>
        <p className="text-gray-600 mb-4">
          Explainable Clinical Decision Support System
        </p>
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-6">
          <p className="text-sm text-gray-700">
            <strong>Disclaimer:</strong> This tool is for educational purposes only. 
            It does not provide medical advice. Always consult a healthcare professional 
            for medical concerns. In case of emergency, call your local emergency number.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input & Results */}
          <div className="space-y-8">
            {/* Symptom Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Enter Symptoms
              </h2>
              
              {/* User Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={userAge}
                    onChange={(e) => setUserAge(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender (Optional)
                  </label>
                  <select
                    value={userGender}
                    onChange={(e) => setUserGender(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Symptom Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Symptoms:
                </label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    id="symptom-input"
                    placeholder="e.g., headache, fever"
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = (e.target as HTMLInputElement).value;
                        if (input.trim()) {
                          handleAddSymptom(input);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('symptom-input') as HTMLInputElement;
                      if (input.value.trim()) {
                        handleAddSymptom(input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Common Symptoms */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Quick select common symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => handleAddSymptom(symptom)}
                        disabled={symptoms.includes(symptom)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          symptoms.includes(symptom)
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
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
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Symptoms ({symptoms.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 flex items-center gap-2"
                        >
                          <span className="text-blue-800">{symptom}</span>
                          <button
                            onClick={() => handleRemoveSymptom(index)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
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
                    disabled={loading || symptoms.length === 0}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      loading || symptoms.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </span>
                    ) : (
                      'Analyze Symptoms'
                    )}
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Results Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Analysis Results
              </h2>
              {results ? (
                <ResultsDisplay results={results} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-4">🔍</div>
                  <p>Submit symptoms to see analysis results</p>
                  <p className="text-sm mt-2">The system will suggest possible conditions with confidence scores</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Graph Visualization */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Knowledge Graph Visualization
            </h2>
            <p className="text-gray-600 mb-6">
              Interactive visualization showing relationships between diseases and symptoms
            </p>
            
            <GraphVisualization
              graphData={results?.graph_data || null}
              isLoading={loading}
            />
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">How to use the graph:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Red circles = Diseases</li>
                <li>• Green circles = Your input symptoms</li>
                <li>• Blue circles = Related symptoms</li>
                <li>• Lines show relationships between diseases and symptoms</li>
                <li>• Click on any node to focus on it</li>
                <li>• Drag to move around the graph</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          <p>HealthTrack AI - Final Year Project | Abdul Basit (B22F0359SE052)</p>
          <p className="mt-1">Pak-Austria Fachhochschule, Haripur | Supervisor: Dr. Adnan Iqbal</p>
          <p className="mt-4">
            <strong>Note:</strong> This system uses a Neo4j graph database with limited medical data.
            For production use, consult with medical professionals and use validated medical databases.
          </p>
        </footer>
      </div>
    </div>
  );
}