import InputDropdown, {
  Option,
} from "@/components/input/inputDropdown/input_dropdown";
import { useState, useEffect } from "react";
import axios from "axios";

const options: Option[] = [
  { label: "บริการทั้งหมด", value: "" },
  { label: "ล้างแอร์", value: "ล้างแอร์" },
  { label: "ติดตั้งเครื่องทำน้ำอุ่น", value: "ติดตั้งเครื่องทำน้ำอุ่น" },
  { label: "ติดตั้งปั๊มน้ำ", value: "ติดตั้งปั๊มน้ำ" },
];

function TecnicianProfile() {
  const [SelectCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
const params: any = {};
if (SelectCategory && SelectCategory !== "") {
  params.servicename = SelectCategory; // dropdown filter
}
if (search.trim()) {
  params.search = search.trim(); // input search filter
}
params.status = 3;
        const token = localStorage.getItem("accessToken"); // หรือ cookie ก็ได้

        const res = await axios.get("/api/technician/history", {
          params,
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          withCredentials: true, // ส่ง cookie ถ้ามี
        });

        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]); // clear ถ้า error
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [SelectCategory, search]);

  return (
    <div className="w-full">
      {/* header & search */}
      <div className="w-full h-[80px] border-b border-[var(--gray-200)] bg-white">
        <div className="p-[15px] md:px-[40px] md:py-[25px] h-full flex items-center justify-between">
          <p className="text-[20px] font-medium">ประวัติการซ่อม</p>
          <div className="flex gap-[8px] md:gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                placeholder="ค้นหารายการสั่งซ่อม"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-[var(--gray-300)] pl-10 pr-3 py-2 text-sm outline-none hover:border-[var(--gray-400)] focus:ring-2 focus:ring-[var(--blue-600)] focus:border-[var(--blue-600)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="m-[40px]">
        <div className="w-[245px] flex flex-row items-center gap-[15px]">
          <p>บริการ</p>
          <InputDropdown
            options={options}
            value={SelectCategory}
            onChange={setSelectedCategory}
            placeholder="เลือกบริการ…"
          />
        </div>

        {/* Table */}
        <div className="w-[100%] mt-[25px]">
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">ชื่อบริการ</th>
                  <th className="px-6 py-3 font-medium">วันเวลาดำเนินการ</th>
                  <th className="px-6 py-3 font-medium">รหัสคำสั่งซ่อม</th>
                  <th className="px-6 py-3 font-medium text-left">ราคารวม</th>
                  <th className="px-6 py-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  bookings.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{row.servicename}</td>
                      <td className="px-6 py-4">
                        {new Date(row.service_date).toLocaleDateString("th-TH")}{" "}
                        เวลา {row.service_time.substring(0, 5)} น.
                      </td>
                      <td className="px-6 py-4">{row.order_code}</td>
                      <td className="px-6 py-4 text-left">
                        {row.total_price?.toLocaleString("th-TH")} ฿
                      </td>
                      <td className="px-6 py-4 flex justify-center">
                        <button className="p-2 text-blue-500 hover:text-blue-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TecnicianProfile;
