"""
Social Media Platform Connection Services.

This module handles fetching profile data from various social media platforms.
"""

import re
import requests
import logging
import time
import random
from django.conf import settings

logger = logging.getLogger(__name__)


class YouTubeService:
    """
    Fetch YouTube channel data using Google Data API v3.
    Free tier: 10,000 units/day. channels.list costs 1 unit.
    """
    
    API_BASE = "https://www.googleapis.com/youtube/v3"
    
    @classmethod
    def extract_channel_id_or_handle(cls, url: str) -> tuple:
        """
        Extract channel ID or handle from YouTube URL.
        Returns: (type, value) where type is 'id', 'handle', or 'username'
        """
        patterns = [
            # youtube.com/channel/UC...
            (r'youtube\.com/channel/(UC[\w-]+)', 'id'),
            # youtube.com/@handle
            (r'youtube\.com/@([\w.-]+)', 'handle'),
            # youtube.com/c/CustomName or youtube.com/user/username
            (r'youtube\.com/(?:c|user)/([\w.-]+)', 'username'),
        ]
        
        for pattern, url_type in patterns:
            match = re.search(pattern, url)
            if match:
                return (url_type, match.group(1))
        
        return (None, None)
    
    @classmethod
    def fetch_channel_data(cls, profile_url: str) -> dict:
        """
        Fetch channel data from YouTube API.
        """
        api_key = getattr(settings, 'YOUTUBE_API_KEY', None)
        if not api_key:
            return {'success': False, 'error': 'YouTube API key not configured'}
        
        url_type, value = cls.extract_channel_id_or_handle(profile_url)
        
        if not url_type:
            return {'success': False, 'error': 'Invalid YouTube URL format'}
        
        try:
            # Build request parameters based on URL type
            params = {
                'part': 'snippet,statistics',
                'key': api_key
            }
            
            if url_type == 'id':
                params['id'] = value
            elif url_type == 'handle':
                params['forHandle'] = value
            else:
                params['forUsername'] = value
            
            response = requests.get(
                f"{cls.API_BASE}/channels",
                params=params,
                timeout=10
            )
            
            if response.status_code != 200:
                return {'success': False, 'error': f'YouTube API error: {response.status_code}'}
            
            data = response.json()
            items = data.get('items', [])
            
            if not items:
                return {'success': False, 'error': 'Channel not found'}
            
            channel = items[0]
            snippet = channel.get('snippet', {})
            statistics = channel.get('statistics', {})
            
            return {
                'success': True,
                'data': {
                    'platform': 'youtube',
                    'platform_user_id': channel.get('id', ''),
                    'username': snippet.get('title', ''),
                    'profile_url': profile_url,
                    'profile_picture_url': snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
                    'followers_count': int(statistics.get('subscriberCount', 0)),
                    'posts_count': int(statistics.get('videoCount', 0)),
                    'is_verified': False,  # YouTube API doesn't expose this easily
                }
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"[YouTube] Request failed: {e}")
            return {'success': False, 'error': f'Network error: {str(e)}'}
        except Exception as e:
            logger.error(f"[YouTube] Unexpected error: {e}")
            return {'success': False, 'error': f'Error: {str(e)}'}


