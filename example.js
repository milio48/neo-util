/**
 * ====================================================================
 * Neo Blog Renderer - Boilerplate Consumer Script
 * ====================================================================
 * - Waits for DOM and neoApi function.
 * - Fetches data using neoApi().
 * - Injects basic CSS styles.
 * - Hides original theme content.
 * - Renders content dynamically based on page type.
 *
 * Place this script in a global HTML/JavaScript gadget in Blogger Layout.
 */
(function() {
    'use strict';

    // --- 1. CSS Styling Block ---
    // Injected dynamically for basic visual structure.
    // Customize or replace with your own CSS framework/styles.
    const CSS_STYLES = `
      body {
        background-color: #f8f9fa; /* Light grey background */
        color: #212529; /* Default text color */
        margin: 0; /* Remove default body margin */
        line-height: 1.6;
        font-size: 16px;
      }
      .neo-ui-container {
        max-width: 850px; /* Content width */
        margin: 0 auto; /* Center container */
        padding: 20px 15px 40px 15px;
        background-color: #ffffff; /* White background for content area */
        box-shadow: 0 2px 8px rgba(0,0,0,0.05); /* Subtle shadow */
        min-height: calc(100vh - 40px); /* Ensure it takes full height */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      }
      .neo-ui-header h1 {
        font-size: 2.5em;
        margin: 0 0 10px 0;
        color: #343a40;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 15px;
        text-align: center;
      }
      .neo-ui-header h1 a {
        color: inherit;
        text-decoration: none;
      }
      .neo-ui-list-title {
          font-size: 1.8em;
          color: #495057;
          margin-top: 40px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 10px;
      }
      .neo-ui-post-summary, .neo-ui-post-full {
        background-color: #fff;
        padding: 25px;
        margin-bottom: 30px;
        border: 1px solid #e9ecef;
        border-radius: 5px;
      }
      .neo-ui-post-summary h2, .neo-ui-post-full h1 {
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 1.75em;
        color: #007bff; /* Link blue for titles */
      }
      .neo-ui-post-summary h2 a {
          color: inherit;
          text-decoration: none;
      }
      .neo-ui-post-summary h2 a:hover,
      .neo-ui-post-full h1 a:hover {
          text-decoration: underline;
      }
      .neo-ui-post-meta {
        font-size: 0.9em;
        color: #6c757d; /* Grey for meta */
        margin-bottom: 15px;
        display: block; /* Ensure it's on its own line */
      }
      .neo-ui-post-meta a {
          color: #5a6268;
          text-decoration: none;
          margin-left: 5px;
          border-bottom: 1px dotted #adb5bd;
      }
       .neo-ui-post-meta a:hover {
          color: #007bff;
          border-bottom: 1px solid #007bff;
       }
      .neo-ui-post-summary img, .neo-ui-post-full img {
        max-width: 100%;
        height: auto;
        margin-top: 10px;
        border-radius: 4px;
      }
      .neo-ui-post-snippet {
        color: #495057;
        margin-top: 10px;
      }
      .neo-ui-post-body {
        margin-top: 20px;
        font-size: 1.05em; /* Slightly larger body font */
      }
      .neo-ui-post-body p { margin: 0 0 1em 0; }
      .neo-ui-post-body h1, .neo-ui-post-body h2, .neo-ui-post-body h3 { margin-top: 1.5em; margin-bottom: 0.5em; color: #343a40;}
      .neo-ui-post-body a { color: #007bff; }
      .neo-ui-post-body code { background-color: #e9ecef; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
      .neo-ui-post-body pre { background-color: #e9ecef; padding: 15px; border-radius: 4px; overflow-x: auto; }
      .neo-ui-error-message {
          color: #dc3545; /* Red for errors */
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
      }
      /* Hide original theme content */
      .neo-content-wrapper { display: none !important; }
      /* Add other specific styles as needed */
    `;
    const styleElement = document.createElement('style');
    styleElement.id = 'neo-ui-styles';
    styleElement.textContent = CSS_STYLES;
    document.head.appendChild(styleElement);

    // --- 2. Main Rendering Function ---
    function renderBlogUI(api) {
        if (!api || !api.blog || !api.pageType) {
            console.error("renderBlogUI: Invalid or missing API data.", api);
            displayRenderError("Failed to receive valid blog data from the parser.");
            return;
        }

        console.log("renderBlogUI: Starting render with API data:", api);

        // Create main container
        const container = document.createElement('div');
        container.className = 'neo-ui-container';
        container.id = 'neo-ui-dynamic-content';

        // Render Header
        container.appendChild(renderHeader(api.blog));

        // Render Main Content based on Page Type
        const mainContent = document.createElement('main');
        try {
            switch (api.pageType) {
                case 'homepage':
                    mainContent.appendChild(renderHomepage(api.page));
                    break;
                case 'item':
                    mainContent.appendChild(renderItemPage(api.page));
                    break;
                case 'static_page':
                    mainContent.appendChild(renderStaticPage(api.page));
                    break;
                case 'archive':
                case 'label':
                case 'search':
                    mainContent.appendChild(renderListPage(api.page, api.blog, api.pageType));
                    break;
                case 'error':
                    mainContent.appendChild(renderErrorPage(api.page, "Page Not Found (404)"));
                    break;
                case 'unknown':
                    mainContent.appendChild(renderErrorPage(api.page, "Unknown Page Type"));
                    break;
                case 'parsing_error':
                    mainContent.appendChild(renderErrorPage(api.page, "Data Parsing Error"));
                    break;
                default:
                    console.warn("renderBlogUI: Unhandled page type:", api.pageType);
                    mainContent.innerHTML = `<p>Rendering not implemented for page type: ${api.pageType}</p>`;
            }
        } catch (renderError) {
            console.error("renderBlogUI: Error during content rendering:", renderError);
            mainContent.innerHTML = `<div class="neo-ui-error-message">A critical error occurred while rendering the page content.</div>`;
        }
        container.appendChild(mainContent);

        // Render Footer (Optional)
        // container.appendChild(renderFooter(api.blog));

        // --- 3. Reset/Replace Body Content ---
        // Remove old dynamic container if it exists (e.g., from previous navigation)
        const oldContainer = document.getElementById('neo-ui-dynamic-content');
        if (oldContainer) oldContainer.remove();

        // Add the new container to the start of the body
        document.body.prepend(container);

        // Hide original theme elements (redundant if CSS is working, but safe)
        const defaultThemeContent = document.querySelector('.neo-content-wrapper');
        if (defaultThemeContent) defaultThemeContent.style.display = 'none';
        const defaultHeader = document.querySelector('.neo-site-header');
        if (defaultHeader) defaultHeader.style.display = 'none';
        const defaultFooter = document.querySelector('.neo-site-footer');
        if (defaultFooter) defaultFooter.style.display = 'none';

        console.log("renderBlogUI: Rendering complete.");
    }

    // --- Helper Rendering Functions ---

    function renderHeader(blog) {
        const header = document.createElement('header');
        header.className = 'neo-ui-header';
        header.innerHTML = `<h1><a href="${blog.homepageUrl || '/'}">${blog.title || 'Blog Title'}</a></h1>`;
        // Add navigation or description here if needed
        return header;
    }

    function renderHomepage(posts) {
        const fragment = document.createDocumentFragment();
        if (!Array.isArray(posts)) {
            console.error("renderHomepage: Expected an array of posts, got:", posts);
            fragment.appendChild(createErrorElement("Homepage data is invalid."));
            return fragment;
        }
        if (posts.length === 0) {
             fragment.appendChild(createMessageElement("No posts found on the homepage."));
             return fragment;
        }
        posts.forEach(post => fragment.appendChild(createPostSummaryElement(post)));
        return fragment;
    }

    function renderListPage(posts, blog, pageType) {
        const fragment = document.createDocumentFragment();
        let listTitle = blog.pageTitle || "Posts"; // Default title

        // Create specific title for Archive, Label, Search
        if (pageType === 'archive' && blog.pageName) {
            listTitle = `Archive: ${blog.pageName}`;
        } else if (pageType === 'label' && blog.pageName) {
            listTitle = `Label: ${blog.pageName}`;
        } else if (pageType === 'search' && blog.searchQuery) {
            listTitle = `Search Results for: "${blog.searchQuery}"`;
        }

        const titleElement = document.createElement('h2');
        titleElement.className = 'neo-ui-list-title';
        titleElement.textContent = listTitle;
        fragment.appendChild(titleElement);

        if (!Array.isArray(posts)) {
             console.error(`renderListPage (${pageType}): Expected an array of posts, got:`, posts);
             fragment.appendChild(createErrorElement("List data is invalid."));
             return fragment;
        }
         if (posts.length === 0) {
             fragment.appendChild(createMessageElement(`No posts found for this ${pageType}.`));
             return fragment;
        }

        posts.forEach(post => fragment.appendChild(createPostSummaryElement(post)));
        return fragment;
    }

    function renderItemPage(post) {
        const article = document.createElement('article');
        article.className = 'neo-ui-post-full';
        if (!post) {
            console.error("renderItemPage: Post data is missing.");
            article.appendChild(createErrorElement("Could not load post details."));
            return article;
        }
        article.innerHTML = `
            <h1>${post.title || 'Untitled Post'}</h1>
            <span class="neo-ui-post-meta">
                Published on ${post.publishedFormatted || 'N/A'}
                ${post.labels && post.labels.length > 0 ? ' | Labels: ' + post.labels.map(l => `<a href="${l.url || '#'}">${l.name}</a>`).join(', ') : ''}
            </span>
            <div class="neo-ui-post-body">
                ${post.bodyHtml || '<p>This post has no content.</p>'}
            </div>
        `;
        return article;
    }

     function renderStaticPage(page) {
        const article = document.createElement('article');
        article.className = 'neo-ui-post-full'; // Reuse styling
         if (!page) {
            console.error("renderStaticPage: Page data is missing.");
            article.appendChild(createErrorElement("Could not load page details."));
            return article;
        }
        article.innerHTML = `
            <h1>${page.title || 'Untitled Page'}</h1>
            <div class="neo-ui-post-body">
                ${page.bodyHtml || '<p>This page has no content.</p>'}
            </div>
        `;
        return article;
    }

    function renderErrorPage(pageData, defaultTitle = "Error") {
        const div = document.createElement('div');
        div.className = 'neo-ui-error-message';
        div.innerHTML = `<h2>${pageData?.title || defaultTitle}</h2><p>${pageData?.message || pageData?.error || 'An unexpected error occurred.'}</p>`;
        return div;
    }

     function createPostSummaryElement(post) {
        const article = document.createElement('article');
        article.className = 'neo-ui-post-summary';
        article.innerHTML = `
            <h2><a href="${post.url || '#'}">${post.title || 'Untitled Post'}</a></h2>
            <span class="neo-ui-post-meta">
                ${post.publishedFormatted || 'N/A'}
                 ${post.labels && post.labels.length > 0 ? ' | Labels: ' + post.labels.map(l => `<a href="${l.url || '#'}">${l.name}</a>`).join(', ') : ''}
            </span>
            ${post.firstImageUrl ? `<img src="${post.firstImageUrl}" alt="" class="neo-ui-post-summary-image">` : ''}
            ${post.snippet ? `<p class="neo-ui-post-snippet">${post.snippet}</p>` : ''}
        `;
        return article;
    }

    function createErrorElement(message) {
        const div = document.createElement('div');
        div.className = 'neo-ui-error-message';
        div.textContent = message;
        return div;
    }
     function createMessageElement(message) {
        const p = document.createElement('p');
        p.textContent = message;
        p.style.textAlign = 'center';
        p.style.color = '#6c757d';
        return p;
    }


    // --- 4. Initialization Logic ---
    function initializeNeoUI() {
        console.log("Neo UI Initializer: DOM ready. Checking for neoApi function...");

        if (typeof neoApi === 'function') {
            console.log("Neo UI Initializer: neoApi function found. Calling it...");
            try {
                const apiData = neoApi(); // Call the parser function
                if (apiData) {
                    renderBlogUI(apiData); // Render the UI
                } else {
                    console.error("Neo UI Initializer: neoApi() returned null or invalid data.");
                    displayRenderError("Failed to retrieve blog data.");
                }
            } catch (error) {
                console.error("Neo UI Initializer: Error executing neoApi():", error);
                displayRenderError("An error occurred while fetching blog data.");
            }
        } else {
            console.error("Neo UI Initializer: Error: neoApi function is not defined. Parser script might have failed to load.");
            displayRenderError("Blog data parser failed to load. Cannot render page.");
        }
    }

    // Helper to display critical errors if rendering fails early
    function displayRenderError(message) {
         const errorDiv = document.createElement('div');
         errorDiv.className = 'neo-ui-error-message';
         errorDiv.style.margin = '50px auto';
         errorDiv.style.maxWidth = '600px';
         errorDiv.textContent = `Critical Error: ${message}`;
         // Try to prepend to body, even if other elements fail
         if (document.body) {
             document.body.prepend(errorDiv);
         } else {
             // Fallback if body isn't ready somehow
             alert(`Critical Error: ${message}`);
         }
    }

    // --- 5. Run Initialization ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNeoUI);
    } else {
        // DOM is already ready
        initializeNeoUI();
    }

})(); // End IIFE