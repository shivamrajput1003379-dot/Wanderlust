const searchBtn = document.getElementById("search-btn");
const locationInput = document.getElementById("location-input");

const mapElement = document.getElementById("map");
const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


if(!mapElement) {
    console.log("Map element not found");
} else {
        const savedLat = parseFloat(mapElement.dataset.lat) || 28.6139;
        const savedLng = parseFloat(mapElement.dataset.lng) || 77.2090;

    // Map Initialize
    const map = L.map("map").setView([savedLat, savedLng], 14);

    // Tile Layer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
    }).addTo(map);



    // Marker
    let marker = L.marker([savedLat, savedLng], {
        icon: redIcon
    }).addTo(map);

    let redZone = L.circle([savedLat, savedLng], {
        radius: 500, // meters
        color: "red",
        fillColor: "red",
        fillOpacity: 0.3
    }).addTo(map);

    const latInput = document.getElementById("latitude");
    const lngInput = document.getElementById("longitude");
    // Hidden inputs me initial values
    if (latInput && lngInput) {
        latInput.value = savedLat;
        lngInput.value = savedLng;
    }

    // Update Function
    function updateLocation(lat, lng) {

        marker.setLatLng([lat, lng]);

        if (latInput && lngInput) {
            latInput.value = lat;
            lngInput.value = lng;
            console.log("Saved:", lat, lng);
        } else {
            console.log("⚠️ Hidden inputs not found on this page (Maybe you are on Show Page)");
        }
    } 

    // Map Click
    map.on("click", function (e) {

        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        updateLocation(lat, lng);
    });

    // Search Button
    const searchBtn = document.getElementById("search-btn");

    if (searchBtn) {

        searchBtn.addEventListener("click", async function () {

            const locationQuery =
                document.getElementById("location-input").value;

            if (!locationQuery) {
                alert("Please enter a location!");
                return;
            }

            try {

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`
                );

                const data = await response.json();

                if (data.length > 0) {

                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);

                    map.setView([lat, lng], 13);

                    updateLocation(lat, lng);

                } else {

                    alert("Location not found!");

                }

            } catch (err) {

                console.error(err);
                alert("Search failed!");

            }
        });
    }
}