import urllib.request
import json

def simple_test():
    print("🧪 SIMPLE TEST: HealthTrack AI")
    print("=" * 60)
    
    # Test cases
    test_cases = [
        {"symptoms": ["itching", "skin rash"], "name": "Skin symptoms"},
        {"symptoms": ["cough", "high fever"], "name": "Respiratory"},
        {"symptoms": ["chest pain"], "name": "EMERGENCY"},
    ]
    
    for test in test_cases:
        print(f"\n📋 {test['name']}: {', '.join(test['symptoms'])}")
        
        try:
            # Create request
            url = "http://localhost:8000/analyze"
            data = json.dumps({"symptoms": test["symptoms"]}).encode('utf-8')
            
            req = urllib.request.Request(
                url,
                data=data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            
            # Send request
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode('utf-8'))
                
                if result.get("emergency_warning"):
                    print(f"   🚨 EMERGENCY: {result['emergency_warning'][:50]}...")
                elif result.get("predictions"):
                    predictions = result["predictions"]
                    print(f"   ✅ Found {len(predictions)} disease(s)")
                    
                    for i, pred in enumerate(predictions[:2], 1):
                        print(f"   {i}. {pred['disease']} ({pred['confidence']}%)")
                else:
                    print("   ⚠️ No predictions found")
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Test completed!")
    print("\nNow test in browser: http://localhost:3000")

if __name__ == "__main__":
    simple_test()