class RapidAPISocialService:
    """
    Fetch profile data from TikTok, Instagram, Facebook using RapidAPI.
    Uses a combined social scraper for cost efficiency.
    """
    
    @classmethod
    def _get_api_key(cls):
        return getattr(settings, 'RAPIDAPI_KEY', None)
    
    @classmethod
    def _get_host(cls, platform: str):
        """Get the RapidAPI host for the given platform."""
        # Using a combined scraper that supports multiple platforms
        hosts = {
            'tiktok': 'tiktok-scraper7.p.rapidapi.com',
            'instagram': 'instagram-scraper-api2.p.rapidapi.com',
            'facebook': 'facebook-scraper-api6.p.rapidapi.com',
        }
        return hosts.get(platform)
    
    @classmethod
    def extract_username(cls, url: str, platform: str) -> str:
        """Extract username from profile URL."""
        patterns = {
            'tiktok': r'tiktok\.com/@([\w.-]+)',
            'instagram': r'instagram\.com/([\w.-]+)',
            'facebook': r'facebook\.com/([\w.-]+)',
        }
        
        pattern = patterns.get(platform)
        if pattern:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    @classmethod
    def fetch_tiktok_profile(cls, profile_url: str) -> dict:
        """Fetch TikTok profile data."""
        api_key = cls._get_api_key()
        if not api_key:
            return {'success': False, 'error': 'RapidAPI key not configured'}
        
        username = cls.extract_username(profile_url, 'tiktok')
        if not username:
            return {'success': False, 'error': 'Invalid TikTok URL format'}
        
        try:
            response = requests.get(
                f"https://{cls._get_host('tiktok')}/user/info",
                params={'unique_id': username},
                headers={
                    'x-rapidapi-key': api_key,
                    'x-rapidapi-host': cls._get_host('tiktok')
                },
                timeout=15
            )
            
            if response.status_code != 200:
                return {'success': False, 'error': f'TikTok API error: {response.status_code}'}
            
            data = response.json()
            user_info = data.get('data', {}).get('user', {})
            stats = data.get('data', {}).get('stats', {})
            
            return {
                'success': True,
                'data': {
                    'platform': 'tiktok',
                    'platform_user_id': user_info.get('id', ''),
                    'username': f"@{user_info.get('uniqueId', username)}",
                    'profile_url': profile_url,
                    'profile_picture_url': user_info.get('avatarLarger', ''),
                    'followers_count': stats.get('followerCount', 0),
                    'following_count': stats.get('followingCount', 0),
                    'posts_count': stats.get('videoCount', 0),
                    'is_verified': user_info.get('verified', False)
                }
            }
            
        except Exception as e:
            logger.error(f"[TikTok] Error: {e}")
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def fetch_instagram_profile(cls, profile_url: str) -> dict:
        """Fetch Instagram profile data."""
        api_key = cls._get_api_key()
        if not api_key:
            return {'success': False, 'error': 'RapidAPI key not configured'}
        
        username = cls.extract_username(profile_url, 'instagram')
        if not username:
            return {'success': False, 'error': 'Invalid Instagram URL format'}
        
        try:
            response = requests.get(
                f"https://{cls._get_host('instagram')}/v1/info",
                params={'username_or_id_or_url': username},
                headers={
                    'x-rapidapi-key': api_key,
                    'x-rapidapi-host': cls._get_host('instagram')
                },
                timeout=15
            )
            
            if response.status_code != 200:
                return {'success': False, 'error': f'Instagram API error: {response.status_code}'}
            
            data = response.json()
            user_data = data.get('data', {})
            
            return {
                'success': True,
                'data': {
                    'platform': 'instagram',
                    'platform_user_id': user_data.get('id', ''),
                    'username': f"@{user_data.get('username', username)}",
                    'profile_url': profile_url,
                    'profile_picture_url': user_data.get('profile_pic_url_hd', ''),
                    'followers_count': user_data.get('follower_count', 0),
                    'following_count': user_data.get('following_count', 0),
                    'posts_count': user_data.get('media_count', 0),
                    'is_verified': user_data.get('is_verified', False)
                }
            }
            
        except Exception as e:
            logger.error(f"[Instagram] Error: {e}")
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def fetch_facebook_profile(cls, profile_url: str) -> dict:
        """Fetch Facebook page data."""
        api_key = cls._get_api_key()
        if not api_key:
            return {'success': False, 'error': 'RapidAPI key not configured'}
        
        username = cls.extract_username(profile_url, 'facebook')
        if not username:
            return {'success': False, 'error': 'Invalid Facebook URL format'}
        
        try:
            response = requests.get(
                f"https://{cls._get_host('facebook')}/page_info",
                params={'page_id': username},
                headers={
                    'x-rapidapi-key': api_key,
                    'x-rapidapi-host': cls._get_host('facebook')
                },
                timeout=15
            )
            
            if response.status_code != 200:
                return {'success': False, 'error': f'Facebook API error: {response.status_code}'}
            
            data = response.json()
            page_data = data.get('data', {})
            
            return {
                'success': True,
                'data': {
                    'platform': 'facebook',
                    'platform_user_id': page_data.get('id', ''),
                    'username': page_data.get('name', username),
                    'profile_url': profile_url,
                    'profile_picture_url': page_data.get('profile_picture', ''),
                    'followers_count': page_data.get('followers_count', 0),
                    'following_count': 0,
                    'posts_count': 0,
                    'is_verified': page_data.get('is_verified', False)
                }
            }
            
        except Exception as e:
            logger.error(f"[Facebook] Error: {e}")
            return {'success': False, 'error': str(e)}


