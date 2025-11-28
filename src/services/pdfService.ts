import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  proName: string;
  proAddress: string;
  proEmail: string;
  proPhone: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  amount: number;
  transactionId: string;
  logoUrl?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor: [number, number, number] = [139, 43, 184]; // Purple
  const textColor: [number, number, number] = [51, 51, 51];
  
  let yPos = 20;

  // Header with logo
  if (data.logoUrl) {
    try {
      // In a real implementation, you'd fetch and convert the image
      // For now, we'll just add a placeholder
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.text('PAWTES', 20, yPos);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  }
  
  yPos += 15;
  
  // Invoice title
  doc.setFontSize(20);
  doc.setTextColor(...textColor);
  doc.text('FACTURE', 20, yPos);
  
  yPos += 10;
  
  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Numéro: ${data.invoiceNumber}`, 20, yPos);
  doc.text(`Date: ${data.date}`, 20, yPos + 5);
  
  yPos += 20;
  
  // Professional info
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text('Prestataire', 20, yPos);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(data.proName, 20, yPos + 6);
  doc.text(data.proAddress, 20, yPos + 11);
  doc.text(data.proEmail, 20, yPos + 16);
  doc.text(data.proPhone, 20, yPos + 21);
  
  // Client info
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text('Client', 120, yPos);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(data.clientName, 120, yPos + 6);
  doc.text(data.clientEmail, 120, yPos + 11);
  
  yPos += 40;
  
  // Service details table
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, 170, 10, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text('Description', 25, yPos + 6);
  doc.text('Montant', 160, yPos + 6);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.text(data.serviceName, 25, yPos);
  doc.text(`${data.amount.toFixed(2)} €`, 160, yPos);
  
  yPos += 15;
  
  // Total
  doc.setFillColor(...primaryColor);
  doc.rect(20, yPos, 170, 12, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL TTC', 25, yPos + 8);
  doc.text(`${data.amount.toFixed(2)} €`, 160, yPos + 8);
  
  yPos += 25;
  
  // Transaction ID
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`ID Transaction: ${data.transactionId}`, 20, yPos);
  
  // Generate QR code with transaction details
  try {
    const qrData = JSON.stringify({
      invoice: data.invoiceNumber,
      amount: data.amount,
      transaction: data.transactionId,
    });
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
    });
    
    doc.addImage(qrCodeDataUrl, 'PNG', 150, yPos + 10, 40, 40);
    
    doc.setFontSize(8);
    doc.text('Scanner pour vérifier', 155, yPos + 55);
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
  
  // Footer
  yPos = 270;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Pawtes - Plateforme de services canins', 105, yPos, { align: 'center' });
  doc.text('contact@pawtes.app - www.pawtes.app', 105, yPos + 5, { align: 'center' });
  
  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
