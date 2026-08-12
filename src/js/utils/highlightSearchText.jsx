import React from 'react';

/**
 * Highlights matching search text in a given string
 * @param {string} text - The text to search in
 * @param {string} searchText - The search term(s) to highlight
 * @returns {React.ReactNode} - Text with highlighted portions or plain text
 */
function highlightSearchText (text, searchText) {
  if (!text || !searchText || typeof text !== 'string' || searchText.trim().length === 0) {
    return text;
  }

  const textStr = String(text);
  // Split search text by whitespace and filter out empty tokens
  const searchWords = searchText.trim().split(/\s+/).filter(Boolean);

  if (searchWords.length === 0) {
    return text;
  }

  // Escape special regex characters in each search word
  const escapedWords = searchWords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = escapedWords.join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');

  const parts = textStr.split(regex);

  return parts.map((part, index) => {
    if (part && searchWords.some((word) => word.toLowerCase() === part.toLowerCase())) {
      return (
        <mark key={index} style={{ backgroundColor: '#FFEB3B', padding: '0 1px', borderRadius: '2px' }}>
          {part}
        </mark>
      );
    }
    return part;
  });
}

export default highlightSearchText;

