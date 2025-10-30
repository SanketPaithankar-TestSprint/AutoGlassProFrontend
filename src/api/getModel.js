import config from "../config";
export const getModelId = async (year, make, model) =>
{
    const baseUrl = config.pythonApiUrl + "agp/v1/get-model-id";
    const url = `${baseUrl}?year=${year}&make=${make}&model=${model}`;

    try
    {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok)
        {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error)
    {
        console.error("Failed to fetch model ID:", error);
        throw error;
    }
};