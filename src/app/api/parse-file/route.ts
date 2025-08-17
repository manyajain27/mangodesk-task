import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const fileExtension = path.extname(originalName).toLowerCase();

    // Create temp file path
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${originalName}`);

    let extractedText = '';

    try {
      // Write file to temp location
      await writeFile(tempFilePath, buffer);

      switch (fileExtension) {
        case '.txt':
          extractedText = buffer.toString('utf-8');
          break;

        case '.pdf':
          try {
            const pdfParse = require('pdf-parse');
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text;
          } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF with extractable text.');
          }
          break;

        case '.docx':
          const mammoth = (await import('mammoth')).default;
          const docxResult = await mammoth.extractRawText({ buffer });
          extractedText = docxResult.value;
          break;

        default:
          return NextResponse.json(
            { error: 'Unsupported file type. Please upload TXT, PDF, or DOCX files.' },
            { status: 400 }
          );
      }

      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        await unlink(tempFilePath);
      }

      // Validate extracted text
      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          { error: 'No text could be extracted from the file' },
          { status: 400 }
        );
      }

      // Clean up the text (remove extra whitespace, normalize line breaks)
      const cleanedText = extractedText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      return NextResponse.json({
        text: cleanedText,
        filename: originalName,
        fileType: fileExtension,
        length: cleanedText.length
      });

    } catch (fileError) {
      // Clean up temp file on error
      if (fs.existsSync(tempFilePath)) {
        await unlink(tempFilePath);
      }
      throw fileError;
    }

  } catch (error) {
    console.error('Error parsing file:', error);
    return NextResponse.json(
      { error: 'Failed to parse file: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}