from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import SupportTicket
from .serializers import SupportTicketSerializer
from .services import GitHubService

class TicketCreateView(generics.CreateAPIView):
    """
    API endpoint to create a support ticket.
    """
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        from django.core.files.storage import default_storage
        from django.conf import settings
        import os
        import uuid

        # 1. Handle File Uploads
        attachments = []
        files = self.request.FILES.getlist('files')
        
        for f in files:
            # Generate unique filename
            ext = os.path.splitext(f.name)[1]
            filename = f"support/{uuid.uuid4()}{ext}"
            path = default_storage.save(filename, f)
            url = default_storage.url(path)
            
            # Ensure absolute URL for GitHub
            if not url.startswith('http'):
                request = self.request
                url = f"{request.scheme}://{request.get_host()}{url}"
            
            attachments.append(url)

        # 2. Save local ticket with attachments
        ticket = serializer.save(user=self.request.user, attachments=attachments)
        
        # 3. Bridge to GitHub
        issue_title = f"[Sup] {ticket.get_topic_display()}: {ticket.subject}"
        
        # Format attachment section for GitHub
        attachment_msg = "\n\n**Attachments:**\n" + "\n".join([f"- [File Link]({url})" for url in attachments]) if attachments else ""
        
        issue_body = (
            f"**Topic:** {ticket.get_topic_display()}\n"
            f"**Reporter:** {ticket.user.display_name} (ID: {ticket.user.id}, Email: {ticket.user.email})\n"
            f"**Subject:** {ticket.subject}\n\n"
            f"**Description:**\n{ticket.description}"
            f"{attachment_msg}\n\n"
            f"--- \n"
            f"*Auto-generated from Support System*"
        )
        
        labels = ['support', ticket.topic.lower()]
        
        # 4. Call GitHub Service
        issue_url = GitHubService.create_issue(issue_title, issue_body, labels)
        
        # 5. Update Ticket with GitHub URL if successful
        if issue_url:
            ticket.github_issue_url = issue_url
            ticket.save()
            
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
