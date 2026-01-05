import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from "docx";
import { saveAs } from "file-saver";
import { Mass, MassSong } from "@/types";

export async function exportToDOCX(mass: Mass, massSongs: MassSong[]) {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: mass.name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Date
  const dateStr = new Date(mass.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  children.push(
    new Paragraph({
      text: dateStr,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Songs
  massSongs.forEach((massSong, index) => {
    const song = massSong.song;
    if (!song) return;

    // Song title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${song.title}`,
            bold: true,
            size: 28,
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    // Metadata
    let metadata = [];
    if (massSong.liturgical_moment) metadata.push(massSong.liturgical_moment);
    if (song.key) metadata.push(song.key);
    if (metadata.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: metadata.join(" • "),
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 150 },
        })
      );
    }

    // Lyrics
    if (song.lyrics_structure && massSong.selected_parts) {
      massSong.selected_parts.forEach((partIndex) => {
        const part = song.lyrics_structure?.[partIndex];
        if (!part) return;

        // Part label
        const partLabel = part.type === "chorus" ? "Refrain" : `Couplet ${part.label}`;
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: partLabel,
                bold: true,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
            spacing: { before: 150, after: 100 },
          })
        );

        // Part content
        const lines = part.content.split("\n");
        lines.forEach((line) => {
          children.push(
            new Paragraph({
              text: line,
              indent: { left: 400 },
              spacing: { after: 100 },
            })
          );
        });
      });
    }

    // Separator
    children.push(
      new Paragraph({
        text: "",
        spacing: { after: 200 },
      })
    );
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const filename = `${mass.name.replace(/\s+/g, "_")}_${mass.date}.docx`;
  saveAs(blob, filename);
}
