import pandas as pd
import os

DATA_FOLDER = r"C:\Users\basit digitech\Desktop\healthtrack-ai-fyp\data\archive"

print("🔍 Examining Kaggle medical datasets...")

# Check Training.csv
train_path = os.path.join(DATA_FOLDER, "Training.csv")
if os.path.exists(train_path):
    print(f"\n📋 Reading: Training.csv")
    try:
        # Try reading with different encodings
        df_train = pd.read_csv(train_path)
        print(f"   Shape: {df_train.shape} (rows, columns)")
        print(f"   Columns: {list(df_train.columns)}")
        print(f"   First few rows:")
        print(df_train.head(3))
        
        # Check for disease and symptom columns
        print(f"\n   Column analysis:")
        for col in df_train.columns:
            unique_count = df_train[col].nunique()
            sample_values = df_train[col].dropna().unique()[:3]
            print(f"   - {col}: {unique_count} unique values, sample: {sample_values}")
            
    except Exception as e:
        print(f"   Error reading file: {e}")
        # Try different encoding
        try:
            df_train = pd.read_csv(train_path, encoding='latin1')
            print(f"   Success with latin1 encoding!")
            print(f"   Shape: {df_train.shape}")
            print(f"   Columns: {list(df_train.columns)}")
        except:
            print(f"   Could not read with any encoding")

# Check Testing.csv
test_path = os.path.join(DATA_FOLDER, "Testing.csv")
if os.path.exists(test_path):
    print(f"\n📋 Reading: Testing.csv")
    try:
        df_test = pd.read_csv(test_path)
        print(f"   Shape: {df_test.shape}")
        print(f"   Columns: {list(df_test.columns)}")
    except Exception as e:
        print(f"   Error: {e}")
        try:
            df_test = pd.read_csv(test_path, encoding='latin1')
            print(f"   Success with latin1 encoding!")
            print(f"   Shape: {df_test.shape}")
            print(f"   Columns: {list(df_test.columns)}")
        except:
            print(f"   Could not read")

print("\n✅ Examination complete!")