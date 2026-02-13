
from fpdf import FPDF
import os
from datetime import datetime

class ReceiptPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'BUSWAY PRO - OFFICIAL FEE RECEIPT', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()} | Generated on {datetime.now().strftime("%Y-%m-%d %H:%M")}', 0, 0, 'C')

def generate_receipt_pdf(payment_data: dict, student_data: dict, due_data: dict):
    pdf = ReceiptPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Receipt Info
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, f"Receipt No: {payment_data['id']}", 0, 1)
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, f"Date: {payment_data['date']}", 0, 1)
    pdf.ln(5)

    # Student Info
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(0, 10, " STUDENT INFORMATION", 1, 1, 'L', True)
    pdf.cell(95, 10, f"Name: {student_data['name']}", 1)
    pdf.cell(95, 10, f"Admission No: {student_data['admission_no']}", 1, 1)
    pdf.cell(95, 10, f"Class: {student_data['class']}", 1)
    pdf.cell(95, 10, f"Route: {student_data['route']}", 1, 1)
    pdf.ln(5)

    # Fee Details
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(0, 10, " PAYMENT DETAILS", 1, 1, 'L', True)
    pdf.cell(140, 10, f"Description: Bus Fee for {due_data['month']} {due_data['year']}", 1)
    pdf.cell(50, 10, f"Amount: INR {due_data['base_fee']}", 1, 1, 'R')
    
    if due_data['late_fee'] > 0:
        pdf.cell(140, 10, "Late Fee", 1)
        pdf.cell(50, 10, f"INR {due_data['late_fee']}", 1, 1, 'R')
    
    if due_data['discount'] > 0:
        pdf.cell(140, 10, "Discount Applied", 1)
        pdf.cell(50, 10, f"- INR {due_data['discount']}", 1, 1, 'R')

    pdf.set_font("Arial", 'B', 12)
    pdf.cell(140, 10, "TOTAL PAID", 1)
    pdf.cell(50, 10, f"INR {payment_data['amount']}", 1, 1, 'R')

    pdf.ln(20)
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(0, 10, "This is a computer generated receipt and does not require a physical signature.", 0, 1, 'C')

    file_path = f"receipts/receipt_{payment_data['id']}.pdf"
    os.makedirs("receipts", exist_ok=True)
    pdf.output(file_path)
    return file_path
