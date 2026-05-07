import { useEffect } from 'react'

/**
 * SEO component — sets <title>, meta description, canonical, OG tags, and JSON-LD per page.
 *
 * Usage:
 *   <SEO
 *     title="Product Name | GAURK"
 *     description="Premium luxury hoodie..."
 *     canonical="https://gaurk.shop/product/123"
 *     image="https://res.cloudinary.com/..."
 *     jsonLd={productSchema}
 *   />
 */
const SEO = ({ title, description, canonical, image, jsonLd, type = 'website' }) => {
    useEffect(() => {
        if (title) {
            document.title = title
        }

        const setMeta = (selector, attr, value) => {
            if (!value) return
            let el = document.head.querySelector(selector)
            if (!el) {
                el = document.createElement('meta')
                const [key, val] = selector.replace('meta[', '').replace(']', '').split('=')
                el.setAttribute(key, val.replace(/"/g, ''))
                document.head.appendChild(el)
            }
            el.setAttribute(attr, value)
        }

        setMeta('meta[name="description"]', 'content', description)
        setMeta('meta[property="og:title"]', 'content', title)
        setMeta('meta[property="og:description"]', 'content', description)
        setMeta('meta[property="og:type"]', 'content', type)
        setMeta('meta[property="og:image"]', 'content', image)
        setMeta('meta[property="og:url"]', 'content', canonical)
        setMeta('meta[name="twitter:title"]', 'content', title)
        setMeta('meta[name="twitter:description"]', 'content', description)
        setMeta('meta[name="twitter:image"]', 'content', image)

        if (canonical) {
            let link = document.head.querySelector('link[rel="canonical"]')
            if (!link) {
                link = document.createElement('link')
                link.setAttribute('rel', 'canonical')
                document.head.appendChild(link)
            }
            link.setAttribute('href', canonical)
        }

        // Inject JSON-LD structured data with a unique id so we can clean up on unmount
        let ldEl = null
        if (jsonLd) {
            ldEl = document.createElement('script')
            ldEl.type = 'application/ld+json'
            ldEl.setAttribute('data-seo-page', 'true')
            ldEl.text = JSON.stringify(jsonLd)
            document.head.appendChild(ldEl)
        }

        return () => {
            if (ldEl && ldEl.parentNode) {
                ldEl.parentNode.removeChild(ldEl)
            }
        }
    }, [title, description, canonical, image, jsonLd, type])

    return null
}

export default SEO
