/**
 * ====================================================================
 * Neo-util - Boilerplate Consumer Script
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



 
 function startLoading() {
   const o = document.createElement("div");
   o.id = "load";
   o.style = `position:fixed;inset:0;background:#fff;z-index:9999;display:grid;place-items:center;font:1.5rem sans-serif`;
   o.textContent = "Loading...";
   document.body.appendChild(o);
 } startLoading();
 


 document.addEventListener("DOMContentLoaded", () => {
   if (typeof window.neoApi === "function") {
     neoRender(myTemplateString);
     console.log(window.neoApi());
     // Loading Bar will be removed automatically by NeoRender
   } else {
     console.error("Fatal: neoApi function not found.");
   }
 });
 

 
 const registerHelpers = () => {
   if (!window.Handlebars) return;
   Handlebars.registerHelper("eq", (a, b) => a === b);
   Handlebars.registerHelper("or", function() {
     const args = Array.prototype.slice.call(arguments, 0, -1);
     return args.some(arg => !!arg);
   });
   Handlebars.registerHelper("now", () => new Date().getFullYear());
 };
 
 
 const myTemplateString = `
 <!DOCTYPE html>
 <html lang="en">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>{{blog.title}}</title>
     <style>
         :root { --color-primary: #2563eb; --color-text: #334155; --color-muted: #64748b; --color-bg: #f8fafc; }
         body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; max-width: 768px; margin: 0 auto; padding: 1.5rem; color: var(--color-text); background: var(--color-bg); }
         a { color: var(--color-primary); text-decoration: none; transition: all 0.2s; }
         a:hover { opacity: 0.8; text-decoration: underline; }
         header { margin-bottom: 3rem; text-align: center; }
         h1, h2, h3 { margin: 0 0 1rem; line-height: 1.3; }
         .post { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
         .meta { color: var(--color-muted); font-size: 0.85rem; margin-bottom: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }
         .label { background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
         .snippet { color: var(--color-text); margin: 0.5rem 0 0; }
         footer { margin-top: 3rem; text-align: center; color: var(--color-muted); font-size: 0.9rem; }
         @media (max-width: 640px) { body { padding: 1rem; } .post { padding: 1rem; } }
     </style>
      <!-- CSS EXTERNAL -->
      <style src="https://localhost/css/template-specific.css"></style>

      <!-- JS EXTERNAL -->
      <script src="https://localhost/js/template-specific.js" defer><\/script> <!-- Escape End Tag Script to prevent injection -->
 </head>
 <body>
     <header>
         <h1><a href="{{blog.homepageUrl}}">{{blog.title}}</a></h1>
     <form class="search-form" action="/search" method="get"> <input class="search-input" type="search" name="q" placeholder="Search posts..." {{#if (eq pageType "search")}}value="{{blog.searchQuery}}"{{/if}} aria-label="Search" > </form>
     </header>
 
     <main>
         {{#if (eq pageType "homepage")}}
             {{#each page}}
                 <article class="post">
                     <h2><a href="{{url}}">{{title}}</a></h2>
                     <div class="meta">
                         <time datetime="{{publishedIso}}">{{publishedFormatted}}</time>
                         {{#if labels.length}}• {{#each labels}}<a href="{{url}}" class="label">{{name}}</a>{{/each}}{{/if}}
                     </div>
                     <p class="snippet">{{{snippet}}}</p>
                 </article>
             {{/each}}
 
         {{else if (eq pageType "item")}}
             <article class="post">
                 <h1>{{page.title}}</h1>
                 <div class="meta">
                     <time datetime="{{page.publishedIso}}">{{page.publishedFormatted}}</time>
                     {{#if page.labels.length}}• {{#each page.labels}}<a href="{{url}}" class="label">{{name}}</a>{{/each}}{{/if}}
                 </div>
                 <div class="snippet">{{{page.bodyHtml}}}</div>
             </article>
 
         {{else if (eq pageType "static_page")}}
             <article class="post">
                 <h1>{{page.title}}</h1>
                 <div class="snippet">{{{page.bodyHtml}}}</div>
             </article>
 
         {{else if (or (eq pageType "archive") (eq pageType "label") (eq pageType "search"))}}
             <h2>
                 {{#if (eq pageType "archive")}}Archive: {{blog.pageName}}
                 {{else if (eq pageType "label")}}Label: {{blog.pageName}}
                 {{else}}Search: "{{blog.searchQuery}}"{{/if}}
             </h2>
             {{#each page}}
                 <article class="post">
                     <h3><a href="{{url}}">{{title}}</a></h3>
                     <div class="meta">
                         <time datetime="{{publishedIso}}">{{publishedFormatted}}</time>
                         {{#if labels.length}}• {{#each labels}}<a href="{{url}}" class="label">{{name}}</a>{{/each}}{{/if}}
                     </div>
                     <p class="snippet">{{{snippet}}}</p>
                 </article>
             {{/each}}
 
         {{else}}
             <article class="post">
                 <h1>Page Not Found</h1>
                 <p class="snippet">The requested page could not be displayed.</p>
             </article>
         {{/if}}
     </main>
 
     <footer>
         <p>&copy; {{now}} {{blog.title}}</p>
     </footer>
 </body>
 </html>
 `;