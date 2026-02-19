import { Helmet } from 'react-helmet-async';

const PageHead = ({ title, description }) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
        </Helmet>
    );
};

export default PageHead;
