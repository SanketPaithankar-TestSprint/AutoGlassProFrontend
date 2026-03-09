import { Helmet } from 'react-helmet-async';

const PageHead = ({ title, description }) => {
    const canonicalUrl = typeof window !== 'undefined'
        ? `https://www.autopaneai.com${window.location.pathname.toLowerCase()}`
        : '';

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            {/* Add OpenGraph tags for social media previews */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        </Helmet>
    );
};

export default PageHead;
