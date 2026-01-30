# 🏥 HealthTrack AI - Explainable Clinical Decision Support System

![HealthTrack AI Banner](https://img.shields.io/badge/Status-Phase%205%20Complete-brightgreen)
![Neo4j](https://img.shields.io/badge/Neo4j-Graph%20Database-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black)

> Final Year Project by **Abdul Basit** (B22F0359SE052)  
> Pak-Austria Fachhochschule, Haripur  
> Supervisor: **Dr. Adnan Iqbal**

## 🚀 Live Demo
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Neo4j Browser:** http://localhost:7474

## 📊 Features

### ✅ Core Features
- **Graph-based AI** using Neo4j for explainability
- **Real medical data**: 41 diseases, 132 symptoms, 36,648 relationships
- **Emergency detection** for critical symptoms like chest pain
- **Interactive visualization** of disease-symptom relationships
- **Symptom autocomplete** with real-time suggestions

### ✅ Phase 5 Additions (New!)
- **Doctor Recommendation System** for Haripur city
- **User Authentication** (Login/Signup)
- **Personalized recommendations** based on user profile
- **Disease-Doctor matching** with specialization mapping

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 + React 19 + TypeScript | Modern UI with server-side rendering |
| **Backend** | FastAPI + Python 3.11 | High-performance API with async support |
| **Database** | Neo4j 5 Enterprise | Graph database for medical relationships |
| **Visualization** | React Force Graph | Interactive 3D/2D graph visualization |
| **Styling** | Tailwind CSS | Utility-first CSS framework |

## 📁 Project Structure
healthtrack-ai-fyp/
├── backend/ # FastAPI backend with Neo4j integration
├── frontend/ # Next.js frontend with React components
├── data/ # Kaggle medical datasets
├── docs/ # Project documentation
└── presentation/ # Demo and presentation files

text

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ 
- Node.js 18+
- Neo4j Desktop 5+
- Windows/Mac/Linux

### 1. Start Neo4j Database
```bash
# Open Neo4j Desktop
# Start "healthtrack-db" database
# Credentials: neo4j / pakistan@1947
2. Start Backend (Terminal 1)
bash
cd backend
venv\Scripts\activate  # Windows
python main.py
3. Start Frontend (Terminal 2)
bash
cd frontend
npm run dev
4. Load Medical Data (One-time)
bash
cd backend
python load_medical_data.py
📊 Database Statistics
Diseases: 41 medical conditions

Symptoms: 132 medical symptoms

Relationships: 36,648 disease-symptom associations

Emergency Detection: Working for chest pain and critical symptoms

🩺 Doctor Recommendation System
The system includes a real doctor database for Haripur, Pakistan:

8+ verified doctors with specializations

Contact information and availability

Disease-to-specialization mapping

One-click contact options

📈 Project Phases
Phase	Status	Description
Phase 1	✅ Complete	Full working web application prototype
Phase 2	✅ Complete	Neo4j Database setup and configuration
Phase 3	✅ Complete	Backend-Neo4j integration
Phase 4	✅ Complete	Medical data loaded (Kaggle dataset)
Phase 5	✅ Complete	Doctor recommendations + Authentication
🔗 API Endpoints
Method	Endpoint	Description
GET	/health	System health check
GET	/graph-stats	Database statistics
POST	/analyze	Analyze symptoms
GET	/symptoms/autocomplete	Symptom suggestions
GET	/doctors/recommend/{disease}	Doctor recommendations
🎯 Testing Scenarios
Basic Analysis: "itching" + "skin rash" → Fungal Infection

Autocomplete: Type "muscle" → shows suggestions

Emergency: "chest pain" → Red warning

Doctor Search: Login → Click "Find Doctors" → See Haripur doctors

📄 Documentation
QUICKSTART.md - Quick setup guide

CONTINUATION_GUIDE.md - Complete project guide

API Documentation - Interactive API docs

⚠️ Safety & Disclaimer
This is an educational project only. Always:

Consult real healthcare professionals

Never ignore emergency symptoms

Verify all doctor information independently

👥 Contributors
Abdul Basit - Full-stack development, Neo4j integration

Dr. Adnan Iqbal - Project supervision and guidance

📞 Contact
Student: Abdul Basit
Email: [Your Email]
University: Pak-Austria Fachhochschule, Haripur
Year: 2026

"In healthcare, understanding relationships between symptoms is as important as the symptoms themselves."

text

## Step 3: Create API Documentation

**File:** `docs/API_DOCUMENTATION.md`

```markdown
# 📚 HealthTrack AI API Documentation

## Base URL
http://localhost:8000

text

## Authentication
Currently using simple local storage. In production, use JWT tokens.

## 📊 Endpoints

### 1. Health Check
```http
GET /health
Response:

json
{
  "api": "healthy",
  "neo4j": "connected (173 nodes)",
  "timestamp": "2025-03-01"
}
2. Database Statistics
http
GET /graph-stats
Response:

json
{
  "node_counts": {
    "Disease": 41,
    "Symptom": 132
  },
  "relationship_counts": {
    "ASSOCIATED_WITH": 36648
  },
  "total_nodes": 173
}
3. Analyze Symptoms
http
POST /analyze
Content-Type: application/json

{
  "symptoms": ["itching", "skin rash"],
  "user_age": 25,
  "user_gender": "male"
}
Response:

json
{
  "predictions": [
    {
      "disease": "Fungal infection",
      "confidence": 85.5,
      "matching_symptoms": ["itching", "skin_rash"],
      "total_symptoms": 15,
      "emergency": false
    }
  ],
  "graph_data": {
    "nodes": [...],
    "links": [...]
  },
  "emergency_warning": null,
  "disclaimer": "This is not medical advice..."
}
4. Symptom Autocomplete
http
GET /symptoms/autocomplete?q=muscle
Response:

json
{
  "suggestions": [
    "muscle_pain",
    "muscle_wasting",
    "muscle_weakness"
  ]
}
5. Doctor Recommendations (NEW)
http
GET /doctors/recommend/Fungal%20infection
Response:

json
{
  "disease": "Fungal infection",
  "recommended_doctors": [
    {
      "id": "DOC002",
      "name": "Dr. Saima Ahmed",
      "specialization": "Dermatologist",
      "hospital": "City Medical Center",
      "address": "Phase 2, Haripur",
      "phone": "0995-234567",
      "email": "drsaima@example.com",
      "rating": 4.3,
      "experience": "12 years",
      "diseases_treated": ["Skin Rash", "Fungal Infection"],
      "availability": "Mon-Sat: 10AM-6PM",
      "fees": "PKR 1200"
    }
  ],
  "location": "Haripur, Pakistan",
  "disclaimer": "Doctor information is for reference only..."
}
🔧 Error Codes
Code	Meaning	Solution
200	Success	-
400	Bad Request	Check request format
500	Server Error	Check backend logs
503	Neo4j Unavailable	Start Neo4j database
📝 Example Usage
Python
python
import requests

response = requests.post("http://localhost:8000/analyze", 
    json={"symptoms": ["fever", "cough"]})
print(response.json())
JavaScript
javascript
fetch('http://localhost:8000/analyze', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({symptoms: ['headache', 'fever']})
})
.then(res => res.json())
.then(console.log);
🗄️ Data Models
SymptomRequest
typescript
{
  symptoms: string[],
  user_age?: number,
  user_gender?: string
}
DiseasePrediction
typescript
{
  disease: string,
  confidence: number,
  matching_symptoms: string[],
  total_symptoms: number,
  emergency: boolean
}
DoctorInfo
typescript
{
  id: string,
  name: string,
  specialization: string,
  hospital: string,
  address: string,
  phone: string,
  email: string,
  rating: number,
  experience: string,
  diseases_treated: string[],
  availability: string,
  fees: string
}