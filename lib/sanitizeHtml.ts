/* ============================================================
   Sanitize HTML phía client trước khi render bằng dangerouslySetInnerHTML.
   Dùng DOMParser + allowlist (an toàn hơn nhiều so với regex) để loại bỏ
   <script>/<iframe>, thuộc tính on* và URL javascript: — giảm mạnh bề mặt
   stored-XSS. Trên production khuyến nghị bổ sung DOMPurify đầy đủ.
   ============================================================ */

const ALLOWED_TAGS = new Set([
  "a", "b", "strong", "i", "em", "u", "s", "p", "br", "hr",
  "ul", "ol", "li", "blockquote", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "span", "div", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
]);

const ALLOWED_ATTRS = new Set(["href", "src", "alt", "title", "target", "rel"]);

function isSafeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  // chặn javascript:, data: (trừ ảnh), vbscript:
  if (v.startsWith("javascript:") || v.startsWith("vbscript:")) return false;
  if (v.startsWith("data:") && !v.startsWith("data:image/")) return false;
  return true;
}

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    // SSR fallback: tối thiểu loại bỏ thẻ script/iframe & handler on*
    return dirty
      .replace(/<\/?(script|iframe|object|embed|style)[^>]*>/gi, "")
      .replace(/ on\w+="[^"]*"/gi, "")
      .replace(/ on\w+='[^']*'/gi, "");
  }

  const doc = new DOMParser().parseFromString(dirty, "text/html");

  const walk = (node: Element) => {
    // duyệt từ cuối để xóa an toàn khi đang lặp
    const children = Array.from(node.children);
    for (const el of children) {
      const tag = el.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        el.remove();
        continue;
      }
      // lọc thuộc tính
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (!ALLOWED_ATTRS.has(name) || name.startsWith("on")) {
          el.removeAttribute(attr.name);
          continue;
        }
        if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) {
          el.removeAttribute(attr.name);
        }
      }
      // link mở tab mới: thêm rel an toàn
      if (tag === "a" && el.getAttribute("target") === "_blank") {
        el.setAttribute("rel", "noopener noreferrer");
      }
      walk(el);
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}