class ApifyServiceHelper:
    """Helper class for Apify API interactions."""
    
    API_BASE = "https://api.apify.com/v2"
    
    @staticmethod
    def run_actor(actor_id: str, run_input: dict, timeout: int = 60) -> dict:
        """Run an Apify actor and retrieve the results."""
        api_token = getattr(settings, 'APIFY_API_TOKEN', None)
        if not api_token:
            return {'success': False, 'error': 'Apify API token not configured'}
            
        try:
            # 1. Start the actor run
            response = requests.post(
                f"{ApifyServiceHelper.API_BASE}/acts/{actor_id}/runs?token={api_token}",
                json=run_input,
                timeout=10
            )
            
            if response.status_code not in [200, 201]:
                return {'success': False, 'error': f'Apify API error: {response.status_code}'}
            
            run_data = response.json()
            run_id = run_data.get('data', {}).get('id')
            dataset_id = run_data.get('data', {}).get('defaultDatasetId')
            
            # 2. Wait for completion (simple polling loop could be better, but using waitForFinish param is easier if supported)
            # Re-running with waitForFinish just in case, or we can poll.
            # actually better to just poll status
            
            import time
            for _ in range(timeout // 2):
                run_status_res = requests.get(
                     f"{ApifyServiceHelper.API_BASE}/actor-runs/{run_id}?token={api_token}"
                )
                status_data = run_status_res.json().get('data', {})
                if status_data.get('status') == 'SUCCEEDED':
                    break
                elif status_data.get('status') in ['FAILED', 'ABORTED', 'TIMED-OUT']:
                     return {'success': False, 'error': f"Actor run failed: {status_data.get('status')}"}
                time.sleep(2)
            else:
                 return {'success': False, 'error': 'Actor run timed out'}

            # 3. Fetch results
            dataset_response = requests.get(
                f"{ApifyServiceHelper.API_BASE}/datasets/{dataset_id}/items?token={api_token}",
                timeout=10
            )
            
            items = dataset_response.json()
            if not items:
                # Sometimes items are empty if profile not found
                return {'success': False, 'error': 'No data found or profile does not exist'}
                
            return {'success': True, 'data': items}
            
        except Exception as e:
            logger.error(f"[Apify] Error running actor {actor_id}: {e}")
            return {'success': False, 'error': str(e)}


class TikTokLocalService:
    """
    Fetch TikTok profile data using the TikTokApi python library (local execution).
    Requries Playwright to be installed.
    """
    
    @classmethod
    def extract_username(cls, url: str) -> str:
        match = re.search(r'tiktok\.com/@([\w.-]+)', url)
        return match.group(1) if match else None

    @staticmethod
    async def _fetch_async(username: str):
        from TikTokApi import TikTokApi
        import asyncio
        
        # Initialize the API using Playwright
        async with TikTokApi() as api:
            await api.create_sessions(ms_tokens=[], num_sessions=1, sleep_after=3, headless=True, browser='webkit')
            user = api.user(username)
            user_data = await user.info()
            return user_data

    @classmethod
    def fetch_profile(cls, profile_url: str) -> dict:
        import asyncio
        
        username = cls.extract_username(profile_url)
        if not username:
             return {'success': False, 'error': 'Invalid TikTok URL format'}

        try:
            # Run the async fetch in a new event loop
            # Note: Nesting event loops can be tricky in Django. 
            # If running under ASGI this might need adjustment, but for WSGI (standard runserver) asyncio.run is usually fine 
            # OR we need to use a separate thread if main loop is running.
            
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            if loop.is_running():
                 # We are likely in an async context already? 
                 # For runserver (sync), this should not be running usually.
                 # But if it is, we might need nest_asyncio
                 import nest_asyncio
                 nest_asyncio.apply()
                 user_info = loop.run_until_complete(cls._fetch_async(username))
            else:
                 user_info = loop.run_until_complete(cls._fetch_async(username))
            
            # Extract data structure from TikTokApi response
            # Note: The structure depends heavily on the library version
            user = user_info.get('userInfo', {}).get('user', {})
            stats = user_info.get('userInfo', {}).get('stats', {})
            
            return {
                'success': True,
                'data': {
                    'platform': 'tiktok',
                    'platform_user_id': user.get('id', ''),
                    'username': f"@{user.get('uniqueId', username)}",
                    'profile_url': profile_url,
                    'profile_picture_url': user.get('avatarLarger', '') or user.get('avatarMedium', ''),
                    'followers_count': stats.get('followerCount', 0),
                    'following_count': stats.get('followingCount', 0),
                    'posts_count': stats.get('videoCount', 0),
                    'is_verified': user.get('verified', False)
                }
            }
            
        except Exception as e:
            logger.error(f"[TikTokApi] Error: {e}")
            # Fallback to efficient requests scraping if Playwright fails
            logger.info("Falling back to requests scraping...")
            return cls._fetch_fallback(profile_url)

    @staticmethod
    def _fetch_fallback(url: str) -> dict:
        """
        Fallback scraping using basic requests and regex.
        Bypasses complex JS checks but might be brittle.
        """
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/'
        }
        
        try:
            # Clean URL
            match = re.search(r'tiktok\.com/(@[\w.-]+)', url)
            if not match:
                return {'success': False, 'error': 'Invalid URL for fallback'}
            username = match.group(1)
            
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code != 200:
                return {'success': False, 'error': f'TikTok Fallback HTTP {response.status_code}'}
                
            html = response.text
            
            # Simple Regex Extraction from Meta Tags (most reliable for public profiles)
            # Followers
            followers_match = re.search(r'"followerCount":\s*(\d+)', html)
            following_match = re.search(r'"followingCount":\s*(\d+)', html)
            video_match = re.search(r'"videoCount":\s*(\d+)', html)
            avatar_match = re.search(r'"avatarLarger":"(https?://[^"]+)"', html)
            
            # Extract data
            followers = int(followers_match.group(1)) if followers_match else 0
            following = int(following_match.group(1)) if following_match else 0
            videos = int(video_match.group(1)) if video_match else 0
            avatar = avatar_match.group(1).replace(r'\u002F', '/') if avatar_match else ''
            
            if followers == 0 and not avatar:
                 return {'success': False, 'error': 'Bot detection active (Fallback failed)'}

            return {
                'success': True,
                'data': {
                    'platform': 'tiktok',
                    'platform_user_id': username, # Use handle as ID if legitimate ID not found
                    'username': username,
                    'profile_url': url,
                    'profile_picture_url': avatar,
                    'followers_count': followers,
                    'following_count': following,
                    'posts_count': videos,
                    'is_verified': False
                }
            }
            
        except Exception as ex:
             return {'success': False, 'error': f'Fallback error: {str(ex)}'}





