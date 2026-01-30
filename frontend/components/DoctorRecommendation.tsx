"use client";

import { useState, useEffect } from 'react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  experience: string;
  diseases_treated: string[];
  availability: string;
  fees: string;
}

interface DoctorRecommendationProps {
  disease: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DoctorRecommendation({ disease, isOpen, onClose }: DoctorRecommendationProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && disease) {
      fetchDoctors(disease);
    }
  }, [isOpen, disease]);

  const fetchDoctors = async (diseaseName: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `http://localhost:8000/doctors/recommend/${encodeURIComponent(diseaseName)}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.status}`);
      }
      
      const data = await response.json();
      setDoctors(data.recommended_doctors || []);
      
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Unable to load doctor recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    // For now, show contact info
    alert(`Contact ${doctor.name}:\nPhone: ${doctor.phone}\nEmail: ${doctor.email}\n\nHospital: ${doctor.hospital}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              🩺 Recommended Doctors in Haripur
            </h3>
            <p className="text-gray-600 mt-1">
              For: <span className="font-semibold text-blue-700">{disease}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Finding the best doctors in Haripur...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <p className="text-gray-700">{error}</p>
              <button
                onClick={() => fetchDoctors(disease)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No specific doctors found for this disease.</p>
              <p className="text-sm text-gray-500 mt-2">
                We recommend visiting a General Physician in Haripur District Hospital.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5"
                  >
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{doctor.name}</h4>
                        <div className="flex items-center mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {doctor.specialization}
                          </span>
                          <div className="ml-3 flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">DR</span>
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">🏥</span>
                        <span className="text-sm text-gray-700">{doctor.hospital}</span>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">📍</span>
                        <span className="text-sm text-gray-700">{doctor.address}</span>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">⏰</span>
                        <span className="text-sm text-gray-700">{doctor.availability}</span>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">💰</span>
                        <span className="text-sm text-gray-700 font-medium">{doctor.fees} per visit</span>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">📅</span>
                        <span className="text-sm text-gray-700">{doctor.experience} experience</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={() => handleBookAppointment(doctor)}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Contact for Appointment
                      </button>
                      <a
                        href={`tel:${doctor.phone}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center"
                        title="Call Now"
                      >
                        📞
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Information */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">ℹ️ Important Information</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• All doctors are verified practitioners in Haripur, Pakistan</li>
                  <li>• Fees mentioned are approximate consultation charges</li>
                  <li>• Always call before visiting to confirm availability</li>
                  <li>• Emergency? Call Haripur Rescue: 1122 or 15</li>
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm">
                  ⚠️ <strong>Disclaimer:</strong> This is a recommendation system. Always verify 
                  doctor credentials independently. In case of emergency, visit the nearest hospital 
                  or call emergency services immediately.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing doctors in <span className="font-semibold">Haripur, Pakistan</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Close
            </button>
            <a
              href="https://www.google.com/maps/search/hospitals+in+haripur"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              <span>📍</span> Find More Hospitals
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}