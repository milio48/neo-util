/**
 * neo-parser.js - Final Version
 * Parses Blogger data from the DOM when requested via the neoApi() function.
 * Assumes this script is loaded before the consumer calls neoApi().
 * The consumer script is responsible for ensuring the DOM is ready before calling neoApi().
 */
(function() {
    'use strict'; // Optional: Enforce stricter parsing and error handling

    let cachedData = null; // Cache the result after first parse

    // ===============================================
    // START: Internal Helper Parsing Functions
    // (These are kept local to this script's scope)
    // ===============================================

    function getBlogInfoFromDOM() {
        const blogInfo = {
            title: document.title, // Default
            homepageUrl: null,
            url: window.location.href // Current URL always available
        };
        try {
            const titleLink = document.querySelector('header.neo-site-header h1 a');
            if (titleLink) {
                blogInfo.title = titleLink.textContent.trim() || blogInfo.title;
                blogInfo.homepageUrl = titleLink.href || null;
            }
        } catch (e) {
            console.error("neo-parser: Error getting basic blog info.", e);
        }
        return blogInfo;
    }

    function determinePageTypeFromDOM(homepageUrl) {
        // Prioritize specific container divs
        if (document.querySelector('div.neo-homepage-data')) return 'homepage';
        if (document.querySelector('article.neo-post[itemscope]')) return 'item';
        if (document.querySelector('div.neo-custom-page')) return 'static_page';
        if (document.querySelector('div.neo-archive-data')) return 'archive';
        if (document.querySelector('div.neo-index-data')) return 'index'; // Label or Search
        if (document.querySelector('div.neo-error-page')) return 'error';
        if (document.querySelector('div.neo-unknown-page')) return 'unknown';

        // Fallbacks if specific containers aren't found
        if (homepageUrl && window.location.href === homepageUrl) {
            // If URL matches homepage and has post list table, likely homepage
            if (document.getElementById('neo-data-table-posts')) return 'homepage';
        }
        // If it has the post list table but no specific container, guess index/archive
        if (document.getElementById('neo-data-table-posts')) {
            // Could refine this guess further based on URL path if needed
            return 'index'; // Default guess for list table without container
        }
        return 'unknown';
    }

    function parseListPageDOM(initialPageType) {
        const result = {
            title: document.title,
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
            // No default needed as initialPageType should be one of these if table exists
        }

        const container = containerSelector ? document.querySelector(containerSelector) : document; // Search globally if no specific container
        if (!container) {
             console.warn(`neo-parser: Container not found for page type ${initialPageType}. Parsing table globally.`);
             result.posts = parsePostListTableDOM(document); // Search in whole document
             return result;
        }


        const titleElement = container.querySelector(titleSelector);
        if (titleElement) {
            result.title = titleElement.textContent.trim();
            // Extract specific name/query from title text
            if (initialPageType === 'archive') {
                const match = result.title.match(/^Archive:\s*(.*?)\s*-\s*Post Data$/i);
                result.nameOrQuery = match ? match[1] : null;
            } else if (initialPageType === 'index') {
                const searchMatch = result.title.match(/^Search Results:\s*"(.*?)"\s*-\s*Post Data$/i);
                const labelMatch = result.title.match(/^Label:\s*(.*?)\s*-\s*Post Data$/i);
                if (searchMatch) {
                    result.subType = 'search';
                    result.nameOrQuery = searchMatch[1];
                } else if (labelMatch) {
                    result.subType = 'label';
                    result.nameOrQuery = labelMatch[1];
                }
            }
        } else if (container !== document) {
             console.warn(`neo-parser: Title element (${titleSelector}) not found in ${containerSelector}.`);
        }

        result.posts = parsePostListTableDOM(container); // Parse table within the container scope
        return result;
    }

    function parsePostListTableDOM(container = document) {
        const table = container.querySelector('#neo-data-table-posts');
        if (!table) return []; // No table found

        const rows = table.querySelectorAll('tbody tr');
        const posts = [];
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 1 && cells[0].hasAttribute('colspan')) return; // Skip "No posts"
            if (cells.length !== 9) return; // Skip malformed rows

            try { // Wrap cell parsing in try-catch per row
                const post = {
                    postId: row.dataset.postId || cells[0]?.textContent.trim() || null,
                    title: cells[1]?.textContent.trim() || '',
                    url: cells[2]?.textContent.trim() || '',
                    publishedIso: cells[3]?.querySelector('time')?.getAttribute('datetime') || cells[3]?.textContent.trim() || '',
                    publishedFormatted: cells[4]?.textContent.trim() || '',
                    author: cells[5]?.textContent.trim() || '',
                    labels: [],
                    snippet: cells[7]?.textContent.trim() || '',
                    firstImageUrl: null
                };

                const labelListItems = cells[6]?.querySelectorAll('li');
                if (labelListItems) {
                    post.labels = Array.from(labelListItems).map(li => ({
                        name: li.getAttribute('neo-label-name') || li.textContent.trim(),
                        url: li.getAttribute('data-label-url') || null
                    }));
                }

                const imageUrl = cells[8]?.textContent.trim();
                if (imageUrl && imageUrl !== '(No image)') {
                    post.firstImageUrl = imageUrl;
                }
                posts.push(post);
            } catch (cellError) {
                 console.warn(`neo-parser: Error parsing cells in table row:`, cellError, row);
            }
        });
        return posts;
    }

    function parseItemPageDOM() {
        const article = document.querySelector('article.neo-post[itemscope]');
        if (!article) return null;

        const post = {};
        const contentDiv = article.querySelector('div[itemprop="articleBody"]');
        const timeEl = article.querySelector('time[itemprop="datePublished"]');
        const labelLinks = article.querySelectorAll('.neo-post-labels a[itemprop="keywords"]');

        post.postId = contentDiv?.id?.replace('neo-post-body-', '') || null;
        post.title = article.querySelector('h1[itemprop="headline"]')?.textContent.trim() || document.title;
        post.url = window.location.href;
        post.publishedIso = timeEl?.getAttribute('datetime') || '';
        post.publishedFormatted = timeEl?.textContent.trim() || '';
        post.labels = labelLinks ? Array.from(labelLinks).map(a => ({
            name: a.textContent.trim(),
            url: a.href || null
        })) : [];
        post.bodyHtml = contentDiv?.innerHTML || '';
        return post;
    }

    function parseStaticPageDOM() {
        const pageDiv = document.querySelector('div.neo-custom-page');
        if (!pageDiv) return null;

        const page = {};
        const contentDiv = pageDiv.querySelector('div.neo-page-content');

        page.pageId = contentDiv?.id?.replace('neo-post-body-', '') || null;
        page.title = pageDiv.querySelector('h1.neo-page-title')?.textContent.trim() || document.title;
        page.url = window.location.href;
        page.bodyHtml = contentDiv?.innerHTML || '';
        return page;
    }

    function parseErrorPageDOM() {
        const pageDiv = document.querySelector('div.neo-error-page');
        return {
            title: pageDiv?.querySelector('h1')?.textContent.trim() || "Error",
            message: pageDiv?.querySelector('p')?.textContent.trim() || "Page not found."
        };
    }

    function parseUnknownPageDOM() {
        const pageDiv = document.querySelector('div.neo-unknown-page');
        return {
            title: pageDiv?.querySelector('h1')?.textContent.trim() || "Unknown Page",
            message: pageDiv?.querySelector('p')?.textContent.trim() || "Unknown page type detected."
        };
    }

    // ===============================================
    // END: Internal Helper Parsing Functions
    // ===============================================


    // ===============================================
    // START: Main Parsing Orchestrator (Internal)
    // ===============================================
    function parseBloggerDataInternal() {
        // Check if DOM is ready before proceeding
        if (document.readyState === 'loading') {
            console.error("neo-parser: Cannot parse, DOM is not ready. Call neoApi() after DOMContentLoaded.");
            return {
                 blog: { title: document.title, url: window.location.href }, // Basic info
                 pageType: 'parsing_error',
                 page: { error: "DOM not ready during parse attempt." }
            };
        }

        let parsedData = {
            blog: {},
            pageType: 'unknown',
            page: null
        };

        try {
            parsedData.blog = getBlogInfoFromDOM();
            parsedData.pageType = determinePageTypeFromDOM(parsedData.blog.homepageUrl);

            switch (parsedData.pageType) {
                case 'homepage':
                case 'archive':
                case 'index':
                    const listPageData = parseListPageDOM(parsedData.pageType);
                    parsedData.page = listPageData.posts;
                    // Refine pageType and add context to blog object
                    if (parsedData.pageType === 'index') {
                        parsedData.pageType = listPageData.subType; // label or search
                        if (listPageData.subType === 'label') parsedData.blog.pageName = listPageData.nameOrQuery;
                        else parsedData.blog.searchQuery = listPageData.nameOrQuery;
                    } else if (parsedData.pageType === 'archive') {
                        parsedData.blog.pageName = listPageData.nameOrQuery;
                    }
                    parsedData.blog.pageTitle = listPageData.title;
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
            console.error("neo-parser: Error during DOM parsing:", error);
            parsedData.pageType = 'parsing_error';
            parsedData.page = { error: "Failed to parse page data from DOM.", details: error.message };
            // Attempt to get basic blog info even on error
            if (!parsedData.blog.title) {
                 try { parsedData.blog = getBlogInfoFromDOM(); } catch(e){}
            }
        }
        // Ensure current URL is always set
        parsedData.blog.url = window.location.href;
        return parsedData;
    }
    // ===============================================
    // END: Main Parsing Orchestrator
    // ===============================================


    // ===============================================
    // START: Public API Function Definition
    // ===============================================
    function neoApi() {
        // If data is already cached, return it immediately
        if (cachedData) {
            return cachedData;
        }

        // If data is not cached, parse the DOM (includes DOM ready check)
        // Store the result in the cache and return it.
        cachedData = parseBloggerDataInternal();
        return cachedData;
    }
    // ===============================================
    // END: Public API Function Definition
    // ===============================================

    // --- Expose the public API function to the global scope ---
    window.neoApi = neoApi;

    // Optional: Log that the API is ready (useful for debugging load order)
    // console.log("neo-parser: window.neoApi function is now available.");

})(); // End IIFE























