import urls from "../config";

export async function getBlogs() {
    const url = `${urls.javaApiUrl}/v1/blogs`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch blogs:", error);
        throw error;
    }
}

export async function getBlogBySlug(slug) {
    const url = `${urls.javaApiUrl}/v1/blogs/${slug}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch blog with slug ${slug}:`, error);
        throw error;
    }
}
