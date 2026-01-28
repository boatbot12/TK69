/**
 * Policy Modal - Shared Component
 * 
 * Displays company terms and conditions in a beautiful modal.
 * Used in both StepPersonalInfo and JobDetail pages.
 */

const PolicyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const sections = [
        {
            title: "1. ขอบเขตของงาน (Scope of Work)",
            content: [
                "1.1 ผู้รับจ้างตกลงรับจ้างผลิตสื่อรีวิวสินค้า ตามรายละเอียดที่บริษัทแจ้งในแต่ละแคมเปญ",
                "1.2 รูปแบบงานประกอบด้วยวิดีโอ รูปภาพ และ/หรือคอนเทนต์อื่นใด ตามที่บริษัทกำหนด",
                "1.3 ผู้รับจ้างต้องดำเนินงานให้แล้วเสร็จภายในระยะเวลาที่กำหนด (Timeline)"
            ]
        },
        {
            title: "2. การยืนยันงานและการเริ่มสัญญา",
            content: [
                "2.1 สัญญานี้มีผลผูกพันทันทีเมื่อผู้รับจ้าง",
                " • ยืนยันรับงานผ่านระบบของบริษัท",
                " • ตอบกลับข้อความยืนยันงาน",
                " • หรือได้รับสินค้าไม่ว่ากรณีใดกรณีหนึ่ง",
                "2.2 ผู้รับจ้างรับรองว่าข้อมูลส่วนบุคคลและที่อยู่จัดส่งสินค้าที่แจ้งไว้เป็นข้อมูลที่ถูกต้องและเป็นปัจจุบัน"
            ]
        },
        {
            title: "3. การจัดส่งสินค้า",
            content: [
                "3.1 บริษัทจะจัดส่งสินค้าไปยังที่อยู่ที่ผู้รับจ้างแจ้งไว้",
                "3.2 ผู้รับจ้างต้องแจ้งบริษัททันทีเมื่อได้รับสินค้า",
                "3.3 สินค้าที่จัดส่งถือเป็นส่วนหนึ่งของค่าตอบแทน และไม่สามารถโอน เปลี่ยน หรือเรียกร้องเป็นเงินสดแทนได้"
            ]
        },
        {
            title: "4. สิทธิในทรัพย์สินทางปัญญา (Intellectual Property Rights)",
            content: [
                "4.1 ผู้รับจ้างตกลงโอนสิทธิในผลงานทั้งหมดที่สร้างขึ้นภายใต้สัญญานี้ให้แก่บริษัท",
                "4.2 บริษัทมีสิทธิ์ใช้ แก้ไข ดัดแปลง ทำซ้ำ เผยแพร่ และนำไปใช้ในเชิงพาณิชย์ได้โดยไม่จำกัดระยะเวลา และไม่ต้องชำระค่าตอบแทนเพิ่มเติม",
                "4.3 ผู้รับจ้างต้องส่งไฟล์ Final Draft และ Asset ทั้งหมดให้แก่บริษัทตามรูปแบบที่กำหนด"
            ]
        },
        {
            title: "5. การเผยแพร่ผลงานและข้อจำกัด",
            content: [
                "5.1 ผู้รับจ้างต้องเผยแพร่ผลงานผ่านแพลตฟอร์มที่บริษัทกำหนด",
                "5.2 ผู้รับจ้างต้องไม่ลบ ซ่อน หรือแก้ไขโพสต์ โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท",
                "5.3 ผู้รับจ้างต้องติดตะกร้าสินค้า ลิงก์ หรือโค้ดตามระยะเวลาที่บริษัทกำหนด"
            ]
        },
        {
            title: "6. การส่งข้อมูลสถิติ (Performance Data)",
            content: [
                "6.1 ผู้รับจ้างต้องจัดส่งสถิติ (Stat) ของผลงานตามระยะเวลาที่บริษัทกำหนด",
                "6.2 ข้อมูลสถิติจะต้องเป็นข้อมูลจริง ไม่ถูกแก้ไขหรือบิดเบือน",
                "6.3 บริษัทมีสิทธิ์ปฏิเสธการชำระค่าจ้าง หากไม่ได้รับข้อมูลสถิติครบถ้วน"
            ]
        },
        {
            title: "7. ค่าตอบแทนและการชำระเงิน",
            content: [
                "7.1 ค่าตอบแทนเป็นไปตามที่ระบุในแต่ละแคมเปญ",
                "7.2 บริษัทจะชำระค่าตอบแทนหลังจาก",
                " • ผู้รับจ้างส่งงานครบถ้วน",
                " • ส่ง Asset และ Stat ตามที่กำหนด",
                "7.3 หากผู้รับจ้างผิดเงื่อนไขข้อใดข้อหนึ่ง บริษัทมีสิทธิ์ระงับหรือยกเลิกการชำระเงินทั้งหมด"
            ]
        },
        {
            title: "8. การผิดสัญญาและบทลงโทษ",
            content: [
                "8.1 การกระทำต่อไปนี้ถือเป็นการผิดสัญญา",
                " • ไม่ส่งงานตามกำหนด",
                " • เงียบหาย ไม่ตอบกลับการติดต่อ",
                " • ส่งงานไม่ตรงตามข้อตกลง",
                " • ลบหรือซ่อนโพสต์โดยไม่ได้รับอนุญาต",
                "8.2 บริษัทมีสิทธิ์ยกเลิกสัญญาทันทีโดยไม่ต้องแจ้งล่วงหน้า",
                "8.3 ผู้รับจ้างต้องรับผิดชอบค่าเสียหายทั้งหมดที่เกิดขึ้น รวมถึงแต่ไม่จำกัดเพียง",
                " • ค่าสินค้า",
                " • ค่าเสียเวลา",
                " • ค่าใช้จ่ายในการดำเนินงาน",
                " • ค่าเสียหายทางธุรกิจและชื่อเสียง"
            ]
        },
        {
            title: "9. การดำเนินคดีตามกฎหมาย",
            content: [
                "9.1 หากเกิดข้อพิพาท บริษัทมีสิทธิ์ดำเนินคดีตามกฎหมายจนถึงที่สุด",
                "9.2 ผู้รับจ้างตกลงให้กฎหมายไทยเป็นกฎหมายที่ใช้บังคับ",
                "9.3 ศาลไทยเป็นศาลที่มีเขตอำนาจพิจารณาข้อพิพาท"
            ]
        },
        {
            title: "10. ข้อกำหนดทั่วไป",
            content: [
                "10.1 บริษัทมีสิทธิ์แก้ไข เปลี่ยนแปลงเงื่อนไข โดยไม่ต้องแจ้งล่วงหน้า",
                "10.2 เงื่อนไขที่แก้ไขแล้วจะมีผลทันทีเมื่อประกาศผ่านเว็บไซต์",
                "10.3 หากข้อใดเป็นโมฆะ จะไม่กระทบต่อความสมบูรณ์ของข้ออื่น"
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg max-h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-scale-in">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-black text-gray-900">เงื่อนไขบริษัท ⚖️</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-6">Terms & Conditions</p>
                    {sections.map((section, idx) => (
                        <div key={idx} className="mb-8 last:mb-0">
                            <h3 className="text-lg font-black text-gray-900 mb-3 flex items-start gap-2">
                                <span className="text-brand-start">•</span>
                                {section.title}
                            </h3>
                            <div className="space-y-2.5 pl-5">
                                {section.content.map((line, lIdx) => (
                                    <p key={lIdx} className="text-gray-600 leading-relaxed text-[15px]">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="h-4" /> {/* Spacer */}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-brand-gradient text-white rounded-2xl font-black shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 active:scale-[0.98] transition-all"
                    >
                        เข้าใจแล้ว
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PolicyModal;
