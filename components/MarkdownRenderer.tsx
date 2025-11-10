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

        const closeOpenLists = () => {
            if (inUnorderedList) {
                htmlElements.push('</ul>');
                inUnorderedList = false;
            }
            if (inOrderedList) {
                htmlElements.push('</ol>');
                inOrderedList = false;
            }
        };

        lines.forEach(line => {
            let currentLine = line.trim();
            
            // Handle horizontal rules, which might be on a line with other content.
            if (currentLine.startsWith('---') || currentLine.startsWith('***') || currentLine.startsWith('___')) {
                closeOpenLists();
                htmlElements.push('<hr />');
                currentLine = currentLine.replace(/^(-{3,}|\*{3,}|_{3,})\s*/, '').trim();
                // If there was nothing else on the line, we're done with this line.
                if (currentLine === '') {
                    return;
                }
            }

            const isUnordered = currentLine.startsWith('- ') || currentLine.startsWith('* ');
            const isOrdered = currentLine.match(/^\d+\.\s/);
            const isImagePlaceholder = currentLine.match(/^\[(Image placement:.*?)\]$/);

            // Close lists if the current line is not a list item of the same type.
            if (inUnorderedList && !isUnordered) {
                htmlElements.push('</ul>');
                inUnorderedList = false;
            }
            if (inOrderedList && !isOrdered) {
                htmlElements.push('</ol>');
                inOrderedList = false;
            }

            // Process the line
            if (currentLine.startsWith('# ')) {
                closeOpenLists();
                htmlElements.push(`<h1>${renderInlineMarkdown(currentLine.substring(2))}</h1>`);
            } else if (currentLine.startsWith('## ')) {
                closeOpenLists();
                htmlElements.push(`<h2>${renderInlineMarkdown(currentLine.substring(3))}</h2>`);
            } else if (currentLine.startsWith('### ')) {
                closeOpenLists();
                htmlElements.push(`<h3>${renderInlineMarkdown(currentLine.substring(4))}</h3>`);
            } else if (currentLine.startsWith('#### ')) {
                closeOpenLists();
                htmlElements.push(`<h4>${renderInlineMarkdown(currentLine.substring(5))}</h4>`);
            } else if (currentLine.startsWith('##### ')) {
                closeOpenLists();
                htmlElements.push(`<h5>${renderInlineMarkdown(currentLine.substring(6))}</h5>`);
            } else if (currentLine.startsWith('###### ')) {
                closeOpenLists();
                htmlElements.push(`<h6>${renderInlineMarkdown(currentLine.substring(7))}</h6>`);
            } else if (isUnordered) {
                if (!inUnorderedList) {
                    htmlElements.push('<ul>');
                    inUnorderedList = true;
                }
                htmlElements.push(`<li>${renderInlineMarkdown(currentLine.substring(2))}</li>`);
            } else if (isOrdered) {
                if (!inOrderedList) {
                    htmlElements.push('<ol>');
                    inOrderedList = true;
                }
                htmlElements.push(`<li>${renderInlineMarkdown(currentLine.replace(/^\d+\.\s/, ''))}</li>`);
            } else if (isImagePlaceholder) {
                closeOpenLists();
                htmlElements.push(`<div style="padding: 1rem; border: 1px dashed #4A5568; background-color: #2D3748; color: #A0AEC0; font-style: italic; text-align: center; border-radius: 0.5rem; margin: 1rem 0;">${isImagePlaceholder[1]}</div>`);
            } else if (currentLine.trim().match(/^(?:-|\*|_){3,}$/)) {
                 closeOpenLists();
                 htmlElements.push('<hr />');
            } else if (currentLine !== '') {
                closeOpenLists();
                htmlElements.push(`<p>${renderInlineMarkdown(currentLine)}</p>`);
            }
            // empty lines are ignored, which helps create paragraph breaks naturally
        });

        // Close any open lists at the end
        closeOpenLists();

        return { __html: htmlElements.join('') };
    };

    return <div dangerouslySetInnerHTML={createMarkup()} />;
};

export default MarkdownRenderer;