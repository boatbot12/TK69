# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8080

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libpq-dev \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Ensure static and media directories exist and have correct permissions
RUN mkdir -p /app/staticfiles /app/media/interests /app/media/mock && \
    chmod -R 755 /app/media /app/staticfiles

# Download mock images during build (Optimizes startup time)
RUN curl -L "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop" -o /app/media/mock/beauty.jpg && \
    curl -L "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop" -o /app/media/mock/gadget.jpg && \
    curl -L "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop" -o /app/media/mock/cafe.jpg && \
    curl -L "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop" -o /app/media/mock/fashion.jpg && \
    curl -L "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" -o /app/media/mock/food.jpg

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Collect static files during build
# We need to set dummy environment variables because Django loads settings during collectstatic
RUN SECRET_KEY=dummy DATABASE_URL=sqlite:///db.sqlite3 DJANGO_ALLOWED_HOSTS=* python manage.py collectstatic --noinput

# Expose port
EXPOSE 8080

# Run entrypoint.sh (now lighter and faster)
ENTRYPOINT ["/app/entrypoint.sh"]
