import { Note, Flashcard, FlashcardSet } from '../store/useStore';

/**
 * Download a note as a Markdown file
 */
export function downloadNoteAsMarkdown(note: Note) {
  // Convert HTML content to basic markdown
  const content = htmlToMarkdown(note.content);

  const markdown = `# ${note.title}

${note.description ? `> ${note.description}\n\n` : ''}${content}

---
Created: ${new Date(note.createdAt).toLocaleString()}
Updated: ${new Date(note.updatedAt).toLocaleString()}
Tags: ${note.tags.join(', ') || 'None'}
`;

  downloadFile(markdown, `${sanitizeFilename(note.title)}.md`, 'text/markdown');
}

/**
 * Download a note as JSON
 */
export function downloadNoteAsJSON(note: Note) {
  const json = JSON.stringify(note, null, 2);
  downloadFile(json, `${sanitizeFilename(note.title)}.json`, 'application/json');
}

/**
 * Download flashcard set as JSON
 */
export function downloadFlashcardsAsJSON(set: FlashcardSet, noteTitle: string) {
  const json = JSON.stringify(set, null, 2);
  downloadFile(json, `${sanitizeFilename(noteTitle)}-flashcards.json`, 'application/json');
}

/**
 * Download flashcard set as CSV
 */
export function downloadFlashcardsAsCSV(cards: Flashcard[], noteTitle: string) {
  const csvHeader = 'Front,Back,Mastered\n';
  const csvRows = cards.map(card => {
    const front = escapeCsvField(card.front);
    const back = escapeCsvField(card.back);
    const mastered = card.mastered ? 'Yes' : 'No';
    return `${front},${back},${mastered}`;
  }).join('\n');

  const csv = csvHeader + csvRows;
  downloadFile(csv, `${sanitizeFilename(noteTitle)}-flashcards.csv`, 'text/csv');
}

/**
 * Download all notes as a ZIP (using JSON format)
 */
export function downloadAllNotesAsJSON(notes: Note[]) {
  const json = JSON.stringify(notes, null, 2);
  downloadFile(json, `sprintnotes-export-${Date.now()}.json`, 'application/json');
}

/**
 * Convert simple HTML to Markdown
 */
function htmlToMarkdown(html: string): string {
  let text = html;

  // Remove HTML tags and convert to markdown
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  text = text.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n');
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  text = text.replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n');
  text = text.replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n');
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<hr\s*\/?>/gi, '\n---\n');
  text = text.replace(/<[^>]+>/g, ''); // Remove remaining HTML tags

  // Clean up extra newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .substring(0, 50);
}

/**
 * Escape CSV field
 */
function escapeCsvField(field: string): string {
  // Remove HTML tags
  let cleaned = field.replace(/<[^>]+>/g, '');

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (cleaned.includes(',') || cleaned.includes('"') || cleaned.includes('\n')) {
    cleaned = `"${cleaned.replace(/"/g, '""')}"`;
  }

  return cleaned;
}

/**
 * Trigger file download in browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
