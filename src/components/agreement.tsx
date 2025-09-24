import React from "react";

export function Agreement({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto shadow-xl transform transition-all duration-500 ease-in-out scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent event propagation
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">ข้อตกลงและเงื่อนไข</h2>

        <h3 className="text-xl font-semibold text-gray-700 mb-4">ข้อตกลงการใช้บริการ</h3>
        <p className="text-gray-600 mb-6">
          ข้อตกลงและเงื่อนไขนี้ ("ข้อตกลง") กำหนดเงื่อนไขในการใช้บริการต่าง ๆ ที่ให้บริการโดย
          [ชื่อบริษัท/เว็บไซต์] ("บริษัท", "เรา", "ของเรา") ให้กับผู้ใช้บริการ ("ผู้ใช้", "คุณ")
          โดยการเข้าถึงหรือใช้บริการของเรา คุณยอมรับที่จะผูกพันตามข้อตกลงนี้ หากคุณไม่ยอมรับ
          ข้อตกลงนี้ โปรดหยุดการใช้บริการทันที
        </p>

        <h4 className="text-lg font-semibold text-gray-700">1. การใช้บริการ</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>1.1 ผู้ใช้บริการต้องใช้บริการตามข้อตกลงและเงื่อนไขที่ระบุในเอกสารนี้เท่านั้น</li>
          <li>1.2 คุณตกลงที่จะไม่ใช้บริการเพื่อการกระทำที่ผิดกฎหมาย หรือกระทำการที่อาจทำให้เกิดความเสียหาย</li>
          <li>1.3 คุณต้องรับผิดชอบในการรักษาความปลอดภัยของข้อมูลบัญชีผู้ใช้</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">2. สิทธิในการแก้ไขและยกเลิกบริการ</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>2.1 บริษัทขอสงวนสิทธิในการแก้ไขหรือหยุดการให้บริการได้ตลอดเวลา</li>
          <li>2.2 หากบริษัทพบว่าผู้ใช้บริการกระทำการที่ละเมิดข้อตกลงนี้ บริษัทสามารถยกเลิกบัญชีผู้ใช้ได้ทันที</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">3. ข้อห้ามในการใช้บริการ</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>3.1 ห้ามผู้ใช้บริการทำการละเมิดหรือทำลายระบบเครือข่ายของบริษัท</li>
          <li>3.2 ห้ามใช้บริการเพื่อการกระทำที่ผิดกฎหมายหรือฝ่าฝืนข้อบังคับทางกฎหมาย</li>
          <li>3.3 ห้ามสร้างหรือเผยแพร่ข้อมูลที่มีเนื้อหาหมิ่นประมาทหรือผิดกฎหมาย</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">4. ข้อจำกัดความรับผิดชอบ</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>4.1 บริษัทไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดขึ้นจากการใช้บริการ</li>
          <li>4.2 บริษัทขอปฏิเสธความรับผิดชอบในกรณีที่บริการมีข้อผิดพลาดหรือขัดข้องเนื่องจากเหตุสุดวิสัย</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">5. การชำระเงินและนโยบายการคืนเงิน</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>5.1 ผู้ใช้ตกลงที่จะชำระค่าบริการตามที่กำหนดในเว็บไซต์</li>
          <li>5.2 บริษัทขอสงวนสิทธิในการไม่คืนเงินในกรณีที่ผู้ใช้ไม่พอใจ</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">6. กฎหมายที่ใช้บังคับ</h4>
        <p className="text-gray-600 mb-6">
          ข้อตกลงนี้จะถูกตีความและบังคับใช้ตามกฎหมายของ [ประเทศที่บริษัทตั้งอยู่] และในกรณีที่เกิดข้อพิพาท การฟ้องร้องจะต้องเกิดขึ้นในศาลที่มีเขตอำนาจใน [เขตพื้นที่ที่กำหนด]
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition-all duration-300 transform hover:scale-105"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}


export function Policy({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
       <div
        className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto shadow-xl transform transition-all duration-500 ease-in-out scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent event propagation
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">นโยบายความเป็นส่วนตัว (Privacy Policy)</h2>

        <h3 className="text-xl font-semibold text-gray-700 mt-6">ข้อมูลที่เรารวบรวม</h3>
        <p className="text-gray-600 mb-4">เราจะแจ้งให้คุณทราบเกี่ยวกับข้อมูลที่เรารวบรวมจากคุณและวิธีการที่เราจะใช้ข้อมูลเหล่านั้น ซึ่งรวมถึง:</p>

        <h4 className="text-lg font-semibold text-gray-700">1. ข้อมูลที่รวบรวม</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>1.1 ข้อมูลที่คุณให้โดยตรง: ข้อมูลที่คุณกรอกในการสมัครสมาชิก, การสั่งซื้อ, หรือการติดต่อกับเรา เช่น ชื่อ, ที่อยู่อีเมล, หมายเลขโทรศัพท์</li>
          <li>1.2 ข้อมูลที่เก็บโดยอัตโนมัติ: ข้อมูลเกี่ยวกับการเข้าถึงบริการของเรา เช่น ที่อยู่ IP, ข้อมูลเกี่ยวกับเบราว์เซอร์, และข้อมูลการใช้งานเว็บไซต์</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">2. การใช้ข้อมูลของคุณ</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>2.1 ข้อมูลที่รวบรวมจะถูกใช้เพื่อปรับปรุงประสบการณ์การใช้งานของคุณ เช่น การแนะนำบริการ, การส่งข้อมูลเกี่ยวกับผลิตภัณฑ์ใหม่ หรือการแจ้งข่าวสาร</li>
          <li>2.2 การใช้ข้อมูลเพื่อการประมวลผลธุรกรรมและการติดต่อกับผู้ใช้ในกรณีที่เกิดปัญหาหรือข้อสงสัยเกี่ยวกับการใช้บริการ</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">3. การแชร์ข้อมูลกับบุคคลที่สาม</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>3.1 บริษัทอาจแชร์ข้อมูลของคุณกับผู้ให้บริการภายนอก เช่น การชำระเงิน หรือการจัดการการขนส่ง เพื่อให้บริการที่ดีที่สุด</li>
          <li>3.2 เราจะไม่แชร์ข้อมูลส่วนบุคคลของคุณกับบุคคลที่สามเพื่อการตลาดโดยไม่ได้รับความยินยอมจากคุณ</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">4. การเก็บรักษาข้อมูล</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>4.1 ข้อมูลส่วนบุคคลของคุณจะถูกเก็บรักษาในระบบของเราอย่างปลอดภัย</li>
          <li>4.2 เราจะเก็บข้อมูลของคุณตราบเท่าที่จำเป็นเพื่อดำเนินการตามข้อกำหนดทางกฎหมายหรือการทำธุรกรรมที่เกี่ยวข้อง</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">5. สิทธิของคุณในข้อมูลส่วนบุคคล</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>5.1 คุณมีสิทธิในการเข้าถึงและขอแก้ไขข้อมูลส่วนบุคคลของคุณ</li>
          <li>5.2 คุณสามารถขอให้เราลบข้อมูลส่วนบุคคลของคุณจากระบบได้ภายใต้ข้อกำหนดที่กฎหมายกำหนด</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">6. การใช้คุกกี้ (Cookies)</h4>
        <ul className="list-inside list-disc mb-4 text-gray-600">
          <li>6.1 เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานของคุณในเว็บไซต์ เช่น การบันทึกการตั้งค่าหรือข้อมูลการเข้าสู่ระบบ</li>
          <li>6.2 คุณสามารถตั้งค่าบราวเซอร์ของคุณเพื่อปฏิเสธคุกกี้ได้ แต่บางฟังก์ชันของเว็บไซต์อาจไม่สามารถใช้งานได้หากปิดการใช้งานคุกกี้</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-700">7. การรักษาความปลอดภัย</h4>
        <p className="text-gray-600 mb-6">เราดำเนินการมาตรการด้านความปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึงข้อมูลส่วนบุคคลของคุณโดยไม่ได้รับอนุญาต เช่น การเข้ารหัสข้อมูลและการใช้เซิร์ฟเวอร์ที่มีความปลอดภัย</p>

        <h4 className="text-lg font-semibold text-gray-700">8. การเปลี่ยนแปลงนโยบาย</h4>
        <p className="text-gray-600 mb-6">นโยบายความเป็นส่วนตัวนี้อาจมีการปรับปรุงตามเวลา หากมีการเปลี่ยนแปลงเราจะแจ้งให้คุณทราบผ่านทางอีเมลหรือการประกาศบนเว็บไซต์ของเรา</p>

        <h4 className="text-lg font-semibold text-gray-700">9. การติดต่อเรา</h4>
        <p className="text-gray-600 mb-6">หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวหรือการใช้ข้อมูลส่วนบุคคลของคุณ สามารถติดต่อเราได้ที่ [อีเมล/เบอร์โทรศัพท์] ที่ระบุไว้ในเว็บไซต์ของเรา</p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition-all duration-300 transform hover:scale-105"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}