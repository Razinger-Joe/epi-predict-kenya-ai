import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export a DOM element (e.g. analytics dashboard section) to a PDF.
 * Falls back to a text-only summary if html2canvas fails.
 */
export async function exportElementToPdf(
    elementId: string,
    filename = "EpiPredict_Report.pdf"
): Promise<void> {
    const element = document.getElementById(elementId);

    if (!element) {
        console.warn(`Element #${elementId} not found — generating text-only PDF`);
        generateFallbackPdf(filename);
        return;
    }

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 20; // 10mm margin each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Header
        pdf.setFontSize(18);
        pdf.setTextColor(22, 101, 52); // Kenya green
        pdf.text("EpiPredict Kenya — Analytics Report", 10, 15);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Generated: ${new Date().toLocaleString("en-KE")}`, 10, 22);

        // Chart image
        pdf.addImage(imgData, "PNG", 10, 28, imgWidth, imgHeight);

        pdf.save(filename);
    } catch {
        console.warn("html2canvas failed, generating fallback PDF");
        generateFallbackPdf(filename);
    }
}

/** Simple text-based PDF fallback */
function generateFallbackPdf(filename: string) {
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.setFontSize(20);
    pdf.setTextColor(22, 101, 52);
    pdf.text("EpiPredict Kenya — Analytics Report", 10, 20);

    pdf.setFontSize(11);
    pdf.setTextColor(50);
    pdf.text(`Report Date: ${new Date().toLocaleString("en-KE")}`, 10, 32);

    const lines = [
        "Disease Surveillance Summary",
        "",
        "• Active monitoring across 47 Kenyan counties",
        "• ML-powered predictions: 14-21 day forecast window",
        "• Risk levels: High, Medium, Low classification",
        "• Data sources: DHIS2, clinic reports, social signals",
        "",
        "For detailed analytics, please visit the dashboard at:",
        "https://epi-predict-kenya-ai.vercel.app/dashboard/analytics",
    ];

    let y = 44;
    for (const line of lines) {
        pdf.text(line, 10, y);
        y += 7;
    }

    pdf.save(filename);
}
