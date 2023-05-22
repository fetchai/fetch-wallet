export const processHyperlinks = (inputText: string) => {
    const processedText = inputText.replace(
        /(<a\s+(?:[^>]*?\s+)?href=(['"])(?:[^'"]*?)\2[^>]*?>.*?<\/a>)|((https?:\/\/[^\s]+)|(?<!\w)(www\.[^\s]+))/g,
        (_match: any, anchorTag: string, _quote: any, url: any, plainUrl: any) => {
            if (anchorTag) {
                if (anchorTag.includes('target=')) {
                    return anchorTag;
                } else {
                    return anchorTag.replace('<a', '<a target="_blank"');
                }
            } else {
                const href = url ? url : `https://${plainUrl}`;
                return `<a href="${href}" target="_blank">${url}</a>`;
            }
        }
    );

    return processedText;
};
 