class InstaloaderService:
    """
    Fetch Instagram profile data using Instaloader (Free, No API Key).
    BEWARE: Aggressive rate limiting by Instagram.
    """
    
    @classmethod
    def extract_username(cls, url: str) -> str:
        # Match instagram.com/username/ or instagram.com/username
        match = re.search(r'instagram\.com/([a-zA-Z0-9_\.]+)/?', url)
        return match.group(1) if match else None
        
    @classmethod
    def fetch_profile(cls, profile_url: str) -> dict:
        import instaloader
        
        username = cls.extract_username(profile_url)
        if not username:
            return {'success': False, 'error': 'Invalid Instagram URL format'}
            
        try:
            # Create Instaloader instance (no login mechanism implemented yet as per request for basic free usage)
            # Login can be added here if needed using L.login(user, password) or load_session_from_file()
            L = instaloader.Instaloader()
            
            # Fetch profile
            profile = instaloader.Profile.from_username(L.context, username)
            
            return {
                'success': True,
                'data': {
                    'platform': 'instagram',
                    'platform_user_id': str(profile.userid),
                    'username': f"@{profile.username}",
                    'profile_url': profile_url,
                    'profile_picture_url': profile.profile_pic_url,
                    'followers_count': profile.followers,
                    'following_count': profile.followees,
                    'posts_count': profile.mediacount,
                    'is_verified': profile.is_verified
                }
            }
            
        except instaloader.ProfileNotExistsException:
             return {'success': False, 'error': 'Instagram profile not found'}
        except instaloader.ConnectionException as e:
             logger.error(f"[Instaloader] Connection Error: {e}")
             return {'success': False, 'error': f'Connection error (Rate Limit?): {str(e)}'}
        except Exception as e:
             logger.error(f"[Instaloader] Unexpected Error: {e}")
             return {'success': False, 'error': f'Error: {str(e)}'}

