from django.conf import settings
import os
from dotenv import load_dotenv

class GeminiService:
    """Service for interacting with Gemini AI."""
    
    @staticmethod
    def _get_model():
        """Configure and return the Gemini model."""
        # Force reload .env from base directory to pick up changes without server restart
        dotenv_path = os.path.join(settings.BASE_DIR, '.env')
        load_dotenv(dotenv_path=dotenv_path, override=True)
        
        try:
            import google.generativeai as genai
        except ImportError:
            return None, "google-generativeai not installed"

        # Dynamically get API key to pick up .env changes
        api_key = os.environ.get('GEMINI_API_KEY')
        print(f"Debug: GEMINI_API_KEY found, length={len(api_key) if api_key else 0}")
        
        if not api_key or api_key == "your_gemini_api_key_here":
            return None, "GEMINI_API_KEY not configured"

        try:
            genai.configure(api_key=api_key)
            # Use Gemini 2.5 Flash-Lite for high performance and low latency
            return genai.GenerativeModel(
                'gemini-2.5-flash-lite-preview-09-2025',
                generation_config={"temperature": 0.1}
            ), None
        except Exception as e:
            return None, f"Config error: {str(e)}"

    @classmethod
    def generate_follow_up_message(cls, influencer_name, campaign_title, status, deadline=None):
        """
        Generate a polite follow-up message using Gemini 1.5 Flash.
        """
        model, error = cls._get_model()
        if error:
            # Fallback with error info for debugging
            return f"สวัสดีค่ะคุณ {influencer_name} รบกวนติดตามงานแคมเปญ {campaign_title} ด้วยนะคะ (System: {error})"

        # Map status to context
        status_context = {
            'APPLICATION_APPROVED': 'เพิ่งผ่านการอนุมัติเข้าร่วมแคมเปญ รบกวนกดรับงานและเริ่มดำเนินการ',
            'WORKING_ON_CONTENT': 'อยู่ระหว่างการผลิตคอนเทนต์ รบกวนสอบถามความคืบหน้า',
            'SUBMITTED_SCRIPT': 'ส่งสคริปต์แล้ว รอตรวจ (อันนี้ไม่ควรทวง Admin ต้องตรวจ)',
            'SCRIPT_APPROVED': 'สคริปต์ผ่านแล้ว รบกวนเริ่มถ่ายทำและส่งดราฟท์',
            'REVISE_SCRIPT': 'สคริปต์ต้องแก้ไข รบกวนแก้ตามคอมเมนต์และส่งใหม่',
            'SUBMITTED_DRAFT': 'ส่งดราฟท์แล้ว รอตรวจ',
            'DRAFT_APPROVED': 'ดราฟท์ผ่านแล้ว รบกวนโพสต์งานจริง',
            'REVISE_DRAFT': 'ดราฟท์ต้องแก้ไข รบกวนแก้ตามคอมเมนต์และส่งใหม่',
            'FINAL_APPROVED': 'โพสต์งานแล้ว รอส่ง Insight',
            'REVISE_FINAL': 'งานโพสต์มีการแก้ไข รบกวนตรวจสอบ',
            'REVISE_INSIGHT': 'ข้อมูล Insight ไม่ครบถ้วน รบกวนส่งใหม่',
            'WAITING': 'รอการอนุมัติ (หากนานเกินไป)'
        }
        
        context = status_context.get(status, 'รบกวนติดตามงาน')
        deadline_text = f"กำหนดส่งคือ {deadline}" if deadline else "ให้เร็วที่สุด"
        
        # Add a "seed" of randomness to the prompt to force different wording
        import time
        prompt = f"""
        Act as a professional and friendly admin of an Influencer Marketing Platform.
        Write a short, polite, and encouraging follow-up message in Thai to an influencer.
        
        Details:
        - Influencer Name: {influencer_name}
        - Campaign: {campaign_title}
        - Current Status: {status} ({context})
        - Deadline: {deadline_text}
        - Variation Seed: {time.time()}
        
        Constraints:
        - Keep it short (under 50 words).
        - Use emojis to be friendly.
        - Do not be aggressive.
        - Format simply as a direct message string.
        - Make it slightly different each time.
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Identify failure in return string
            return f"สวัสดีค่ะคุณ {influencer_name} รบกวนติดตามงานแคมเปญ {campaign_title} ด้วยนะคะ ขอบคุณค่ะ (Fallback: {str(e)[:50]}...)"

    @classmethod
    def extract_document_data(cls, image_source, doc_type):
        """
        Extract data from ID card or Bank Book using Gemini Vision.
        image_source: can be a local path (string) or a file-like object (BytesIO, FileField, etc.)
        doc_type: 'id_card' or 'bank_book'
        """
        import json
        model, error = cls._get_model()
        if error:
            print(f"OCR Error: {error}")
            return None

        try:
            import PIL.Image
            # Load image
            if isinstance(image_source, str):
                if not os.path.exists(image_source):
                    print(f"File not found: {image_source}")
                    return None
                img = PIL.Image.open(image_source)
            else:
                # Assume it's a file-like object
                img = PIL.Image.open(image_source)
            
            prompt = ""
            if doc_type == 'id_card':
                prompt = """
                Analyze this Thai ID Card. Extract the following information in JSON format:
                {
                    "full_name_th": "Name in Thai (exclude Mr./Mrs./Ms., just Firstname Lastname)",
                    "identification_number": "13-digit ID number (digits only)",
                    "address": "Full address string including house no, subdistrict, district, province, zipcode"
                }
                Only return the JSON object, no markdown.
                """
            elif doc_type == 'bank_book':
                prompt = """
                Analyze this Thai Bank Book. Extract the following information in JSON format:
                {
                    "bank_name": "Bank Name in English (e.g., KBANK, SCB, BBL, KTB)",
                    "account_number": "Account number (digits only, remove dashes)",
                    "account_name": "Account name"
                }
                Only return the JSON object, no markdown.
                """
            
            response = model.generate_content([prompt, img])
            text = response.text.strip()
            
            # Clean response header/footer if model adds markdown
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0]
            elif '```' in text:
                text = text.split('```')[1].split('```')[0]
            
            return json.loads(text.strip())
            
        except Exception as e:
            print(f"OCR Exception: {e}")
            return None
    @classmethod
    def analyze_insight_images(cls, image_urls):
        """
        Analyze multiple social media insight screenshots using Gemini Vision.
        Synthesizes data from multiple views (Overview, Viewers, etc.)
        image_urls: List[str]
        """
        import json
        import requests
        from io import BytesIO
        import PIL.Image

        if not image_urls or not isinstance(image_urls, list):
            return None

        model, error = cls._get_model()
        if error:
            print(f"AI Analysis Error: {error}")
            return None

        try:
            images = []
            print(f"[AI Analysis] Downloading {len(image_urls)} images...")
            
            for url in image_urls:
                try:
                    response = requests.get(url, timeout=10)
                    if response.status_code == 200:
                        img = PIL.Image.open(BytesIO(response.content))
                        images.append(img)
                    else:
                        print(f"Failed to download: {url}")
                except Exception as e:
                    print(f"Error downloading {url}: {e}")

            if not images:
                print("[AI Analysis] No valid images to analyze")
                return None
            
            prompt = """
            Analyze these social media insight screenshots (TikTok/Instagram/Facebook).
            These images represent various data points from a high-performing video.
            
            Synthesize ALL available data into EXACTLY this JSON structure:
            {
                "engagement_rate": "string (e.g. 5.2%)",
                "metrics": {
                    "views": integer,
                    "likes": integer,
                    "comments": integer,
                    "shares": integer,
                    "saves": integer
                },
                "retention": {
                    "total_play_time": "string (e.g. 2h:13m:54s)",
                    "average_watch_time": "string (e.g. 7.2s)",
                    "watched_full_video_percentage": "string (e.g. 9.61%)"
                },
                "growth": {
                    "new_followers": integer
                },
                "audience": {
                    "total_viewers": integer,
                    "gender_split": {"male": integer, "female": integer, "other": integer}, 
                    "top_age_ranges": [{"range": "string", "percentage": integer}],
                    "top_locations": [{"name": "string", "percentage": float}],
                    "viewer_types": {
                        "new_viewers_percentage": integer,
                        "returning_viewers_percentage": integer,
                        "followers_percentage": integer,
                        "non_followers_percentage": integer
                    }
                },
                "traffic": {
                    "sources": [{"name": "string", "percentage": float}],
                    "search_queries": ["string"]
                },
                "content_quality": {
                    "lighting": "Good/Bad",
                    "clarity": "High/Low",
                    "product_visibility": "Clear/Hidden"
                }
            }
            
            Rules:
            1. Combine data from all screenshots. 
            2. If numbers are abbreviated (e.g. 10.5K, 1.2M), convert to full integers.
            3. For 'audience' colors/charts, extract percentages as integers (0-100).
            4. For 'traffic sources' and 'locations', include the top 5-7 items with their percentages.
            5. For 'search_queries', list the top keywords shown.
            6. Return valid JSON only, no markdown formatting.
            """
            
            print("[AI Analysis] Sending to Gemini...")
            inputs = [prompt] + images
            response = model.generate_content(inputs)
            text = response.text.strip()
            
            # Clean markdown
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0]
            elif '```' in text:
                text = text.split('```')[1].split('```')[0]
                
            data = json.loads(text.strip())
            
            # Add timestamp
            from django.utils import timezone
            data['analyzed_at'] = timezone.now().isoformat()
            
            print(f"[AI Analysis] Success: {data}")
            return data
            
        except Exception as e:
            print(f"[AI Analysis] Exception: {e}")
            return None
