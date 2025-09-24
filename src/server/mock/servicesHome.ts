//เดี๋ยวลบออก
import type { ServiceItem } from "@/types/service";

type Store = { services: ServiceItem[] };
const g = globalThis as any;

if (!g.__servicesStore) {
    g.__servicesStore = {
        services: [
            {
                id: "1", index: 1, name: "ล้างแอร์", category: "บริการทั่วไป",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "1a", name: "9,000 - 18,000 BTU, แบบติดผนัง", unitName: "เครื่อง", price: 800, index: 1 },
                    { id: "1b", name: "24,000 BTU, แบบติดผนัง", unitName: "เครื่อง", price: 900, index: 2 },
                ],
            },
            {
                id: "2", index: 2, name: "ติดตั้งแอร์", category: "บริการทั่วไป",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "2a", name: "แอร์ 9,000 - 18,000 BTU", unitName: "เครื่อง", price: 1500, index: 1 },
                    { id: "2b", name: "แอร์ 24,000 BTU", unitName: "เครื่อง", price: 1800, index: 2 },
                ],
            },
            {
                id: "3", index: 3, name: "ทำความสะอาดทั่วไป", category: "บริการทั่วไป",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "3a", name: "คอนโด/อพาร์ทเมนท์", unitName: "ครั้ง", price: 700, index: 1 },
                    { id: "3b", name: "บ้านเดี่ยว 2 ชั้น", unitName: "ครั้ง", price: 1200, index: 2 },
                ],
            },
            {
                id: "4", index: 4, name: "ซ่อมประตู", category: "บริการทั่วไป",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "4a", name: "ประตูไม้", unitName: "บาน", price: 500, index: 1 },
                    { id: "4b", name: "ประตูเหล็ก", unitName: "บาน", price: 700, index: 2 },
                ],
            },
            {
                id: "5", index: 5, name: "ซ่อมเครื่องซักผ้า", category: "บริการทั่วไป",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "5a", name: "เครื่องซักผ้าฝาบน", unitName: "เครื่อง", price: 600, index: 1 },
                    { id: "5b", name: "เครื่องซักผ้าฝาหน้า", unitName: "เครื่อง", price: 800, index: 2 },
                ],
            },
            {
                id: "6", index: 6, name: "ติดตั้งเตาแก๊ส", category: "บริการห้องครัว",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "6a", name: "เตาแก๊ส 1 หัว", unitName: "ชุด", price: 500, index: 1 },
                    { id: "6b", name: "เตาแก๊ส 2 หัว", unitName: "ชุด", price: 700, index: 2 },
                ],
            },
            {
                id: "7", index: 7, name: "ติดตั้งเครื่องดูดควัน", category: "บริการห้องครัว",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "7a", name: "เครื่องดูดควันติดผนัง", unitName: "ชุด", price: 1200, index: 1 },
                    { id: "7b", name: "เครื่องดูดควันแบบฝัง", unitName: "ชุด", price: 1500, index: 2 },
                ],
            },
            {
                id: "8", index: 8, name: "ติดตั้งชักโครก", category: "บริการห้องน้ำ",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "8a", name: "ชักโครกธรรมดา", unitName: "ชุด", price: 1000, index: 1 },
                    { id: "8b", name: "ชักโครกแบบประหยัดน้ำ", unitName: "ชุด", price: 1200, index: 2 },
                ],
            },
            {
                id: "9", index: 9, name: "ติดตั้งเครื่องทำน้ำอุ่น", category: "บริการห้องน้ำ",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "9a", name: "เครื่องทำน้ำอุ่นขนาดเล็ก", unitName: "เครื่อง", price: 900, index: 1 },
                    { id: "9b", name: "เครื่องทำน้ำอุ่นขนาดใหญ่", unitName: "เครื่อง", price: 1300, index: 2 },
                ],
            },
            {
                id: "10", index: 10, name: "ซ่อมท่อน้ำ", category: "บริการห้องน้ำ",
                createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z",
                imageUrl: "", subItems: [
                    { id: "10a", name: "ซ่อมท่อน้ำรั่ว", unitName: "จุด", price: 500, index: 1 },
                    { id: "10b", name: "เปลี่ยนท่อน้ำใหม่", unitName: "เมตร", price: 300, index: 2 },
                ],
            },
        ] satisfies ServiceItem[]
    } as Store;
}

export function getServices(): ServiceItem[] { return (globalThis as any).__servicesStore.services; }
export function setServices(next: ServiceItem[]) { (globalThis as any).__servicesStore.services = next; }
export function getServiceById(id: string) { return getServices().find(s => s.id === id); }