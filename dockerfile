# Use Python Image
FROM python:3.10

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN pip install flask firebase-admin

# Expose Flask port
EXPOSE 5000

# Run application
CMD ["python", "app.py"]