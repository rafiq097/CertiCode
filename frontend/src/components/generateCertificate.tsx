import jsPDF from "jspdf";

const generateCertificate = (
  userName: string,
  quizType: string,
  score: number
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const leftSign = ["Alice Johnson", "Michael Smith", "Sarah Lee", "David Carter"][
    Math.floor(Math.random() * 4)
  ];
  const rightSign = ["Emily Brown", "James Wilson", "Olivia Taylor", "Robert Martinez"][
    Math.floor(Math.random() * 4)
  ];

  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.text("CERTICODE", 148.5, 35, { align: "center" });

  doc.setFontSize(28);
  doc.text("Certificate of Achievement", 148.5, 60, { align: "center" });

  doc.setFontSize(18);
  doc.setFont("times", "normal");
  doc.text("This is proudly presented to", 148.5, 80, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.text(userName, 148.5, 95, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(16);
  doc.text(
    `For successfully completing the ${quizType.toUpperCase()} Quiz with a score of ${score}%`,
    148.5,
    110,
    { align: "center", maxWidth: 250 }
  );

  const date = new Date().toLocaleDateString();
  doc.setFontSize(14);
  doc.text(`Issued on: ${date}`, 148.5, 125, { align: "center" });

  const borderMargin = 20;
  const lineWidth = 50;
  const yLine = 170;

  doc.setLineWidth(0.5);
  doc.line(borderMargin, yLine, borderMargin + lineWidth, yLine);

  doc.line(297 - borderMargin - lineWidth, yLine, 297 - borderMargin, yLine);

  doc.setFontSize(12);
  doc.setFont("times", "italic");
  doc.text(leftSign, borderMargin + lineWidth / 2, yLine + 8, { align: "center" });
  doc.text(rightSign, 297 - borderMargin - lineWidth / 2, yLine + 8, { align: "center" });

  doc.setFont("times", "normal");
  doc.text("Instructor", borderMargin + lineWidth / 2, yLine + 15, { align: "center" });
  doc.text("Director", 297 - borderMargin - lineWidth / 2, yLine + 15, { align: "center" });

  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);

  doc.save(`certificate-${userName}.pdf`);
};

export default generateCertificate;
