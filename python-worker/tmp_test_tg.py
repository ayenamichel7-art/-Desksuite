import sys
import os
import io
import httpx
import asyncio
from datetime import datetime

# Importer les services du worker
sys.path.append(r'c:\Users\MICHEL\Desktop\Desksuite\python-worker')
from services import generate_premium_report, ReportRequest, ExpenseItem, logger

async def send_to_telegram(pdf_bytes, token, chat_id):
    """Envoie un fichier PDF à un Chat ID Telegram."""
    url = f"https://api.telegram.org/bot{token}/sendDocument"
    
    # S'assurer que c'est bien des bytes et non un bytearray
    if isinstance(pdf_bytes, (bytearray, bytes)):
        pdf_file = io.BytesIO(pdf_bytes)
    else:
        pdf_file = pdf_bytes

    files = {'document': ('Rapport_Audit_Premium.pdf', pdf_file, 'application/pdf')}
    data = {
        'chat_id': chat_id,
        'caption': "🚀 *DÉMONSTRATION PREMIUM : Rapport d'Audit Desksuite*\n\nVoici le rendu final du nouveau moteur de reporting (Jinja2 + WeasyPrint) avec correction de vision activée.",
        'parse_mode': 'Markdown'
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, data=data, files=files, timeout=60.0)
        return resp.json()

async def main():
    # 1. Données de Test (Dummy)
    test_data = ReportRequest(
        tenant_name="Demo Entreprise Pro",
        period="Mars 2024 (Audit Spécial)",
        expenses=[
            ExpenseItem(date="2024-03-01", vendor="Station Service Shell", category="Transport", amount=45500.0, amount_vat=8190.0),
            ExpenseItem(date="2024-03-05", vendor="Supermarché Erevan", category="Fournitures", amount=125000.0, amount_vat=22500.0),
            ExpenseItem(date="2024-03-12", vendor="Restaurant Le Privé", category="Repas", amount=35000.0, amount_vat=6300.0),
            ExpenseItem(date="2024-03-18", vendor="Canal+ Benin", category="Abonnement", amount=15000.0, amount_vat=2700.0),
        ]
    )
    
    # 2. Générer le PDF Premium
    logger.info("Génération du rapport Premium pour Telegram...")
    pdf_bytes = generate_premium_report(test_data)
    
    if not pdf_bytes:
        print("Erreur : PDF non généré.")
        return

    # 3. Envoyer via Telegram
    # On utilise les credentials trouvés dans le .env
    token = "8674436555:AAE7hX_wxLr_CpXR6yfrdfujiIbuKYeuVFI"
    chat_id = "6171095816"
    
    logger.info(f"Envoi au Chat ID {chat_id}...")
    result = await send_to_telegram(pdf_bytes, token, chat_id)
    
    if result.get("ok"):
        print("✅ Rapport Premium envoyé avec succès sur Telegram !")
    else:
        print(f"❌ Erreur Telegram : {result}")

if __name__ == "__main__":
    asyncio.run(main())
