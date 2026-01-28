"""
Google Drive Link Validator Service
"""

import re
import requests
from typing import Dict, Optional


class GoogleDriveValidator:
    """
    Service to validate if Google Drive links are publicly accessible.
    
    Checks various Google Drive URL formats and verifies accessibility
    by making a HEAD request to the file.
    """
    
    # Regex patterns for different Google Drive URL formats
    DRIVE_PATTERNS = [
        r'drive\.google\.com/file/d/([a-zA-Z0-9_-]+)',
        r'drive\.google\.com/open\?id=([a-zA-Z0-9_-]+)',
        r'docs\.google\.com/document/d/([a-zA-Z0-9_-]+)',
        r'docs\.google\.com/spreadsheets/d/([a-zA-Z0-9_-]+)',
        r'docs\.google\.com/presentation/d/([a-zA-Z0-9_-]+)',
        r'drive\.google\.com/drive/folders/([a-zA-Z0-9_-]+)',
    ]
    
    # Direct access URL template
    DIRECT_URL_TEMPLATE = "https://drive.google.com/uc?id={file_id}"
    
    # Request timeout in seconds
    TIMEOUT = 10
    
    @classmethod
    def extract_file_id(cls, url: str) -> Optional[str]:
        """
        Extract the file ID from various Google Drive URL formats.
        
        Args:
            url: The Google Drive URL
            
        Returns:
            The file ID if found, None otherwise
        """
        for pattern in cls.DRIVE_PATTERNS:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    @classmethod
    def is_google_drive_url(cls, url: str) -> bool:
        """
        Check if the URL is a Google Drive URL.
        
        Args:
            url: The URL to check
            
        Returns:
            True if it's a Google Drive URL, False otherwise
        """
        return bool(re.search(r'(drive|docs)\.google\.com', url))
    
    @classmethod
    def validate(cls, url: str) -> Dict:
        """
        Validate if a Google Drive link is publicly accessible.
        
        Args:
            url: The Google Drive URL to validate
            
        Returns:
            Dictionary containing:
            - valid: Whether the URL format is valid
            - accessible: Whether the file is publicly accessible
            - message: Human-readable status message
        """
        # Check if it's a Google Drive URL
        if not cls.is_google_drive_url(url):
            return {
                'valid': True,
                'accessible': True,  # Non-Drive URLs skip validation
                'is_google_drive': False,
                'message': 'Not a Google Drive URL, skipping validation'
            }
        
        # Extract file ID
        file_id = cls.extract_file_id(url)
        if not file_id:
            return {
                'valid': False,
                'accessible': False,
                'is_google_drive': True,
                'message': 'Invalid Google Drive URL format'
            }
        
        try:
            # Check the original URL directly - this is more reliable
            # Google returns 401/403 for restricted files
            response = requests.get(
                url,
                allow_redirects=True,
                timeout=cls.TIMEOUT,
                stream=True,  # Don't download full content
                headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; LinkValidator/1.0)'
                }
            )
            
            # Read initial content to check for access denial
            content_chunk = response.raw.read(16384).decode('utf-8', errors='ignore')
            
            # Check for access denied indicators in the HTML
            access_denied_indicators = [
                'Request access',
                'You need access',
                'Sign in',
                'accounts.google.com',
                'ServiceLogin',
                'Request Access',
                'You need permission',
                'Access Denied'
            ]
            
            is_access_denied = any(indicator.lower() in content_chunk.lower() for indicator in access_denied_indicators)
            
            # HTTP 401/403 indicates access denied
            if response.status_code in [401, 403]:
                return {
                    'valid': True,
                    'accessible': False,
                    'is_google_drive': True,
                    'message': 'ลิงก์นี้ต้องขอสิทธิ์เข้าถึง กรุณาเปลี่ยนการแชร์เป็น "Anyone with the link"'
                }
            elif is_access_denied:
                return {
                    'valid': True,
                    'accessible': False,
                    'is_google_drive': True,
                    'message': 'ลิงก์นี้ต้องขอสิทธิ์เข้าถึง กรุณาเปลี่ยนการแชร์เป็น "Anyone with the link"'
                }
            elif response.status_code == 200:
                return {
                    'valid': True,
                    'accessible': True,
                    'is_google_drive': True,
                    'message': 'Link is publicly accessible'
                }
            else:
                return {
                    'valid': True,
                    'accessible': False,
                    'is_google_drive': True,
                    'message': f'Unable to access link (HTTP {response.status_code})'
                }
                
        except requests.Timeout:
            return {
                'valid': True,
                'accessible': None,
                'is_google_drive': True,
                'message': 'Request timed out. Please try again.'
            }
        except requests.RequestException as e:
            return {
                'valid': False,
                'accessible': None,
                'is_google_drive': True,
                'message': f'Error checking link: {str(e)}'
            }
