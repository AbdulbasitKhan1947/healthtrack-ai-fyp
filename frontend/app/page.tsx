"use client";

import { useState, useEffect } from 'react';
import SymptomInput from '@/components/SymptomInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import GraphVisualization from '@/components/GraphVisualization';
import AuthModal from '../components/AuthModal';
import DoctorRecommendation from '../components/DoctorRecommendation';

// Define TypeScript interfaces
interface DiseasePrediction {
  disease: string;
  confidence: number;
  matching_symptoms: string[];
  total_symptoms: number;
  emergency: boolean;
}

interface AnalysisResponse {
  predictions: DiseasePrediction[];
  graph_data: any;
  emergency_warning: string | null;
  disclaimer: string;
}

interface UserData {
  name: string;
  email: string;
  isLoggedIn: boolean;
  age?: string;
  gender?: string;
  phone?: string;
}

export default function Home() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  
  // Authentication state
  const [user, setUser] = useState<UserData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Doctor recommendation state
  const [selectedDisease, setSelectedDisease] = useState('');
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('healthtrack_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('healthtrack_user');
      }
    }
  }, []);

  // Handle login
  const handleLogin = (userData: UserData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('healthtrack_user');
    setUser(null);
    alert('Logged out successfully!');
  };

  // Show doctor recommendations for a disease
  const handleShowDoctors = (disease: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedDisease(disease);
    setShowDoctorModal(true);
  };

  // Main analysis function
  const handleAnalyze = async (symptomList: string[]) => {
    setSymptoms(symptomList);
    setLoading(true);
    setResults(null);
    setGraphData(null);
    
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptomList,
          user_age: user?.age ? parseInt(user.age) : undefined,
          user_gender: user?.gender || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      setResults(data);
      setGraphData(data.graph_data);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setResults({
        predictions: [],
        graph_data: { nodes: [], links: [] },
        emergency_warning: "Analysis failed. Please check your connection and try again.",
        disclaimer: "System error occurred. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Auth */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🏥 HealthTrack AI
              </h1>
              <p className="text-gray-600">
                Explainable Clinical Decision Support System
              </p>
            </div>
            
            {/* Auth Section */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="text-center md:text-right">
                    <p className="text-gray-700">
                      Welcome, <strong>{user.name}</strong>!
                    </p>
                    {user.age && user.gender && (
                      <p className="text-sm text-gray-500">
                        {user.age} years, {user.gender}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Logout
                    </button>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-gray-600">Get personalized recommendations</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Login / Signup
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="lg:sticky lg:top-8">
            <SymptomInput onAnalyze={handleAnalyze} isLoading={loading} />
            
            {/* User Benefits Card */}
            {user && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-md border border-green-200">
                <h3 className="font-semibold text-green-700 mb-2">🌟 Personalized Features</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Symptom history saved</li>
                  <li>• Doctor recommendations for Haripur</li>
                  <li>• Age/gender specific insights</li>
                  <li>• Export health reports</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-8">
            {results && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Analysis Results
                  </h2>
                  {results.predictions.length > 0 && user && (
                    <button
                      onClick={() => handleShowDoctors(results.predictions[0].disease)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      🩺 Find Doctors
                    </button>
                  )}
                </div>
                
                <ResultsDisplay 
                  results={results} 
                  onFindDoctors={handleShowDoctors}
                  isLoggedIn={!!user}
                />
              </div>
            )}

            {graphData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Knowledge Graph Visualization
                </h2>
                <GraphVisualization graphData={graphData} isLoading={loading} />
              </div>
            )}

            {/* Doctor Benefits Card */}
            {!user && (
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow-lg p-6 border border-blue-300">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  🔒 Unlock Doctor Recommendations
                </h3>
                <p className="text-gray-700 mb-4">
                  Create a free account to get personalized doctor recommendations in Haripur based on your symptoms.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
                >
                  Sign Up for Free
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tips */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md lg:hidden">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> On mobile, you may need to zoom in on the graph 
            for better interaction. Tap on nodes to focus them.
          </p>
        </div>

        {/* Safety Disclaimer */}
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium text-center">
            ⚠️ IMPORTANT: This is not medical advice. Always consult healthcare professionals for diagnosis and treatment.
          </p>
          <p className="text-red-600 text-sm mt-1 text-center">
            Emergency symptoms like chest pain require immediate medical attention. Call 1122 for emergencies in Pakistan.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            HealthTrack AI © {new Date().getFullYear()} | 
            Data: 41 diseases, 132 symptoms | 
            Location: Haripur, Pakistan | 
            <span className="text-green-600 ml-2">System Status: Operational ✅</span>
          </p>
        </footer>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      <DoctorRecommendation
        disease={selectedDisease}
        isOpen={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
      />
    </div>
  );
}