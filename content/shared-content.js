(function () {
  const source = "content/site-content.json";
  const ready = fetch(source, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Shared website content is unavailable");
      return response.json();
    })
    .then((data) => {
      window.ProfileContent.data = data;
      return data;
    })
    .catch(() => null);

  window.ProfileContent = {
    data: null,
    ready,
    text(item, mode = "detailed", field = "body") {
      if (!item) return "";
      if (mode === "compact") return item[`compact_${field}`] || item[field] || "";
      return item[field] || "";
    },
    title(item, mode = "detailed") {
      if (!item) return "";
      return mode === "compact" ? item.compact_title || item.title || "" : item.title || "";
    },
    meta(item, mode = "detailed") {
      if (!item) return "";
      return mode === "compact" ? item.compact_meta || item.meta || "" : item.meta || "";
    },
    keywordText(item) {
      return Array.isArray(item?.keywords) ? item.keywords.join(" · ") : item?.tags || "";
    }
  };
})();
