
$(function () {
    let allClusters = $('.acordeon-data-claster')
    allClusters.find('.acordeon-data-claster__header').on('click', function () {
        $(this).closest('.acordeon-data-claster').find('.acordeon-data-claster__body').slideToggle(500)
        $(this).closest('.acordeon-data-claster').toggleClass('active')
    })

});

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

        const mapSec = document.querySelector('.map-sec')

        if (mapSec) {


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

            const coloradoBounds = [
                [36.1, -110.2], // юго-запад (с запасом)
                [41.9, -100.8]  // северо-восток (с запасом)
            ];

            if (window.matchMedia('(min-width: 1460px)').matches) {
                zoomValue = 7.5
            } else {
                zoomValue = 7.2
            }


            function loadMap() {
                const map = L.map('map', {
                    center: [39, -105.5],
                    zoom: zoomValue,
                    zoomSnap: 0,
                    maxBounds: coloradoBounds,
                    maxBoundsViscosity: 1.0
                });

                // серый фон (Carto)
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                    subdomains: 'abcd',

                    minZoom: 7.5
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

                    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyDthpqDp8dKmzG9uL5RNpFx2RSaYtnYTXI`)
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

    }



    mapSearchLoad()



    const statSec = document.querySelector('.district-stat-sec')

    if (statSec) {

        let currentSelectYearRangeValue = 3

        let currentDistrictServerData = null

        let dopDistrictSelectValue = null

        //example districts data list
        let allDistrictData = [
            {
                id: 1,
                title: 'District 1',
                dataValue: [
                    {
                        year: 2019,
                        value: 32
                    },
                    {
                        year: 2023,
                        value: 56
                    },
                    {
                        year: 2024,
                        value: 89
                    },
                ]
            },

            {
                id: 2,
                title: 'District 2',
                dataValue: [
                    {
                        year: 2019,
                        value: 12
                    },
                    {
                        year: 2023,
                        value: 70
                    },
                    {
                        year: 2024,
                        value: 54
                    },
                ]
            },

            {
                id: 3,
                title: 'District 3',
                dataValue: [
                    {
                        year: 2019,
                        value: 44
                    },
                    {
                        year: 2023,
                        value: 32
                    },
                    {
                        year: 2024,
                        value: 60
                    },
                ]
            }
        ]

        //EMITATION GET DISTRICT SERVER DATA
        let CurrentPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let currentDistrData = [
                    {
                        year: 2019,
                        value: 60
                    },
                    {
                        year: 2023,
                        value: 45
                    },
                    {
                        year: 2024,
                        value: 78
                    },
                ]
                resolve(currentDistrData);
            }, 2000);
        })

        CurrentPromise.then((value) => {
            console.log(value)
            currentDistrictServerData = value

            setDistrictsListData()
        })





        //set districts list to custom select
        function setDistrictsListData() {
            let selectDistrictChart = document.querySelector('.district-stat-select--controll')
            let selectListDistrictChart = selectDistrictChart.querySelector('.select__list')
            selectListDistrictChart.innerHTML = ''

            for (let i = 0; i < allDistrictData.length; i++) {
                let newLiElement = document.createElement('li')
                newLiElement.classList.add('select__item')
                newLiElement.setAttribute('data-value', allDistrictData[i].id)
                newLiElement.innerHTML = allDistrictData[i].title
                selectListDistrictChart.appendChild(newLiElement)

            }

            customSelect()
            customRange()
            chartJsInitial()
        }




        //custom selectors scripts
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



        //custom range
        function customRange() {
            const range = document.getElementById('range');
            const timeLineYearListText = document.querySelectorAll('.timeline .marks span')
            const fullingLine = document.querySelector('.timeline__row-line-fulling')
            const timeLineRangeCustom = document.querySelector('.timeline__row-line')

            timeLineYearListText[2].classList.add('active')

            fullingLine.style.width = '0%'

            timeLineRangeCustom.style.borderRadius = '0 20px 20px 0'

            currentSelectYearRangeValue = 3

            range.addEventListener('input', () => {
                currentSelectYearRangeValue = range.value
                console.log("Выбран год:", range.value);

                if (range.value == 1) {
                    for (let i = 0; i < timeLineYearListText.length; i++) {
                        timeLineYearListText[i].classList.remove('active')
                    }
                    timeLineYearListText[0].classList.add('active')
                    fullingLine.style.width = '100%'
                    timeLineRangeCustom.style.borderRadius = '20px 0 0 20px'

                }

                if (range.value == 2) {
                    for (let i = 0; i < timeLineYearListText.length; i++) {
                        timeLineYearListText[i].classList.remove('active')
                    }
                    timeLineYearListText[1].classList.add('active')
                    fullingLine.style.width = '50%'
                    timeLineRangeCustom.style.borderRadius = '0 0 0 0'
                }

                if (range.value == 3) {
                    for (let i = 0; i < timeLineYearListText.length; i++) {
                        timeLineYearListText[i].classList.remove('active')
                    }
                    timeLineYearListText[2].classList.add('active')
                    fullingLine.style.width = '0%'
                    timeLineRangeCustom.style.borderRadius = '0 20px 20px 0'
                }


            });
        }



        function chartJsInitial() {

            const range = document.getElementById('range');

            const selectControl = document.querySelector('.district-stat-select--controll')

            const selectControlInput = selectControl.querySelector('.select__input')

            const btnTestAddData = document.querySelector('.controll-container__select-wrapper')

            let dataChart = {
                labels: [currentDistrictServerData[0].year, currentDistrictServerData[1].year, currentDistrictServerData[2].year],
                datasets: [{
                    label: '# of Votes',
                    data: [+currentDistrictServerData[0].value, +currentDistrictServerData[1].value, +currentDistrictServerData[2].value],
                    borderWidth: 8,
                    borderColor: '#013364',
                }],
            }


            const ctx = document.getElementById('statDistrictChart');

            const chartDistrict = new Chart(ctx, {
                type: 'line',
                data: dataChart,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawTicks: false,   // убрать маленькие деления
                                drawBorder: false,  // убрать границу оси
                                display: false      // полностью скрыть линии сетки
                            },
                            ticks: {
                                color: '#9B9B9B', // цвет шрифта оси Y
                                font: {
                                    size: 14,       // размер шрифта
                                    family: 'Arial',
                                    weight: '300'
                                }
                            }

                        },

                        x: {
                            ticks: {
                                color: '#9B9B9B', // цвет шрифта оси Y
                                font: {
                                    size: 14,       // размер шрифта
                                    family: 'Arial',
                                    weight: '300'
                                }
                            }
                        }
                    },

                    plugins: {
                        tooltip: {
                            enabled: true, // включен, но можно вручную дергать
                            external: null, // используем стандартный стиль
                            backgroundColor: '#FFFFFF', // цвет фона
                            titleColor: '#013364',     // цвет заголовка
                            bodyColor: '#013364',      // цвет текста
                            titleFont: { size: 16, weight: 'bold' }, // шрифт заголовка
                            bodyFont: { size: 14 },                  // шрифт текста
                            padding: 10,           // отступы
                            cornerRadius: 6,       // скругление углов
                            displayColors: false,  // скрыть цветные квадратики
                            multiKeyBackground: '#555', // фон для множественных ключей
                        },
                        legend: {
                            display: false // скрываем легенду полностью
                        }
                    }
                }
            });


            // Функция ручного показа тултипа для нескольких элементов
            function showTooltip(chart, elements) {
                chart.setActiveElements(elements);
                chart.tooltip.setActiveElements(elements, { x: 0, y: 0 });
                chart.update();
            }

            range.addEventListener('change', () => {
                console.log('gg');
                console.log('currentSelectYearRangeValue', currentSelectYearRangeValue);

                const index = +currentSelectYearRangeValue - 1;

                if (dopDistrictSelectValue && dopDistrictSelectValue !== '') {
                    // Показываем сразу два элемента
                    showTooltip(chartDistrict, [
                        { datasetIndex: 0, index },
                        { datasetIndex: 1, index }
                    ]);
                } else {
                    // Показываем один элемент
                    showTooltip(chartDistrict, [
                        { datasetIndex: 0, index }
                    ]);
                }
            })


            selectControlInput.addEventListener('input', () => {
                console.log('ssSS', selectControlInput.value)
                dopDistrictSelectValue = selectControlInput.value

                if (dopDistrictSelectValue && dopDistrictSelectValue != '') {
                    let currentDopElement = allDistrictData.find(
                        element => element.id === +dopDistrictSelectValue
                    );

                    console.log('dopDistrictSelectValue', +dopDistrictSelectValue)
                    console.log('currentDopElement', allDistrictData[0])
                    console.log('currentDopElement', currentDopElement)
                    dataChart = {
                        labels: ['2019', '2023', '2024'],
                        datasets: [{
                            label: 'District 0',
                            data: [+currentDistrictServerData[0].value, +currentDistrictServerData[1].value, +currentDistrictServerData[2].value],
                            borderWidth: 8,
                            borderColor: '#013364',
                        },

                        {
                            label: currentDopElement.title,
                            data: [currentDopElement.dataValue[0].value, currentDopElement.dataValue[1].value, currentDopElement.dataValue[2].value],
                            borderWidth: 5,
                            borderColor: '#559EC7',
                            borderDash: [10, 10]
                        }],
                    }
                }
                else {
                    dataChart = {
                        labels: ['2019', '2023', '2024'],
                        datasets: [{
                            label: '# of Votes',
                            data: [+currentDistrictServerData[0].value, +currentDistrictServerData[1].value, +currentDistrictServerData[2].value],
                            borderWidth: 8,
                            borderColor: '#013364',
                        }],
                    }
                }


                console.log('update', chartDistrict.data)

                chartDistrict.data = dataChart

                chartDistrict.update()

            })


        }


    }






    const ctx = document.getElementById('financeChart1');

    const chartDistrict = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                'Red',
                'Blue',
                'Yellow'
            ],
            datasets: [{
                label: 'My First Dataset',
                data: [300, 50, 100],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
            }]
        },
        options: {}
    });




});