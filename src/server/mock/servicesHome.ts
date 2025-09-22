import type { ServiceItem } from "@/components/admin/services/type_service";

type Store = { services: ServiceItem[] };

const g = globalThis as any;

if (!g.__servicesStore) {
    g.__servicesStore = {
        services: [
            { id: "1", index: 1, name: "ล้างแอร์", category: "บริการทั่วไป", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
            { id: "2", index: 2, name: "ติดตั้งแอร์", category: "บริการทั่วไป", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
            { id: "3", index: 3, name: "ทำความสะอาดทั่วไป", category: "บริการทั่วไป", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
            { id: "4", index: 4, name: "ซ่อมประตู", category: "บริการทั่วไป", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
            { id: "5", index: 5, name: "ซ่อมเครื่องซักผ้า", category: "บริการทั่วไป", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
            { id: "6", index: 6, name: "ติดตั้งเตาแก๊ส", category: "บริการห้องครัว", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
            { id: "7", index: 7, name: "ติดตั้งเครื่องดูดควัน", category: "บริการห้องครัว", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
            { id: "8", index: 8, name: "ติดตั้งชักโครก", category: "บริการห้องน้ำ", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
            { id: "9", index: 9, name: "ติดตั้งเครื่องทำน้ำอุ่น", category: "บริการห้องน้ำ", createdAt: "2022-12-02T22:30:00.000Z", updatedAt: "2022-12-02T22:30:00.000Z" },
        ] satisfies ServiceItem[]
    } as Store;
}

export function getServices(): ServiceItem[] {
    return (globalThis as any).__servicesStore.services as ServiceItem[];
}

export function setServices(next: ServiceItem[]) {
    (globalThis as any).__servicesStore.services = next;
}
