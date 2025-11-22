
import React from 'react';

const renderInlineMarkdown = (line: string): string => {
    return line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/\[\[([^\]]+)\]\{.underline\}\]\(([^)]+)\)/g, '<a href="$2" style="text-decoration:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const createMarkup = () => {
        if (!content) return { __html: '' };

        const lines = content.split('\n');
        const htmlElements: string[] = [];
        
        // Track nesting
        let currentIndentLevel = 0;
        const listTypeStack: string[] = []; // 'ul' or 'ol'

        const closeLists = (toLevel: number) => {
            while (currentIndentLevel > toLevel) {
                const closingTag = listTypeStack.pop();
                if (closingTag) htmlElements.push(`</${closingTag}>`);
                currentIndentLevel--;
            }
        };

        lines.forEach(line => {
            // Normalize tabs to 4 spaces for calculation
            const expandedLine = line.replace(/\t/g, '    ');
            
            // Ignore purely empty lines to prevent breaking lists unnecessarily
            if (!expandedLine.trim()) return;

            // Headers
            if (expandedLine.trim().startsWith('#')) {
                closeLists(0);
                const level = expandedLine.trim().match(/^#+/)?.[0].length || 0;
                const text = expandedLine.trim().replace(/^#+\s*/, '');
                htmlElements.push(`<h${level}>${renderInlineMarkdown(text)}</h${level}>`);
                return;
            }

            // Horizontal Rules
            if (expandedLine.trim().match(/^(-{3,}|\*{3,}|_{3,})$/)) {
                closeLists(0);
                htmlElements.push('<hr />');
                return;
            }

            // Lists
            // Match indentation, marker (- * or 1.), and text
            const listMatch = expandedLine.match(/^(\s*)([-*]|\d+\.)\s+(.*)/);
            
            if (listMatch) {
                const [_, spaces, marker, text] = listMatch;
                const isOrdered = /^\d+\./.test(marker);
                const listTag = isOrdered ? 'ol' : 'ul';
                
                // Calculate depth: 2 spaces per level logic (standard for many AI outputs)
                // Level 1: 0-1 spaces
                // Level 2: 2-3 spaces
                // Level 3: 4-5 spaces
                const newLevel = Math.floor(spaces.length / 2) + 1;

                if (newLevel > currentIndentLevel) {
                    // Go deeper: Open new lists
                    while (currentIndentLevel < newLevel) {
                        htmlElements.push(`<${listTag}>`);
                        listTypeStack.push(listTag);
                        currentIndentLevel++;
                    }
                } else if (newLevel < currentIndentLevel) {
                    // Go shallower: Close lists
                    closeLists(newLevel);
                } else {
                    // Same level: Check if type changed (e.g. bullet to number)
                    const currentType = listTypeStack[listTypeStack.length - 1];
                    if (currentType !== listTag) {
                        htmlElements.push(`</${currentType}>`);
                        listTypeStack.pop();
                        htmlElements.push(`<${listTag}>`);
                        listTypeStack.push(listTag);
                    }
                }

                htmlElements.push(`<li>${renderInlineMarkdown(text)}</li>`);
            } else {
                // Not a list item - reset lists
                closeLists(0);
                
                const currentLine = expandedLine.trim();
                
                // Image placeholder check
                const imageMatch = currentLine.match(/^\[(Image placement:.*?)\]$/);
                
                if (imageMatch) {
                    htmlElements.push(`<div style="padding: 1rem; border: 1px dashed #4A5568; background-color: #2D3748; color: #A0AEC0; font-style: italic; text-align: center; border-radius: 0.5rem; margin: 1rem 0;">${imageMatch[1]}</div>`);
                } else {
                    htmlElements.push(`<p>${renderInlineMarkdown(currentLine)}</p>`);
                }
            }
        });

        // Close any remaining open lists at end of document
        closeLists(0);

        return { __html: htmlElements.join('') };
    };

    return <div dangerouslySetInnerHTML={createMarkup()} />;
};

export default MarkdownRenderer;
