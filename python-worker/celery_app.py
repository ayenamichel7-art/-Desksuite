import os
import logging
import base64
from celery import Celery
from services import extract_receipt_data, generate_invoice_pdf_pro

# Configuration : Utiliser la DB 2 de Redis pour éviter conflit avec Laravel Cache (DB 1)
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/2")

celery_app = Celery(
    "desksuite_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    # Limite de temps pour ne pas bloquer les workers éternellement
    task_time_limit=300, 
)

logger = logging.getLogger("celery-worker")

@celery_app.task(name="tasks.ocr_receipt")
def ocr_receipt_task(image_bytes_b64: str):
    """Effectue l'OCR en arrière-plan et retourne le résultat structuré."""
    try:
        image_bytes = base64.b64decode(image_bytes_b64)
        result = extract_receipt_data(image_bytes)
        return result
    except Exception as e:
        logger.error(f"❌ [Celery OCR] Error: {e}")
        return {"success": False, "error": str(e)}

@celery_app.task(name="tasks.generate_pdf")
def generate_pdf_task(req_data: dict):
    """Génère un PDF professionnel en arrière-plan."""
    try:
        pdf_bytes = generate_invoice_pdf_pro(**req_data)
        # Retourne en base64 pour être compatible avec les résultats JSON de Celery
        return {
            "success": True, 
            "pdf_b64": base64.b64encode(pdf_bytes).decode('utf-8'),
            "filename": f"{req_data.get('doc_type', 'doc')}_{req_data.get('reference', 'ref')}.pdf"
        }
    except Exception as e:
        logger.error(f"❌ [Celery PDF] Error: {e}")
        return {"success": False, "error": str(e)}

@celery_app.task(name="tasks.ping")
def ping_task():
    return "pong"
