# Neo-util: JavaScript-Based Templating System for Blogger

## Overview
Neo-util is a templating system for Blogger that enables theme development using JavaScript exclusively. With an API-based approach, neo-util simplifies the theme creation process by separating presentation logic from Blogger data.

## Live Demo
🔗 [https://neo-util.blogspot.com/](https://neo-util.blogspot.com/)

**Demo Features:**
- Enable style mode via toggle in the bottom bar
- Try the `window.neoApi()` function in the Dev Tools Console

## Setup
1. Blogger Dashboard - Theme - Edit HTML - Replace with neo-util.xml code - Save
   - (XML already includes neo-util.js and Handlebars.js)
   - [![](https://data.jsdelivr.com/v1/package/gh/milio48/neo-util/badge)](https://www.jsdelivr.com/package/gh/milio48/neo-util)
2. Put your custom code on Layout -> Add a Gadget -> HTML/JavaScript
   - This is where you'll place your template code for rendering pages
   - See the Tutorial section below for examples

## Key Features
- **JavaScript-Centric Development** - Build Blogger themes entirely with JavaScript
- **Comprehensive Data API** - Access Blogger data through `window.neoApi()`
- **PageType Segmentation** - Full support for various Blogger page types
- **Widget System** - Modular template file management (HTML, CSS, JS)
- **Handlebars Integration** - Powerful templating engine support
- **Lightweight** - Lightweight solution without heavy dependencies

## How Neo-util Works
1. **Data Provision** - neo-util transforms raw Blogger data into a clean JavaScript structure
2. **Template Rendering** - Provides a rendering system based on Handlebars.js
3. **PageType Specialization** - Separates display logic based on page type
4. **Widget Management** - Flexible widget system as a pseudo file manager

## Pagetype 
| Link                                                            | Blogger PageType | neoApi PageType |
|-----------------------------------------------------------------|------------------|-----------------|
| https://neo-util.blogspot.com                                   | homepage         | homepage        |
| https://neo-util.blogspot.com/p/example-static-page.html        | static_page      | static_page     |
| https://neo-util.blogspot.com/2025/04/coding-my-first-game.html | item             | item            |
| https://neo-util.blogspot.com/2025/                             | archive          | archive         |
| https://neo-util.blogspot.com/search/label/dev                  | index            | label           |
| https://neo-util.blogspot.com/search?q=what                     | index            | search          |
| https://neo-util.blogspot.com/404                               | error_page       | error           |
> See [API Documentation](api-docs.md) for complete details

## SCREENSHOT
| WIDGET SYSTEM | JS BLOCK | EXAMPLE|
|---|---|---|
| [![widget-system.jpg](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhbxHhlQnfEkFArujpZZ9hqMM1wKmlRqZbUI1SLUukN_5LMY0aWyPNOCWOQbSquzTX8gOW4m9DnsZy8dUGklK0TgT3clhkMZC_PqKPGBEHOy3Fn67whXM4wZhGsudj7oWiPYzHXL2r6hAppg1VpT-3jYztQmj5W-ecfAsz0REXhq8Jalh73Fp61YqAifNAa/w200/widget-system.jpg 'widget-system.jpg')](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhbxHhlQnfEkFArujpZZ9hqMM1wKmlRqZbUI1SLUukN_5LMY0aWyPNOCWOQbSquzTX8gOW4m9DnsZy8dUGklK0TgT3clhkMZC_PqKPGBEHOy3Fn67whXM4wZhGsudj7oWiPYzHXL2r6hAppg1VpT-3jYztQmj5W-ecfAsz0REXhq8Jalh73Fp61YqAifNAa/s16000/widget-system.jpg) | [![block-js.jpg](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi6ryL8ks0umWs6hVM9_ZZO9jTv0KzyZI2V4TwC5NcETkuI2FkS5TV9yrVvksOdJ9C4h90si0dXZmEzJEqzyvS8hn96PzWUcTOiSd3RDYmSub83Hv-c086RlSnnNYLCsjLdGH_O8ZHPsGKZZnD2j_PmHOmHRGZugpo_RqfrttMY5kcycws9k_p_T0YCiXOi/w200/block-js.jpg 'block-js.jpg')](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi6ryL8ks0umWs6hVM9_ZZO9jTv0KzyZI2V4TwC5NcETkuI2FkS5TV9yrVvksOdJ9C4h90si0dXZmEzJEqzyvS8hn96PzWUcTOiSd3RDYmSub83Hv-c086RlSnnNYLCsjLdGH_O8ZHPsGKZZnD2j_PmHOmHRGZugpo_RqfrttMY5kcycws9k_p_T0YCiXOi/s1600/block-js.jpg) | [![screenshot.jpg](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiA5MNWENrCi-Jb8xwi5Ux6hyphenhyphentrkbSFDaZHlxKfie7ngWfDDcRgd-N5XHLHEimFTzKtgGSJsV1dVzve67l0GwR0sbs4-_VKM404wlrDdu3or-4DuyrtIRKx8JGYq8bJ-J-dXHm4Jc5-njLthAlKAie2W_wV4CSi3skBcOjeoUuysqwA3WaN2BT5m4f8N-2V/w200/screenshot.jpg 'screenshot.jpg')](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiA5MNWENrCi-Jb8xwi5Ux6hyphenhyphentrkbSFDaZHlxKfie7ngWfDDcRgd-N5XHLHEimFTzKtgGSJsV1dVzve67l0GwR0sbs4-_VKM404wlrDdu3or-4DuyrtIRKx8JGYq8bJ-J-dXHm4Jc5-njLthAlKAie2W_wV4CSi3skBcOjeoUuysqwA3WaN2BT5m4f8N-2V/s1600/screenshot.jpg) |


### Inject CSS
Method 1 : Programmatically via JavaScript
```html
<script>
  document.head.appendChild(
    Object.assign(document.createElement('style'), {
      textContent: `
      body { background-color: lightblue; }
      h1 { color: darkred; }
      `
    })
  );
</script>
```
Method 2 : Directly with style tags
```html
<style>
  body { background-color: lightblue; }
  h1 { color: darkred; }
</style>
```


### Inject JS
Simply create a script tag
```html
<script>
  alert('Hello');
</script>
```

### Injecting HTML + Handlebars.js included
<details>

<summary>Expand Code example.js</summary>

```html
<script>
 
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
    // Loading Bar will be removed automatically by neoRender
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


</script>
```
> When defining myTemplateString variable, write script closing tag with escaped end tag. `<\/script>`
</details>

## API Code
```javascript
// main variable
console.log(window.neoApi());

// public function
neoRender(myTemplateString);

// custom helper
const registerHelpers = () => {
  if (!window.Handlebars) return;
  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("or", function() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.some(arg => !!arg);
  });
  Handlebars.registerHelper("now", () => new Date().getFullYear());
};
```

## API Docs
[API Documentation for the window.neoApi()](api-docs.md)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (window.neoApi()) {
    console.log("Blogger Data:", window.neoApi());

    // Example: Access blog title
    console.log("Blog Title:", window.neoApi().blog.title);

    // Example: Access posts on homepage
    if (window.neoApi().pageType === 'homepage') {
      console.log("Posts:", window.neoApi().page);
    }
  } else {
    console.error("window.neoApi() not found!");
  }
});
```

The `neoApi()` object typically contains:
* `neoApi().blog`: General blog information (title, URL, etc.)
* `neoApi().pageType`: The type of the current page (e.g., 'homepage', 'item', 'label')
* `neoApi().page`: Page-specific data (an array of posts for lists, or an object for single items/pages)

## Websites Using neo-util
1. https://neo-util.blogspot.com/
2. ...