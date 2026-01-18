from typing import List, Dict, Any, Tuple
from neo4j import Driver
import json

def analyze_symptoms(symptoms: List[str], driver: Driver) -> Dict[str, Any]:
    """
    Analyze symptoms using Neo4j graph database
    
    Args:
        symptoms: List of symptom strings
        driver: Neo4j driver instance
    
    Returns:
        Dictionary with predictions and graph data
    """
    if not driver:
        return {
            "predictions": [],
            "graph_data": {"nodes": [], "links": []},
            "emergency_warning": "Database connection failed",
            "disclaimer": "System temporarily unavailable"
        }
    
    # Check for emergency symptoms first
    emergency_result = check_emergency_symptoms(symptoms, driver)
    if emergency_result["emergency"]:
        return emergency_result
    
    # Get disease predictions from Neo4j
    predictions = get_disease_predictions(symptoms, driver)
    
    # Get graph data for visualization
    graph_data = get_graph_data(symptoms, predictions, driver)
    
    return {
        "predictions": predictions,
        "graph_data": graph_data,
        "emergency_warning": None,
        "disclaimer": "This is not medical advice. Consult a healthcare professional."
    }

def check_emergency_symptoms(symptoms: List[str], driver: Driver) -> Dict[str, Any]:
    """
    Check if any symptoms require immediate emergency attention
    
    Args:
        symptoms: List of symptom strings
        driver: Neo4j driver instance
    
    Returns:
        Dictionary with emergency warning if needed
    """
    # Always check for chest pain (your existing rule)
    if "chest pain" in [s.lower() for s in symptoms]:
        return {
            "predictions": [],
            "graph_data": {"nodes": [], "links": []},
            "emergency_warning": "⚠️ EMERGENCY WARNING: Chest pain can indicate serious conditions like heart attack. Seek immediate medical attention!",
            "disclaimer": "This is a medical emergency. Call emergency services immediately."
        }
    
    # Also check Neo4j for symptoms marked as emergency
    with driver.session() as session:
        result = session.run("""
            MATCH (s:Symptom)
            WHERE s.name IN $symptoms AND s.emergency = true
            RETURN s.name as symptom, s.severity as severity
        """, symptoms=symptoms)
        
        emergency_symptoms = []
        for record in result:
            emergency_symptoms.append({
                "symptom": record["symptom"],
                "severity": record["severity"]
            })
        
        if emergency_symptoms:
            warning_symptoms = ", ".join([s["symptom"] for s in emergency_symptoms])
            return {
                "predictions": [],
                "graph_data": {"nodes": [], "links": []},
                "emergency_warning": f"⚠️ URGENT: Symptoms '{warning_symptoms}' require immediate medical attention.",
                "disclaimer": "Consult a healthcare professional immediately."
            }
    
    return {"emergency": False}

def get_disease_predictions(symptoms: List[str], driver: Driver) -> List[Dict[str, Any]]:
    """
    Query Neo4j for diseases matching the given symptoms
    
    Args:
        symptoms: List of symptom strings
        driver: Neo4j driver instance
    
    Returns:
        List of disease predictions with confidence scores
    """
    with driver.session() as session:
        # Find diseases that have these symptoms
        result = session.run("""
            MATCH (d:Disease)-[r:ASSOCIATED_WITH]->(s:Symptom)
            WHERE s.name IN $symptoms
            WITH d, count(r) as matched_symptoms, collect(s.name) as matching_symptoms
            
            // Get total symptoms for this disease
            MATCH (d)-[r2:ASSOCIATED_WITH]->(s2:Symptom)
            WITH d, matched_symptoms, matching_symptoms, count(r2) as total_symptoms
            
            // Calculate confidence score
            // Higher score for more matched symptoms and higher severity
            OPTIONAL MATCH (d)-[r3:ASSOCIATED_WITH]->(s3:Symptom)
            WHERE s3.name IN $symptoms
            WITH d, matched_symptoms, total_symptoms, matching_symptoms,
                 sum(CASE WHEN r3.severity IS NOT NULL THEN r3.severity ELSE 1 END) as severity_score
            
            RETURN d.name as disease_name,
                   matched_symptoms,
                   total_symptoms,
                   matching_symptoms,
                   severity_score,
                   (matched_symptoms * 1.0 / total_symptoms * 100) as match_percentage,
                   d.emergency as is_emergency
            ORDER BY matched_symptoms DESC, severity_score DESC
            LIMIT 10
        """, symptoms=symptoms)
        
        predictions = []
        for record in result:
            confidence = min(record["match_percentage"] + (record["severity_score"] * 0.1), 99.9)
            
            predictions.append({
                "disease": record["disease_name"],
                "confidence": round(confidence, 1),
                "matching_symptoms": record["matching_symptoms"],
                "total_symptoms": record["total_symptoms"],
                "emergency": record["is_emergency"] or False
            })
        
        return predictions

def get_graph_data(symptoms: List[str], predictions: List[Dict], driver: Driver) -> Dict[str, Any]:
    """
    Get graph data for visualization
    
    Args:
        symptoms: Input symptoms
        predictions: Disease predictions
        driver: Neo4j driver instance
    
    Returns:
        Graph data in format for frontend visualization
    """
    if not predictions:
        return {"nodes": [], "links": []}
    
    disease_names = [p["disease"] for p in predictions[:3]]  # Top 3 diseases
    
    with driver.session() as session:
        # Get disease nodes, symptom nodes, and relationships
        result = session.run("""
            MATCH (d:Disease)-[r:ASSOCIATED_WITH]->(s:Symptom)
            WHERE d.name IN $diseases OR s.name IN $symptoms
            RETURN d, s, r
            ORDER BY r.severity DESC
            LIMIT 50
        """, diseases=disease_names, symptoms=symptoms)
        
        nodes = []
        links = []
        node_ids = set()
        
        for record in result:
            disease_node = record["d"]
            symptom_node = record["s"]
            relationship = record["r"]
            
            # Add disease node if not already added
            disease_id = f"disease_{disease_node.id}"
            if disease_id not in node_ids:
                nodes.append({
                    "id": disease_id,
                    "label": disease_node["name"],
                    "type": "disease",
                    "properties": dict(disease_node)
                })
                node_ids.add(disease_id)
            
            # Add symptom node if not already added
            symptom_id = f"symptom_{symptom_node.id}"
            if symptom_id not in node_ids:
                nodes.append({
                    "id": symptom_id,
                    "label": symptom_node["name"],
                    "type": "symptom",
                    "properties": dict(symptom_node),
                    "is_input": symptom_node["name"] in symptoms
                })
                node_ids.add(symptom_id)
            
            # Add relationship link
            links.append({
                "source": disease_id,
                "target": symptom_id,
                "relationship": "ASSOCIATED_WITH",
                "properties": dict(relationship)
            })
        
        return {"nodes": nodes, "links": links}

# === OLD RULE-BASED SYSTEM (FOR REFERENCE - TO BE REMOVED LATER) ===
"""
def analyze_symptoms_old(symptoms: List[str]) -> Dict[str, Any]:
    # Old rule-based system - keeping for reference
    # This will be removed once Neo4j integration is complete
    pass
"""