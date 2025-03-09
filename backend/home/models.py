from django.db import models
import io
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from fpdf import FPDF
from io import BytesIO
from PIL import Image
from .utils import convert_docx_to_pdf  # Import the function from utils.py

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    resume = models.BinaryField(null=True)  # Store file as BLOB data
    filename = models.CharField(max_length=255, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Handle file during save
        file = kwargs.pop('file', None)  # File passed during save
        if file:
            file_extension = file.name.split('.')[-1].lower()

            if file_extension == 'pdf':
                # Save PDF directly
                pdf_data = file.read()
            elif file_extension == 'docx':
                # Convert DOCX to PDF
                pdf_data = convert_docx_to_pdf(file)
            elif file_extension in ['jpeg', 'jpg', 'png', 'tiff']:
                # Convert image files to PDF
                pdf_data = self.convert_image_to_pdf(file)
            else:
                raise ValidationError("Unsupported file type. Only PDF, DOCX, JPEG, PNG, TIFF, JPG are allowed.")

            # Check if file size exceeds 100 KB
            if len(pdf_data) > 100 * 1024:
                raise ValidationError("The file size exceeds 100 KB after conversion.")

            # Save the binary PDF data
            self.resume = pdf_data

        super().save(*args, **kwargs)

    def convert_itp(self, file):
        """
        Converts an image file to PDF.
        """
        pdf_buffer = BytesIO()
        image = Image.open(file)

        # Convert to RGB if the image is not in RGB mode (for compatibility)
        if image.mode != "RGB":
            image = image.convert("RGB")

        image.save(pdf_buffer, format="PDF")
        pdf_buffer.seek(0)
        return pdf_buffer.read()
    

    def __str__(self):
        return f"{self.user.username} - {self.filename}"

# Create your models here.

class Contact(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)  # Storing phone numbers as strings
    password = models.CharField(max_length=255)  # Hashing should be handled later
    confirm_password = models.CharField(max_length=255)  # For validation, not stored
    
    def __str__(self):
        return self.username