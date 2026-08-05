import { Helmet } from "react-helmet-async";

const SITE_NAME = "Estude Loterias";
const BASE_URL = "https://estudeloterias.com.br";
const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph.jpg`;

interface PageSEOProps {
  title: string;
  description?: string;
  canonical?: string;
  /** Full URL to the Open Graph image (defaults to the site-wide /opengraph.jpg). */
  image?: string;
  contentType?: "website" | "article";
}

export function PageSEO({
  title,
  description,
  canonical,
  image = DEFAULT_OG_IMAGE,
  contentType = "website",
}: PageSEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = canonical ? `${BASE_URL}${canonical}` : undefined;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="robots" content="index, follow" />
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}

      {/* OpenGraph */}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={contentType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={image} />
      <meta property="og:title" content={fullTitle} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
}
