# Product Requirements Document (PRD)
## Binx: Digital Marketing & Advertising Portfolio

---

## 1. Executive Summary
**Project Name:** Binx Portfolio Website  
**Project Objective:** To design and develop a highly unique, cross-platform responsive web portfolio that acts as a digital resume and lead-generation engine. The website will showcase a diverse range of capabilities, including social media marketing, digital creations, website design, and visual property presentation.  
**Design Philosophy:** The site will break away from standard grid-based corporate templates, utilizing a **Retro Bauhaus** aesthetic featuring bold stencil typography, asymmetrical layouts, and duotone cutout photography.

## 2. Target Audience & Objectives
*   **Creative Directors & Agency Leads:** Looking to hire innovative talent who intrinsically understands brand identity and digital campaigns.
*   **Direct Clients (Real Estate, Digital Content Brands, E-commerce):** Seeking a professional who can handle end-to-end visual presentation, from decluttering and optimizing property layouts for potential buyers to designing dynamic promotional material and logos.
*   **Brand Managers:** Looking for a fresh perspective on social media management and cohesive visual storytelling.

## 3. Visual & Art Direction

### 3.1. Color Palette
Derived from the provided brand references ("1.jpg" and "2.jpg"), the website will utilize a strictly controlled, high-contrast palette:
*   **Canvas / Background:** Off-White / Cream (`#F5F4F0`) - Provides a warm, retro paper texture.
*   **Primary Accent:** Bauhaus Orange (`#E85524`) - Used for bold stencil headers, interactive hover states, and graphic accents (e.g., large directional arrows).
*   **High Contrast / Text:** Stark Black (`#111111`) - Used for structural typography, body text, and heavy drop shadows.
*   **Photographic Treatments:** Portfolio imagery and portraits will heavily utilize duotone filters (Burnt Orange, Deep Sepia, and Grayscale) to unify disparate projects under one cohesive visual identity.

### 3.2. Typography
*   **Display Headers (H1, H2):** A bold, stencil-style sans-serif (e.g., *Futura Stencil*, *Plak*, or a custom geometric cut). Text should be tightly tracked, occasionally mixing solid black with orange to create a poster-like rhythm.
*   **Body Text:** A clean, highly legible geometric sans-serif (e.g., *Helvetica Neue*, *Inter*) to balance the aggressive headers and maintain readability across devices.

### 3.3. Layout & UI Elements
*   **Overlapping Cutouts:** High-quality, background-removed portraits (like the "HI! I'M BINX" framing pose) will break the constraints of traditional CSS boxes, overlapping text and bridging scrolling sections.
*   **Grid Defiance:** While maintaining an underlying alignment system, the layout will visually appear free-flowing and asymmetrical, echoing early 20th-century Bauhaus poster design.
*   **Brutalism Meets Elegance:** Large typography acting as graphical elements, with stark divides between sections rather than soft gradients.

---

## 4. Inspirational References (Web Design & Portfolio)
To achieve the requested unique edge and stand out in the 2026 market, the following award-winning agencies and portfolios (recognized by Awwwards) serve as interactive inspiration for layout, typography, and motion:

1.  **Obys Agency (obys.agency):** A masterclass in typography-led design, grid manipulation, and incorporating retro/brutalist elements seamlessly into high-end digital experiences.
2.  **Pacôme Pertant / FLOT NOIR (Recent Awwwards Winners):** Excellent examples of fluid motion, unconventional scroll behaviors, and distinct personal branding that breaks the "standard template" mold.
3.  **Readymag / Webflow Custom Builds:** Look for showcases utilizing "scroll-triggered duotone filters" and parallax elements—perfect for mimicking the triple-colored portrait effect seen in "1.jpg".

---

## 5. Site Architecture & Content Strategy

The portfolio will be structured as a seamless, flowing single-page application (or deeply connected multi-page site) divided into the following core narrative sections:

