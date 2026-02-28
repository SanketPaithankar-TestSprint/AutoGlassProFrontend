import { Helmet } from 'react-helmet-async';

const PageHead = ({ title, description }) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            {/* Add OpenGraph tags for social media previews */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
        </Helmet>
    );
};

export default PageHead;
