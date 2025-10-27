export type AddressData = {
    // ข้อความรวม ถ้ามี (เช่นจาก geocoder)
    text?: string;
    full?: string;
    address?: string;

    // ส่วนประกอบย่อย
    line1?: string;
    line2?: string;
    village?: string;
    moo?: string;
    soi?: string;
    road?: string;

    // เขต/อำเภอ/จังหวัด/รหัสไปรษณีย์ (รองรับ key ที่เจอบ่อย)
    subdistrict?: string;   // ตำบล
    tambon?: string;        // alias ของ subdistrict
    district?: string;      // อำเภอ/เขต
    amphoe?: string;        // alias ของ district
    province?: string;      // จังหวัด
    postcode?: string;
    zipcode?: string;       // alias ของ postcode
};
