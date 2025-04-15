/**
 * ====================================================================
 * Neo Util - Blogger Data Parser & Handlebars Renderer Utility
 * ====================================================================
 * Version: 1.0.0 (Example Version)
 * Author: milio48 (Adapted by AI)
 * Repository: https://github.com/milio48/neo-util
 *
 * Combines the neo-parser functionality (providing window.neoApi())
 * with a Handlebars-based renderer (providing window.renderNeoHTML()
 * and window.registerNeoCustomHelpers()).
 *
 * Loads Handlebars.js from CDN if not already present.
 * Provides a streamlined way to fetch Blogger data and render it
 * using a full HTML template string.
 */
(function() {
    'use strict';

    // ===============================================
    // SECTION 1: NEO PARSER LOGIC
    // ===============================================

    let cachedData = null; // Cache the result after first parse

    // --- Internal Parser Helper Functions ---

    function getBlogInfoFromDOM() {
        const blogInfo = {
            title: document.title,
            homepageUrl: null,
            url: window.location.href,
            pageTitle: document.title, // Default page title
            pageName: null,
            searchQuery: null,
            description: null // Placeholder for potential description parsing
        };
        try {
            // Get main title and homepage URL
            const titleLink = document.querySelector('header.neo-site-header h1 a');
            if (titleLink) {
                blogInfo.title = titleLink.textContent?.trim() || blogInfo.title;
                blogInfo.homepageUrl = titleLink.href || null;
            }
            // Attempt to get blog description (example selector)
            const descriptionMeta = document.querySelector('meta[name="description"]');
            if (descriptionMeta) {
                blogInfo.description = descriptionMeta.content;
            }

        } catch (e) {
            console.error("Neo Util (Parser): Error getting basic blog info.", e);
        }
        return blogInfo;
    }

    function determinePageTypeFromDOM(homepageUrl) {
        // Prioritize specific container divs from the neo-data-provider theme
        if (document.querySelector('div.neo-homepage-data')) return 'homepage';
        if (document.querySelector('article.neo-post[itemscope]')) return 'item';
        if (document.querySelector('div.neo-custom-page')) return 'static_page';
        if (document.querySelector('div.neo-archive-data')) return 'archive';
        if (document.querySelector('div.neo-index-data')) return 'index'; // Label or Search (refined later)
        if (document.querySelector('div.neo-error-page')) return 'error';
        if (document.querySelector('div.neo-unknown-page')) return 'unknown';

        // Fallbacks
        if (homepageUrl && window.location.href === homepageUrl) {
            if (document.getElementById('neo-data-table-posts')) return 'homepage';
        }
        if (document.getElementById('neo-data-table-posts')) {
            return 'index'; // Default guess for list table without specific container
        }
        // Final fallback if nothing matches
        // Check for standard Blogger error class as a last resort for 'error'
        if (document.querySelector('.status-msg-wrap .status-msg-body')) {
             // Check if it looks like a 404 message
             const errorMsg = document.querySelector('.status-msg-wrap .status-msg-body');
             if (errorMsg && /tidak dapat menemukan|could not find|not found/i.test(errorMsg.textContent || '')) {
                 return 'error';
             }
        }

        return 'unknown';
    }

    function parseListPageDOM(initialPageType, blogInfoRef) {
        const result = {
            title: document.title, // Default, will be overwritten
            posts: [],
            subType: initialPageType,
            nameOrQuery: null
        };
        let containerSelector = null;
        let titleSelector = 'h2'; // Default title element for lists

        switch (initialPageType) {
            case 'homepage': containerSelector = '.neo-homepage-data'; break;
            case 'archive': containerSelector = '.neo-archive-data'; result.subType = 'archive'; break;
            case 'index': containerSelector = '.neo-index-data'; break;
        }

        const container = containerSelector ? document.querySelector(containerSelector) : document;
        if (!container) {
             console.warn(`Neo Util (Parser): Container not found for page type ${initialPageType}. Parsing table globally.`);
             result.posts = parsePostListTableDOM(document); // Search in whole document
             // Try to get title from a generic H1 if no container
             result.title = document.querySelector('h1')?.textContent?.trim() || document.title;
             blogInfoRef.pageTitle = result.title; // Update blog info page title
             return result;
        }

        const titleElement = container.querySelector(titleSelector);
        if (titleElement) {
            result.title = titleElement.textContent.trim();
            blogInfoRef.pageTitle = result.title; // Update blog info page title

            // Extract specific name/query from title text (adjust regex based on theme output)
            if (initialPageType === 'archive') {
                // Example Regex: "Archive: October 2023 - Post Data"
                const match = result.title.match(/^(?:Archive|Arsip):\s*(.*?)(?:\s*-\s*Post Data)?$/i);
                result.nameOrQuery = match ? match[1].trim() : null;
                blogInfoRef.pageName = result.nameOrQuery; // Update blog info
            } else if (initialPageType === 'index') {
                 // Example Regex: "Search Results: "query" - Post Data" or "Label: labelName - Post Data"
                const searchMatch = result.title.match(/^(?:Search Results|Hasil Penelusuran):\s*"?([^"]*?)"?(?:\s*-\s*Post Data)?$/i);
                const labelMatch = result.title.match(/^(?:Label):\s*(.*?)(?:\s*-\s*Post Data)?$/i);
                if (searchMatch) {
                    result.subType = 'search';
                    result.nameOrQuery = searchMatch[1].trim();
                    blogInfoRef.searchQuery = result.nameOrQuery; // Update blog info
                } else if (labelMatch) {
                    result.subType = 'label';
                    result.nameOrQuery = labelMatch[1].trim();
                    blogInfoRef.pageName = result.nameOrQuery; // Update blog info
                }
            }
        } else if (container !== document) {
             console.warn(`Neo Util (Parser): Title element (${titleSelector}) not found in ${containerSelector}. Using document title.`);
             result.title = document.title;
             blogInfoRef.pageTitle = result.title; // Update blog info page title
        }

        result.posts = parsePostListTableDOM(container);
        return result;
    }

    function parsePostListTableDOM(container = document) {
        const table = container.querySelector('#neo-data-table-posts');
        if (!table) return [];

        const rows = table.querySelectorAll('tbody tr');
        const posts = [];
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 1 && cells[0].hasAttribute('colspan')) return; // Skip "No posts"
            if (cells.length !== 9) {
                console.warn(`Neo Util (Parser): Skipping table row with ${cells.length} cells (expected 9).`, row);
                return;
            }

            try {
                const post = {
                    postId: row.dataset.postId || cells[0]?.textContent?.trim() || null,
                    title: cells[1]?.textContent?.trim() ?? '',
                    url: cells[2]?.textContent?.trim() ?? '',
                    publishedIso: cells[3]?.querySelector('time')?.getAttribute('datetime') || cells[3]?.textContent?.trim() || '',
                    publishedFormatted: cells[4]?.textContent?.trim() ?? '',
                    author: cells[5]?.textContent?.trim() ?? '',
                    labels: [],
                    snippet: cells[7]?.textContent?.trim() ?? '',
                    firstImageUrl: null,
                    bodyHtml: null // Not typically available in list view
                };

                const labelListItems = cells[6]?.querySelectorAll('li');
                if (labelListItems) {
                    post.labels = Array.from(labelListItems).map(li => ({
                        name: li.getAttribute('neo-label-name') || li.textContent?.trim() || '',
                        url: li.getAttribute('data-label-url') || li.querySelector('a')?.href || null
                    })).filter(label => label.name);
                }

                const imageUrl = cells[8]?.textContent?.trim();
                if (imageUrl && !/^\(?No image\)?$/i.test(imageUrl) && !imageUrl.startsWith('Placeholder')) {
                    post.firstImageUrl = imageUrl;
                }
                posts.push(post);
            } catch (cellError) {
                 console.warn(`Neo Util (Parser): Error parsing cells in table row:`, cellError, row);
            }
        });
        return posts;
    }

    function parseItemPageDOM(blogInfoRef) {
        const article = document.querySelector('article.neo-post[itemscope]');
        if (!article) return null;

        const post = {
             postId: null, title: '', url: window.location.href, publishedIso: '', publishedFormatted: '',
             labels: [], bodyHtml: '', author: null, // Placeholder for author
             pageTitle: '' // Will be set from blogInfoRef
        };
        const contentDiv = article.querySelector('div[itemprop="articleBody"]');
        const timeEl = article.querySelector('time[itemprop="datePublished"]');
        const labelLinks = article.querySelectorAll('.neo-post-labels a[itemprop="keywords"]'); // Adjust selector if needed
        const titleEl = article.querySelector('h1[itemprop="headline"]');

        post.postId = contentDiv?.id?.replace('neo-post-body-', '') || article.id || null;
        post.title = titleEl?.textContent?.trim() || document.title;
        post.publishedIso = timeEl?.getAttribute('datetime') || '';
        post.publishedFormatted = timeEl?.textContent?.trim() || '';
        post.labels = labelLinks ? Array.from(labelLinks).map(a => ({
            name: a.textContent.trim(),
            url: a.href || null
        })) : [];
        post.bodyHtml = contentDiv?.innerHTML || '';
        // Attempt to find author (example - might need theme adjustment)
        const authorEl = article.querySelector('[itemprop="author"], .post-author');
        if(authorEl) post.author = authorEl.textContent?.trim();

        // Update blog info page title
        blogInfoRef.pageTitle = post.title;
        post.pageTitle = post.title; // Add to post object itself too

        return post;
    }

    function parseStaticPageDOM(blogInfoRef) {
        const pageDiv = document.querySelector('div.neo-custom-page');
        if (!pageDiv) return null;

        const page = {
             pageId: null, title: '', url: window.location.href, bodyHtml: '',
             pageTitle: '' // Will be set from blogInfoRef
        };
        const contentDiv = pageDiv.querySelector('div.neo-page-content');
        const titleEl = pageDiv.querySelector('h1.neo-page-title'); // Adjust selector if needed

        page.pageId = contentDiv?.id?.replace('neo-page-content-', '') || pageDiv.id || null;
        page.title = titleEl?.textContent?.trim() || document.title;
        page.bodyHtml = contentDiv?.innerHTML || '';

        // Update blog info page title
        blogInfoRef.pageTitle = page.title;
        page.pageTitle = page.title; // Add to page object itself too

        return page;
    }

    function parseErrorPageDOM(blogInfoRef) {
        let title = "Error";
        let message = "Page not found.";
        const pageDiv = document.querySelector('div.neo-error-page'); // Theme specific
        const bloggerErrorWrap = document.querySelector('.status-msg-wrap'); // Standard Blogger

        if (pageDiv) {
            title = pageDiv.querySelector('h1')?.textContent.trim() || title;
            message = pageDiv.querySelector('p')?.textContent.trim() || message;
        } else if (bloggerErrorWrap) {
             title = bloggerErrorWrap.querySelector('.status-msg-title')?.textContent.trim() || "Error";
             message = bloggerErrorWrap.querySelector('.status-msg-body')?.textContent.trim() || message;
             // Try to detect 404 specifically
             if (/tidak dapat menemukan|could not find|not found/i.test(message)) {
                 title = pageDiv?.querySelector('h1')?.textContent.trim() || "Page Not Found (404)"; // Keep theme title if possible
             }
        }
        blogInfoRef.pageTitle = title; // Update blog info
        return { title: title, message: message };
    }

     function parseUnknownPageDOM(blogInfoRef) {
        const pageDiv = document.querySelector('div.neo-unknown-page');
        const title = pageDiv?.querySelector('h1')?.textContent.trim() || "Unknown Page Type";
        const message = pageDiv?.querySelector('p')?.textContent.trim() || "The type of this page could not be determined.";
        blogInfoRef.pageTitle = title; // Update blog info
        return { title: title, message: message };
    }

    // --- Main Parser Orchestrator (Internal) ---
    function parseBloggerDataInternal() {
        if (document.readyState === 'loading') {
            console.error("Neo Util (Parser): Cannot parse, DOM is not ready. Call neoApi() after DOMContentLoaded.");
            return {
                 blog: { title: document.title, url: window.location.href, pageTitle: document.title },
                 pageType: 'parsing_error',
                 page: { title: 'Parsing Error', message: 'DOM not ready during parse attempt.', error: "DOM not ready" }
            };
        }
        console.log("Neo Util (Parser): Starting data parsing...");

        let parsedData = {
            blog: {},
            pageType: 'unknown',
            page: null
        };

        try {
            parsedData.blog = getBlogInfoFromDOM(); // Get initial blog info
            parsedData.pageType = determinePageTypeFromDOM(parsedData.blog.homepageUrl);
            console.log(`Neo Util (Parser): Detected pageType: ${parsedData.pageType}`);

            switch (parsedData.pageType) {
                case 'homepage':
                case 'archive':
                case 'index': // Will be refined into 'label' or 'search'
                    const listPageData = parseListPageDOM(parsedData.pageType, parsedData.blog); // Pass blog obj by reference
                    parsedData.page = listPageData.posts;
                    // Refine pageType if it was 'index'
                    if (parsedData.pageType === 'index') {
                        parsedData.pageType = listPageData.subType; // 'label' or 'search'
                        console.log(`Neo Util (Parser): Refined pageType to: ${parsedData.pageType}`);
                    }
                    // Note: pageTitle, pageName, searchQuery are updated inside parseListPageDOM
                    break;
                case 'item':
                    parsedData.page = parseItemPageDOM(parsedData.blog); // Pass blog obj by reference
                    // Note: pageTitle updated inside parseItemPageDOM
                    break;
                case 'static_page':
                    parsedData.page = parseStaticPageDOM(parsedData.blog); // Pass blog obj by reference
                    // Note: pageTitle updated inside parseStaticPageDOM
                    break;
                case 'error':
                    parsedData.page = parseErrorPageDOM(parsedData.blog); // Pass blog obj by reference
                    // Note: pageTitle updated inside parseErrorPageDOM
                    break;
                default: // Unknown
                    parsedData.page = parseUnknownPageDOM(parsedData.blog); // Pass blog obj by reference
                    // Note: pageTitle updated inside parseUnknownPageDOM
                    break;
            }
        } catch (error) {
            console.error("Neo Util (Parser): Error during DOM parsing:", error);
            parsedData.pageType = 'parsing_error';
            parsedData.page = {
                title: 'Data Parsing Error',
                message: "Failed to parse page data from DOM.",
                error: error.message,
                stack: error.stack // Include stack for debugging
            };
            // Ensure basic blog info is still present
            if (!parsedData.blog.url) parsedData.blog.url = window.location.href;
            if (!parsedData.blog.title) parsedData.blog.title = document.title;
             if (!parsedData.blog.pageTitle) parsedData.blog.pageTitle = document.title;
        }

        // Final check for pageTitle consistency
        if (!parsedData.blog.pageTitle) {
             parsedData.blog.pageTitle = parsedData.page?.title || document.title;
        }

        console.log("Neo Util (Parser): Parsing complete.");
        return parsedData;
    }

    // --- Public Parser API Function ---
    /**
     * [PUBLIC] Returns the parsed Blogger data object.
     * Parses the DOM on the first call and caches the result.
     * Ensure this is called after DOMContentLoaded.
     * @returns {object} The parsed Blogger data. See documentation for structure.
     */
    function neoApi() {
        if (cachedData) {
            // console.log("Neo Util (Parser): Returning cached data.");
            return cachedData;
        }
        // console.log("Neo Util (Parser): No cache, parsing data...");
        cachedData = parseBloggerDataInternal();
        return cachedData;
    }


    // ===============================================
    // SECTION 2: HANDLEBARS RENDERER LOGIC
    // ===============================================

    let handlebarsLoaded = typeof window.Handlebars !== 'undefined';
    let handlebarsLoadingPromise = null;
    let userDefinedHelpers = {}; // Store user-defined helpers

    // --- Internal Renderer Helper Functions ---

    /**
     * Loads Handlebars from CDN if needed.
     * @returns {Promise<void>}
     */
    function loadHandlebarsIfNeeded() {
        if (handlebarsLoaded) return Promise.resolve();
        if (handlebarsLoadingPromise) return handlebarsLoadingPromise;

        console.log("Neo Util (Renderer): Loading Handlebars...");
        handlebarsLoadingPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js';
            script.async = true;
            script.onload = () => {
                console.log("Neo Util (Renderer): Handlebars loaded successfully.");
                handlebarsLoaded = true;
                handlebarsLoadingPromise = null;
                registerAllHelpers(); // Register helpers now that Handlebars is loaded
                resolve();
            };
            script.onerror = (err) => {
                console.error("Neo Util (Renderer): Failed to load Handlebars from CDN.", err);
                handlebarsLoadingPromise = null;
                reject(new Error("Failed to load Handlebars."));
            };
            document.head.appendChild(script);
        });
        return handlebarsLoadingPromise;
    }

    /**
     * Registers all custom helpers provided by the user.
     */
    function registerAllHelpers() {
        if (!window.Handlebars || typeof window.Handlebars.registerHelper !== 'function') {
             return; // Handlebars not ready
        }
        console.log("Neo Util (Renderer): Registering custom user-defined helpers...");
        try {
            let registeredCount = 0;
            for (const helperName in userDefinedHelpers) {
                if (Object.hasOwnProperty.call(userDefinedHelpers, helperName)) {
                    const helperFunc = userDefinedHelpers[helperName];
                    if (typeof helperFunc === 'function') {
                        window.Handlebars.registerHelper(helperName, helperFunc);
                        registeredCount++;
                    } else {
                         console.warn(`Neo Util (Renderer): Custom helper '${helperName}' is not a function.`);
                    }
                }
            }
            if (registeredCount > 0) {
                console.log(`Neo Util (Renderer): Registered/Updated ${registeredCount} custom helper(s).`);
            } else if (Object.keys(userDefinedHelpers).length < 1) {
                console.log("Neo Util (Renderer): No custom helpers provided by user yet.");
            }
        } catch (e) {
             console.error("Neo Util (Renderer): Error registering custom Handlebars helpers:", e);
        }
    }

    /**
     * Clears previously injected head elements.
     */
    function clearInjectedHeadElements() {
        document.querySelectorAll('[data-neo-injected="true"]').forEach(el => el.remove());
    }

    /**
     * Processes <head> content from a parsed template document.
     * @param {HTMLHeadElement} templateHead
     */
    function processAndInjectHead(templateHead) {
        if (!templateHead) return;
        console.log("Neo Util (Renderer): Processing <head> content from template...");
        clearInjectedHeadElements();

        const titleElement = templateHead.querySelector('title');
        document.title = titleElement?.textContent || document.title; // Set document title
        console.log(`Neo Util (Renderer): Document title set to "${document.title}".`);

        let injectedCount = { style: 0, link: 0, meta: 0 };
        Array.from(templateHead.children).forEach(element => {
            const tagName = element.tagName.toLowerCase();
            let newElement = null;
            try {
                // Skip title as it's handled above
                if (tagName === 'title') return;
                // Skip scripts from template head for security/stability
                if (tagName === 'script') {
                    console.warn("Neo Util (Renderer): Skipping <script> tag found in template <head>:", element.src || 'inline script');
                    return;
                }
                // Skip base tag to avoid issues
                if (tagName === 'base') {
                     console.warn("Neo Util (Renderer): Skipping <base> tag found in template <head>.");
                     return;
                }

                // Clone other relevant tags (style, link, meta)
                if (['style', 'link', 'meta'].includes(tagName)) {
                     // Special handling for stylesheet links
                     if (tagName === 'link' && !(element.rel === 'stylesheet' && element.href)) {
                         return; // Skip non-stylesheet links
                     }
                    newElement = element.cloneNode(true); // Deep clone the element
                    injectedCount[tagName]++;
                }

                if (newElement) {
                    newElement.setAttribute('data-neo-injected', 'true'); // Mark as injected
                    document.head.appendChild(newElement);
                }
            } catch (e) { console.error(`Neo Util (Renderer): Error processing <${tagName}> from template head:`, e, element); }
        });
        console.log(`Neo Util (Renderer): Injected from template <head>: ${injectedCount.style} <style>, ${injectedCount.link} <link>, ${injectedCount.meta} <meta>.`);
    }

    // --- Public Renderer API Functions ---

    /**
     * [PUBLIC] Registers an object of custom Handlebars helpers.
     * Call this before renderNeoHTML if using custom helpers in the template.
     * @param {object} helpersObject - Example: { formatMyDate: (d) => ..., eq: (a,b)=>a===b }
     */
    function registerNeoCustomHelpers(helpersObject) {
        if (typeof helpersObject === 'object' && helpersObject !== null) {
            console.log("Neo Util (Renderer): Registering custom helpers:", Object.keys(helpersObject));
            userDefinedHelpers = { ...userDefinedHelpers, ...helpersObject };
            if (handlebarsLoaded) {
                registerAllHelpers(); // Re-register all if Handlebars is already loaded
            }
        } else {
            console.warn("Neo Util (Renderer): Invalid object passed to registerNeoCustomHelpers.");
        }
    }


    /**
     * [PUBLIC] Renders a full HTML template string using Handlebars and data from neoApi().
     * Processes <head> elements from the template and replaces the <body> content.
     * Requires Handlebars (loads from CDN if needed).
     * @param {string} fullHtmlTemplateString - The complete HTML template string with Handlebars syntax.
     * @returns {Promise<void>} Promise resolving on success, rejecting on error.
     */
    async function renderNeoHTML(fullHtmlTemplateString) {
        console.log("Neo Util (Renderer): renderNeoHTML called.");
        if (typeof fullHtmlTemplateString !== 'string' || !fullHtmlTemplateString.trim()) {
            console.error("Neo Util (Renderer) Error: Invalid or empty HTML template string provided.");
            return Promise.reject(new Error("Invalid template string."));
        }

        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            console.log("Neo Util (Renderer): DOM not ready, waiting...");
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
            console.log("Neo Util (Renderer): DOM ready.");
        }

        // Ensure neoApi is available
         if (typeof window.neoApi !== 'function') {
             const msg = "window.neoApi() is not available. Ensure neo-util.js loaded correctly.";
             console.error(`Neo Util (Renderer) Error: ${msg}`);
             return Promise.reject(new Error(msg));
         }

        try {
            // 1. Load Handlebars if needed
            await loadHandlebarsIfNeeded();

            // 2. Get API Data (neoApi should be ready now)
            console.log("Neo Util (Renderer): Fetching data from neoApi()...");
            const apiData = window.neoApi();
            if (!apiData || !apiData.blog || typeof apiData.page === 'undefined') {
                console.error("Neo Util (Renderer) Error: Invalid API data.", apiData);
                throw new Error('Invalid or incomplete API data.');
            }
            console.log("Neo Util (Renderer): API data received.");

            // 3. Compile Template (Helpers should be registered now)
            console.log("Neo Util (Renderer): Compiling Handlebars template...");
            const template = window.Handlebars.compile(fullHtmlTemplateString);
            console.log("Neo Util (Renderer): Template compiled.");

            // 4. Render Template
            console.log("Neo Util (Renderer): Rendering HTML...");
            const renderedHtmlOutput = template(apiData);
            console.log("Neo Util (Renderer): HTML rendered.");

            // 5. Parse Rendered HTML
            console.log("Neo Util (Renderer): Parsing rendered HTML...");
            const parser = new DOMParser();
            const tempDoc = parser.parseFromString(renderedHtmlOutput, 'text/html');
            console.log("Neo Util (Renderer): Rendered HTML parsed.");

            // 6. Process <head>
            processAndInjectHead(tempDoc.head);

            // 7. Replace <body>
            if (document.body && tempDoc.body) {
                // Replace attributes on the actual body tag (e.g., class, id)
                 Array.from(tempDoc.body.attributes).forEach(attr => {
                     try { document.body.setAttribute(attr.name, attr.value); } catch(e){ console.warn(`Could not set body attribute ${attr.name}`, e)}
                 });
                // Replace inner content
                document.body.innerHTML = tempDoc.body.innerHTML;
                console.log("Neo Util (Renderer): document.body content replaced.");
            } else {
                throw new Error("Could not access document.body or parsed template body.");
            }

            console.log("Neo Util (Renderer): Rendering process completed successfully.");
            return Promise.resolve();

        } catch (error) {
            console.error("Neo Util (Renderer): CRITICAL ERROR during rendering:", error);
            if (document.body) {
                document.body.innerHTML = `<div style="color:red; border:2px solid red; padding: 15px; margin: 20px; font-family: monospace;"><h2>Neo Renderer Error</h2><p>Failed to render template.</p><p><strong>Error:</strong> ${error.message}</p><pre>${error.stack || ''}</pre><p>Check console.</p></div>`;
            }
            return Promise.reject(error);
        }
    }

    // ===============================================
    // SECTION 3: PUBLIC API EXPOSURE
    // ===============================================

    window.neoApi = neoApi;
    window.renderNeoHTML = renderNeoHTML;
    window.registerNeoCustomHelpers = registerNeoCustomHelpers;

    console.log("Neo Util: neoApi, renderNeoHTML, and registerNeoCustomHelpers are now available.");

    // Panggil register helpers sekali di awal jika Handlebars sudah ada
    if (handlebarsLoaded) {
        registerAllHelpers();
    }

})(); // End Neo Util IIFE