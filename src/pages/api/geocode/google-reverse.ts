import type { NextApiRequest, NextApiResponse } from "next";

type GAddrComp = { long_name: string; short_name: string; types: string[] };
type GRes = { formatted_address: string; place_id: string; address_components: GAddrComp[] };

function pick(components: GAddrComp[], ...types: string[]) {
    for (const t of types) {
        const f = components.find(c => c.types.includes(t));
        if (f?.long_name) return f.long_name as string;
    }
    return "";
}

/** สร้างที่อยู่ไทยล้วน โดย “มีบ้านเลขที่” แน่นอนถ้า Google ส่งมา */
function formatThaiFromComponents(components: GAddrComp[]) {
    // บางที่ Google ไม่ส่ง route/soi ให้ครบ จึงลองหลายชนิด
    const streetNo = pick(components, "street_number");  // บ้านเลขที่
    const route = pick(components, "route"); // ถนน/ซอย (อังกฤษ)
    const soi = pick(components, "sublocality_level_2"); // บางครั้งซอยมาในนี้
    const village = pick(components, "premise", "subpremise"); // หมู่บ้าน/อาคาร
    const moo = pick(components, "administrative_area_level_4"); // บางจังหวัดใช้เป็น "หมู่ที่"

    // แขวง/ตำบล
    const subdistrict =
        pick(components, "sublocality_level_1") ||
        pick(components, "administrative_area_level_3") ||
        pick(components, "neighborhood");

    // เขต/อำเภอ
    const district = pick(components, "administrative_area_level_2") || pick(components, "locality");
    const province = pick(components, "administrative_area_level_1");
    const postcode = pick(components, "postal_code");

    const isBKK = /กรุงเทพ/i.test(province);
    const sdLabel = isBKK ? "แขวง" : "ตำบล";
    const dLabel = isBKK ? "เขต" : "อำเภอ";

    // บรรทัดแรก: บ้านเลขที่ + ถนน/ซอย + อาคาร/หมู่บ้าน + หมู่ที่
    const parts1: string[] = [];
    if (streetNo) parts1.push(streetNo); // บ้านเลขที่
    if (route) parts1.push(route.startsWith("ถ.") || /ถนน|road/i.test(route) ? route : `ถนน ${route}`);
    if (soi) parts1.push(/^ซ/.test(soi) ? soi : `ซอย ${soi}`);
    if (village) parts1.push(village);
    if (moo) parts1.push(moo);

    const line1 = parts1.join(" ").replace(/\s+/g, " ").trim();

    // บรรทัดสอง: แขวง/ตำบล + เขต/อำเภอ + จังหวัด + รหัสไปรษณีย์
    const line2 = [
        subdistrict && `${sdLabel}${subdistrict}`,
        district && `${dLabel}${district}`,
        province,
        postcode,
    ].filter(Boolean).join(" ");

    return [line1, line2].filter(Boolean).join(" ");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { lat, lng } = req.query;
    const key = process.env.GOOGLE_MAPS_SERVER_KEY; // ใช้ SERVER KEY เท่านั้น

    if (!lat || !lng || Array.isArray(lat) || Array.isArray(lng))
        return res.status(400).json({ status: "error", message: "Invalid lat/lng" });
    if (!key) return res.status(500).json({ status: "error", message: "Missing GOOGLE_MAPS_SERVER_KEY" });

    try {
        const url =
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}` +
            `&language=th&region=TH&key=${key}`;

        const resp = await fetch(url);
        const data = await resp.json();

        if (data.status !== "OK" || !Array.isArray(data.results))
            return res.status(200).json({ status: data.status ?? "ZERO_RESULTS", results: [] });

        const results: GRes[] = data.results;
        const first = results[0];
        const formatted_th = formatThaiFromComponents(first.address_components);

        return res.status(200).json({
            status: "OK",
            results: results.map(r => ({
                formatted_address: r.formatted_address,   // ของ Google
                formatted_th,
                place_id: r.place_id
            })),
        });
    } catch (err) {
        console.error("Geocode error:", err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}
