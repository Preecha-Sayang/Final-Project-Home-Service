export function Footer() {
    return (
      <footer className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          
          {/* logo */}
          <div className="flex items-center gap-2">
            <div>
              <span></span>
            </div>
            <div>
              <h2 className="text-[var(--blue-600)] font-semibold">HomeService</h2>
            </div>
          </div>
  
          {/* info */}
          <div>
            <h3 className="text-[var(--gray-950)] font-medium">บริษัท โฮมเซอร์วิส จำกัด</h3>
            <p className="text-[var(--gray-800)] text-sm">
              452 ซอยสุขุมวิท 79 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพมหานคร 10260
            </p>
          </div>
  
          {/* contact */}
          <div className="flex flex-col gap-2 text-[var(--gray-800)]">
            <div className="flex items-center gap-2">
              <span>logo</span>
              <span>080-540-6357</span>
            </div>
            <div className="flex items-center gap-2">
              <span>logo</span>
              <span>contact@homeservice.co</span>
            </div>
          </div>
        </div>
  
        {/* copyright */}
        <div className="bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-[var(--gray-500)] gap-2">
            <p>Copyright © 2021 HomeServices.com All rights reserved</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[var(--gray-700)]">
                เงื่อนไขและข้อตกลงการใช้งานเว็บไซต์
              </a>
              <a href="#" className="hover:text-[var(--gray-700)]">
                นโยบายความเป็นส่วนตัว
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  