from weasyprint import HTML
import io

try:
    html = "<h1>Test Desksuite</h1>"
    pdf = HTML(string=html).write_pdf()
    print(f"Succès ! PDF généré ({len(pdf)} octets)")
except Exception as e:
    print(f"Erreur WeasyPrint : {e}")
