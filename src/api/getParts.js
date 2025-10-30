const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api";
const DEFAULTS = {
    type: 565,
    format: "json",
    page: 1,
};
function buildGetPartsURL(params = {})
{
    const p = { ...DEFAULTS, ...params };
    const q = new URLSearchParams();

    // required
    if (p.type != null) q.set("type", String(p.type));

    // optional
    if (p.fromDate) q.set("fromDate", String(p.fromDate)); // "M/D/YYYY"
    if (p.toDate) q.set("toDate", String(p.toDate));       // "M/D/YYYY"
    if (p.manufacturer != null && p.manufacturer !== "")
        q.set("manufacturer", String(p.manufacturer));
    if (p.page != null) q.set("page", String(p.page));
    q.set("format", p.format || "json");

    return `${VPIC_BASE}/vehicles/GetParts?${q.toString()}`;
}

/**
 * Fetch helper — returns a normalized shape:
 * {
 *   ok: boolean,
 *   url: string,
 *   count: number,
 *   message: string,
 *   data: array,      // VPIC Results (or empty array)
 *   raw: object       // full API payload
 * }
 */
export async function getParts(params = {})
{
    const url = buildGetPartsURL(params);

    try
    {
        const res = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
        });

        if (!res.ok)
        {
            const text = await res.text().catch(() => "");
            return {
                ok: false,
                url,
                count: 0,
                message: `HTTP ${res.status} ${res.statusText} ${text}`.trim(),
                data: [],
                raw: null,
            };
        }

        const payload = await res.json();
        const data = Array.isArray(payload?.Results) ? payload.Results : [];

        return {
            ok: true,
            url,
            count: Number(payload?.Count ?? data.length ?? 0),
            message: String(payload?.Message ?? ""),
            data,
            raw: payload,
        };
    } catch (err)
    {
        return {
            ok: false,
            url,
            count: 0,
            message: err?.message || "Network error",
            data: [],
            raw: null,
        };
    }
}

