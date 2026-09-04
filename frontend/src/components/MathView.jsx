import React from 'react';
import katex from 'katex';

/**
 * Converts common ASCII algorithm complexity & formula strings into LaTeX syntax.
 */

export function asciiToLatex(mathStr) {
  if (!mathStr) return '';
  let str = mathStr.trim();

  // If already contains LaTeX math wrappers
  if (str.startsWith('\\') || str.includes('\\frac')) {
    return str;
  }

  // Symbol replacements
  str = str.replace(/Ω/g, '\\Omega ');
  str = str.replace(/Θ/g, '\\Theta ');
  str = str.replace(/Omega/gi, '\\Omega ');
  str = str.replace(/Theta/gi, '\\Theta ');
  str = str.replace(/N²/g, 'N^2');
  str = str.replace(/N³/g, 'N^3');
  str = str.replace(/log_2/g, '\\log_2 ');
  str = str.replace(/log2/g, '\\log_2 ');
  str = str.replace(/log N/g, '\\log N');
  str = str.replace(/\blog\b/g, '\\log ');

  // Fractional formulas e.g. N*(N-1)/2 -> \frac{N(N-1)}{2}
  str = str.replace(/([A-Za-z0-9_*()+-]+)\/([0-9]+)/g, '\\frac{$1}{$2}');

  // Multiplication symbol * -> \cdot
  str = str.replace(/\*/g, ' \\cdot ');

  return str;
}

export default function MathView({ math, displayMode = false, className = '' }) {
  if (!math) return null;

  const latex = asciiToLatex(math);

  try {
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });

    return (
      <span
        className={`inline-block align-middle ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (err) {
    return <span className={`font-mono ${className}`}>{math}</span>;
  }
}
