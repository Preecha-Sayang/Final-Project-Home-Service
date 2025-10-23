import { useRouter } from "next/router";
import InputDropdown, { Option } from "@/components/input/inputDropdown/input_dropdown";
import { useState, useEffect } from "react";
import axios from "axios";



type Booking = {
  booking_id: number;
  servicename: string;
  service_date: string;
  service_time: string;
  order_code: string;
  total_price: number;
};

interface FetchParams {
  page: number;
  servicename?: string;
  search?: string;
  status: number;
}

function TecnicianProfile() {
    const router = useRouter();
  const [SelectCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);;
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;
  const [services, setServices] = useState<Option[]>([]);


  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const params: FetchParams = { page, status: 4 };
        if (SelectCategory && SelectCategory !== "") params.servicename = SelectCategory;
        if (search.trim()) params.search = search.trim();

        const token = localStorage.getItem("accessToken");

        const res = await axios.get("/api/technician/history", {
          params,
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        });

        setBookings(res.data.bookings);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [SelectCategory, search, page]);

    useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("/api/technician/history/allservice");
        // สมมติ API คืน { services: [{ servicename: "ล้างแอร์" }, ...] }
        const options: Option[] = [
          { label: "บริการทั้งหมด", value: "" },
          ...res.data.services.map((s: { servicename: string }) => ({
            label: s.servicename,
            value: s.servicename,
          })),
        ];
        setServices(options);
        console.log(options)
      } catch (err) {
        console.error("Error fetching service names:", err);
      }
    };

    fetchServices();
  }, []);


  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full">
      {/* header & search */}
      <div className="w-full md:h-[80px] border-b border-[var(--gray-200)] bg-white">
        <div className="p-[15px] md:px-[40px] md:py-[25px] h-full flex flex-col md:flex-row md:items-center justify-between">
          <p className="text-[20px] font-medium">ประวัติการซ่อม</p>
          <div className="flex gap-[8px] md:gap-3">
            <div className="relative w-[100%]">
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // reset page
                }}
                className="w-full rounded-md border border-[var(--gray-300)] pl-10 pr-3 py-2 text-sm outline-none hover:border-[var(--gray-400)] focus:ring-2 focus:ring-[var(--blue-600)] focus:border-[var(--blue-600)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="m-[15px]  md:m-[40px]">
        <div className=" flex flex-col md:flex-row md:items-center gap-[15px]">
          <p>บริการ</p>
          <InputDropdown
            className="w-[100%] md:!w-[300px]"
            options={services}
            value={SelectCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setPage(1); // reset page
            }}
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
                        วันที่ {new Date(row.service_date).toLocaleDateString("th-TH")}{" "}
                        เวลา {row.service_time.substring(0, 5)} น.
                      </td>
                      <td className="px-6 py-4">{row.order_code}</td>
                      <td className="px-6 py-4 text-left">
                        {row.total_price?.toLocaleString("th-TH")} ฿
                      </td>
                      <td className="px-6 py-4 flex justify-center">
                        <button className="p-2 text-blue-500 hover:text-blue-700 hover:cursor-pointer"
                        onClick={() => router.push(`/technician/history/${row.booking_id}`)}
                        >
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 mb-[50px] md:mb-0">
              <button
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer w-[85px]"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ก่อนหน้า
              </button>
              <span>หน้า {page} / {totalPages}</span>
              <button
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer w-[85px]"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TecnicianProfile;