/**
 * neo-render.js - Using Handlebars.js
 * Rendering Template String to HTML using neoRender()
 */
const loadHandlebars = () => {
    return new Promise((resolve, reject) => {
      if (window.Handlebars) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      (document.head || document.documentElement).appendChild(script);
    });
  };
  

  const neoRender = async (templateString) => {
    if (!templateString || typeof templateString !== 'string') {
        console.error('neoRender requires a valid HTML template string as an argument.');
        return;
    }
  
    try {
      await loadHandlebars();
      registerHelpers();
      const api = await window.neoApi?.();
  
      if (!api) throw new Error('API data missing or invalid.');
  
      const template = Handlebars.compile(templateString);
      const renderedHtmlString = template(api);
  
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(renderedHtmlString, 'text/html');
  
      const newBodyContent = newDoc.body?.innerHTML;
      const newHeadNodes = newDoc.head?.childNodes;
  
      if (newBodyContent === undefined || newBodyContent === null) {
          throw new Error("Could not parse body content from the rendered template.");
      }
  
      if (newHeadNodes && document.head) {
          Array.from(newHeadNodes).forEach(node => {
              document.head.appendChild(document.adoptNode(node));
          });
       } else {
          console.warn("Could not find new head nodes or existing document head to merge.");
      }
  
      document.body.innerHTML = newBodyContent;
      console.log('Page body replaced.');
  
    } catch (error) {
      console.error('Failed to render page content:', error);
    }
  };
  