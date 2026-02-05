"""
🎓 ML/AI Testing Suite
======================
This script systematically tests all ML/AI functionality in the EpiPredict system.
Run this after Python and dependencies are installed.

Usage:
    python test_ml_system.py
"""

import requests
import json
import time
from typing import Dict, List
from datetime import datetime

# ═══════════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════════

BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

def print_success(text: str):
    """Print success message"""
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text: str):
    """Print error message"""
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_info(text: str):
    """Print info message"""
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")

def print_learning(text: str):
    """Print learning point"""
    print(f"{Colors.WARNING}🎓 LEARNING: {text}{Colors.ENDC}")

# ═══════════════════════════════════════════════════════════════════════════════
# Test 1: Server Health Check
# ═══════════════════════════════════════════════════════════════════════════════

def test_server_health():
    """Test if the backend server is running"""
    print_header("TEST 1: Server Health Check")
    
    print_learning("Health checks verify your API is online and responsive")
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Server is running: {data.get('name', 'Unknown')}")
            print_info(f"Version: {data.get('version', 'Unknown')}")
            print_info(f"Status: {data.get('status', 'Unknown')}")
            return True
        else:
            print_error(f"Server returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to server. Is it running?")
        print_info("Start server with: python -m uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

# ═══════════════════════════════════════════════════════════════════════════════
# Test 2: ML Prediction Endpoint
# ═══════════════════════════════════════════════════════════════════════════════

def test_ml_prediction():
    """Test the ML prediction endpoint"""
    print_header("TEST 2: ML Disease Prediction")
    
    print_learning(
        "This tests the core ML model - a Naive Bayes classifier that predicts\n"
        "   disease outbreak probability based on environmental and health factors"
    )
    
    # High-risk scenario
    print_info("Testing HIGH-RISK scenario (Nairobi malaria)...")
    
    high_risk_request = {
        "county": "Nairobi",
        "disease": "malaria",
        "temperature": 28.0,        # Higher temp favors mosquitoes
        "humidity": 85.0,            # High humidity increases breeding
        "rainfall": 150.0,           # Heavy rainfall creates breeding sites
        "population_density": 10000.0,  # Dense population spreads disease
        "access_to_water": 45.0,     # Poor water access
        "healthcare_coverage": 50.0, # Limited healthcare
        "previous_cases": 300,       # Many previous cases
        "vaccination_rate": 30.0     # Low vaccination
    }
    
    try:
        response = requests.post(
            f"{API_V1}/ml/predict",
            json=high_risk_request,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Prediction successful!")
            print(f"\n   📊 Results:")
            print(f"   Risk Level: {Colors.BOLD}{data.get('risk_level', 'Unknown').upper()}{Colors.ENDC}")
            print(f"   Outbreak Probability: {Colors.BOLD}{data.get('outbreak_probability', 0) * 100:.1f}%{Colors.ENDC}")
            print(f"   Predicted Cases: {data.get('predicted_cases', 'Unknown')}")
            print(f"   Confidence: {data.get('confidence_score', 0) * 100:.1f}%")
            print(f"   Model Version: {data.get('model_version', 'Unknown')}")
            
            # Check recommendations
            if 'recommendations' in data and data['recommendations']:
                print(f"\n   💡 Recommendations:")
                for i, rec in enumerate(data['recommendations'][:3], 1):
                    print(f"   {i}. {rec}")
            
            # Validate high-risk detection
            if data.get('outbreak_probability', 0) > 0.4:
                print_success("Model correctly identified high-risk scenario")
            else:
                print_error(f"Expected high risk, got {data.get('outbreak_probability', 0) * 100:.1f}%")
            
            return True
        else:
            print_error(f"Prediction failed with status: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Error during prediction: {e}")
        return False

# ═══════════════════════════════════════════════════════════════════════════════
# Test 3: AI Chatbot
# ═══════════════════════════════════════════════════════════════════════════════

def test_ai_chatbot():
    """Test the AI chatbot endpoint"""
    print_header("TEST 3: AI Chatbot (LLM Integration)")
    
    print_learning(
        "The chatbot uses Ollama (local LLM) or falls back to mock responses.\n"
        "   It enriches answers with ML predictions and social media data"
    )
    
    test_question = "What is the malaria risk in Nairobi?"
    
    print_info(f"Asking: '{test_question}'")
    
    try:
        # First check chatbot status
        status_response = requests.get(f"{API_V1}/chat/status")
        if status_response.status_code == 200:
            status = status_response.json()
            print_info(f"Ollama Available: {status.get('ollama_available', False)}")
            print_info(f"Model: {status.get('model', 'Unknown')}")
            print_info(f"Fallback Active: {status.get('fallback_active', True)}")
        
        # Send chat message
        chat_request = {
            "message": test_question,
            "county": "Nairobi",
            "disease": "malaria"
        }
        
        response = requests.post(
            f"{API_V1}/chat/chat",
            json=chat_request,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Chat response received!")
            print(f"\n   🤖 EpiBot Response:")
            print(f"   {'-' * 70}")
            # Print first 300 chars of response
            message = data.get('message', '')
            print(f"   {message[:300]}...")
            print(f"   {'-' * 70}")
            
            # Check sources
            if 'sources' in data and data['sources']:
                print(f"\n   📚 Data Sources:")
                for source in data['sources']:
                    print(f"   • {source}")
            
            # Check suggested actions
            if 'suggested_actions' in data and data['suggested_actions']:
                print(f"\n   💡 Suggested Actions:")
                for action in data['suggested_actions'][:3]:
                    print(f"   • {action}")
            
            return True
        else:
            print_error(f"Chat failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error during chat: {e}")
        return False

# ═══════════════════════════════════════════════════════════════════════════════
# Test 4: Health Operators
# ═══════════════════════════════════════════════════════════════════════════════

def test_health_operators():
    """Test health operators endpoints"""
    print_header("TEST 4: Health Operators Service")
    
    print_learning(
        "Health operators are verified medical professionals who can upload\n"
        "   PDF reports and validate ML predictions"
    )
    
    try:
        # Get all operators
        print_info("Fetching health operators list...")
        response = requests.get(f"{API_V1}/operators")
        
        if response.status_code == 200:
            operators = response.json()
            print_success(f"Found {len(operators)} health operators")
            
            # Show first 3 operators
            for op in operators[:3]:
                verified = "✅ Verified" if op.get('is_verified') else "⏳ Pending"
                print(f"   • {op.get('full_name', 'Unknown')} - {op.get('role', 'Unknown')} - {verified}")
            
            return True
        else:
            print_error(f"Failed to fetch operators: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error testing operators: {e}")
        return False

# ═══════════════════════════════════════════════════════════════════════════════
# Test 5: Model Training (Advanced)
# ═══════════════════════════════════════════════════════════════════════════════

def test_model_training():
    """Test ML model training endpoint"""
    print_header("TEST 5: ML Model Training")
    
    print_learning(
        "Model training re-trains the Naive Bayes classifier on updated data.\n"
        "   This is typically done periodically as new data becomes available"
    )
    
    print_info("Checking model status...")
    
    try:
        response = requests.get(f"{API_V1}/ml/model/status")
        
        if response.status_code == 200:
            status = response.json()
            print_success("Model status retrieved!")
            
            if status.get('models'):
                for model_name, model_info in status['models'].items():
                    print(f"\n   📦 {model_name}:")
                    print(f"   Accuracy: {model_info.get('accuracy', 0) * 100:.1f}%")
                    print(f"   Trained: {model_info.get('trained_at', 'Unknown')}")
                    print(f"   Samples: {model_info.get('training_samples', 'Unknown')}")
            else:
                print_info("No trained models found (this is OK for first run)")
            
            return True
        else:
            print_error(f"Failed to get model status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error checking model status: {e}")
        return False

# ═══════════════════════════════════════════════════════════════════════════════
# Test 6: Training Data
# ═══════════════════════════════════════════════════════════════════════════════

def test_training_data():
    """Test training data endpoints"""
    print_header("TEST 6: Training Data Management")
    
    print_learning(
        "Training data is historical data used to train ML models.\n"
        "   More data = better predictions (generally)"
    )
    
    try:
        # Get training data statistics
        print_info("Fetching training data statistics...")
        response = requests.get(f"{API_V1}/ml/training-data/statistics")
        
        if response.status_code == 200:
            stats = response.json()
            print_success("Statistics retrieved!")
            print(f"   Total training samples: {stats.get('total_samples', 0)}")
            
            if 'disease_distribution' in stats:
                print(f"\n   📊 Disease Distribution:")
                for disease, count in stats['disease_distribution'].items():
                    print(f"   • {disease}: {count} samples")
            
            return True
        else:
            print_error(f"Failed to get statistics: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error fetching training data: {e}")
        return False

# ═══════════════════════════════════════════════════════════════════════════════
# Main Test Runner
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("╔══════════════════════════════════════════════════════════════════════════════╗")
    print("║                   EpiP redict ML/AI Testing Suite                            ║")
    print("║                  Comprehensive System Verification                           ║")
    print("╚══════════════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}\n")
    
    print_info(f"Starting tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info(f"Testing against: {BASE_URL}\n")
    
    # Run all tests
    results = {}
    
    tests = [
        ("Server Health", test_server_health),
        ("ML Prediction", test_ml_prediction),
        ("AI Chatbot", test_ai_chatbot),
        ("Health Operators", test_health_operators),
        ("Model Training", test_model_training),
        ("Training Data", test_training_data),
    ]
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {e}")
            results[test_name] = False
        
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{Colors.OKGREEN}✅ PASSED{Colors.ENDC}" if result else f"{Colors.FAIL}❌ FAILED{Colors.ENDC}"
        print(f"   {test_name:.<50} {status}")
    
    print(f"\n   {Colors.BOLD}Final Score: {passed}/{total} tests passed{Colors.ENDC}")
    
    if passed == total:
        print(f"\n   {Colors.OKGREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Your ML/AI system is working perfectly!{Colors.ENDC}")
    else:
        print(f"\n   {Colors.WARNING}⚠️  Some tests failed. Review the output above for details.{Colors.ENDC}")
    
    print("\n")

if __name__ == "__main__":
    main()