class FacebookLocalService:
    """
    Fetch Facebook page data using facebook-scraper (Free, No API Key).
    """
    
    @classmethod
    def extract_username(cls, url: str) -> str:
        # Match facebook.com/page-name or facebook.com/profile.php?id=123
        # Simplest case: facebook.com/username
        match = re.search(r'facebook\.com/([a-zA-Z0-9.]+)/?', url)
        if match and 'profile.php' not in match.group(1):
            return match.group(1)
        return None
        
    @classmethod
    def fetch_profile(cls, profile_url: str) -> dict:
        from facebook_scraper import get_page_info
        
        username = cls.extract_username(profile_url)
        if not username:
             return {'success': False, 'error': 'Invalid Facebook URL format (Page ID/Name required)'}
             
        try:
            # get_page_info returns dict with: likes, followers, Name, etc.
            page_info = get_page_info(username)
            
            # If get_page_info fails to return data, try fallback
            if not page_info or not page_info.get('Followers') or not page_info.get('image'):
                logger.info(f"[Facebook] Insufficient data for {username}. Trying fallback...")
                fallback_res = cls._fetch_fallback(profile_url)
                if fallback_res.get('success'):
                    return fallback_res

            return {
                'success': True,
                'data': {
                    'platform': 'facebook',
                    'platform_user_id': str(page_info.get('id', '')),
                    'username': page_info.get('Name', username),
                    'profile_url': profile_url,
                    'profile_picture_url': page_info.get('image', ''),
                    'followers_count': page_info.get('Followers', 0),
                    'following_count': 0, # Pages don't typically show following
                    'posts_count': 0, # Not provided by get_page_info
                    'is_verified': page_info.get('Time', False) is not False # Rough heuristic or default to False
                }
            }
            
        except Exception as e:
             logger.error(f"[FacebookScraper] Error: {e}")
             return cls._fetch_fallback(profile_url)

    @staticmethod
    def _fetch_fallback(url: str) -> dict:
        """
        Fallback scraping using basic requests and regex.
        Parses Meta tags which are often available for public pages.
        """
        logger.info(f"[Facebook Fallback] Requesting URL: {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            logger.info(f"[Facebook Fallback] Response Status: {response.status_code}")
            if response.status_code != 200:
                return {'success': False, 'error': f'Facebook HTTP {response.status_code}'}
                
            html = response.text
            
            # Extract Meta Description (contains follower/likes for public pages)
            # Example: content="CNN. 34,785,123 likes &#xb7; 32,123 talking about this..."
            desc_match = re.search(r'property="og:description" content="([^"]+)"', html)
            if not desc_match:
                 desc_match = re.search(r'<meta name="description" content="([^"]+)"', html)
            
            description = desc_match.group(1) if desc_match else ""
            logger.info(f"[Facebook Fallback] Description: {description}")
            
            # Extract likes/followers from description
            # Formats: "1.2M likes", "10,234 followers", or "42k likes"
            # Thai formats: "มีผู้ติดตาม 1.2 ล้าน คน", "ถูกใจ 1 หมื่น คน"
            followers_count = 0
            
            # 1. English Pattern
            stats_match = re.search(r'([\d,M.K]+)\s+(followers|likes)', description, re.IGNORECASE)
            
            # 2. Thai Pattern Fallback
            if not stats_match:
                 # Match "ผู้ติดตาม 1.2M" or "ถูกใจ 1.2M"
                 stats_match = re.search(r'(?:ผู้ติดตาม|ถูกใจ)\s*([\d,M.Kล้านหมื่น]+)', description, re.IGNORECASE)

            # 3. Raw HTML JSON/Text Fallback (for profiles without meta description)
            if not stats_match:
                 # Search for "follower_count":1234 or "followers":{"count":1234} or just "1,234 followers"
                 stats_match = re.search(r'\"follower_count\":\s*(\d+)', html)
                 if not stats_match:
                     stats_match = re.search(r'([\d,M.K]+)\s+followers', html, re.IGNORECASE)

            if stats_match:
                val = stats_match.group(1).upper().replace(',', '')
                # Handle Thai multipliers
                if 'ล้าน' in val:
                    val = val.replace('ล้าน', '')
                    followers_count = int(float(val) * 1000000)
                elif 'หมื่น' in val:
                    val = val.replace('หมื่น', '')
                    followers_count = int(float(val) * 10000)
                elif 'K' in val:
                    followers_count = int(float(val.replace('K', '')) * 1000)
                elif 'M' in val:
                    followers_count = int(float(val.replace('M', '')) * 1000000)
                else:
                    try:
                        followers_count = int(float(val))
                    except:
                        pass

            # Extract Profile Picture (og:image)
            image_match = re.search(r'property="og:image" content="([^"]+)"', html)
            if not image_match:
                # Try standard meta image
                image_match = re.search(r'<meta property="og:image" content="([^"]+)"', html)
                
            profile_picture_url = image_match.group(1).replace('&amp;', '&') if image_match else ""
            
            # If still no image, try to find any profile pic URL in script tags
            if not profile_picture_url:
                pic_match = re.search(r'\"profile_pic_uri\":\s*\"([^\"]+)\"', html)
                if pic_match:
                    profile_picture_url = pic_match.group(1).encode().decode('unicode-escape')
            
            # Extract Page Name (og:title)
            name_match = re.search(r'property="og:title" content="([^"]+)"', html)
            username = name_match.group(1) if name_match else "Facebook Page"
            
            # Clean up username (strip " - Home | Facebook")
            username = re.sub(r'\s-\s.*', '', username)

            if followers_count == 0 and not profile_picture_url:
                 # If we still got nothing, might be blocked or private
                 return {'success': False, 'error': 'Failed to extract data from meta tags'}

            return {
                'success': True,
                'data': {
                    'platform': 'facebook',
                    'platform_user_id': '', 
                    'username': username,
                    'profile_url': url,
                    'profile_picture_url': profile_picture_url,
                    'followers_count': followers_count,
                    'following_count': 0,
                    'posts_count': 0,
                    'is_verified': 'verified' in description.lower() or 'official' in description.lower()
                }
            }
            
        except Exception as ex:
             return {'success': False, 'error': f'Fallback error: {str(ex)}'}


class SocialPlatformService:
    """
    Unified service for fetching profile data from any supported platform.
    """
    
    @classmethod
    def fetch_profile(cls, platform: str, profile_url: str) -> dict:
        """Dispatch to the appropriate platform service with safety measures."""
        
        # 1. Random Jitter Delay (Anti-Blocking Rule #1 & #2)
        # 3 to 10 seconds (Human-like behavior)
        delay = random.uniform(3, 10)
        logger.info(f"[Safety] Adding random delay of {delay:.2f}s before fetching {platform}...")
        time.sleep(delay)
        
        handlers = {
            'youtube': YouTubeService.fetch_channel_data,
            'tiktok': TikTokLocalService.fetch_profile,
            'instagram': InstaloaderService.fetch_profile,
            'facebook': FacebookLocalService.fetch_profile,
        }
        
        handler = handlers.get(platform)
        if not handler:
            return {'success': False, 'error': f'Unsupported platform: {platform}'}
        
        try:
            result = handler(profile_url)
            
            # 2. Check for Security Stops (Anti-Blocking Rule #3)
            # If the error message indicates a block, we return a special status
            if not result.get('success'):
                err_msg = str(result.get('error', '')).lower()
                if '403' in err_msg or 'forbidden' in err_msg or '429' in err_msg or 'too many requests' in err_msg:
                    return {
                        'success': False, 
                        'security_stop': True,
                        'error': f'⚠️ IP Blocking Detected ({platform}). Stopping all requests to protect your IP.'
                    }
                    
            return result
        except Exception as e:
            logger.error(f"[SocialPlatformService] Unexpected Error: {e}")
            return {'success': False, 'error': str(e)}
