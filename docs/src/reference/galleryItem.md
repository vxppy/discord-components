---json
{"layout":"reference","component":"MediaGalleryComponentItem","property_names":["Description","IsSpoiler","Url"],"method_names":["clone","description","spoiler","toJSON","url"],"properties":["### <a id=\"property-Description\">Description</a>\n\n<pre class=\"vxppy-code\"><code><span class=\"line\"><span class=\"keyword\">get</span> <span class=\"property\">Description</span><span class=\"punctuation\">(): </span><span class=\"keyword\">string</span> <span class=\"punctuation\">|</span> <span class=\"keyword\">undefined</span></span></code></pre>\n\nthe description of the component.","### <a id=\"property-IsSpoiler\">IsSpoiler</a>\n\n<pre class=\"vxppy-code\"><code><span class=\"line\"><span class=\"keyword\">get</span> <span class=\"property\">IsSpoiler</span><span class=\"punctuation\">(): </span><span class=\"keyword\">boolean</span> <span class=\"punctuation\">|</span> <span class=\"keyword\">undefined</span></span></code></pre>\n\nWhether the component is marked as a spoiler.","### <a id=\"property-Url\">Url</a>\n\n<pre class=\"vxppy-code\"><code><span class=\"line\"><span class=\"keyword\">get</span> <span class=\"property\">Url</span><span class=\"punctuation\">(): </span><span class=\"keyword\">string</span></span></code></pre>\n\nThe url of the component"],"methods":["### <a id=\"method-clone\">clone</a>\n\n\n<pre class=\"vxppy-code\"><code><span class=\"line\"><span class=\"method\">clone</span><span class=\"punctuation\">():</span> <span class=\"class\">MediaGalleryComponentItem</span></span></code></pre>","### <a id=\"method-description\">description</a>\n\n\n<pre class=\"vxppy-code\"><code><span class=\"line\"><span class=\"method\">description</span><span class=\"punctuation\">(</span></span>\n<span class=\"line\">    <span class=\"parameter\">value</span><span class=\"punctuation\">:</span> <span class=\"keyword\">string</span></span>\n<span class=\"line\"><span class=\"punctuation\">):</span> <span class=\"class\">MediaGalleryComponentItem</span></span></code></pre>\n\nSets the description text of the component.\n\nPass `undefined` to remove the description.","### <a id=\"method-spoiler\">spoiler</a>\n\n\n<pre class=\"vxppy-code\"><code><span class=\"line\"><span class=\"method\">spoiler</span><span class=\"punctuation\">(</span></span>\n<span class=\"line\">    <span class=\"parameter\">state</span><span class=\"punctuation\">:</span> <span class=\"keyword\">boolean</span></span>\n<span class=\"line\"><span class=\"punctuation\">):</span> <span class=\"class\">MediaGalleryComponentItem</span></span></code></pre>\n\nMarks or un-marks the component as a spoiler.","### <a id=\"method-toJSON\">toJSON</a>\n\n\n<pre class=\"vxppy-code\"><code><span class=\"line\"><span class=\"method\">toJSON</span><span class=\"punctuation\">():</span> <span class=\"class\">APIMediaGalleryItem</span></span></code></pre>","### <a id=\"method-url\">url</a>\n\n\n<pre class=\"vxppy-code\"><code><span class=\"line\"><span class=\"method\">url</span><span class=\"punctuation\">(</span></span>\n<span class=\"line\">    <span class=\"parameter\">url</span><span class=\"punctuation\">:</span> <span class=\"keyword\">string</span></span>\n<span class=\"line\"><span class=\"punctuation\">):</span> <span class=\"class\">MediaGalleryComponentItem</span></span></code></pre>\n\nSets the gallery item URL.\n\nThe value can be either:\n- A url to image resource\n- An attachment URL in the format `attachment://<filename>`\n\n`@example` - \n```ts\nmediaGalleryItem.file('attachment://my_image.png')\n```"]}
---

```ts
class MediaGalleryComponentItem
```

## Builder

Create MediaGalleryComponentItem
The value can be either:
- A url to image resource
- An attachment URL in the format `attachment://<filename>`

<pre class="vxppy-code"><code><span class="line"><span class="keyword">export</span> <span class="keyword">function</span> <span class="method">galleryItem</span><span class="punctuation">(</span></span>
<span class="line">    <span class="parameter">url</span><span class="punctuation">:</span> <span class="keyword">string</span></span>
<span class="line"><span class="punctuation">):</span> <span class="class">MediaGalleryComponentItem</span></span></code></pre>

`@example` - 
```ts
mediaGalleryItem.file('attachment://my_image.png')
```
