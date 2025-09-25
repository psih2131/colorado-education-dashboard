//для якорей
jQuery(function ($) {
    $('a[href*="#"]').on('click.smoothscroll', function (e) {
        var hash = this.hash, _hash = hash.replace(/#/, ''), theHref = $(this).attr('href').replace(/#.*/, '');
        if (theHref && location.href.replace(/#.*/, '') != theHref) return;
        var $target = _hash === '' ? $('body') : $(hash + ', a[name="' + _hash + '"]').first();
        if (!$target.length) return;
        e.preventDefault();
        $('html, body').stop().animate({ scrollTop: $target.offset().top - 0 }, 800, 'swing', function () {
            window.location.hash = hash;
        });
    });
});





document.addEventListener("DOMContentLoaded", () => {






    //map district search and load
    function mapSearchLoad() {


        function customSelect() {

            document.querySelectorAll(".select__head").forEach(head => {
                head.addEventListener("click", function () {
                    const isOpen = this.classList.contains("open");

                    // Закрываем все
                    document.querySelectorAll(".select__head").forEach(h => h.classList.remove("open"));
                    document.querySelectorAll(".select__list").forEach(list => list.style.display = "none");

                    if (!isOpen) {
                        this.classList.add("open");
                        const list = this.nextElementSibling;
                        if (list) list.style.display = "block";
                    }
                });
            });

            // Клик по .select__item
            document.querySelectorAll(".select__item").forEach(item => {
                item.addEventListener("click", function () {
                    const list = this.parentElement;
                    const head = list.previousElementSibling;
                    const input = head.previousElementSibling;

                    document.querySelectorAll(".select__head").forEach(h => h.classList.remove("open"));
                    list.style.display = "none";

                    head.textContent = this.textContent;
                    if (input) input.value = this.getAttribute('data-value')
                    console.log(input.value)

                    input.dispatchEvent(new Event("input", { bubbles: true }));
                });
            });

            // Клик вне .select
            document.addEventListener("click", (e) => {
                if (!e.target.closest(".select")) {
                    document.querySelectorAll(".select__head").forEach(h => h.classList.remove("open"));
                    document.querySelectorAll(".select__list").forEach(list => list.style.display = "none");
                }
            });
        }



        function genDistrictList() {
            fetch('../js/map.geojson')
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    createDistrictSekectElement(data)
                })
        }

        genDistrictList()


        function createDistrictSekectElement(dataGeo) {
            let selectContainer = document.querySelector('.map-home-select .select__list')
            selectContainer.innerHTML = ""

            let dataListObjects = dataGeo.features

            for (let i = 0; i < dataListObjects.length; i++) {
                let newOptionLi = document.createElement('li')
                newOptionLi.classList.add('select__item')
                newOptionLi.setAttribute('data-value', dataListObjects[i].properties.GEOID)
                newOptionLi.innerHTML = `${dataListObjects[i].properties.NAME}`
                selectContainer.appendChild(newOptionLi)
            }

            console.log(selectContainer)

            customSelect()
            loadMap()

        }



        let zoomValue = 7.5

        if (window.matchMedia('(min-width: 1460px)').matches) {
            zoomValue = 7.5
        } else {
            zoomValue = 7.2
        }


        function loadMap() {
            const map = L.map('map', {
                center: [39, -105.5],
                zoom: zoomValue,
                zoomSnap: 0
            });

            // серый фон (Carto)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            let geojson;

            fetch('../js/map.geojson')
                .then(res => res.json())
                .then(data => {
                    // базовый стиль
                    function style() {
                        return {
                            color: "#D6D9DB",
                            weight: 1.5,
                            fillColor: "#609DC9",
                            fillOpacity: 1
                        };
                    }

                    // подсветка при наведении
                    function highlightFeature(e) {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 2.5,
                            color: "#fff",
                            fillColor: "#91B4D3",
                            fillOpacity: 1
                        });
                        layer.bringToFront();
                    }

                    // возврат к исходному стилю
                    function resetHighlight(e) {
                        geojson.resetStyle(e.target);
                    }

                    function onEachFeature(feature, layer) {
                        layer.bindPopup(feature.properties.NAME);
                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight
                        });
                    }

                    geojson = L.geoJSON(data, {
                        style,
                        onEachFeature
                    }).addTo(map);
                });


            console.log('test', document.querySelector('.map-home-select .select__input'))

            document.querySelector('.map-home-select .select__input').addEventListener('input', () => {
                console.log('test 2')
                document.getElementById('addressInput').value = ""
                let currentDistryctIDValue = document.querySelector('.map-home-select .select__input').value;
                console.log(currentDistryctIDValue)

                if (!geojson) return;

                geojson.eachLayer(layer => {
                    if (layer.feature.properties.GEOID == currentDistryctIDValue) {
                        // Подсветка
                        layer.setStyle({
                            weight: 2.5,
                            color: "#fff",
                            fillColor: "#91B4D3",
                            fillOpacity: 1
                        });

                        // Центрируем на объекте
                        if (layer.getBounds && typeof layer.getBounds().getCenter === 'function') {
                            map.setView(layer.getBounds().getCenter(), map.getZoom());
                        } else if (layer.getLatLng) {
                            map.setView(layer.getLatLng(), map.getZoom());

                        }

                        if (window.matchMedia('(max-width: 765px)').matches) {
                            document.getElementById("map").scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });
                        }

                        // Показываем popup
                        layer.bindPopup(layer.feature.properties.NAME).openPopup();

                    } else {
                        geojson.resetStyle(layer);
                    }
                });
            });



            // Поиск по адресу через Google Geocoding
            document.getElementById('searchBtn').addEventListener('click', () => {
                const address = document.getElementById('addressInput').value;
                if (!address || !geojson) return;

                fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=YOUR_API_KEY`)
                    .then(res => res.json())
                    .then(data => {

                        console.log(data)
                        if (!data.results.length) { alert("District dont finded"); return; }

                        const { lat, lng } = data.results[0].geometry.location;
                        const point = turf.point([lng, lat]);

                        let found = false;

                        geojson.eachLayer(layer => {
                            const polygon = layer.feature;
                            if (turf.booleanPointInPolygon(point, polygon)) {
                                // Подсветка найденного дистрикта
                                layer.setStyle({ weight: 2.5, color: "#fff", fillColor: "#91B4D3", fillOpacity: 1 });
                                map.setView(layer.getBounds().getCenter(), map.getZoom());
                                layer.bindPopup(layer.feature.properties.NAME).openPopup();
                                found = true;


                                if (window.matchMedia('(max-width: 765px)').matches) {
                                    document.getElementById("map").scrollIntoView({
                                        behavior: "smooth",
                                        block: "start"
                                    });
                                }

                                document.querySelector('.map-home-select .select__head').innerHTML = layer.feature.properties.NAME
                            } else {
                                geojson.resetStyle(layer);
                            }
                        });

                        if (!found) alert("District dont finded");
                    });
            });

        }

    }



    mapSearchLoad()

});