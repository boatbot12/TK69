from github import Github
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class GitHubService:
    """Service to interact with GitHub API using PyGithub"""
    
    @staticmethod
    def create_issue(title, body, labels=None):
        """
        Create an issue on GitHub repository.
        Requires GITHUB_ACCESS_TOKEN and GITHUB_REPO_OWNER/GITHUB_REPO_NAME in settings.
        """
        token = getattr(settings, 'GITHUB_ACCESS_TOKEN', '')
        owner = getattr(settings, 'GITHUB_REPO_OWNER', '')
        repo_name = getattr(settings, 'GITHUB_REPO_NAME', '')
        
        if not all([token, owner, repo_name]):
            logger.warning("GitHub integration disabled: Missing configuration.")
            return None

        try:
            # Initialize PyGithub
            g = Github(token)
            
            # Get the full repo path (owner/repo)
            full_repo_path = f"{owner}/{repo_name}"
            repo = g.get_repo(full_repo_path)
            
            # Create the issue
            issue = repo.create_issue(
                title=title,
                body=body,
                labels=labels or []
            )
            
            return issue.html_url
        except Exception as e:
            logger.error(f"Failed to create GitHub issue via PyGithub: {e}")
            return None
