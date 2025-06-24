from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
import uuid
import os
from pathlib import Path
import aiofiles
from ..gemini_content_service import GeminiContentService
from ..firestore_service import FirebaseDataService
import pytesseract
from PIL import Image
import PyPDF2
import io

router = APIRouter()

# Document storage configuration
UPLOAD_DIRECTORY = "uploads/tax_documents"
ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.post("/documents/upload")
async def upload_tax_documents(
    documents: List[UploadFile] = File(...),
    category_id: str = Form(...),
    form_id: str = Form(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload tax documents with categorization"""
    try:
        uploaded_docs = []
        
        for document in documents:
            # Validate file type and size
            file_ext = Path(document.filename).suffix.lower()
            if file_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed")
            
            # Read file content to check size
            content = await document.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large (max 10MB)")
            
            # Generate unique filename
            file_id = str(uuid.uuid4())
            filename = f"{file_id}{file_ext}"
            file_path = os.path.join(UPLOAD_DIRECTORY, filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            
            # Store document metadata
            doc_metadata = {
                'id': file_id,
                'name': document.filename,
                'category_id': category_id,
                'form_id': form_id,
                'user_id': user_id,
                'file_path': file_path,
                'file_size': len(content),
                'file_type': file_ext,
                'upload_timestamp': firestore.SERVER_TIMESTAMP,
                'ocr_processed': False
            }
            
            # Save to Firestore
            firestore_service = FirebaseDataService()
            await firestore_service.save_tax_document(doc_metadata)
            
            uploaded_docs.append({
                'id': file_id,
                'name': document.filename,
                'size': len(content),
                'type': file_ext,
                'download_url': f"/api/tax/documents/{file_id}/download",
                'preview_url': f"/api/tax/documents/{file_id}/preview"
            })
        
        return {
            'success': True,
            'documents': uploaded_docs,
            'message': f'{len(uploaded_docs)} document(s) uploaded successfully'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/documents/{document_id}/ocr")
async def process_document_ocr(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Process OCR on uploaded document"""
    try:
        # Get document metadata from Firestore
        firestore_service = FirebaseDataService()
        doc_metadata = await firestore_service.get_tax_document(document_id, user_id)
        
        if not doc_metadata:
            raise HTTPException(status_code=404, detail="Document not found")
        
        file_path = doc_metadata['file_path']
        file_ext = doc_metadata['file_type']
        
        extracted_data = {}
        
        if file_ext == '.pdf':
            # Extract text from PDF
            extracted_data = await extract_text_from_pdf(file_path)
        elif file_ext in ['.jpg', '.jpeg', '.png']:
            # Extract text from image using OCR
            extracted_data = await extract_text_from_image(file_path)
        
        # Use Gemini to structure the extracted data
        gemini_service = GeminiContentService()
        structured_data = await gemini_service.structure_tax_document_data(
            extracted_text=extracted_data.get('raw_text', ''),
            document_type=doc_metadata['category_id']
        )
        
        # Update document with OCR results
        doc_metadata.update({
            'ocr_processed': True,
            'raw_extracted_text': extracted_data.get('raw_text', ''),
            'structured_data': structured_data,
            'ocr_timestamp': firestore.SERVER_TIMESTAMP
        })
        
        await firestore_service.update_tax_document(document_id, doc_metadata)
        
        return {
            'success': True,
            'extracted_data': structured_data,
            'message': 'OCR processing completed'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@router.get("/documents/{document_id}/download")
async def download_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Download tax document"""
    try:
        firestore_service = FirebaseDataService()
        doc_metadata = await firestore_service.get_tax_document(document_id, user_id)
        
        if not doc_metadata:
            raise HTTPException(status_code=404, detail="Document not found")
        
        file_path = doc_metadata['file_path']
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        return FileResponse(
            path=file_path,
            filename=doc_metadata['name'],
            media_type='application/octet-stream'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete tax document"""
    try:
        firestore_service = FirebaseDataService()
        doc_metadata = await firestore_service.get_tax_document(document_id, user_id)
        
        if not doc_metadata:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete file from disk
        file_path = doc_metadata['file_path']
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from Firestore
        await firestore_service.delete_tax_document(document_id, user_id)
        
        return {
            'success': True,
            'message': 'Document deleted successfully'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

async def extract_text_from_pdf(file_path: str) -> dict:
    """Extract text from PDF using PyPDF2"""
    try:
        extracted_text = ""
        
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"
        
        return {
            'raw_text': extracted_text,
            'pages': len(pdf_reader.pages)
        }
        
    except Exception as e:
        return {
            'raw_text': '',
            'error': str(e)
        }

async def extract_text_from_image(file_path: str) -> dict:
    """Extract text from image using OCR"""
    try:
        image = Image.open(file_path)
        extracted_text = pytesseract.image_to_string(image)
        
        return {
            'raw_text': extracted_text,
            'image_size': image.size
        }
        
    except Exception as e:
        return {
            'raw_text': '',
            'error': str(e)
        }

def get_current_user_id():
    """Mock function to get current user ID - implement based on your auth system"""
    # This should be replaced with your actual authentication logic
    return "mock_user_id"
