import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up pdf.js worker using reliable CDN with version sync
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  // Use unpkg or cdnjs corresponding to installed pdfjs-dist version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

/**
 * Result of parsing a document file (PDF, DOCX, TXT, MD, RTF)
 */
export interface ParsedDocumentResult {
  text: string;
  wordCount: number;
  fileType: string;
  error?: string;
}

/**
 * Strips RTF control codes and groups from raw RTF text
 */
function cleanRtfText(rtf: string): string {
  // Remove binary data / hex escapes
  let text = rtf.replace(/\\'[0-9a-fA-F]{2}/g, ' ');
  // Remove RTF control words: \word or \word123
  text = text.replace(/\\[a-zA-Z]+(-?\d+)? ?/g, ' ');
  // Remove curly brackets
  text = text.replace(/[{}]/g, ' ');
  // Collapse whitespace
  return text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();
}

/**
 * Fallback raw text extractor for PDF if pdfjs encounters an error or network block
 */
function fallbackPdfTextExtractor(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    let raw = '';
    // Sample ASCII characters
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
        raw += String.fromCharCode(b);
      } else {
        raw += ' ';
      }
    }

    // Extract text in parentheses (PDF string literals: (Text here))
    const textTokens: string[] = [];
    const parenRegex = /\(([^()]{2,})\)/g;
    let match;
    while ((match = parenRegex.exec(raw)) !== null) {
      const str = match[1].trim();
      // Filter out PDF internal metadata / font definitions
      if (str.length > 2 && !str.startsWith('/') && !str.includes('Font') && !str.includes('Length')) {
        textTokens.push(str);
      }
    }

    if (textTokens.length > 5) {
      return textTokens.join(' ');
    }
  } catch (err) {
    console.warn('Fallback PDF extractor failed', err);
  }
  return '';
}

/**
 * Cleans extracted text: removes non-printable bytes, normalizes whitespace and line breaks
 */
export function sanitizeExtractedText(raw: string): string {
  if (!raw) return '';

  return raw
    // Remove null bytes and non-printable control characters (except newline, tab, carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace Unicode replacement characters
    .replace(/\uFFFD/g, '')
    // Normalize unicode spaces
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove lines that are just strange artifacts
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      // Filter out raw PDF bytecode remnants like '1 0 obj', 'endobj', 'stream', 'xref'
      if (/^(%PDF|\d+ \d+ obj|endobj|stream|endstream|xref|trailer|startxref)/i.test(line)) {
        return false;
      }
      return true;
    })
    .join('\n')
    // Collapse 3+ consecutive newlines to double newline
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Primary document parsing entry point.
 * Accurately parses PDF, DOCX, DOC, TXT, MD, RTF into clean plain text.
 */
export async function parseResumeFile(file: File): Promise<ParsedDocumentResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileType = file.type || extension;

  try {
    // 1. PDF File Handling
    if (extension === 'pdf' || fileType.includes('pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true,
          disableFontFace: true,
        });
        const pdf = await loadingTask.promise;
        const pageTextPromises: Promise<string>[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          pageTextPromises.push(
            pdf.getPage(i).then(async (page) => {
              const textContent = await page.getTextContent();
              let lastY: number | null = null;
              let pageText = '';

              for (const item of textContent.items) {
                if ('str' in item) {
                  // Check if item is on a new line based on transform Y position
                  const itemY = (item as any).transform?.[5];
                  if (lastY !== null && itemY !== undefined && Math.abs(itemY - lastY) > 6) {
                    pageText += '\n';
                  } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
                    pageText += ' ';
                  }
                  pageText += item.str;
                  lastY = itemY ?? lastY;
                }
              }
              return pageText;
            })
          );
        }

        const pages = await Promise.all(pageTextPromises);
        let combined = pages.join('\n\n');
        combined = sanitizeExtractedText(combined);

        if (combined.length > 20) {
          const words = combined.split(/\s+/).filter(Boolean).length;
          return {
            text: combined,
            wordCount: words,
            fileType: 'PDF Document',
          };
        }
      } catch (pdfErr) {
        console.warn('pdfjs-dist extraction issue, trying fallback parser:', pdfErr);
        const fallbackText = fallbackPdfTextExtractor(arrayBuffer);
        if (fallbackText && fallbackText.length > 30) {
          const cleaned = sanitizeExtractedText(fallbackText);
          return {
            text: cleaned,
            wordCount: cleaned.split(/\s+/).filter(Boolean).length,
            fileType: 'PDF Document (Text Layer)',
          };
        }
        throw new Error('Unable to extract text from this PDF. It may be a scanned image without a text layer.');
      }
    }

    // 2. DOCX File Handling (Microsoft Word)
    if (extension === 'docx' || fileType.includes('wordprocessingml')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const cleaned = sanitizeExtractedText(result.value || '');
      const words = cleaned.split(/\s+/).filter(Boolean).length;
      return {
        text: cleaned,
        wordCount: words,
        fileType: 'Word Document (.docx)',
      };
    }

    // 3. RTF File Handling
    if (extension === 'rtf' || fileType.includes('rtf')) {
      const raw = await file.text();
      const cleaned = sanitizeExtractedText(cleanRtfText(raw));
      return {
        text: cleaned,
        wordCount: cleaned.split(/\s+/).filter(Boolean).length,
        fileType: 'Rich Text Format (.rtf)',
      };
    }

    // 4. Plain Text / Markdown / HTML / Generic
    const raw = await file.text();
    // Quick check if user renamed a binary PDF or ZIP/DOCX as .txt
    if (raw.startsWith('%PDF-') || raw.startsWith('PK\x03\x04')) {
      return {
        text: '',
        wordCount: 0,
        fileType: 'Corrupted File',
        error: 'This file appears to be a binary format renamed to text. Please upload the original .pdf or .docx.',
      };
    }

    const cleaned = sanitizeExtractedText(raw);
    const words = cleaned.split(/\s+/).filter(Boolean).length;
    return {
      text: cleaned,
      wordCount: words,
      fileType: extension.toUpperCase() || 'Text Document',
    };
  } catch (err: any) {
    console.error('File parsing error:', err);
    return {
      text: '',
      wordCount: 0,
      fileType: extension.toUpperCase() || 'Unknown',
      error: err.message || 'Failed to parse file text.',
    };
  }
}
