import os
import asyncio
import logging
from datetime import datetime
from prefect import flow, task
from services import (
    run_database_backup, 
    backup_uploaded_files, 
    check_overdue_invoices, 
    check_overdue_tasks,
    check_expiring_quotations
)

# Configuration simple pour Prefect
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prefect-orchestrator")

@task(name="Backup PostgreSQL", retries=3, retry_delay_seconds=300)
def db_backup_task():
    """Tâche de sauvegarde de la base de données vers MinIO."""
    logger.info("💾 [Prefect] Lancement sauvegarde PostgreSQL...")
    result = run_database_backup()
    if not result.get("success"):
        raise Exception(f"Backup Error: {result.get('error')}")
    return result

@task(name="Backup S3 Files", retries=2)
def files_backup_task():
    """Tâche de synchronisation des fichiers vers le bucket backup."""
    logger.info("📂 [Prefect] Lancement sauvegarde des fichiers...")
    result = backup_uploaded_files()
    if not result.get("success"):
        # On ne lève pas forcément d'exception si c'est mineur
        logger.warning(f"File backup minor issue: {result.get('error')}")
    return result

@task(name="Auto Reminders (Laravel Link)")
def check_reminders_task():
    """Déclenche les rappels via Laravel (Invoices, Tasks, Quotations)."""
    logger.info("⏰ [Prefect] Vérification des rappels via Laravel...")
    
    # Prefect run_until_complete pour les fonctions async de services.py
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(check_overdue_invoices())
        loop.run_until_complete(check_expiring_quotations())
        loop.run_until_complete(check_overdue_tasks())
    finally:
        loop.close()
    return True

@flow(name="Desksuite Daily Maintenance", log_prints=True)
def daily_maintenance_flow():
    """
    Le flow complet orchestrant la maintenance journalière.
    C'est ici que Prefect prend tout son sens pour la visibilité des erreurs.
    """
    logger.info("🚀 Début de la maintenance journalière orchestrée par Prefect.")
    
    # 1. Backups critiques
    db_status = db_backup_task()
    file_status = files_backup_task()
    
    # 2. Rappels automatiques
    reminders_status = check_reminders_task()
    
    logger.info(f"✅ Maintenance terminée. DB: {db_status.get('filename')}")
    return {"db": db_status, "files": file_status, "reminders": reminders_status}

if __name__ == "__main__":
    # Démarre ou déploie le flow s'il est lancé directement.
    # On utilise .serve() pour créer une instance locale qui écoute le schedule.
    daily_maintenance_flow.serve(
        name="daily-maintenance-schedule",
        cron="0 3 * * *", # Tous les jours à 3h00 du matin
    )
