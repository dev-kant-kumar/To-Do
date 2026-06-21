import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function SEO({ title, description, keywords, image }) {
  const location = useLocation();

  useEffect(() => {
    // 1. Update Document Title
    if (title) {
      document.title = title;
    }

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description || "");
    } else if (description) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", description);
      document.head.appendChild(metaDescription);
    }

    // 3. Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", keywords || "To Do app, task manager, productivity, todo list");
    } else if (keywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      metaKeywords.setAttribute("content", keywords);
      document.head.appendChild(metaKeywords);
    }

    // 4. Update Open Graph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) {
      ogTitle.setAttribute("content", title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) {
      ogDescription.setAttribute("content", description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    const resolvedImage = image
      ? (image.startsWith("http") ? image : `https://todo.devkantkumar.com${image.startsWith("/") ? "" : "/"}${image}`)
      : "https://todo.devkantkumar.com/og-img-vo.png";

    if (ogImage) {
      ogImage.setAttribute("content", resolvedImage);
    } else {
      const newOgImage = document.createElement("meta");
      newOgImage.setAttribute("property", "og:image");
      newOgImage.setAttribute("content", resolvedImage);
      document.head.appendChild(newOgImage);
    }

    // 5. Update Twitter Tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && title) {
      twitterTitle.setAttribute("content", title);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && description) {
      twitterDescription.setAttribute("content", description);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute("content", resolvedImage);
    } else {
      const newTwitterImage = document.createElement("meta");
      newTwitterImage.setAttribute("name", "twitter:image");
      newTwitterImage.setAttribute("content", resolvedImage);
      document.head.appendChild(newTwitterImage);
    }

    // 6. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    const currentUrl = `https://todo.devkantkumar.com${location.pathname}`;
    if (canonical) {
      canonical.setAttribute("href", currentUrl);
    } else {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("href", currentUrl);
      document.head.appendChild(canonical);
    }
  }, [title, description, keywords, location, image]);

  return null;
}

export default SEO;
