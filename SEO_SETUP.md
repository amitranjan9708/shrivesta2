# SEO Setup Guide for Shrivesta

This guide explains how to configure SEO for your Shrivesta e-commerce website.

## Files Created

1. **robots.txt** - Located in `/public/robots.txt`
   - Controls which pages search engines can crawl
   - Currently allows all public pages, blocks admin/account pages

2. **sitemap.xml** - Located in `/public/sitemap.xml`
   - Helps search engines discover your pages
   - Lists all important pages with priorities

3. **SEO Component** - Located in `/src/components/SEO.tsx`
   - Dynamic meta tags for each page
   - Updates title, description, Open Graph, and Twitter cards

4. **Updated index.html**
   - Base SEO meta tags
   - Structured data (JSON-LD)
   - Open Graph and Twitter card tags

## Domain Configuration

✅ **Domain is set to: `https://shrivesta.in`**

All files have been configured with your domain. You may want to:

1. **Update `<lastmod>` dates in `/public/sitemap.xml`**
   - Update to current date when you deploy

2. **Add actual images in `/index.html`**
   - Add your logo: `https://shrivesta.in/logo.png`
   - Add OG image: `https://shrivesta.in/og-image.jpg`
   - Create and upload these images to your `/public/` folder

3. **Update social media links in `/index.html`**
   - Update the `sameAs` array with your actual social media profiles

## Adding SEO to Pages

To add SEO meta tags to any page, import and use the SEO component:

```tsx
import { SEO } from "./components/SEO";

function YourPage() {
  return (
    <>
      <SEO
        title="Your Page Title"
        description="Your page description"
        keywords="keyword1, keyword2, keyword3"
        image="https://your-domain.com/your-image.jpg"
      />
      {/* Your page content */}
    </>
  );
}
```

## Google Search Console Setup

1. **Verify Your Site**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add your property (website URL)
   - Verify ownership using one of the methods:
     - HTML file upload
     - HTML tag
     - Domain name provider
     - Google Analytics

2. **Submit Your Sitemap**
   - In Google Search Console, go to "Sitemaps"
   - Submit: `https://your-domain.com/sitemap.xml`

3. **Request Indexing**
   - Use "URL Inspection" tool to request indexing for important pages
   - Start with homepage, products page, and main category pages

## Additional SEO Best Practices

### 1. Create OG Images
- Create a 1200x630px image for Open Graph
- Place it in `/public/og-image.jpg`
- Update the URL in `index.html` and `SEO.tsx`

### 2. Add Favicons
- Create favicon files:
  - `favicon.ico` (16x16, 32x32)
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `apple-touch-icon.png` (180x180)
- Place them in `/public/` directory

### 3. Add Structured Data for Products
For product pages, add Product structured data. Update `ProductDetailPage.tsx`:

```tsx
// Add this in ProductDetailPage component
useEffect(() => {
  if (product) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.product,
      "description": product.subtitle,
      "image": product.imageUrls,
      "offers": {
        "@type": "Offer",
        "price": product.salePrice,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.ratingCount
      }
    };
    
    // Add script tag to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }
}, [product]);
```

### 4. Generate Dynamic Sitemap
For a production site with many products, consider generating a dynamic sitemap:

```tsx
// Create /src/utils/generateSitemap.ts
// This would fetch all products and generate sitemap entries
```

### 5. Add Analytics
Consider adding Google Analytics or other analytics tools:

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Testing Your SEO

1. **Test with Google Rich Results Test**
   - [Rich Results Test](https://search.google.com/test/rich-results)
   - Test your structured data

2. **Test with Facebook Sharing Debugger**
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Test Open Graph tags

3. **Test with Twitter Card Validator**
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - Test Twitter card tags

4. **Check Mobile-Friendliness**
   - [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

## Monitoring

- Monitor your site in Google Search Console
- Check indexing status
- Review search performance
- Fix any crawl errors
- Monitor Core Web Vitals

## Notes

- The sitemap.xml is static. For dynamic product pages, you may want to generate it programmatically
- Update the sitemap whenever you add new major pages
- Keep meta descriptions under 160 characters for best results
- Use unique titles and descriptions for each page

