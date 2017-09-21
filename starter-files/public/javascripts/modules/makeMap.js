import axios from "axios";
import { $ } from "./bling";
// READ Google Maps APIs documentation https://google-developers.appspot.com/maps/documentation
const mapOptions = {
	center: { lat: 43.2, lng: -79.8 },
	zoom: 5
};

// TODO:  use the geolocation api to find users current hardware location
function loadPlaces(map, lat = 43.2, lng = -79.8) {
	axios.get(`/api/v1/stores/near?lat=${lat}&lng=${lng}`)
		.then(res => {
			const places = res.data;
			if (!places.length) {
				alert("sorry, no places found!");
				return;
			}

			const bounds = new google.maps.LatLngBounds();
			const infoWindow = new google.maps.InfoWindow();

			const markers = places.map(place => {
				// 🔥 es6 destructuring 🔥
				const [placeLng, placeLat] = place.location.coordinates;
				const position = { lat: placeLat, lng: placeLng };
				bounds.extend(position);
				const marker = new google.maps.Marker({ map, position });
				// add data from our API to each google marker
				marker.place = place;
				return marker;
			});

			markers.forEach(marker => marker.addListener("click", function() {
				const html = `
					<div class="popup">
						<a href="/store/${this.place.slug}">
							<img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
							<p>${this.place.name}</p>
							<p class="small">${this.place.location.address}</p>
						</a>
					</div>
				`;
				// setContent and open are google InfoWindow methods;
				infoWindow.setContent(html);
				infoWindow.open(map, this);
			}));

			// zoom the map to fit all the bounds of the markers
			map.setCenter(bounds.getCenter());
			map.fitBounds(bounds);
		});
}

function makeMap(mapDiv) {
	if(!mapDiv) return;
	// make the map
	const map = new google.maps.Map(mapDiv, mapOptions);
	loadPlaces(map)
	const input = $('[name="geolocate"]');
	const autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.addListener("place_changed", () => {
		const place = autocomplete.getPlace();
		const lat = place.geometry.location.lat();
		const lng = place.geometry.location.lng();
		loadPlaces(map, lat, lng);
	});
}

export default makeMap;