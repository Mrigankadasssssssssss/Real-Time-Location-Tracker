const sock = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((pos) => {
        console.log('Position received from geolocation:', pos);
        const { latitude: lat, longitude: lng } = pos.coords;
        console.log('Sending location:', { lat, lng });
        sock.emit("send-location", { lat, lng });
    }, (error) => {
        console.log('Geolocation error:', error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};

sock.on("received-location", (data) => {
    console.log('Received location:', data);
    const { id, lat, lng } = data;

    if (lat !== undefined && lng !== undefined) {
        map.setView([lat, lng]);

        if (markers[id]) {
            markers[id].setLatLng([lat, lng]);
        } else {
            markers[id] = L.marker([lat, lng]).addTo(map);
        }
    } else {
        console.error('Received invalid location data:', data);
    }
});

sock.on("client-disconnected",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})