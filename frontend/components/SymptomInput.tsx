"use client";

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface SymptomInputProps {
  onAnalyze: (symptoms: string[]) => void;
  isLoading: boolean;
}

// Helper function to convert user input to database format
const toDatabaseFormat = (text: string): string => {
  return text.trim().toLowerCase().replace(/\s+/g, '_');
};

// Helper function to convert database format to display format
const toDisplayFormat = (text: string): string => {
  return text.replace(/_/g, ' ');
};

export default function SymptomInput({ onAnalyze, isLoading }: SymptomInputProps) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Convert to database format for search
        const dbQuery = toDatabaseFormat(query);
        console.log(`🔍 Searching for: "${query}" → "${dbQuery}"`);
        
        const response = await fetch(
          `http://localhost:8000/symptoms/autocomplete?q=${encodeURIComponent(dbQuery)}`
        );
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        // Convert database format to display format
        const displaySuggestions = (data.suggestions || []).map(toDisplayFormat);
        setSuggestions(displaySuggestions);
        
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(inputValue);
  }, [inputValue, fetchSuggestions]);

  const handleAddSymptom = (symptom?: string) => {
    const symptomToAdd = symptom || inputValue.trim().toLowerCase();
    
    if (!symptomToAdd) {
      setError('Please enter a symptom');
      return;
    }
    
    // Convert to database format for storage
    const dbSymptom = toDatabaseFormat(symptomToAdd);
    
    if (symptoms.includes(dbSymptom)) {
      setError('Symptom already added');
      return;
    }
    
    setSymptoms([...symptoms, dbSymptom]);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setError('');
    console.log(`✅ Added symptom: "${symptomToAdd}" → "${dbSymptom}"`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log(`🖱️ Clicked suggestion: "${suggestion}"`);
    handleAddSymptom(suggestion);
  };

  const handleRemoveSymptom = (index: number) => {
    const newSymptoms = [...symptoms];
    const removed = newSymptoms.splice(index, 1);
    setSymptoms(newSymptoms);
    console.log(`🗑️ Removed symptom: "${removed[0]}"`);
  };

  const handleQuickAdd = (symptom: string) => {
    const dbSymptom = toDatabaseFormat(symptom);
    if (!symptoms.includes(dbSymptom)) {
      setSymptoms([...symptoms, dbSymptom]);
      console.log(`⚡ Quick added: "${symptom}" → "${dbSymptom}"`);
    }
  };

  const handleAnalyze = () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }
    
    console.log(`🚀 Analyzing ${symptoms.length} symptoms:`, symptoms);
    onAnalyze(symptoms);
  };

  const handleClearAll = () => {
    console.log(`🧹 Cleared all ${symptoms.length} symptoms`);
    setSymptoms([]);
    setError('');
  };

  const COMMON_SYMPTOMS = [
    "fever", "cough", "headache", "fatigue", "nausea",
    "chest pain", "shortness of breath", "dizziness",
    "abdominal pain", "sore throat", "runny nose", "body aches"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Enter Your Symptoms
      </h2>

      {/* Input Field with Autocomplete */}
      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a symptom:
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
              setError('');
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddSymptom();
              }
            }}
            placeholder="Type at least 2 characters (e.g., muscle, pain, itching)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
          
          {/* Loading indicator */}
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Autocomplete Suggestions - HIGHLY VISIBLE VERSION */}
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-500 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-3 text-blue-600 text-sm font-medium">
                  🔍 Searching database...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  No symptoms found. Try different search terms.
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
                    <p className="text-xs font-bold text-blue-700">
                      🩺 FOUND {suggestions.length} MEDICAL SYMPTOMS:
                    </p>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-600">
                          +
                        </div>
                        <div>
                          <span className="text-gray-900 font-bold text-base">
                            {suggestion}
                          </span>
                          <div className="text-gray-500 text-xs mt-1">
                            Click to add this symptom
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>
        )}
        
        <div className="mt-2 text-sm text-gray-500">
          💡 Type "muscle", "pain", or "itching" to see real medical symptoms
        </div>
      </div>

      {/* Common Symptoms */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">Quick select common symptoms:</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              onClick={() => handleQuickAdd(symptom)}
              disabled={symptoms.includes(toDatabaseFormat(symptom))}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                symptoms.includes(toDatabaseFormat(symptom))
                  ? 'bg-blue-500 text-white border border-blue-600 cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-300'
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
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <div
                key={index}
                className="bg-blue-100 border border-blue-300 rounded-full px-4 py-2 flex items-center gap-2"
              >
                <span className="text-blue-800 font-medium">
                  {toDisplayFormat(symptom)}
                </span>
                <button
                  onClick={() => handleRemoveSymptom(index)}
                  className="text-blue-700 hover:text-blue-900 text-lg font-bold"
                  aria-label={`Remove ${toDisplayFormat(symptom)}`}
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
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Pro Tip:</strong> The database has 132 real medical symptoms. 
          Try searching for: "muscle", "pain", "itching", "fever", or "cough"
        </p>
      </div>
    </div>
  );
}