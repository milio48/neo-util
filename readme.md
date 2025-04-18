# Blogger Data Provider Theme & DOM Parser

## The Short Version (TL;DR)

This theme focuses on rendering essential Blogger data into clean HTML. This allows **you** to focus purely on building your frontend using the structured data provided, without wrestling with complex Blogger templating for visuals. Think of it as a **data layer** for your Blogger site.

## Live Demo / Page Examples

See how the theme renders different Blogger page types. The underlying HTML structure is what the parser reads.

1.  **Homepage:** [`https://neo-util.blogspot.com/`](https://neo-util.blogspot.com/)
2.  **Item Page (Single Post):** [`https://neo-util.blogspot.com/2025/04/coding-my-first-game.html`](https://neo-util.blogspot.com/2025/04/coding-my-first-game.html) *(Note: Specific post URL may change)*
3.  **Static Page:** [`https://neo-util.blogspot.com/p/example-static-page.html`](https://neo-util.blogspot.com/p/example-static-page.html) *(Note: Example, your static page path might differ)*
4.  **Archive Page:** [`https://neo-util.blogspot.com/2025/`](https://neo-util.blogspot.com/2025/)
5.  **Label Page:** [`https://neo-util.blogspot.com/search/label/dev`](https://neo-util.blogspot.com/search/label/dev)
6.  **Search Results Page:** [`https://neo-util.blogspot.com/search?q=what`](https://neo-util.blogspot.com/search?q=what)
7.  **Error Page (404):** [`https://neo-util.blogspot.com/404`](https://neo-util.blogspot.com/404)

## How it Works (Briefly)

1.  **Theme Renders HTML:** The minimalist XML theme (`neo-util.xml`) outputs blog data using specific HTML structures (tables for lists, semantic tags for single pages).
2.  **Parser Reads HTML:** The theme includes a script tag loading `neo-parser.js` (hosted externally). This script runs in the browser, analyzes the HTML DOM, and extracts the data.
3.  **Data Object Available:** The parser makes the extracted data available globally via `window.neoApi()`.

## Setup

1.  **Upload Theme:** Go to your Blogger Dashboard -> Theme -> Edit HTML. Replace the *entire* editor content with the code from `neo-util.xml`. Save.
    *(The theme already includes the `<script>` tag to load the parser from its hosted location - no extra JS installation needed).*
[![](https://data.jsdelivr.com/v1/package/gh/milio48/neo-util/badge)](https://www.jsdelivr.com/package/gh/milio48/neo-util)
## Accessing the Data ("API")

After the page loads (`DOMContentLoaded`), access the parsed data using the global variable `window.neoApi()`.

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
*   `neoApi().blog`: General blog information (title, URL, etc.)
*   `neoApi().pageType`: The type of the current page (e.g., 'homepage', 'item', 'label').
*   `neoApi().page`: Page-specific data (an array of posts for lists, or an object for single items/pages).

*(Refer to `neo-parser.js` or console output for the exact structure).*

## Api Docs

[API Documentation for the window.neoApi()](api-docs.md)

## Injecting Your Custom Code

You might want to add your *own* JavaScript (e.g., your frontend framework code, analytics) that uses the `neoApi()` data. You can inject code that runs only on specific page types using these methods:

### Method 1: Via Theme XML `<script>` Blocks

Directly edit the theme's XML (`neo-util.xml`). Find the conditional blocks near the end of the `<body>` and add your code inside the appropriate `//<![CDATA[ ... //]]>` section:

```xml
  <!-- Conditional <script> Blocks (Placeholders - Best Practice) -->
  <b:if cond='data:view.isHomepage'>
    <!-- Code 1. Homepage -->
    <script type='text/javascript'>//<![CDATA[
      // Your Homepage-specific JS here
      // console.log("Homepage JS runs");
      // if(window.neoApi()) { /* Use neoApi */ }
    //]]></script>
  <b:elseif cond='data:blog.pageType == "item"'/>
    <!-- Code 2. Post -->
    <script type='text/javascript'>//<![CDATA[
      // Your Item Page-specific JS here
    //]]></script>
  </b:if>
  <!-- ... other conditions ... -->
```

### Method 2: Via Blogger Layout Gadgets

Use Blogger's UI without editing XML. Go to Blogger Dashboard -> Layout. Find the conditional widget sections (e.g., "Home Widgets", "Post Widgets", "Index (Label/Search) Widgets") and add an "HTML/JavaScript" gadget containing your code (including `<script>` tags if needed).

```xml
   <!-- Conditional Widget Sections -->
```

*(There might also be a "Global Scripts/HTML (All Pages)" section if you included that option in your theme for code that should run everywhere).*

## Examples
Don't want to touch the Blogger XML? A simpler method is to inject your JavaScript directly into an HTML/JavaScript gadget through the Blogger Layout settings. See the screenshot below for an example.

![neo-widget-js](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8sDaWd8M1BA-HDmiSLN6CGYRtsFwJUZhyphenhyphenwpLhcrg-6yzc_4gMRFhgNBLNDGlI2-W94oOBtvfkRYaiyMNrUW3cYLOVR517oI6dEfzK_7vaTqD7e6MFIvhRbuPi93Bnssk0h3BfpLKGUv_Ym7dF7KJifipdxu7_Z-qzv-j259CxXabswM5r0ry6toc2273x/s16000/neo-widget-js.jpg)

### Styling & Enjoying the Theme
[example.js](example.js)


<details>

<summary>Contributing</summary>



# Contributing

Contributions are welcome! We appreciate any help, whether it's reporting bugs, suggesting features, improving documentation, or submitting code changes.

**How to Contribute:**

1.  **Issues:** Please open an issue first to report bugs or discuss potential new features or significant changes. This helps coordinate efforts.
2.  **Pull Requests:** For code contributions, please fork the repository, make your changes on a separate branch, and then submit a pull request linked to the relevant issue (if applicable). Ensure your code follows the existing style and includes comments where necessary.

### Current Features (What this project *already* does)

This project currently provides the following core functionalities:

*   **Minimalist Data Theme (`neo-util.xml`):** A Blogger XML theme focused on rendering essential blog data into predictable, structured HTML with minimal styling.
*   **DOM Parser (`neo-parser.js`):** A JavaScript parser (included via the theme) that analyzes the HTML generated by the theme.
*   **JavaScript Data API (`window.neoApi()`):** Exposes a global function that returns a structured JavaScript object containing the parsed data after the DOM is ready.
*   **Page Type Detection:** Automatically identifies the current page type (Homepage, Item, Static Page, Archive, Label Search, Query Search, Error).
*   **Structured Data Extraction:** Parses key information into the `neoApi()` object, including:
    *   **Blog Info (`neoApi().blog`):** Blog title, homepage URL, current page URL, page title, context name (for Archive/Label), search query.
    *   **Page Data (`neoApi().page`):**
        *   For lists (Homepage, Archive, Label, Search): An array of post objects (`postId`, `title`, `url`, `publishedIso`, `publishedFormatted`, `author`, `labels` array, `snippet`, `firstImageUrl`).
        *   For single items (`item`): A post detail object (`postId`, `title`, `url`, `publishedIso`, `publishedFormatted`, `labels` array, `bodyHtml`).
        *   For static pages (`static_page`): A page detail object (`pageId`, `title`, `url`, `bodyHtml`).
        *   For errors/unknown (`error`, `unknown`, `parsing_error`): A message object (`title`, `message`, optional error details).
*   **Data/Presentation Decoupling:** Enables developers to build custom frontends using any JavaScript framework or library by consuming the `neoApi()` data, separate from Blogger's rendering logic.
*   **Example Consumer Script (`example.js`):** Provides a basic example of how to fetch data and render a simple UI.

### To-Do List & Potential Future Enhancements (Ideas for Contributors)

Here are some ideas for potential improvements and new features. Feel free to suggest others!

**Parser (`neo-parser.js`) Enhancements:**

*   **Parse Comment Data:**
    *   Extract comment count for posts (might require theme changes to render the count).
    *   Potentially parse basic details of recent comments if the theme can render them reliably.
*   **Parse Author Details:** Extract author name/profile URL on `item` pages (currently marked as *not parsed* in API docs, requires checking if `itemprop="author"` or similar data is available/renderable by the theme).
*   **Parse Pagination Data:** Extract URLs for "Next Page" / "Previous Page" on list views (Homepage, Archive, Label, Search) if the theme renders these links with identifiable selectors. This would enable custom pagination controls.
*   **Parse Related Posts:** If the theme includes a related posts widget/section with structured data, parse this information.
*   **Improve Error Handling:** Provide more specific error messages within the `parsing_error` object based on where parsing failed.
*   **Increase Robustness:** Explore ways to make the parser slightly more tolerant of minor, non-breaking variations in the theme's HTML (challenging with DOM scraping).

**Theme (`neo-util.xml`) Enhancements:**

*   **Render Data for Comments/Pagination:** Ensure the theme renders the necessary HTML elements (with clear IDs/classes) if features like comment count or pagination parsing are to be added.
*   **Theme Configuration (Optional):** Consider adding simple theme options (e.g., via `b:includable` variables) to toggle the rendering of certain data sections, although this might conflict with the minimalist goal.

**Frontend / Consumer Features (Things to build *using* the API):**

*   **Dynamic Navigation Bar:** Create a navigation menu using data from `neoApi().blog` or potentially by parsing a specific menu gadget's HTML (if the theme renders it predictably).
*   **Blogger Comment Integration:** Build a UI to display and potentially submit Blogger comments using the `postId` and standard Blogger comment frame/API.
*   **Third-Party Comment Systems:** Integrate systems like Disqus using the `postId` and `url` from the API.
*   **Client-Side Search:** Implement a live search feature that filters the posts available in `neoApi().page` on list views.
*   **Advanced Pagination:** Build custom "Load More", infinite scroll, or numbered pagination controls using parsed pagination data (if added).
*   **Image Lightboxes/Galleries:** Enhance the display of images within `bodyHtml`.
*   **Framework Examples:** Create example implementations using popular frameworks (React, Vue, Svelte, Alpine.js) showing how to integrate `neoApi()`.

**Documentation & Testing:**

*   **More Examples:** Add more diverse examples of using the `neoApi()` data.
*   **Tutorials:** Write guides on building specific features (like a navbar or comment section) using this project.
*   **Automated Tests:** Implement basic automated tests (e.g., using Jest with JSDOM) to verify the parser's output for different sample HTML inputs.
</details>
