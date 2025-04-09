/**
 * neo-parser-dom.js
 * Parses Blogger data rendered by the neo-data-provider theme (v6+)
 * purely by reading the rendered DOM structure.
 * Does NOT rely on window.neoBlogData injection.
 *
 * Usage:
 * 1. Include this script in your Blogger theme (e.g., before </body>).
 * 2. After the DOM is loaded, the parsed data will be available in window.parsedBloggerDataDOM.
 */

/**
 * Main function to parse data based on the rendered DOM.
 * @returns {Object} An object containing blog info and page-specific data.
 */
function parseBloggerDataDOMOnly() {
    // console.log("neo-parser-dom.js: Starting DOM-only parsing for:", window.location.href);

    let parsedData = {
        blog: {},
        pageType: 'unknown', // Default page type
        page: null
    };

    try {
        // 1. Get Basic Blog Info from DOM
        parsedData.blog = getBlogInfoFromDOM();

        // 2. Determine Page Type from DOM Structure
        parsedData.pageType = determinePageTypeFromDOM(parsedData.blog.homepageUrl);
        // console.log("neo-parser-dom.js: Determined Page Type:", parsedData.pageType);

        // 3. Call Specific Parser based on Determined Type
        switch (parsedData.pageType) {
            case 'homepage':
            case 'archive':
            case 'index': // Covers Label and Search initially
                // These pages use the post list table
                const listPageData = parseListPageDOM(parsedData.pageType);
                parsedData.page = listPageData.posts; // Store the array of posts
                // Refine pageType and add specific info (like label name or search query)
                if (parsedData.pageType === 'index') {
                    parsedData.pageType = listPageData.subType; // 'label' or 'search'
                    if (listPageData.subType === 'label') {
                        parsedData.blog.pageName = listPageData.nameOrQuery;
                    } else {
                        parsedData.blog.searchQuery = listPageData.nameOrQuery;
                    }
                } else if (parsedData.pageType === 'archive') {
                     parsedData.blog.pageName = listPageData.nameOrQuery;
                }
                 parsedData.blog.pageTitle = listPageData.title; // Get title from H2
                break;
            case 'item':
                parsedData.page = parseItemPageDOM();
                parsedData.blog.pageTitle = parsedData.page?.title || document.title;
                break;
            case 'static_page':
                parsedData.page = parseStaticPageDOM();
                 parsedData.blog.pageTitle = parsedData.page?.title || document.title;
                break;
            case 'error':
                parsedData.page = parseErrorPageDOM();
                 parsedData.blog.pageTitle = parsedData.page?.title || document.title;
                break;
            default: // Unknown
                parsedData.page = parseUnknownPageDOM();
                 parsedData.blog.pageTitle = parsedData.page?.title || document.title;
                break;
        }

    } catch (error) {
        console.error("neo-parser-dom.js: Error during DOM parsing:", error);
        parsedData.pageType = 'parsing_error';
        parsedData.page = { error: "Failed to parse page data from DOM.", details: error.message, stack: error.stack };
        // Attempt to get basic blog info even on error
        if (!parsedData.blog.title) {
             try { parsedData.blog = getBlogInfoFromDOM(); } catch(e){}
        }
    }

    // Add current URL regardless of parsing success/failure
    parsedData.blog.url = window.location.href;

    // console.log("neo-parser-dom.js: Final Parsed Data (DOM Only):", parsedData);
    return parsedData;
}

/**
 * Extracts basic blog info from header/DOM.
 * @returns {Object} Object with title and homepageUrl.
 */
function getBlogInfoFromDOM() {
    const blogInfo = {
        title: document.title, // Default to document title
        homepageUrl: null,
        url: window.location.href
    };
    try {
        const titleLink = document.querySelector('header.neo-site-header h1 a');
        if (titleLink) {
            blogInfo.title = titleLink.textContent.trim() || blogInfo.title;
            blogInfo.homepageUrl = titleLink.href || null;
        } else {
            console.warn("neo-parser-dom.js: Could not find header title link (header.neo-site-header h1 a).");
        }
    } catch(e) {
        console.error("neo-parser-dom.js: Error getting basic blog info.", e);
    }
    return blogInfo;
}

/**
 * Determines the page type by looking for specific container elements.
 * @param {string|null} homepageUrl - The determined homepage URL.
 * @returns {string} The determined page type ('homepage', 'item', 'static_page', etc.).
 */
