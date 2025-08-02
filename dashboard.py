import os
import io
import base64
import requests
import json
import time
from flask import Flask, request, render_template, jsonify, Response
from pdf2image import convert_from_path
from PIL import Image
from together import Together
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
DIAGRAM_FOLDER = 'saved_diagrams'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DIAGRAM_FOLDER, exist_ok=True)

# Initialize Together client
try:
    client = Together(api_key="tgp_v1_DgC4EOU6LEV0eeeNN5iHKyGj5l9ohnM_6O507cXKBZY")
except Exception as e:
    print(f"Error initializing Together client: {e}")
    client = None

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyAQMvTL1SR3dLM-pB9BldZdzpGQH3K3nz8"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
GEMINI_HEADERS = {"Content-Type": "application/json"}

def image_to_base64(image):
    with io.BytesIO() as buffer:
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        image.save(buffer, format="JPEG", quality=95)
        return base64.b64encode(buffer.getvalue()).decode("utf-8")


def cleanup_file(filepath):
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        print(f"Error cleaning up file {filepath}: {e}")

def process_image_for_ocr(image):
    """Enhance image for better OCR results"""
    # Convert to grayscale
    if image.mode != 'L':
        image = image.convert('L')
    return image

@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/extract', methods=['POST'])
def extract_text():
    if 'pdf' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['pdf']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        filename = file.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        images = convert_from_path(filepath)
        
        def generate():
            try:
                for i, image in enumerate(images):
                    # Process image for better OCR
                    processed_image = process_image_for_ocr(image)
                    base64_img = image_to_base64(processed_image)
                    
                    if not client:
                        yield json.dumps({"error": "API client not initialized"}) + "\n"
                        return

                    response = client.chat.completions.create(
                        model="google/gemma-3n-E4B-it",
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}},
                                    {"type": "text", "text": "Extract all readable text from this image. Include formatting like bullet points, headings, and paragraphs."}
                                ]
                            }
                        ]
                    )
                    
                    page_text = f"\n\n=== Page {i+1} ===\n{response.choices[0].message.content}"
                    yield page_text
                    
                cleanup_file(filepath)
            except Exception as e:
                yield json.dumps({"error": f"Processing error: {str(e)}"}) + "\n"
                cleanup_file(filepath)

        return Response(generate(), mimetype='text/plain')
    
    except Exception as e:
        cleanup_file(filepath)
        return jsonify({"error": f"Initial processing error: {str(e)}"}), 500

@app.route('/explain-diagram', methods=['POST'])
def explain_diagram():
    if 'diagram' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['diagram']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filepath = None
    try:
        filename = file.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Handle PDF or image
        if filename.lower().endswith('.pdf'):
            images = convert_from_path(filepath)
            if not images:
                cleanup_file(filepath)
                return jsonify({"error": "Could not extract images from PDF"}), 400
            image = images[0]
        else:
            image = Image.open(filepath)
        
        # Convert RGBA to RGB if needed
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        
        base64_img = image_to_base64(image)
        
        if not client:
            cleanup_file(filepath)
            return jsonify({"error": "API client not initialized"}), 500

        response = client.chat.completions.create(
            model="meta-llama/Llama-Guard-4-12B",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}},
                        {
                            "type": "text", 
                            "text": "Explain this diagram in very simple terms that a beginner could understand. "
                                   "Break down complex concepts step by step. Focus on the key elements and their relationships."
                        }
                    ]
                }
            ]
        )
        
        cleanup_file(filepath)
        return jsonify({
            "explanation": response.choices[0].message.content.strip(),
            "image_base64": base64_img  # Return base64 for potential frontend display
        })
    
    except Exception as e:
        cleanup_file(filepath)
        return jsonify({"error": f"Diagram processing error: {str(e)}"}), 500

@app.route('/generate-summary', methods=['POST'])
def generate_summary():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    prompt = f"Create a concise summary of the following text in bullet points, focusing on key concepts and main ideas:\n\n{text}"
    
    try:
        response = requests.post(
            GEMINI_URL,
            headers=GEMINI_HEADERS,
            data=json.dumps({
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            })
        )
        
        if response.status_code == 200:
            result = response.json()
            summary = result['candidates'][0]['content']['parts'][0]['text']
            return jsonify({"summary": summary})
        return jsonify({"error": "Failed to generate summary"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    def split_text(text, max_words=300):
        words = text.split()
        chunks = []
        for i in range(0, len(words), max_words):
            chunk = " ".join(words[i:i + max_words])
            chunks.append(chunk)
        return chunks
    
    chunks = split_text(text)
    all_questions = []
    
    for chunk in chunks:
        prompt = f"""
        Generate 3-5 direct, topic-wise questions based on the following text. 
        The questions should test understanding of the material and should be concise.
        Do NOT include explanations, notes, or parenthetical remarks like "(This tests...)".
        Format each question as a single line starting with "1. ", "2. ", etc.

        Text:
        {chunk}
        """
        
        try:
            response = requests.post(
                GEMINI_URL,
                headers=GEMINI_HEADERS,
                data=json.dumps({
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                })
            )
            
            if response.status_code == 200:
                result = response.json()
                questions = result['candidates'][0]['content']['parts'][0]['text']
                # Clean up any remaining notes or explanations
                questions = "\n".join([q.split('(')[0].strip() if '(' in q else q.strip() 
                                     for q in questions.split('\n') if q.strip()])
                all_questions.append(questions)
            time.sleep(4)  # Respect rate limits
        except Exception as e:
            continue
    
    return jsonify({"questions": "\n\n".join(all_questions)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)