import requests
from django.conf import settings
from django.utils import timezone

class LineMessagingService:
    """Service for sending LINE messages."""
    
    BASE_URL = 'https://api.line.me/v2/bot/message/push'
    
    @classmethod
    def send_push_message(cls, line_user_id, messages):
        """Send push message to specific user."""
        if not settings.LINE_CHANNEL_ACCESS_TOKEN:
            print("❌ LINE Channel Access Token not found")
            return {'success': False, 'error': 'LINE Channel Access Token not configured'}
            
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {settings.LINE_CHANNEL_ACCESS_TOKEN}'
        }
        
        data = {
            'to': line_user_id,
            'messages': messages
        }
        
        try:
            response = requests.post(cls.BASE_URL, headers=headers, json=data, timeout=10)
            if response.status_code == 200:
                print(f"✅ LINE message sent to {line_user_id}")
                return {'success': True}
            else:
                print(f"❌ Failed to send LINE message: {response.text}")
                return {'success': False, 'error': response.text}
        except Exception as e:
            print(f"❌ Error sending LINE message: {e}")
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def send_text_message(cls, line_user_id, text):
        """Send a simple text message."""
        messages = [{'type': 'text', 'text': text}]
        return cls.send_push_message(line_user_id, messages)
    
    @classmethod
    def send_flex_message(cls, line_user_id, alt_text, flex_contents):
        """Send a Flex Message."""
        messages = [{
            'type': 'flex',
            'altText': alt_text,
            'contents': flex_contents
        }]
        return cls.send_push_message(line_user_id, messages)

    @classmethod
    def send_approval_notification(cls, user):
        """Send 'Approved' Flex Message to user."""
        if not user.line_user_id:
            return False
            
        # Thai Date Formatting Helper
        now = timezone.localtime()
        thai_months = [
            "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ]
        thai_year = now.year + 543
        thai_date = f"{now.day} {thai_months[now.month - 1]} {thai_year}"
        
        flex_message = {
            "type": "flex",
            "altText": "🎉 ยินดีด้วย! บัญชีของคุณได้รับการอนุมัติแล้ว",
            "contents": {
                "type": "bubble",
                "size": "giga",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        # Header Row: Status Label + Status Value
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "🔔 สถานะ",
                                    "size": "sm",
                                    "color": "#555555",
                                    "flex": 0,
                                    "gravity": "center"
                                },
                                {
                                    "type": "text",
                                    "text": "อนุมัติแล้ว (Approved)",
                                    "size": "sm",
                                    "color": "#1DB446",
                                    "weight": "bold",
                                    "align": "end",
                                    "gravity": "center"
                                }
                            ]
                        },
                        # Title
                        {
                            "type": "text",
                            "text": f"ยินดีต้อนรับ {user.display_name or user.username}!",
                            "weight": "bold",
                            "size": "xl",
                            "margin": "md",
                            "wrap": True,
                            "color": "#111111"
                        },
                        # Subtitle
                        {
                            "type": "text",
                            "text": "บัญชีของคุณพร้อมรับงานแล้ว",
                            "size": "sm",
                            "color": "#999999",
                            "margin": "xs"
                        },
                        # Divider
                        {
                            "type": "separator",
                            "margin": "xl"
                        },
                        # Member Info Section
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "xl",
                            "spacing": "sm",
                            "contents": [
                                # Section Header
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "📋 ข้อมูลสมาชิก",
                                            "size": "sm",
                                            "weight": "bold",
                                            "color": "#555555"
                                        }
                                    ],
                                    "margin": "none"
                                },
                                # Row 1: Username
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "ชื่อผู้ใช้งาน",
                                            "color": "#aaaaaa",
                                            "size": "sm",
                                            "flex": 2
                                        },
                                        {
                                            "type": "text",
                                            "text": f"{user.display_name or user.username}",
                                            "wrap": True,
                                            "color": "#333333",
                                            "size": "sm",
                                            "flex": 3,
                                            "align": "end"
                                        }
                                    ]
                                },
                                # Row 2: Date
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "วันที่อนุมัติ",
                                            "color": "#aaaaaa",
                                            "size": "sm",
                                            "flex": 2
                                        },
                                        {
                                            "type": "text",
                                            "text": thai_date,
                                            "wrap": True,
                                            "color": "#333333",
                                            "size": "sm",
                                            "flex": 3,
                                            "align": "end"
                                        }
                                    ]
                                }
                            ]
                        },
                        # Start Working Section (Fixed Truncation)
                        {
                            "type": "separator",
                            "margin": "xl"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "margin": "xl",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "เริ่มหางานได้ตั้งแต่",
                                    "size": "md",
                                    "color": "#333333",
                                    "flex": 0,
                                    "gravity": "center"
                                },
                                {
                                    "type": "text",
                                    "text": "วันนี้เป็นต้นไป",
                                    "size": "md",
                                    "color": "#FF6B00",
                                    "weight": "bold",
                                    "align": "end",
                                    "gravity": "center"
                                }
                            ]
                        },
                        # Button
                        {
                            "type": "button",
                            "style": "primary",
                            "height": "sm",
                            "action": {
                                "type": "uri",
                                "label": "ดูงานทั้งหมด (Browse Jobs)",
                                "uri": f"https://liff.line.me/{settings.LIFF_ID}/jobs" if hasattr(settings, 'LIFF_ID') and settings.LIFF_ID else f"{settings.FRONTEND_URL}/jobs"
                            },
                            "color": "#006C8D",
                            "margin": "xl"
                        }
                    ]
                }
            }
        }
        
        return cls.send_push_message(user.line_user_id, [flex_message])

    @classmethod
    def send_rejection_notification(cls, user, rejection_reason=''):
        """Send 'Rejected' Flex Message to user."""
        if not user.line_user_id:
            return {'success': False, 'error': 'No LINE user ID'}
            
        current_date_thai = timezone.localtime().strftime('%d %b %Y').replace(' 0', ' ')
        
        reason_text = rejection_reason or 'ข้อมูลไม่ครบถ้วนหรือไม่ตรงตามเกณฑ์'
        
        flex_message = {
            "type": "flex",
            "altText": "😔 ขออภัย การสมัครของคุณไม่ผ่านการอนุมัติ",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "🔔 สถานะ",
                            "weight": "bold",
                            "color": "#E74C3C",
                            "size": "sm"
                        },
                        {
                            "type": "text",
                            "text": "ไม่ผ่านการอนุมัติ",
                            "weight": "bold",
                            "size": "xl",
                            "margin": "md",
                            "color": "#E74C3C"
                        },
                        {
                            "type": "text",
                            "text": f"ขออภัยคุณ {user.display_name or user.username}",
                            "weight": "bold",
                            "size": "xl",
                            "margin": "lg",
                            "wrap": True
                        },
                        {
                            "type": "text",
                            "text": "การสมัครของคุณไม่ผ่านการพิจารณา",
                            "size": "md",
                            "color": "#666666",
                            "margin": "sm"
                        },
                        {
                            "type": "separator",
                            "margin": "xl"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "xl",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "📋 รายละเอียด",
                                            "color": "#aaaaaa",
                                            "size": "sm",
                                            "flex": 1
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "ชื่อผู้ใช้งาน",
                                            "color": "#666666",
                                            "size": "sm",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": f"{user.display_name or user.username}",
                                            "wrap": True,
                                            "color": "#333333",
                                            "size": "sm",
                                            "flex": 2,
                                            "align": "end"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "วันที่พิจารณา",
                                            "color": "#666666",
                                            "size": "sm",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": f"{current_date_thai}",
                                            "wrap": True,
                                            "color": "#333333",
                                            "size": "sm",
                                            "flex": 2,
                                            "align": "end"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "xl",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "💬 เหตุผล",
                                    "color": "#aaaaaa",
                                    "size": "sm"
                                },
                                {
                                    "type": "text",
                                    "text": reason_text,
                                    "size": "sm",
                                    "color": "#E74C3C",
                                    "margin": "sm",
                                    "wrap": True
                                }
                            ]
                        },
                        {
                            "type": "text",
                            "text": "กรุณาติดต่อทีมงานหากมีข้อสงสัย",
                            "size": "xs",
                            "color": "#999999",
                            "margin": "xl",
                            "align": "center"
                        }
                    ]
                }
            }
        }
        
        return cls.send_push_message(user.line_user_id, [flex_message])

    @classmethod
    def send_campaign_status_notification(cls, application, old_status, new_status):
        """
        Send notification when campaign application status changes.
        
        Args:
            application: CampaignApplication instance
            old_status: Previous status string
            new_status: New status string
        """
        user = application.user
        campaign = application.campaign
        
        if not user.line_user_id:
            return {'success': False, 'error': 'No LINE user ID'}
        
        # Skip if status didn't actually change
        if old_status == new_status:
            return {'success': False, 'error': 'Status unchanged'}
        
        # Define messages for each status transition
        status_messages = {
            'APPROVED': {
                'emoji': '🎉',
                'title': 'ใบสมัครได้รับการอนุมัติแล้ว!',
                'message': f'ยินดีด้วย! ใบสมัครแคมเปญ "{campaign.title}" ของคุณได้รับการอนุมัติแล้วค่ะ เริ่มทำงานได้เลย!',
                'color': '#1DB446'
            },
            'REJECTED': {
                'emoji': '😔',
                'title': 'ใบสมัครไม่ผ่านการพิจารณา',
                'message': f'ขออภัยค่ะ ใบสมัครแคมเปญ "{campaign.title}" ไม่ผ่านการพิจารณา กรุณาลองสมัครแคมเปญอื่นนะคะ',
                'color': '#E74C3C'
            },
            'SCRIPT_APPROVED': {
                'emoji': '✅',
                'title': 'สคริปต์ผ่านการอนุมัติแล้ว!',
                'message': f'เย้! สคริปต์ของคุณสำหรับแคมเปญ "{campaign.title}" ผ่านแล้วค่ะ กรุณาส่งดราฟท์ในขั้นตอนถัดไป',
                'color': '#1DB446'
            },
            'DRAFT_APPROVED': {
                'emoji': '🎬',
                'title': 'ดราฟท์ผ่านการอนุมัติแล้ว!',
                'message': f'ดีมาก! ดราฟท์ของคุณสำหรับแคมเปญ "{campaign.title}" ผ่านแล้วค่ะ กรุณาส่งไฟล์สุดท้ายได้เลย',
                'color': '#1DB446'
            },
            'COMPLETED': {
                'emoji': '🎊',
                'title': 'งานเสร็จสมบูรณ์!',
                'message': f'ยินดีด้วยค่ะ! คุณทำแคมเปญ "{campaign.title}" สำเร็จแล้ว รอรับเงินโอนจากเราได้เลย',
                'color': '#1DB446'
            },
            'PAYMENT_TRANSFERRED': {
                'emoji': '💰',
                'title': 'โอนเงินเรียบร้อยแล้ว!',
                'message': f'โอนเงินค่าจ้างสำหรับแคมเปญ "{campaign.title}" ให้คุณเรียบร้อยแล้วค่ะ ขอบคุณที่ร่วมงานกับเรา!',
                'color': '#1DB446'
            },
        }
        
        # Get message config for new status
        config = status_messages.get(new_status)
        if not config:
            return {'success': False, 'error': f'No message configured for status {new_status}'}
        
        # Build Premium Flex Message
        # Build Premium Flex Message
        liff_id = getattr(settings, 'LIFF_ID', None)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://google.com')
        
        if liff_id:
            action_url = f"https://liff.line.me/{liff_id}/campaign/{campaign.uuid}"
        else:
            action_url = f"{frontend_url}/campaign/{campaign.uuid}"
        
        flex_message = {
            "type": "flex",
            "altText": f"{config['emoji']} {config['title']}",
            "contents": {
                "type": "bubble",
                "size": "giga",  # Increased size for better layout
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        # Header: Status Badge & Brand
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": new_status.replace('_', ' '),
                                            "color": "#ffffff",
                                            "size": "xs",
                                            "weight": "bold",
                                            "align": "center"
                                        }
                                    ],
                                    "backgroundColor": config['color'],
                                    "cornerRadius": "20px",
                                    "paddingStart": "md",
                                    "paddingEnd": "md",
                                    "height": "25px",
                                    "justifyContent": "center",
                                    "flex": 0
                                },
                                {
                                    "type": "text",
                                    "text": campaign.brand_name.upper(),
                                    "size": "xs",
                                    "color": "#bbbbbb",
                                    "align": "end",
                                    "gravity": "center",
                                    "weight": "bold"
                                }
                            ]
                        },
                        # Title Section
                        {
                            "type": "text",
                            "text": config['title'],
                            "weight": "bold",
                            "size": "xl",
                            "margin": "md",
                            "wrap": True,
                            "color": "#111111"
                        },
                        # Campaign Title
                        {
                            "type": "text",
                            "text": campaign.title,
                            "size": "sm",
                            "color": "#555555",
                            "wrap": True,
                            "margin": "sm"
                        },
                        # Divider
                        {
                            "type": "separator",
                            "margin": "xl",
                            "color": "#eeeeee"
                        },
                        # Detail Section
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "xl",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "สถานะ",
                                            "color": "#aaaaaa",
                                            "size": "sm",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": config['title'],
                                            "wrap": True,
                                            "color": "#333333",
                                            "size": "sm",
                                            "flex": 2,
                                            "weight": "bold"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "อัปเดตเมื่อ",
                                            "color": "#aaaaaa",
                                            "size": "sm",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": timezone.localtime().strftime('%H:%M น. (%d/%m)'),
                                            "wrap": True,
                                            "color": "#333333",
                                            "size": "sm",
                                            "flex": 2
                                        }
                                    ]
                                }
                            ]
                        },
                        # Message Box
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "xl",
                            "backgroundColor": "#f8f9fa",
                            "cornerRadius": "md",
                            "paddingAll": "md",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": config['message'],
                                    "size": "sm",
                                    "color": "#555555",
                                    "wrap": True,
                                    "lineSpacing": "4px"
                                }
                            ]
                        },
                        # Action Button
                        {
                            "type": "button",
                            "style": "primary",
                            "height": "sm",
                            "action": {
                                "type": "uri",
                                "label": "ดูรายละเอียดงาน",
                                "uri": action_url
                            },
                            "color": "#000000",
                            "margin": "xl"
                        }
                    ]
                }
            }
        }
        
        return cls.send_push_message(user.line_user_id, [flex_message])