function determinePageTypeFromDOM(homepageUrl) {
    // Check for specific containers first
    if (document.querySelector('div.neo-homepage-data')) return 'homepage'; // Specific div for homepage
    if (document.querySelector('article.neo-post[itemscope]')) return 'item';
    if (document.querySelector('div.neo-custom-page')) return 'static_page';
    if (document.querySelector('div.neo-archive-data')) return 'archive';
    if (document.querySelector('div.neo-index-data')) return 'index'; // Label or Search
    if (document.querySelector('div.neo-error-page')) return 'error';
    if (document.querySelector('div.neo-unknown-page')) return 'unknown';

    // Fallback checks (less specific)
    // Check if current URL is homepage URL (if homepageUrl was found)
    if (homepageUrl && window.location.href === homepageUrl) {
         // Check if it has the post list table, could still be homepage if theme changed
         if (document.getElementById('neo-data-table-posts')) {
             return 'homepage';
         }
    }
    // If it has the post list table but none of the specific containers, assume index/archive
    if (document.getElementById('neo-data-table-posts')) {
        console.warn("neo-parser-dom.js: Found post list table but no specific container (archive/index). Assuming 'index'.");
        return 'index';
    }

    console.warn("neo-parser-dom.js: Could not determine page type from known elements.");
    return 'unknown'; // Default if nothing matches
}


/**
 * Parses list pages (Homepage, Archive, Index) which contain the post list table.
 * Extracts page title and specific type (label/search/archive name).
 * @param {string} initialPageType - The initially determined page type ('homepage', 'archive', 'index').
 * @returns {Object} Contains page title, posts array, subtype, and name/query if applicable.
 */
function parseListPageDOM(initialPageType) {
    const result = {
        title: document.title, // Default
        posts: [],
        subType: initialPageType, // 'homepage', 'archive', 'index'
        nameOrQuery: null
    };
    let containerSelector;
    let titleSelector = 'h2'; // Usually H2 for these pages

    switch(initialPageType) {
        case 'homepage':
            containerSelector = '.neo-homepage-data';
            break;
        case 'archive':
            containerSelector = '.neo-archive-data';
             result.subType = 'archive';
            break;
        case 'index':
             containerSelector = '.neo-index-data';
             // subtype (label/search) determined below
            break;
        default:
             console.warn(`neo-parser-dom.js: Unexpected initialPageType in parseListPageDOM: ${initialPageType}`);
             result.posts = parsePostListTableDOM(); // Try parsing table anyway
             return result;
    }

    const container = document.querySelector(containerSelector);
    if (container) {
        const titleElement = container.querySelector(titleSelector);
        if (titleElement) {
            result.title = titleElement.textContent.trim();
            // Try to extract specific name/query from title for archive/index
            if (initialPageType === 'archive') {
                // Example: "Archive: Monthly Archive - Post Data" -> "Monthly Archive"
                const match = result.title.match(/^Archive:\s*(.*?)\s*-\s*Post Data$/i);
                result.nameOrQuery = match ? match[1] : result.title; // Fallback to full title
            } else if (initialPageType === 'index') {
                 // Example: "Search Results: "query" - Post Data" -> "query"
                const searchMatch = result.title.match(/^Search Results:\s*"(.*?)"\s*-\s*Post Data$/i);
                 // Example: "Label: LabelName - Post Data" -> "LabelName"
                const labelMatch = result.title.match(/^Label:\s*(.*?)\s*-\s*Post Data$/i);

                if (searchMatch) {
                    result.subType = 'search';
                    result.nameOrQuery = searchMatch[1];
                } else if (labelMatch) {
                    result.subType = 'label';
                    result.nameOrQuery = labelMatch[1];
                } else {
                     result.subType = 'index'; // Could not determine subtype
                     result.nameOrQuery = result.title; // Fallback
                }
            }
        } else {
             console.warn(`neo-parser-dom.js: Could not find title element (${titleSelector}) in ${containerSelector}.`);
        }
        // Parse the table within the container (or globally if needed)
        result.posts = parsePostListTableDOM(container); // Pass container to scope search
    } else {
         console.warn(`neo-parser-dom.js: Could not find container element: ${containerSelector}. Parsing table globally.`);
         result.posts = parsePostListTableDOM(); // Fallback to global search
    }

    return result;
}


/**
 * Parses the post list table (#neo-data-table-posts). DOM ONLY version.
 * @param {Element} [container=document] - Optional container element to search within.
 * @returns {Array<Object>} Array of post objects or empty array.
 */
