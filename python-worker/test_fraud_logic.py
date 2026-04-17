import sys
import os
from datetime import datetime, timedelta

# Add current path to import services
sys.path.append(os.getcwd())
from services import detect_invoice_fraud

def run_fraud_tests():
    print("🚦 [Audit Security] Test du moteur de détection de fraude...\n")
    
    scenarios = [
        {
            "name": "Facture Normale (Saine)",
            "text": "Facture Restaurant Le Gourmet, Cotonou. Repas d'affaires. Total 25000 CFA. TVA 3813 CFA.",
            "total": 25000,
            "tva": 3813,
            "date": datetime.now().strftime("%Y-%m-%d")
        },
        {
            "name": "Erreur Arithmétique (TVA incohérente)",
            "text": "Facture Boutique Mode. Total 100000 CFA. TVA 5000 CFA.", # 18% of (100k-5k) = 17100
            "total": 100000,
            "tva": 5000,
            "date": datetime.now().strftime("%Y-%m-%d")
        },
        {
            "name": "Montant Exorbitant (Alerte Vigilance)",
            "text": "Achat Matériel Industriel. Total 5500000 CFA.",
            "total": 5500000,
            "tva": 0,
            "date": datetime.now().strftime("%Y-%m-%d")
        },
        {
            "name": "Document dans le Futur",
            "text": "Service Maintenance.",
            "total": 15000,
            "tva": 0,
            "date": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        },
        {
            "name": "Document Suspicieux (Mots-clés)",
            "text": "Ceci est un document de TEST PROFORMA CANCELLED.",
            "total": 12000,
            "tva": 0,
            "date": datetime.now().strftime("%Y-%m-%d")
        }
    ]

    for s in scenarios:
        print(f"--- Scenario: {s['name']} ---")
        report = detect_invoice_fraud(s['text'], s['total'], s['tva'], s['date'])
        
        status = "🚨 SUSPECT" if report['is_suspicious'] else "✅ VALIDE"
        print(f"Status: {status} (Score: {report['risk_score']}/100)")
        
        if report['flags']:
            print("Flags:")
            for flag in report['flags']:
                print(f"  [{flag['severity']}] {flag['message']}")
        else:
            print("  Aucune anomalie détectée.")
        print("-" * 40)

if __name__ == "__main__":
    run_fraud_tests()
