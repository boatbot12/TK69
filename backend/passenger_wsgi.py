import os
import sys

# Add the directory containing your backend code to the sys.path
# Hostinger typically places your site in /home/<user>/domains/<domain>/public_html/
# You will need to update this path based on your actual Hostinger file structure
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

# Set the Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'

# Import the WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
