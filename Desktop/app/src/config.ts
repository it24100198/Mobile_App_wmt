// Site Configuration
// Replace placeholder values with your actual content

export interface SiteConfig {
  language: string;
  siteTitle: string;
  siteDescription: string;
}

export const siteConfig: SiteConfig = {
  language: "en",
  siteTitle: "CoolKids - Boys Fashion Store",
  siteDescription: "Shop trendy t-shirts, jeans, and shirts for boys. Quality clothing with easy online ordering and fast delivery.",
};

// Hero Section
export interface HeroConfig {
  backgroundText: string;
  heroImage: string;
  heroImageAlt: string;
  overlayText: string;
  brandName: string;
  navLinks: { label: string; href: string }[];
}

export const heroConfig: HeroConfig = {
  backgroundText: "COOL KIDS",
  heroImage: "/hero-model.png",
  heroImageAlt: "Stylish boy wearing denim jacket and jeans",
  overlayText: "Style that fits their vibe",
  brandName: "CoolKids",
  navLinks: [
    { label: "Collections", href: "#collections" },
    { label: "Shop", href: "#shop" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
};

// Intro Grid Section
export interface PortfolioImage {
  src: string;
  alt: string;
}

export interface IntroGridConfig {
  titleLine1: string;
  titleLine2: string;
  description: string;
  portfolioImages: PortfolioImage[];
  accentText: string;
}

export const introGridConfig: IntroGridConfig = {
  titleLine1: "Trendy Styles for",
  titleLine2: "Every Boy",
  description: "From casual t-shirts to stylish jeans and smart shirts, find the perfect outfits that match your boy's personality. Quality fabrics, comfortable fits, and designs they'll love to wear every day.",
  portfolioImages: [
    { src: "/grid-tshirts.jpg", alt: "Colorful boys t-shirts collection" },
    { src: "/grid-jeans.jpg", alt: "Premium denim jeans for boys" },
    { src: "/grid-shirts.jpg", alt: "Stylish button-up shirts" },
    { src: "/grid-lifestyle.jpg", alt: "Boy wearing trendy streetwear" },
    { src: "/grid-fabrics.jpg", alt: "Quality fabric close-up" },
  ],
  accentText: "New Arrivals - 2026",
};

// Featured Projects Section
export interface Project {
  id: number;
  title: string;
  category: string;
  year: string;
  image: string;
  description: string;
}

export interface FeaturedProjectsConfig {
  subtitle: string;
  titleRegular: string;
  titleItalic: string;
  viewAllText: string;
  viewAllHref: string;
  viewProjectText: string;
  projects: Project[];
}

export const featuredProjectsConfig: FeaturedProjectsConfig = {
  subtitle: "Shop Now",
  titleRegular: "Featured",
  titleItalic: "Collections",
  viewAllText: "View All Products",
  viewAllHref: "#shop",
  viewProjectText: "Order Now",
  projects: [
    {
      id: 1,
      title: "Graphic T-Shirts",
      category: "T-Shirts",
      year: "2026",
      image: "/feat-tshirts.jpg",
      description: "Cool graphic tees with trending designs - gaming, skateboarding, and abstract art prints that boys love.",
    },
    {
      id: 2,
      title: "Slim Fit Jeans",
      category: "Jeans",
      year: "2026",
      image: "/feat-jeans.jpg",
      description: "Premium denim in multiple washes from light blue to dark indigo. Comfortable stretch fabric for all-day wear.",
    },
    {
      id: 3,
      title: "Casual Shirts",
      category: "Shirts",
      year: "2026",
      image: "/feat-shirts.jpg",
      description: "Smart casual shirts in plaid, denim, and solid colors. Perfect for school events and family gatherings.",
    },
    {
      id: 4,
      title: "Complete Outfits",
      category: "Sets",
      year: "2026",
      image: "/feat-outfits.jpg",
      description: "Curated outfit sets including hoodies, joggers, and sneakers. Ready-to-wear coordinated styles.",
    },
  ],
};

// Services Section
export interface ServiceItem {
  iconName: string;
  title: string;
  description: string;
}

export interface ServicesConfig {
  subtitle: string;
  titleLine1: string;
  titleLine2Italic: string;
  description: string;
  services: ServiceItem[];
}

export const servicesConfig: ServicesConfig = {
  subtitle: "What We Offer",
  titleLine1: "Shopping Made",
  titleLine2Italic: "Simple & Easy",
  description: "We provide a hassle-free shopping experience with fast delivery, easy returns, and quality you can trust. Your satisfaction is our priority.",
  services: [
    {
      iconName: "Sparkles",
      title: "Premium Quality",
      description: "All our clothes are made from high-quality, durable fabrics that are soft on skin and built to last through every adventure.",
    },
    {
      iconName: "Diamond",
      title: "Trendy Designs",
      description: "Stay ahead of the fashion curve with our curated collection of the latest styles that boys actually want to wear.",
    },
    {
      iconName: "Users",
      title: "Perfect Fit Guarantee",
      description: "Not the right size? No problem! Exchange any item within 30 days for the perfect fit, free of charge.",
    },
    {
      iconName: "Camera",
      title: "Easy Online Ordering",
      description: "Browse, select, and order in minutes. Our simple checkout process makes shopping for your kids effortless.",
    },
  ],
};

// Why Choose Me Section
export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface FeatureCard {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
}

export interface WhyChooseMeConfig {
  subtitle: string;
  titleRegular: string;
  titleItalic: string;
  statsLabel: string;
  stats: StatItem[];
  featureCards: FeatureCard[];
  wideImage: string;
  wideImageAlt: string;
  wideTitle: string;
  wideDescription: string;
}

export const whyChooseMeConfig: WhyChooseMeConfig = {
  subtitle: "Why Choose Us",
  titleRegular: "Trusted by",
  titleItalic: "Parents",
  statsLabel: "By The Numbers",
  stats: [
    { value: 50000, suffix: "+", label: "Happy Customers" },
    { value: 99, suffix: "%", label: "Satisfaction Rate" },
    { value: 24, suffix: "h", label: "Fast Delivery" },
    { value: 30, suffix: " days", label: "Easy Returns" },
  ],
  featureCards: [
    {
      image: "/feature-quality.jpg",
      imageAlt: "Boys wearing quality clothing",
      title: "Built to Last",
      description: "Our clothes withstand the rough and tumble of active boys. Reinforced stitching and pre-shrunk fabrics ensure they look great wash after wash.",
    },
    {
      image: "/feature-delivery.jpg",
      imageAlt: "Happy boy opening package",
      title: "Fast & Free Delivery",
      description: "Order today and get free delivery on orders over $50. Your package arrives at your doorstep within 24-48 hours, ready for your little one.",
    },
  ],
  wideImage: "/wide-store.jpg",
  wideImageAlt: "Modern boys clothing store interior",
  wideTitle: "Shop the Latest Trends",
  wideDescription: "Visit our store or shop online for the newest styles in boys fashion. New arrivals every week!",
};

// Testimonials Section
export interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  quote: string;
}

export interface TestimonialsConfig {
  subtitle: string;
  titleRegular: string;
  titleItalic: string;
  testimonials: Testimonial[];
}

export const testimonialsConfig: TestimonialsConfig = {
  subtitle: "Customer Stories",
  titleRegular: "Happy",
  titleItalic: "Families",
  testimonials: [
    {
      id: 1,
      name: "Jake Morrison",
      role: "Age 12, T-Shirt Fan",
      image: "/testimonial-1.jpg",
      quote: "I love the graphic tees from CoolKids! The designs are so cool and my friends always ask where I got them. Super comfortable too!",
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Mom of Two",
      image: "/testimonial-2.jpg",
      quote: "Finally, a store that understands what boys want to wear! The quality is amazing and the prices are reasonable. My sons actually get excited about new clothes now.",
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Father of Three",
      image: "/testimonial-3.jpg",
      quote: "The sizing guide is spot-on and delivery is incredibly fast. Exchanged a pair of jeans for a different size - the process was seamless. Highly recommend!",
    },
    {
      id: 4,
      name: "Patricia Adams",
      role: "Grandmother",
      image: "/testimonial-4.jpg",
      quote: "I ordered shirts for my grandsons and they absolutely loved them. The fabric is soft and the styles are perfect. Will definitely be ordering again!",
    },
  ],
};

// FAQ Section
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQConfig {
  subtitle: string;
  titleRegular: string;
  titleItalic: string;
  ctaText: string;
  ctaButtonText: string;
  ctaHref: string;
  faqs: FAQItem[];
}

export const faqConfig: FAQConfig = {
  subtitle: "Common Questions",
  titleRegular: "Got",
  titleItalic: "Questions?",
  ctaText: "Still have questions? We're here to help!",
  ctaButtonText: "Contact Us",
  ctaHref: "#contact",
  faqs: [
    {
      id: "faq-1",
      question: "How do I find the right size for my child?",
      answer: "We provide a detailed size guide for all our products. Simply measure your child's chest, waist, and height, then match with our size chart. If you're between sizes, we recommend ordering the larger size for growing room. You can also contact us for personalized sizing advice!",
    },
    {
      id: "faq-2",
      question: "What is your return and exchange policy?",
      answer: "We offer a hassle-free 30-day return and exchange policy. If the clothes don't fit or you're not completely satisfied, simply return them unworn with tags attached for a full refund or exchange. Return shipping is free for exchanges!",
    },
    {
      id: "faq-3",
      question: "How long does delivery take?",
      answer: "We offer free standard delivery (2-3 business days) on orders over $50. Express delivery (24 hours) is available for $5.99. You'll receive a tracking number as soon as your order ships so you can follow its journey to your doorstep.",
    },
    {
      id: "faq-4",
      question: "Are the fabrics safe for sensitive skin?",
      answer: "Absolutely! All our clothes are made from hypoallergenic, skin-friendly fabrics. We use 100% organic cotton for our t-shirts and natural fiber blends for jeans and shirts. They're free from harsh chemicals and safe even for children with sensitive skin.",
    },
    {
      id: "faq-5",
      question: "How do I place an order online?",
      answer: "Ordering is easy! Browse our collections, select the items you want, choose the size and color, then click 'Add to Cart'. When you're ready, go to your cart and click 'Checkout'. Fill in your delivery details, choose your payment method, and confirm your order. You'll receive an email confirmation right away!",
    },
  ],
};

// Footer Section
export interface SocialLink {
  iconName: string;
  href: string;
  label: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterConfig {
  logoText: string;
  contactLabel: string;
  email: string;
  locationText: string;
  navigationLabel: string;
  navLinks: FooterLink[];
  socialLabel: string;
  socialLinks: SocialLink[];
  tagline: string;
  copyright: string;
  bottomLinks: FooterLink[];
}

export const footerConfig: FooterConfig = {
  logoText: "COOLKIDS",
  contactLabel: "Get in Touch",
  email: "hello@coolkids.com",
  locationText: "123 Fashion Street\nNew York, NY 10001",
  navigationLabel: "Quick Links",
  navLinks: [
    { label: "T-Shirts", href: "#shop" },
    { label: "Jeans", href: "#shop" },
    { label: "Shirts", href: "#shop" },
    { label: "Size Guide", href: "#faq" },
    { label: "Track Order", href: "#contact" },
  ],
  socialLabel: "Follow Us",
  socialLinks: [
    { iconName: "Instagram", href: "https://instagram.com/coolkids", label: "Instagram" },
    { iconName: "Twitter", href: "https://twitter.com/coolkids", label: "Twitter" },
    { iconName: "Linkedin", href: "https://linkedin.com/company/coolkids", label: "LinkedIn" },
    { iconName: "Mail", href: "mailto:hello@coolkids.com", label: "Email" },
  ],
  tagline: "Style that fits\ntheir world",
  copyright: "© 2026 CoolKids. All rights reserved.",
  bottomLinks: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Shipping Info", href: "#" },
  ],
};
