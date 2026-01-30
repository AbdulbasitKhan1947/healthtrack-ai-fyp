from neo4j import GraphDatabase
import pandas as pd
import os
import numpy as np
# Update at the top of load_medical_data.py:
import os

# Use environment variable or default path
DATA_FOLDER = os.getenv("DATA_FOLDER", "/app/data/archive")  # Docker path
# For Windows local testing, you can keep the original as fallback
if not os.path.exists(DATA_FOLDER):
    DATA_FOLDER = r"C:\Users\basit digitech\Desktop\healthtrack-ai-fyp\data\archive"

# Neo4j connection
NEO4J_URI = "neo4j://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "pakistan@1947"

# Data paths
DATA_FOLDER = r"C:\Users\basit digitech\Desktop\healthtrack-ai-fyp\data\archive"
TRAINING_FILE = os.path.join(DATA_FOLDER, "Training.csv")
TESTING_FILE = os.path.join(DATA_FOLDER, "Testing.csv")

def analyze_dataset_format():
    """Analyze the CSV files to understand their structure"""
    print("🔍 Analyzing dataset format...")
    
    try:
        # Try reading training data
        df = pd.read_csv(TRAINING_FILE)
        print(f"✅ Successfully read Training.csv")
        print(f"   Shape: {df.shape} (rows × columns)")
        print(f"   Columns ({len(df.columns)}): {list(df.columns)}")
        print(f"   First few rows:")
        print(df.head(2).to_string())
        
        # Check if it's a binary matrix format
        symptom_columns = []
        disease_column = None
        
        for col in df.columns:
            unique_vals = df[col].unique()
            if len(unique_vals) <= 3 and set(unique_vals).issubset({0, 1, 0.0, 1.0}):
                symptom_columns.append(col)
            elif col.lower() in ['prognosis', 'disease', 'diagnosis', 'outcome']:
                disease_column = col
        
        if disease_column and symptom_columns:
            print(f"\n📊 Detected format: Binary symptom matrix")
            print(f"   Disease column: {disease_column}")
            print(f"   Symptom columns: {len(symptom_columns)}")
            print(f"   Diseases found: {df[disease_column].nunique()}")
            print(f"   Sample diseases: {df[disease_column].unique()[:5]}")
            return 'binary_matrix', df, disease_column, symptom_columns
        
        # Check for other formats
        if 'symptom' in ' '.join(df.columns).lower() and 'disease' in ' '.join(df.columns).lower():
            print(f"\n📊 Detected format: Disease-symptom pairs")
            return 'pairs', df, None, None
        
        print(f"\n📊 Unknown format, using first column as disease")
        return 'unknown', df, df.columns[0], df.columns[1:]
        
    except Exception as e:
        print(f"❌ Error analyzing dataset: {e}")
        return None, None, None, None

