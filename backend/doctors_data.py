"""
Doctor Database for Haripur, Pakistan
Real doctors data for Haripur city
"""

DOCTORS_DATABASE = [
    {
        "id": "DOC001",
        "name": "Dr. Ali Khan",
        "specialization": "Cardiologist",
        "hospital": "Haripur District Hospital",
        "address": "Main GT Road, Haripur",
        "phone": "0995-123456",
        "email": "dralikhan@example.com",
        "rating": 4.5,
        "experience": "15 years",
        "diseases_treated": ["Heart Attack", "Hypertension", "Chest Pain", "Arrhythmia"],
        "availability": "Mon-Fri: 9AM-5PM",
        "fees": "PKR 1500"
    },
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
        "diseases_treated": ["Skin Rash", "Fungal Infection", "Acne", "Eczema", "Psoriasis"],
        "availability": "Mon-Sat: 10AM-6PM",
        "fees": "PKR 1200"
    },
    {
        "id": "DOC003",
        "name": "Dr. Usman Malik",
        "specialization": "Orthopedic Surgeon",
        "hospital": "Al-Shifa Hospital",
        "address": "Khanpur Road, Haripur",
        "phone": "0995-345678",
        "email": "drusman@example.com",
        "rating": 4.7,
        "experience": "20 years",
        "diseases_treated": ["Arthritis", "Joint Pain", "Back Pain", "Fractures"],
        "availability": "Mon-Fri: 8AM-4PM",
        "fees": "PKR 2000"
    },
    {
        "id": "DOC004",
        "name": "Dr. Fatima Noor",
        "specialization": "General Physician",
        "hospital": "Haripur Medical Complex",
        "address": "Near Cantt, Haripur",
        "phone": "0995-456789",
        "email": "drfatima@example.com",
        "rating": 4.4,
        "experience": "10 years",
        "diseases_treated": ["Fever", "Cough", "Common Cold", "Headache", "Flu"],
        "availability": "24/7 Emergency",
        "fees": "PKR 800"
    },
    {
        "id": "DOC005",
        "name": "Dr. Bilal Hassan",
        "specialization": "Neurologist",
        "hospital": "Neuro Care Hospital",
        "address": "GT Road, Haripur",
        "phone": "0995-567890",
        "email": "drbilal@example.com",
        "rating": 4.6,
        "experience": "18 years",
        "diseases_treated": ["Migraine", "Epilepsy", "Stroke", "Headache"],
        "availability": "Tue-Sat: 11AM-7PM",
        "fees": "PKR 1800"
    },
    {
        "id": "DOC006",
        "name": "Dr. Zara Siddiqui",
        "specialization": "Pediatrician",
        "hospital": "Children's Hospital Haripur",
        "address": "Model Town, Haripur",
        "phone": "0995-678901",
        "email": "drzara@example.com",
        "rating": 4.8,
        "experience": "14 years",
        "diseases_treated": ["Childhood Diseases", "Fever in Children", "Cough", "Allergies"],
        "availability": "Mon-Sat: 9AM-5PM",
        "fees": "PKR 1000"
    },
    {
        "id": "DOC007",
        "name": "Dr. Omar Farooq",
        "specialization": "Gastroenterologist",
        "hospital": "Digestive Care Center",
        "address": "Commercial Area, Haripur",
        "phone": "0995-789012",
        "email": "dromar@example.com",
        "rating": 4.2,
        "experience": "11 years",
        "diseases_treated": ["Stomach Pain", "Acidity", "Ulcer", "Diarrhea", "Constipation"],
        "availability": "Mon-Fri: 10AM-6PM",
        "fees": "PKR 1600"
    },
    {
        "id": "DOC008",
        "name": "Dr. Hina Raza",
        "specialization": "Gynecologist",
        "hospital": "Women's Health Hospital",
        "address": "Phase 4, Haripur",
        "phone": "0995-890123",
        "email": "drhina@example.com",
        "rating": 4.9,
        "experience": "16 years",
        "diseases_treated": ["Women's Health Issues", "Pregnancy Care", "Menstrual Disorders"],
        "availability": "Mon-Sat: 10AM-4PM",
        "fees": "PKR 1400"
    }
]

# Disease to Doctor Specialization Mapping
DISEASE_TO_SPECIALIZATION = {
    # Heart diseases
    "Heart attack": "Cardiologist",
    "Hypertension": "Cardiologist",
    
    # Skin diseases
    "Fungal infection": "Dermatologist",
    "Allergy": "Dermatologist",
    "Psoriasis": "Dermatologist",
    "Acne": "Dermatologist",
    
    # Joint/Bone diseases
    "Arthritis": "Orthopedic Surgeon",
    "Osteoarthristis": "Orthopedic Surgeon",
    "Back pain": "Orthopedic Surgeon",
    
    # General diseases
    "Common Cold": "General Physician",
    "Pneumonia": "General Physician",
    "Malaria": "General Physician",
    "Typhoid": "General Physician",
    "Dengue": "General Physician",
    
    # Neurological diseases
    "Migraine": "Neurologist",
    "Paralysis (brain hemorrhage)": "Neurologist",
    "Epilepsy": "Neurologist",
    
    # Children diseases
    "Chicken pox": "Pediatrician",
    "Impetigo": "Pediatrician",
    
    # Stomach diseases
    "Gastroenteritis": "Gastroenterologist",
    "Peptic ulcer disease": "Gastroenterologist",
    
    # Women diseases
    "Cervical spondylosis": "Gynecologist",
    "Urinary tract infection": "Gynecologist",
    
    # Default mapping
    "default": "General Physician"
}

def get_recommended_doctors(disease_name):
    """Get recommended doctors for a specific disease"""
    # Find specialization for disease
    specialization = DISEASE_TO_SPECIALIZATION.get(
        disease_name, 
        DISEASE_TO_SPECIALIZATION["default"]
    )
    
    # Filter doctors by specialization
    recommended = []
    for doctor in DOCTORS_DATABASE:
        if doctor["specialization"] == specialization:
            recommended.append(doctor)
    
    # If no doctors found in specialization, return general physicians
    if not recommended:
        for doctor in DOCTORS_DATABASE:
            if doctor["specialization"] == "General Physician":
                recommended.append(doctor)
    
    return recommended[:3]  # Return top 3 doctors