function parsePostListTableDOM(container = document) {
    const table = container.querySelector('#neo-data-table-posts'); // Search within container or document
    if (!table) {
        console.warn("neo-parser-dom.js: Table #neo-data-table-posts not found within the scope.", container === document ? "Document" : container);
        return []; // Return empty array
    }

    const rows = table.querySelectorAll('tbody tr');
    const posts = [];
    // Expected header order: ID, Title, URL, Published ISO, Published Formatted, Author, Labels, Snippet, First Image URL

    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 1 && cells[0].hasAttribute('colspan')) return; // Skip "No posts" row
        if (cells.length !== 9) {
            console.warn(`neo-parser-dom.js: Row ${rowIndex} in table skipped: Expected 9 cells, found ${cells.length}.`, row);
            return;
        }

        const post = {};
        try {
            post.postId = row.dataset.postId || cells[0]?.textContent.trim() || null;
            post.title = cells[1]?.textContent.trim() || '';
            post.url = cells[2]?.textContent.trim() || ''; // Plain text URL
            post.publishedIso = cells[3]?.querySelector('time')?.getAttribute('datetime') || cells[3]?.textContent.trim() || '';
            post.publishedFormatted = cells[4]?.textContent.trim() || '';
            post.author = cells[5]?.textContent.trim() || '';

            const labelListItems = cells[6]?.querySelectorAll('li');
            post.labels = labelListItems ? Array.from(labelListItems).map(li => ({
                name: li.getAttribute('neo-label-name') || li.textContent.trim(),
                url: li.getAttribute('data-label-url') || null
            })) : [];

            post.snippet = cells[7]?.textContent.trim() || '';
            const imageUrl = cells[8]?.textContent.trim();
            post.firstImageUrl = (imageUrl && imageUrl !== '(No image)') ? imageUrl : null;

            posts.push(post);
        } catch (cellError) {
            console.warn(`neo-parser-dom.js: Error parsing cells in table row ${rowIndex}:`, cellError, row);
        }
    });
    return posts;
}

/**
 * Parses data from an Item page (Single Post). DOM ONLY version.
 * @returns {Object|null} Post detail object or null.
 */
function parseItemPageDOM() {
    const article = document.querySelector('article.neo-post[itemscope]');
    if (!article) {
         console.warn("neo-parser-dom.js: Article element for Item page not found.");
         return null;
    }

    const post = {};
    const contentDiv = article.querySelector('div[itemprop="articleBody"]');

    post.postId = contentDiv?.id?.replace('neo-post-body-', '') || null;
    post.title = article.querySelector('h1[itemprop="headline"]')?.textContent.trim() || document.title; // Fallback to doc title
    post.url = window.location.href; // Current URL

    const timeEl = article.querySelector('time[itemprop="datePublished"]');
    post.publishedIso = timeEl?.getAttribute('datetime') || '';
    post.publishedFormatted = timeEl?.textContent.trim() || '';

    const labelLinks = article.querySelectorAll('.neo-post-labels a[itemprop="keywords"]');
    post.labels = labelLinks ? Array.from(labelLinks).map(a => ({
        name: a.textContent.trim(),
        url: a.href || null
    })) : [];

    post.bodyHtml = contentDiv?.innerHTML || '';
    // post.author = article.querySelector('[itemprop="author"]')?.textContent.trim() || ''; // Add if author itemprop exists

    return post;
}

/**
 * Parses data from a Static page. DOM ONLY version.
 * @returns {Object|null} Page detail object or null.
 */
function parseStaticPageDOM() {
    const pageDiv = document.querySelector('div.neo-custom-page');
    if (!pageDiv) {
        console.warn("neo-parser-dom.js: Container element for Static page not found.");
        return null;
    }

    const page = {};
    const contentDiv = pageDiv.querySelector('div.neo-page-content');

    page.pageId = contentDiv?.id?.replace('neo-post-body-', '') || null;
    page.title = pageDiv.querySelector('h1.neo-page-title')?.textContent.trim() || document.title; // Fallback
    page.url = window.location.href;
    page.bodyHtml = contentDiv?.innerHTML || '';

    return page;
}

/**
 * Parses data from an Error page. DOM ONLY version.
 * @returns {Object} Page detail object.
 */
function parseErrorPageDOM() {
     const pageDiv = document.querySelector('div.neo-error-page');
     const title = pageDiv?.querySelector('h1')?.textContent.trim() || "Error";
     const message = pageDiv?.querySelector('p')?.textContent.trim() || "Page not found.";
     return { title, message };
}

/**
 * Parses data from an Unknown page type. DOM ONLY version.
 * @returns {Object} Page detail object.
 */
function parseUnknownPageDOM() {
     const pageDiv = document.querySelector('div.neo-unknown-page');
     const title = pageDiv?.querySelector('h1')?.textContent.trim() || "Unknown Page";
     const message = pageDiv?.querySelector('p')?.textContent.trim() || "Unknown page type detected.";
     return { title, message };
}


// --- Execution ---
document.addEventListener('DOMContentLoaded', () => {
    // console.log("neo-parser-dom.js: DOM fully loaded. Starting DOM-only parser...");
    // Parse the data using only DOM and store it globally
    window.parsedBloggerDataDOM = parseBloggerDataDOMOnly();

    // Example: Access the data
    // console.log("Accessing DOM-parsed data:", window.parsedBloggerDataDOM);
});