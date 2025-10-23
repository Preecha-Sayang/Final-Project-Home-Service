import { create } from "zustand";
import type { BookingNearby } from "@/types/booking";

type Geo = { lat: number; lng: number };

type JobsState = {
    loading: boolean;
    center: Geo | null;
    jobs: BookingNearby[];
    loadNearby: (args?: Partial<Geo>) => Promise<void>;
    accept: (id: number) => Promise<boolean>;
    decline: (id: number) => Promise<boolean>;
};

export const useTechJobs = create<JobsState>((set, get) => ({
    loading: false,
    center: null,
    jobs: [],
    // โหลดงานใกล้เคียง
    loadNearby: async (args) => {
        set({ loading: true });
        try {
            const url = new URL("/api/technician/jobs/nearby", window.location.origin);
            if (args?.lat != null && args?.lng != null) {
                url.searchParams.set("lat", String(args.lat));
                url.searchParams.set("lng", String(args.lng));
            }
            const r = await fetch(url.toString(), { credentials: "include" });
            const js = await r.json();
            if (js?.ok) set({ jobs: js.jobs as BookingNearby[], center: js.center as Geo });
        } finally {
            set({ loading: false });
        }
    },
    // รับงาน
    accept: async (id) => {
        const r = await fetch(`/api/technician/jobs/${id}/accept`, {
            method: "POST",
            credentials: "include",
        });
        const ok = (await r.json())?.ok === true;
        if (ok) set({ jobs: get().jobs.filter(j => j.booking_id !== id) });
        return ok;
    },
    // ปฏิเสธ
    decline: async (id) => {
        const r = await fetch(`/api/technician/jobs/${id}/decline`, {
            method: "POST",
            credentials: "include",
        });
        const ok = (await r.json())?.ok === true;
        if (ok) set({ jobs: get().jobs.filter(j => j.booking_id !== id) });
        return ok;
    },
}));
