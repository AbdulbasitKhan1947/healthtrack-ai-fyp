import requests
import json

def quick_test():
    print("🧪 QUICK TEST: HealthTrack AI with Medical Data")
    print("=" * 60)
    
    test_cases = [
        {"symptoms": ["itching", "skin rash"], "name": "Skin symptoms"},
        {"symptoms": ["cough", "high fever"], "name": "Respiratory symptoms"},
        {"symptoms": ["joint pain", "swelling joints"], "name": "Joint symptoms"},
        {"symptoms": ["chest pain"], "name": "EMERGENCY TEST"},
        {"symptoms": ["headache", "nausea"], "name": "Neurological symptoms"},
    ]
    
    for test in test_cases:
        print(f"\n📋 Test: {test['name']}")
        print(f"   Symptoms: {', '.join(test['symptoms'])}")
        
        try:
            response = requests.post(
                "http://localhost:8000/analyze",
                json={"symptoms": test["symptoms"]},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("emergency_warning"):
                    print(f"   🚨 EMERGENCY: {data['emergency_warning']}")
                elif data.get("predictions"):
                    predictions = data["predictions"]
                    print(f"   ✅ Found {len(predictions)} disease(s)")
                    
                    for i, pred in enumerate(predictions[:3], 1):
                        print(f"   {i}. {pred['disease']} ({pred['confidence']}%)")
                        print(f"      Matches: {pred['matching_symptoms']}")
                else:
                    print("   ⚠️ No predictions found")
            else:
                print(f"   ❌ API Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Quick test completed!")
    print("\nNext: Test in browser at http://localhost:3000")

if __name__ == "__main__":
    quick_test()