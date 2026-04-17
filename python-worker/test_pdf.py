from fpdf import FPDF
from datetime import datetime

def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def generate_branded_pdf(client_name, amount, brand_name, primary_hex, secondary_hex, is_invoice=True):
    pdf = FPDF()
    pdf.add_page()
    
    p_rgb = hex_to_rgb(primary_hex)
    s_rgb = hex_to_rgb(secondary_hex)

    # Header de la marque
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(*p_rgb)
    pdf.cell(0, 15, brand_name.upper(), ln=True, align="C")
    
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, "Audit de performance & Solutions Cloud", ln=True, align="C")
    pdf.ln(10)
    
    # Ligne de séparation colorée
    pdf.set_draw_color(*s_rgb)
    pdf.set_line_width(0.8)
    pdf.line(10, 42, 200, 42)
    pdf.ln(15)

    # Info Doc
    title_str = "FACTURE" if is_invoice else "DEVIS"
    pdf.set_text_color(*p_rgb)
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 10, title_str, ln=True)
    
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 8, f"Date: {datetime.now().strftime('%d/%m/%Y')}", ln=True)
    pdf.cell(100, 8, f"Référence: INV-2026-001", ln=0)
    pdf.cell(0, 8, f"Client: {client_name}", ln=1)
    pdf.ln(15)

    # Table Header
    pdf.set_fill_color(*p_rgb)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(140, 12, "Services Desksuite", 1, 0, "L", fill=True)
    pdf.cell(50, 12, "Total H.T.", 1, 1, "R", fill=True)

    # Content Row
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(140, 18, f"Déploiement instance {brand_name} (Cloud + SaaS)", 1, 0, "L")
    
    pdf.set_text_color(*s_rgb)
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(50, 18, f"{amount:,.2f} EUR", 1, 1, "R")
    
    pdf.ln(25)
    
    # Footer
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(0, 10, "Conditions de règlement : Paiement immédiat.", ln=True)
    
    pdf.set_y(-20)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(200, 200, 200)
    pdf.cell(0, 10, f"Généré par Desksuite pour {brand_name}", align="C")

    filename = "resultat_exercice_senior.pdf"
    pdf.output(filename)
    print(f"PDF généré avec succès : {filename}")

# TEST EXERCICE
generate_branded_pdf(
    "Jean Dupont", 
    2500.00, 
    "MA MARQUE PRO", 
    "#e11d48", # Rose vibrant (Primary)
    "#fbbf24", # Ambre (Secondary)
    True
)
