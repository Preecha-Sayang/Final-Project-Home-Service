import { GoogleMap, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import type { GeoPoint } from "@/types/location";

export default function RoutePreview({ origin, destination }: { origin: GeoPoint; destination: GeoPoint; }) {
    const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, libraries: ["places"], language: "th", region: "TH" });
    const [dir, setDir] = useState<google.maps.DirectionsResult>();

    useEffect(() => {
        if (!isLoaded) return;
        const svc = new google.maps.DirectionsService();
        svc.route({
            origin, destination, travelMode: google.maps.TravelMode.DRIVING, drivingOptions: { departureTime: new Date() }
        }, (res, status) => { if (status === "OK" && res) setDir(res); });
    }, [isLoaded, origin, destination]);

    if (!isLoaded) return <div className="w-full h-64 rounded-xl border" />;
    return (
        <GoogleMap mapContainerClassName="w-full h-64 rounded-xl border" center={origin} zoom={12}>
            {dir && <DirectionsRenderer directions={dir} options={{ suppressMarkers: false }} />}
        </GoogleMap>
    );
}

//# แสดงทาง + ระยะทาง/เวลา (DirectionsRenderer)