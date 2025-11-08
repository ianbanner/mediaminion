import React from 'react';

// This function will handle inline markdown like bold, italic, and links.
const renderInlineMarkdown = (line: string): string => {
    return line
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Special Substack underlined links
        .replace(/\[\[([^\]]+)\]\{.underline\}\]\(([^)]+)\)/g, '<a href="$2" style="text-decoration:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        // Standard links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const createMarkup = () => {
        if (!content) return { __html: '' };

        const lines = content.split('\n');
        const htmlElements: string[] = [];
        let inUnorderedList = false;
        let inOrderedList = false;

        lines.forEach(line => {
            const isUnordered = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            const isOrdered = line.trim().match(/^\d+\.\s/);

            // Close ordered list if we are in one and the new line is not ordered
            if (inOrderedList && !isOrdered) {
                htmlElements.push('</ol>');
                inOrderedList = false;
            }
            // Close unordered list if we are in one and the new line is not unordered
            if (inUnorderedList && !isUnordered) {
                htmlElements.push('</ul>');
                inUnorderedList = false;
            }

            // Process the line
            if (line.startsWith('# ')) {
                htmlElements.push(`<h1>${renderInlineMarkdown(line.substring(2))}</h1>`);
            } else if (line.startsWith('## ')) {
                htmlElements.push(`<h2>${renderInlineMarkdown(line.substring(3))}</h2>`);
            } else if (line.startsWith('### ')) {
                htmlElements.push(`<h3>${renderInlineMarkdown(line.substring(4))}</h3>`);
            } else if (isUnordered) {
                if (!inUnorderedList) {
                    htmlElements.push('<ul>');
                    inUnorderedList = true;
                }
                htmlElements.push(`<li>${renderInlineMarkdown(line.trim().substring(2))}</li>`);
            } else if (isOrdered) {
                if (!inOrderedList) {
                    htmlElements.push('<ol>');
                    inOrderedList = true;
                }
                htmlElements.push(`<li>${renderInlineMarkdown(line.trim().replace(/^\d+\.\s/, ''))}</li>`);
            } else if (line.trim() === '---') {
                htmlElements.push('<hr />');
            } else if (line.trim() !== '') {
                htmlElements.push(`<p>${renderInlineMarkdown(line)}</p>`);
            }
            // empty lines are ignored, which helps create paragraph breaks naturally
        });

        // Close any open lists at the end
        if (inUnorderedList) htmlElements.push('</ul>');
        if (inOrderedList) htmlElements.push('</ol>');

        return { __html: htmlElements.join('') };
    };

    return <div dangerouslySetInnerHTML={createMarkup()} />;
};

export default MarkdownRenderer;