def load_binary_matrix_data(driver, df, disease_col, symptom_cols):
    """Load binary matrix format data into Neo4j"""
    print(f"\n🚀 Loading binary matrix data into Neo4j...")
    
    with driver.session() as session:
        # Clear existing data
        print("   Clearing existing data...")
        session.run("MATCH (n) DETACH DELETE n")
        
        # Create diseases
        print("   Creating disease nodes...")
        diseases = df[disease_col].unique()
        disease_map = {}
        
        for i, disease_name in enumerate(diseases, 1):
            disease_id = f"D{i:03d}"
            disease_map[disease_name] = disease_id
            
            # Determine if it's an emergency disease
            emergency_keywords = ['heart', 'stroke', 'attack', 'failure', 'cancer', 'emergency']
            is_emergency = any(keyword in disease_name.lower() for keyword in emergency_keywords)
            
            query = """
            CREATE (d:Disease {
                id: $id,
                name: $name,
                emergency: $emergency,
                type: 'medical_condition'
            })
            """
            session.run(query, {
                'id': disease_id,
                'name': str(disease_name),
                'emergency': is_emergency
            })
        
        print(f"   Created {len(diseases)} disease nodes")
        
        # Create symptoms and relationships
        print("   Creating symptom nodes and relationships...")
        symptom_map = {}
        
        for i, symptom_name in enumerate(symptom_cols, 1):
            symptom_id = f"S{i:03d}"
            symptom_map[symptom_name] = symptom_id
            
            # Determine severity based on symptom type
            severity_map = {
                'pain': 4, 'bleed': 5, 'chest': 5, 'breath': 4,
                'fever': 3, 'cough': 2, 'headache': 3, 'nausea': 3
            }
            severity = 2  # default
            for key, value in severity_map.items():
                if key in symptom_name.lower():
                    severity = value
                    break
            
            query = """
            CREATE (s:Symptom {
                id: $id,
                name: $name,
                severity: $severity,
                frequency: 1,
                emergency: $emergency
            })
            """
            session.run(query, {
                'id': symptom_id,
                'name': str(symptom_name),
                'severity': severity,
                'emergency': severity >= 4
            })
        
        print(f"   Created {len(symptom_cols)} symptom nodes")
        
        # Create relationships
        print("   Creating disease-symptom relationships...")
        relationship_count = 0
        
        for _, row in df.iterrows():
            disease_name = row[disease_col]
            disease_id = disease_map[disease_name]
            
            for symptom_name in symptom_cols:
                if row[symptom_name] == 1:
                    symptom_id = symptom_map[symptom_name]
                    
                    query = """
                    MATCH (d:Disease {id: $disease_id})
                    MATCH (s:Symptom {id: $symptom_id})
                    CREATE (d)-[r:ASSOCIATED_WITH {
                        severity: s.severity,
                        frequency: 1,
                        confidence: 0.8
                    }]->(s)
                    """
                    session.run(query, {
                        'disease_id': disease_id,
                        'symptom_id': symptom_id
                    })
                    relationship_count += 1
        
        print(f"   Created {relationship_count} relationships")
        
        return True

def load_medical_data():
    """Main function to load medical data into Neo4j"""
    
    print("=" * 60)
    print("🏥 HEALTHTRACK AI - MEDICAL DATA LOADER")
    print("=" * 60)
    
    # Connect to Neo4j
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        driver.verify_connectivity()
        print("✅ Connected to Neo4j")
    except Exception as e:
        print(f"❌ Failed to connect to Neo4j: {e}")
        return
    
    # Analyze dataset format
    format_type, df, disease_col, symptom_cols = analyze_dataset_format()
    
    if format_type == 'binary_matrix':
        success = load_binary_matrix_data(driver, df, disease_col, symptom_cols)
    else:
        print(f"❌ Unsupported format: {format_type}")
        print("   Please check your CSV file structure")
        success = False
    
    if success:
        # Show final statistics
        print("\n" + "=" * 60)
        print("📊 DATABASE STATISTICS AFTER IMPORT")
        print("=" * 60)
        
        with driver.session() as session:
            # Node counts
            result = session.run("""
                MATCH (n)
                RETURN labels(n)[0] as type, count(n) as count
                ORDER BY type
            """)
            
            for record in result:
                print(f"   {record['type']}: {record['count']}")
            
            # Relationship count
            result = session.run("MATCH ()-[r:ASSOCIATED_WITH]->() RETURN count(r) as rel_count")
            rel_count = result.single()["rel_count"]
            print(f"   ASSOCIATED_WITH relationships: {rel_count}")
            
            # Sample data
            print(f"\n   Sample diseases:")
            result = session.run("MATCH (d:Disease) RETURN d.name as disease LIMIT 5")
            for record in result:
                print(f"     - {record['disease']}")
            
            print(f"\n   Sample symptoms:")
            result = session.run("MATCH (s:Symptom) RETURN s.name as symptom LIMIT 5")
            for record in result:
                print(f"     - {record['symptom']}")
        
        print("\n" + "=" * 60)
        print("🎉 MEDICAL DATA LOADED SUCCESSFULLY!")
        print("=" * 60)
        print("\nYou can now test your application with real medical data!")
        print("\nNext steps:")
        print("1. Restart your backend: python main.py")
        print("2. Refresh your frontend: http://localhost:3000")
        print("3. Test with symptoms from your dataset")
    
    driver.close()

if __name__ == "__main__":
    load_medical_data()