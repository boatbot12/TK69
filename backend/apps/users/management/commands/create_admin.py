from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with a known password for admin access'
    
    def handle(self, *args, **options):
        username = 'admin'
        email = 'admin@example.com'
        password = 'admin123'
        
        # Check if admin already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Admin user "{username}" already exists. Skipping creation.'))
            return

        # Create new superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            display_name='Admin',
            status='APPROVED'
        )
        
        self.stdout.write(self.style.SUCCESS(f'✅ Superuser created successfully!'))
        self.stdout.write(f'Username: {username}')
        self.stdout.write(f'Password: {password}')
        self.stdout.write(f'Email: {email}')
