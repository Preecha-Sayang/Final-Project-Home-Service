import { useState } from "react";

export default function CategoryPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: "บริการทั่วไป", createdAt: "12/02/2022 10:30PM", updatedAt: "12/02/2022 10:30PM" },
    { id: 2, name: "บริการห้องครัว", createdAt: "12/02/2022 10:30PM", updatedAt: "12/02/2022 10:30PM" },
    { id: 3, name: "บริการห้องน้ำ", createdAt: "12/02/2022 10:30PM", updatedAt: "12/02/2022 10:30PM" },
  ]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">หมวดหมู่</h1>

          <div className="flex items-center gap-4">
            {/* SearchBar */}
            <SearchBar placeholder="ค้นหาหมวดหมู่..." />

            <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              เพิ่มหมวดหมู่ +
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow p-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-3 px-4">ลำดับ</th>
                <th className="py-3 px-4">ชื่อหมวดหมู่</th>
                <th className="py-3 px-4">สร้างเมื่อ</th>
                <th className="py-3 px-4">แก้ไขล่าสุด</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c.id} className="border-t">
                  <td className="py-3 px-4">{i + 1}</td>
                  <td className="py-3 px-4">{c.name}</td>
                  <td className="py-3 px-4">{c.createdAt}</td>
                  <td className="py-3 px-4">{c.updatedAt}</td>
                  <td className="py-3 px-4 text-right flex justify-end gap-3">
                    <button className="text-gray-500 hover:text-blue-600">✏️</button>
                    <button className="text-gray-500 hover:text-red-600">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
