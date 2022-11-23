// MAPBOX DISPLAY
function showHikesOnMap() {


    // MAPBOX DISPLAY
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [-123.11535188078236, 49.28274402264293], // starting position
        zoom: 14 // starting zoom
    });


    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
        const features = [];
        db.collection("events").get().then(allHikes => {
            allHikes.forEach(doc => {
                longitude = doc.data().longitude;
                latitude = doc.data().latitude;
                coordinates = [latitude, longitude]
                // coordiantes = doc.data().coordiantes;
                console.log(coordinates);
                url = doc.data().link;

                features.push({
                    'type': 'Feature',
                    'properties': {
                        'description': `<strong>Current Capacity</strong><p><a href="${url}" target="_blank" title="Opens in a new window">Event Name</a> Some description here</p>`,
                        'icon': 'mountain-15'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates
                    }
                });
            })

            map.addSource('places', {
                // This GeoJSON contains features that include an "icon"
                // property. The value of the "icon" property corresponds
                // to an image in the Mapbox Streets style's sprite.
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': features
                }
            });
            // Add a layer showing the places.
            map.addLayer({
                'id': 'places',
                'type': 'symbol',
                'source': 'places',
                'layout': {
                    'icon-image': '{icon}',
                    'icon-allow-overlap': true
                }
            });

            // When a click event occurs on a feature in the places layer, open a popup at the
            // location of the feature, with description HTML from its properties.
            map.on('click', 'places', (e) => {
                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .addTo(map);
            });

            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', 'places', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'places', () => {
                map.getCanvas().style.cursor = '';
            });
        })

    });
}

showHikesOnMap()