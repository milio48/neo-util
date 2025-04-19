/**
 * ====================================================================
 * Neo Blog Renderer - Boilerplate Consumer Script
 * ====================================================================
 * - Waits for DOM and neoApi function.
 * - Fetches data using neoApi().
 * - Injects <head> content.
 * - Replaces <body> content.
 * - Using neoRender() to render template.
 * - Handlebars.js is included.
 *
 * Place this script in a [Global Scripts/HTML All Pages (Hidden)] gadget in Blogger Layout.
 * 
 * 
 * Please add a Loading Overlay to Waiting for DOM and neoApi() to load.
 */






  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.neoApi === 'function') {
      NeoRender(myTemplateString);
    } else {
      console.error('Fatal: neoApi function not found.');
    }
  });
  
  const registerHelpers = () => {
    if (!window.Handlebars) return;
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('now', () => new Date().getFullYear());
  };
  

  const myTemplateString = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>{{blog.title}} - injected</title>
      <meta name="description" content="Generated description for {{blog.title}}">
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .post { margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1.5rem; }
          header, footer { padding: 1rem; background-color: #f8f9fa; }
          header { margin-bottom: 2rem; }
          footer { margin-top: 3rem; text-align: center; font-size: 0.9em; color: #6c757d; }
          a { color: #007bff; text-decoration: none; }
          a:hover { text-decoration: underline; }
          h1, h2, h3 { color: #343a40; margin-top: 0; }
          time { color: #6c757d; font-size: 0.9em; display: block; margin-bottom: 0.5rem; }
      </style>

      <!-- CSS EXTERNAL -->
      <style src="/css/template-specific.css"></style>

      <!-- JS EXTERNAL -->
      <script src="/js/template-specific.js" defer><\/script> <!-- Escape End Tag Script to prevent injection -->
  </head>
  <body>
      <header>
          <h1>{{blog.title}}</h1>
          <nav><a href="{{blog.homepageUrl}}">Home</a></nav>
      </header>
      <main>
          {{#if (eq pageType "homepage")}}
              <h2>Latest Posts</h2>
              {{#each page}}
                  <article class="post">
                      <h3><a href="{{url}}">{{title}}</a></h3>
                      {{#if publishedFormatted}}<time datetime="{{publishedIso8601}}">{{publishedFormatted}}</time>{{/if}}
                      <div>{{{bodyHtml}}}</div>
                  </article>
              {{else}}
                  <p>No posts found.</p>
              {{/each}}
          {{else if (eq pageType "item")}}
              <article class="post">
                  <h2>{{page.title}}</h2>
                   {{#if page.publishedFormatted}}<time datetime="{{page.publishedIso8601}}">{{page.publishedFormatted}}</time>{{/if}}
                  <div>{{{page.bodyHtml}}}</div>
              </article>
          {{else}}
              <p>Page type "{{pageType}}" not recognized.</p>
          {{/if}}
      </main>
      <footer>
          <p>&copy; {{now}} {{blog.title}}. All rights reserved.</p>
      </footer>
  </body>
  </html>
  `;