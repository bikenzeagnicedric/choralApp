import jsPDF from "jspdf";
import { Mass, MassSong } from "@/types";

export async function exportToPDF(mass: Mass, massSongs: MassSong[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(mass.name, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date(mass.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(dateStr, pageWidth / 2, yPosition, { align: "center" });

  yPosition += 15;
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Songs
  massSongs.forEach((massSong, index) => {
    const song = massSong.song;
    if (!song) return;

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    // Song number and title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${song.title}`, margin, yPosition);
    yPosition += 7;

    // Category and key
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    let metadata = [];
    if (massSong.liturgical_moment) metadata.push(massSong.liturgical_moment);
    if (song.key) metadata.push(song.key);
    if (metadata.length > 0) {
      doc.text(metadata.join(" • "), margin, yPosition);
      yPosition += 7;
    }

    // Lyrics
    if (song.lyrics_structure && massSong.selected_parts) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      massSong.selected_parts.forEach((partIndex) => {
        const part = song.lyrics_structure?.[partIndex];
        if (!part) return;

        // Check page break
        if (yPosition > 260) {
          doc.addPage();
          yPosition = margin;
        }

        // Part label
        doc.setFont("helvetica", "bold");
        const partLabel = part.type === "chorus" ? "Refrain" : `Couplet ${part.label}`;
        doc.text(partLabel, margin + 5, yPosition);
        yPosition += 5;

        // Part content
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(part.content, pageWidth - margin * 2 - 10);
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 10, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      });
    }

    yPosition += 5;
  });

  // Save
  const filename = `${mass.name.replace(/\s+/g, "_")}_${mass.date}.pdf`;
  doc.save(filename);
}
