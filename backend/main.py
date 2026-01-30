from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import json
from typing import Optional
from doctors_data import get_recommended_doctors

# ============================
# NEO4J CONNECTION
# ============================
NEO4J_URI = "neo4j://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "pakistan@1947"

# Create Neo4j driver
try:
    driver = GraphDatabase.driver(
        NEO4J_URI, 
        auth=(NEO4J_USER, NEO4J_PASSWORD)
    )
    driver.verify_connectivity()
    print("✅ Neo4j connection established")
except Exception as e:
    print(f"❌ Neo4j connection failed: {e}")
    driver = None

# ============================
# LIFESPAN MANAGER
# ============================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 HealthTrack AI API starting...")
    
    # Test Neo4j
    if driver:
        try:
            with driver.session() as session:
                result = session.run("MATCH (n) RETURN count(n) as count")
                count = result.single()["count"]
                print(f"📊 Neo4j connected with {count} nodes")
        except Exception as e:
            print(f"⚠️ Neo4j test failed: {e}")
    
    yield  # App runs here
    
    # Shutdown
    print("🛑 HealthTrack AI API shutting down...")
    if driver:
        driver.close()
        print("✅ Neo4j driver closed")

# ============================
# FASTAPI APP
# ============================
app = FastAPI(
    title="HealthTrack AI API",
    version="2.0",
    description="Explainable Clinical Decision Support System",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://frontend:3000",  # Docker container name
        "http://localhost",       # Fallback
        "*"                       # For development only - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# DATA MODELS
# ============================
class SymptomRequest(BaseModel):
    symptoms: List[str]
    user_age: Optional[int] = None
    user_gender: Optional[str] = None

class DiseasePrediction(BaseModel):
    disease: str
    confidence: float
    matching_symptoms: List[str]
    total_symptoms: int
    emergency: bool = False

class AnalysisResponse(BaseModel):
    predictions: List[DiseasePrediction]
    graph_data: Dict[str, Any]
    emergency_warning: Optional[str] = None
    disclaimer: str = "This is not medical advice. Consult a healthcare professional."

class DoctorInfo(BaseModel):
    id: str
    name: str
    specialization: str
    hospital: str
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    rating: float
    experience: str
    diseases_treated: List[str]
    availability: str
    fees: str

class DoctorResponse(BaseModel):
    disease: str
    recommended_doctors: List[DoctorInfo]
    location: str = "Haripur, Pakistan"
    disclaimer: str = "Doctor information is for reference only. Always verify before visiting."

# ============================
# HELPER FUNCTIONS (CORRECT INDENTATION)
# ============================
def normalize_symptom_name(symptom: str) -> str:
    """Convert user-input symptom names to match database format"""
    if not symptom:
        return symptom
    
    # Convert to lowercase and clean
    symptom = symptom.strip().lower()
    
    # Replace spaces with underscores (database format)
    normalized = symptom.replace(' ', '_')
    
    # Special cases - map common variations to database names
    special_cases = {
        'shortness of breath': 'breathlessness',
        'shortness breath': 'breathlessness',
        'difficulty breathing': 'breathlessness',
        'runny nose': 'runny_nose',
        'stuffy nose': 'congestion',
        'stomach pain': 'stomach_pain',
        'belly pain': 'abdominal_pain',
        'chest pain': 'chest_pain',
        'joint pain': 'joint_pain',
        'high fever': 'high_fever',
        'mild fever': 'mild_fever',
        'back pain': 'back_pain',
        'neck pain': 'neck_pain',
        'abdominal pain': 'abdominal_pain',
        'skin rash': 'skin_rash',
        'skin itching': 'itching',
        'itchy skin': 'itching',
        'fever': 'high_fever',
        'coughing': 'cough',
        'head ache': 'headache',
        'nauseous': 'nausea',
        'vomit': 'vomiting',
        'diarrhea': 'diarrhoea',
        'constipated': 'constipation',
        'dizzy': 'dizziness',
        'fatigued': 'fatigue',
        'tired': 'fatigue',
    }
    
    # Check if we have a special case
    if symptom in special_cases:
        return special_cases[symptom]
    
    # Otherwise return with underscores
    return normalized

def check_emergency_symptoms(symptoms: List[str]) -> tuple[bool, Optional[str]]:
    """Check if any symptoms require emergency attention"""
    symptoms_lower = [s.lower() for s in symptoms]
    
    # Always check for chest pain
    if "chest pain" in symptoms_lower:
        return True, "⚠️ EMERGENCY WARNING: Chest pain can indicate serious conditions like heart attack. Seek immediate medical attention!"
    
    # Check for other emergencies
    emergency_keywords = [
        "difficulty breathing", "severe bleeding", "unconscious", 
        "stroke", "heart attack", "paralysis", "severe headache"
    ]
    
    for keyword in emergency_keywords:
        if keyword in symptoms_lower:
            return True, f"⚠️ EMERGENCY: '{keyword}' requires immediate medical attention!"
    
    return False, None

def query_neo4j_for_diseases(symptoms: List[str]) -> List[Dict[str, Any]]:
    """Query Neo4j for diseases matching the symptoms"""
    if not driver:
        return []
    
    # NORMALIZE SYMPTOM NAMES
    normalized_symptoms = [normalize_symptom_name(s) for s in symptoms]
    print(f"🔍 Original symptoms: {symptoms}")
    print(f"🔍 Normalized symptoms: {normalized_symptoms}")
    
    try:
        with driver.session() as session:
            # Query to find diseases with matching symptoms
            result = session.run("""
                MATCH (d:Disease)-[r:ASSOCIATED_WITH]->(s:Symptom)
                WHERE s.name IN $symptoms
                WITH d, count(r) as matched_symptoms, collect(s.name) as matching_symptoms
                
                // Get total symptoms for this disease
                MATCH (d)-[r2:ASSOCIATED_WITH]->(s2:Symptom)
                WITH d, matched_symptoms, matching_symptoms, count(r2) as total_symptoms
                
                // Get severity scores
                OPTIONAL MATCH (d)-[r3:ASSOCIATED_WITH]->(s3:Symptom)
                WHERE s3.name IN $symptoms
                WITH d, matched_symptoms, total_symptoms, matching_symptoms,
                     sum(CASE WHEN r3.severity IS NOT NULL THEN r3.severity ELSE 1 END) as severity_score
                
                RETURN d.name as disease_name,
                       d.emergency as is_emergency,
                       matched_symptoms,
                       total_symptoms,
                       matching_symptoms,
                       severity_score,
                       (matched_symptoms * 1.0 / total_symptoms * 100) as match_percentage
                ORDER BY matched_symptoms DESC, severity_score DESC
                LIMIT 10
            """, symptoms=normalized_symptoms)
            
            predictions = []
            for record in result:
                # Calculate confidence score (0-99.9)
                base_confidence = record["match_percentage"]
                severity_bonus = min(record["severity_score"] * 2, 20)
                confidence = min(base_confidence + severity_bonus, 99.9)
                
                predictions.append({
                    "disease": record["disease_name"],
                    "confidence": round(confidence, 1),
                    "matching_symptoms": record["matching_symptoms"],
                    "total_symptoms": record["total_symptoms"],
                    "emergency": record["is_emergency"] or False
                })
            
            return predictions
            
    except Exception as e:
        print(f"Error querying Neo4j: {e}")
        return []

def get_graph_data_from_neo4j(symptoms: List[str]) -> Dict[str, Any]:
    """Get graph data for visualization"""
    if not driver:
        return {"nodes": [], "links": []}
    
    # NORMALIZE SYMPTOM NAMES
    normalized_symptoms = [normalize_symptom_name(s) for s in symptoms]
    
    try:
        with driver.session() as session:
            # Get diseases that match the symptoms
            result = session.run("""
                MATCH (d:Disease)-[r:ASSOCIATED_WITH]->(s:Symptom)
                WHERE s.name IN $symptoms
                RETURN d, s, r
                LIMIT 30
            """, symptoms=normalized_symptoms)
            
            nodes = []
            links = []
            node_ids = set()
            
            for record in result:
                disease = record["d"]
                symptom = record["s"]
                relationship = record["r"]
                
                # Add disease node
                disease_id = f"disease_{disease.id}"
                if disease_id not in node_ids:
                    nodes.append({
                        "id": disease_id,
                        "label": disease.get("name", "Unknown Disease"),
                        "type": "disease",
                        "properties": {
                            "emergency": disease.get("emergency", False),
                            "id": disease.get("id", "")
                        }
                    })
                    node_ids.add(disease_id)
                
                # Add symptom node
                symptom_id = f"symptom_{symptom.id}"
                if symptom_id not in node_ids:
                    nodes.append({
                        "id": symptom_id,
                        "label": symptom.get("name", "Unknown Symptom"),
                        "type": "symptom",
                        "properties": {
                            "severity": symptom.get("severity", 1),
                            "frequency": symptom.get("frequency", 1),
                            "emergency": symptom.get("emergency", False)
                        },
                        "is_input": symptom.get("name") in normalized_symptoms
                    })
                    node_ids.add(symptom_id)
                
                # Add relationship
                links.append({
                    "source": disease_id,
                    "target": symptom_id,
                    "relationship": "ASSOCIATED_WITH",
                    "properties": {
                        "severity": relationship.get("severity", 1),
                        "frequency": relationship.get("frequency", 1)
                    }
                })
            
            return {"nodes": nodes, "links": links}
            
    except Exception as e:
        print(f"Error getting graph data: {e}")
        return {"nodes": [], "links": []}

# ============================
# API ENDPOINTS
# ============================
@app.get("/symptoms/autocomplete")
async def get_symptom_suggestions(q: str = ""):
    """Get symptom suggestions for autocomplete - SIMPLIFIED VERSION"""
    if not driver or not q:
        return {"suggestions": []}
    
    try:
        with driver.session() as session:
            # Clean the query
            search_term = q.strip().lower()
            
            print(f"🔍 Searching for symptoms containing: '{search_term}'")
            
            # SIMPLE QUERY - only one parameter
            result = session.run("""
                MATCH (s:Symptom)
                WHERE toLower(s.name) CONTAINS $search
                RETURN s.name as symptom
                ORDER BY s.name
                LIMIT 10
            """, search=search_term)
            
            suggestions = []
            for record in result:
                symptom_name = record["symptom"]
                suggestions.append(symptom_name)
                print(f"   Found: {symptom_name}")
            
            print(f"✅ Found {len(suggestions)} suggestions")
            return {"suggestions": suggestions}
            
    except Exception as e:
        print(f"❌ Error in autocomplete: {e}")
        return {"suggestions": [], "error": str(e)}
@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "HealthTrack AI API",
        "version": "2.0",
        "status": "Neo4j Connected" if driver else "Neo4j Disconnected",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "graph_stats": "/graph-stats",
            "analyze": "/analyze (POST)"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    api_status = "healthy"
    neo4j_status = "connected" if driver else "disconnected"
    
    if driver:
        try:
            with driver.session() as session:
                result = session.run("MATCH (n) RETURN count(n) as count")
                node_count = result.single()["count"]
                neo4j_status = f"connected ({node_count} nodes)"
        except:
            neo4j_status = "error"
    
    return {
        "api": api_status,
        "neo4j": neo4j_status,
        "timestamp": "2025-03-01"
    }

@app.get("/graph-stats")
async def get_graph_stats():
    """Get Neo4j database statistics"""
    if not driver:
        return {"error": "Neo4j not connected"}
    
    try:
        with driver.session() as session:
            # Count nodes by label
            result = session.run("""
                MATCH (n)
                RETURN labels(n)[0] as label, count(n) as count
                ORDER BY count DESC
            """)
            
            stats = {}
            for record in result:
                stats[record["label"]] = record["count"]
            
            # Count relationships
            result = session.run("""
                MATCH ()-[r]->()
                RETURN type(r) as type, count(r) as count
                ORDER BY count DESC
            """)
            
            relationships = {}
            for record in result:
                relationships[record["type"]] = record["count"]
            
            return {
                "node_counts": stats,
                "relationship_counts": relationships,
                "total_nodes": sum(stats.values()) if stats else 0
            }
            
    except Exception as e:
        return {"error": str(e)}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_symptoms(request: SymptomRequest):
    """
    Analyze symptoms and return predictions with graph data
    """
    print(f"📝 Analyzing symptoms: {request.symptoms}")
    
    is_emergency, warning = check_emergency_symptoms(request.symptoms)
    if is_emergency:
        return AnalysisResponse(
            predictions=[],
            graph_data={"nodes": [], "links": []},
            emergency_warning=warning,
            disclaimer="This is a medical emergency. Call emergency services immediately."
        )
    
    predictions = query_neo4j_for_diseases(request.symptoms)
    graph_data = get_graph_data_from_neo4j(request.symptoms)
    
    print(f"✅ Analysis complete: {len(predictions)} predictions found")
    
    return AnalysisResponse(
        predictions=predictions,
        graph_data=graph_data,
        emergency_warning=None,
        disclaimer="This is not medical advice. Consult a healthcare professional."
    )
@app.get("/doctors/recommend/{disease_name}", response_model=DoctorResponse)
async def recommend_doctors(disease_name: str):
    """
    Get recommended doctors in Haripur for a specific disease
    """
    try:
        doctors = get_recommended_doctors(disease_name)
        
        return DoctorResponse(
            disease=disease_name,
            recommended_doctors=doctors,
            location="Haripur, Pakistan",
            disclaimer="Doctor information is for reference only. Always verify details before visiting."
        )
    except Exception as e:
        return DoctorResponse(
            disease=disease_name,
            recommended_doctors=[],
            disclaimer=f"Error fetching doctors: {str(e)}"
        )

@app.get("/doctors/search")
async def search_doctors(
    specialization: Optional[str] = None,
    rating_min: Optional[float] = None
):
    """Search doctors by specialization or rating"""
    from doctors_data import DOCTORS_DATABASE
    
    filtered = DOCTORS_DATABASE
    
    if specialization:
        filtered = [d for d in filtered if specialization.lower() in d["specialization"].lower()]
    
    if rating_min is not None:
        filtered = [d for d in filtered if d["rating"] >= rating_min]
    
    return {"doctors": filtered[:10], "count": len(filtered)}
# ============================
# MAIN ENTRY POINT
# ============================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)