### 5.1. Hero Section: "HI! I'M BINX"
*   **Visual:** Large, screen-filling cutout of the framing pose (from 2.jpg). 
*   **Text:** Bold introduction staggered across the screen: "THE WEBSITE, THE SOCIALS, THE VISUALS, THE MARKETING."
*   **Interaction:** Subtle parallax effect on the cutout image as the user scrolls down, making the figure appear to interact with the typography.

### 5.2. Services Overview: "THAT'S MY DESK..."
*   **Content:** A punchy breakdown of core competencies.
*   **Categories:** 
    *   **Digital Creations:** Branding, logos, high-impact thumbnails, and digital visual identities.
    *   **Web Creations:** Custom website layouts, wireframes, and UI/UX design.
    *   **Social Media & Marketing:** Campaign strategy, content calendars, grid curation, and ad creative.

### 5.3. The Work (Portfolio Showcase)
A highly visual, interactive masonry or horizontal scroll gallery showcasing past projects.
*   **Project Pillar 1: Digital & Promotional Content:** Showcasing vibrant, high-energy digital creations (e.g., dynamic channel branding, stream overlays, and cohesive social media aesthetics). 
*   **Project Pillar 2: Property Marketing & Visual Presentation:** Highlighting spatial decluttering and virtual staging. *Feature Concept:* An interactive before-and-after image slider demonstrating a cluttered room transforming into a clean, optimized layout revealing its features to potential buyers.
*   **Project Pillar 3: Web & Interface Design:** Mockups of digital layouts presented on 3D device frames with matching Bauhaus orange accents.

### 5.4. About Section: "MEET THE MAN BEHIND THE BRAND"
*   **Visual:** The triple-duotone cutout graphic from "1.jpg". 
*   **Interaction:** The three figures will swap colors or slightly shift along the X-axis on mouse hover or scroll progress.
*   **Content:** A brief, compelling biography detailing professional background, the approach to modern marketing, and the drive for unique visual communication.

### 5.5. Footer & Call to Action (CTA)
*   **Visual:** A massive, screen-wide arrow (referencing the graphical arrow in 1.jpg) pointing towards the contact information.
*   **Text:** "LET'S BUILD SOMETHING UNIQUE."
*   **Functionality:** Direct email link, linked social channels (LinkedIn, Instagram, etc.), and a downloadable PDF resume styled in the same stencil/Bauhaus aesthetic.

---

## 6. Functional & Technical Specifications

### 6.1. Cross-Platform Responsiveness
*   **Mobile-First Touch:** Given the social media focus, the site must feel intuitive on mobile phones. This includes touch-friendly swipe galleries for portfolio pieces and collapsible navigation.
*   **Tablet & Desktop:** Expanding the canvas to allow for sweeping horizontal layouts, larger photographic cutouts, and more complex hover interactions.
*   **Fluid Typography:** Implementing `clamp()` CSS functions to ensure the "poster-like" impact of the typography scales flawlessly without breaking the viewport across any device size.

### 6.2. Animations & Interactions
*   **CSS Blend Modes:** Using `mix-blend-mode` to allow text to invert or change color as it passes over different background elements.
*   **Scroll Reveal:** Text and images should dynamically reveal themselves (e.g., masking text up from the baseline) to emulate a physical stencil being painted.

### 6.3. Performance, Accessibility & SEO
*   **Asset Optimization:** All high-res cutout images must be served as WebP with proper `srcset` attributes to ensure fast loading times.
*   **Accessibility:** High contrast ratios (Black/Orange on Cream) naturally aid visibility, but all images must include descriptive `alt` tags (e.g., "Binx making a framing gesture").
*   **Metadata:** Fully optimized for search engines (Target Keywords: Digital Marketing Portfolio, Web Creations, Social Media Content Creator, Visual Presentation).

---

## 7. Next Steps & Implementation
1.  **Wireframing:** Block out the spatial arrangement of the Hero and Portfolio sections in Figma using the off-white and orange palette.
2.  **Asset Preparation:** Export all personal portraits as high-resolution PNGs with transparent backgrounds for the overlapping depth effects.
3.  **Prototyping:** Build a high-fidelity interactive prototype to test typography scaling and scroll animations before handing off to development or building in a platform like Webflow.
