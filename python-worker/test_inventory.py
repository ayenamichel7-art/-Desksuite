import json
from services import InventoryReportRequest, ProductItem, generate_inventory_valuation_report, generate_product_labels

def test_inventory_world_class():
    print("🚀 [Test] Lancement de l'Audit d'Inventaire World Class...")
    
    # Simulation de données d'inventaire
    products = [
        ProductItem(id="P-001", name="Ordinateur HP EliteBook", category="IT", stock=2, min_stock=5, buy_price=450000, sell_price=600000),
        ProductItem(id="P-002", name="Souris Logitech MX", category="Accessoires", stock=45, min_stock=10, buy_price=15000, sell_price=35000),
        ProductItem(id="P-003", name="Imprimante Laserjet B210", category="IT", stock=150, min_stock=20, buy_price=85000, sell_price=120000),
        ProductItem(id="P-004", name="Papier A4 (Rame)", category="Fourniture", stock=1, min_stock=10, buy_price=2500, sell_price=4500, expiry_date="2026-04-15"),
    ]
    
    request = InventoryReportRequest(tenant_name="Benin Tech Hub", products=products)
    
    # 1. Génération du Rapport de Valorisation
    print("📊 Génération du rapport de valorisation...")
    pdf_valuation = generate_inventory_valuation_report(request)
    if pdf_valuation:
        with open("test_valuation_report.pdf", "wb") as f:
            f.write(pdf_valuation)
        print("✅ Rapport de valorisation généré : test_valuation_report.pdf")
    
    # 2. Génération des Étiquettes
    print("🏷️ Génération des étiquettes QR...")
    pdf_labels = generate_product_labels(products)
    if pdf_labels:
        with open("test_product_labels.pdf", "wb") as f:
            f.write(pdf_labels)
        print("✅ Étiquettes QR générées : test_product_labels.pdf")

if __name__ == "__main__":
    test_inventory_world_class()
