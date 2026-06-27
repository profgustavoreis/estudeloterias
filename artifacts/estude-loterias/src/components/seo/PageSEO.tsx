import { Helmet } from "react-helmet-async";

const SITE_NAME = "Estude Loterias";
const BASE_URL = "https://estudeloterias.com.br";

interface PageSEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

export function PageSEO({ title, description, canonical }: PageSEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = canonical ? `${BASE_URL}${canonical}` : undefined;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
    </Helmet>
  );
}
