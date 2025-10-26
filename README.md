# CareScan - AI-Powered Health Prediction Platform

CareScan is a comprehensive web application that helps users monitor and predict various health conditions using artificial intelligence.

## Features

### 🔬 AI Disease Prediction

**Diabetes Risk Assessment**
- Analyzes 8 key health parameters including glucose levels, BMI, blood pressure, and age
- Provides instant risk assessment with detailed predictions
- Tracks parameters: Pregnancies, Glucose, Blood Pressure, Skin Thickness, Insulin, BMI, Diabetes Pedigree Function, Age

**Hypertension Screening**
- Evaluates cardiovascular health risk factors
- Considers gender, age, diabetes status, heart disease history, and smoking habits
- Analyzes BMI, HbA1c levels, and blood glucose

**Chronic Kidney Disease (CKD) Detection**
- Comprehensive kidney function analysis
- Tracks 24 clinical parameters including blood tests and urine analysis
- Monitors blood pressure, albumin, sugar, and blood cell counts

**Lung Cancer Analysis**
- AI-powered CT scan image analysis
- Detects Normal, Benign, or Malignant conditions
- Provides confidence scores for predictions

**Pneumonia Detection**
- Chest X-ray analysis for pneumonia signs
- Binary classification with confidence percentage
- Fast and accurate screening tool

**Skin Disease Identification**
- Image-based skin condition analysis
- Identifies multiple skin diseases with confidence scores
- Visual pattern recognition for early detection

### 📊 Health Management

**Health Trends & Analytics**
- Track health metrics over time
- View glucose and BMI trends for diabetes predictions
- Monitor blood glucose levels for hypertension
- Prediction summary dashboard showing total tests by category
- Recent activity timeline

**Health Reports**
- Complete prediction history storage
- Detailed parameter tracking for all assessments
- Export reports as PDF for doctor consultations
- Color-coded results for easy interpretation
- Timestamps for all predictions

### 💊 Medication Management

**Medication Tracker**
- Add and manage multiple medications
- Track dosage, frequency, and timing
- Set medication reminders
- Add custom notes (e.g., "Take with food")
- Quick access to all active medications

### 🚨 Emergency Features

**Emergency Contact Management**
- Store personal emergency contacts
- Quick access to contact phone numbers and email
- Pre-loaded Indian emergency numbers (108, 100, 101)
- One-tap calling functionality
- Relationship tagging for contacts

**Doctor Directory**
- 10+ verified medical specialists
- Multiple specialties: Cardiology, Dermatology, General Medicine, Pulmonology, Endocrinology, Nephrology, Oncology, Neurology, Rheumatology, Gastroenterology
- Direct contact information with phone numbers
- Experience details for each doctor
- One-click call functionality

### 📖 Health Education

**Learn About Conditions**
- Comprehensive information on 6 major health conditions
- Common symptoms for each condition
- Prevention tips and guidelines
- Easy-to-understand medical information
- No technical jargon

### 🔐 User Authentication

**Secure Sign In/Sign Up**
- Email and password authentication via Supabase
- User profile with name and surname
- Personalized welcome messages
- Session persistence
- Secure data handling

### 📱 User Experience

**Responsive Design**
- Works seamlessly on desktop, tablet, and mobile
- Modern, clean interface with Inter font
- Smooth animations and transitions
- Intuitive navigation
- Accessible design principles

**Privacy-Focused**
- Medical images are not stored
- Only prediction results and parameters are saved
- Local storage for offline access
- No data sharing with third parties
- HIPAA-conscious architecture

## Technology

Built with React 19, Vite, Supabase, and integrated machine learning models for fast, secure, and accurate health predictions.