$(function () {
    let allClusters = $('.acordeon-data-claster')
    allClusters.find('.acordeon-data-claster__header').on('click', function () {
        $(this).closest('.acordeon-data-claster').find('.acordeon-data-claster__body').slideToggle(500)
        $(this).closest('.acordeon-data-claster').toggleClass('active')
    })

    let allAcorderons = $('.acordeon-data-claster')
    let allAcorderonsBtns = $('.container-checkbox input ')

    for (let i = 0; i < allAcorderonsBtns.length; i++) {
        $(allAcorderonsBtns[i]).on('change', function () {
            console.log($(this).prop('checked'));
            let statusInt = $(this).prop('checked')

            if (statusInt == false) {
                allAcorderons[i].style.display = 'none'
            }
            else {
                allAcorderons[i].style.display = 'block'
            }
        });
    }
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

    let devMod = false

    let devModData = devMod
    let urlGeoFile = ''
    let urlDomain = ''

    if (devMod == true) {
        urlGeoFile = '../js/map.geojson'
    }
    else {
        urlGeoFile = '/wp-content/themes/csi/js/map.geojson'
    }

    if (devModData == true) {
        urlDomain = 'http://district-dashbord.test'
    }
    else {
        // urlDomain = 'https://csi.theprojectview.com'

        urlDomain = '   https://coloradoeducationdashboard.com'
    }

    var swiper = new Swiper(".post-slider-swiper", {
        slidesPerView: 3,
        spaceBetween: 0,
        speed: 1000,
        loop: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            // when window width is >= 320px
            300: {
                slidesPerView: 1,
                spaceBetween: 0,

                // centeredSlides: true
            },
            // when window width is >= 320px

            // when window width is >= 320px
            767: {
                slidesPerView: 2,
                spaceBetween: 0,
            },
            // when window width is >= 480px
            1220: {
                slidesPerView: 3,
                spaceBetween: 0,
            },
            // when window width is >= 640px
            1540: {
                slidesPerView: 3,
                spaceBetween: 0,
            }
        }

    });


    //нормализация высот заголовков блоков
    function normalisationEventBox() {
        const elements = document.querySelectorAll('.event-element__title-wrapper');

        if (elements && elements.length) {
            // Получаем все элементы с нужным классом

            if (!elements.length) return;

            // Сбрасываем высоту, чтобы правильно измерить исходную
            elements.forEach(el => (el.style.height = 'auto'));

            // Находим максимальную высоту
            const maxHeight = Math.max(...Array.from(elements).map(el => el.offsetHeight));

            // Устанавливаем всем одинаковую высоту
            elements.forEach(el => (el.style.height = `${maxHeight}px`));
        }
    }

    normalisationEventBox()

    //map district search and load
    function mapSearchLoad() {

        const mapSec = document.querySelector('.map-sec')

        if (mapSec) {

            let districtListDataServer = []

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

            //получаем дистрикты заполненые в админке
            async function getServerDistrictDataList() {


                let endpoint = `${urlDomain}/wp-json/wp/v2/district`
                try {
                    let data = await fetch(endpoint)
                    let result = await data.json()
                    if (result) {
                        districtListDataServer = result
                    }

                    genDistrictList()
                    console.log('getServerDistrictDataList', result)
                }
                catch (error) {
                    console.log('getServerDistrictDataList error', error)
                }
            }


            //получаем дистрикты с файла для карты
            function genDistrictList() {

                fetch(urlGeoFile)
                    .then(res => res.json())
                    .then(data => {
                        console.log(data)
                        createDistrictSekectElement(data)
                    })
            }

            getServerDistrictDataList()



            function createDistrictSekectElement(dataGeo) {
                let selectContainer = document.querySelector('.map-home-select .select__list')
                selectContainer.innerHTML = ""

                let dataListObjects = dataGeo.features


                dataListObjects.sort((a, b) => {
                    return a.properties.NAME.localeCompare(b.properties.NAME, 'en', { sensitivity: 'base' });
                });

                // dataListObjects = dataListObjects.filter(item => item.title.rendered !== 'State');

                for (let i = 0; i < dataListObjects.length; i++) {
                    let newOptionLi = document.createElement('li')
                    newOptionLi.classList.add('select__item')
                    newOptionLi.setAttribute('data-value', dataListObjects[i].properties.GEOID)
                    // newOptionLi.innerHTML = `${dataListObjects[i].properties.NAME}`


                    let geoIdFile = dataListObjects[i].properties.GEOID; // нужный geoid
                    let districtData = districtListDataServer.find(
                        item => +item.acf.geoid === +geoIdFile
                    );

                    let url = ''

                    if (districtData && +districtData.acf.geoid == +geoIdFile) {
                        url = districtData.link
                    }
                    else {

                    }

                    let linlHtml = `
                                    <a href="${url}">${dataListObjects[i].properties.NAME}</a>
                                    `

                    newOptionLi.innerHTML = linlHtml

                    selectContainer.appendChild(newOptionLi)
                }

                console.log(selectContainer)

                customSelect()
                loadMap()

            }


            let mapOptions = {}

            let zoomValue = 7.5

            let minZoomValue = 7.5

            let maxPopupWith = 300

            let coloradoBounds = [
                [36.9, -110.2], // юго-запад (с запасом)
                [41.5, -100]  // северо-восток (с запасом)
            ];

            if (window.matchMedia('(min-width: 1781px)').matches) {

                minZoomValue = 7.5

                mapOptions = {
                    center: [39, -105.5],
                    zoom: minZoomValue,
                    zoomSnap: 0,
                    maxBounds: coloradoBounds,
                    maxBoundsViscosity: 1.0,
                    dragging: false,
                    zoomControl: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false,
                    tap: false
                }
                maxPopupWith = 300

            }
            else if (window.matchMedia('(min-width: 1461px)').matches) {


                minZoomValue = 7.5

                mapOptions = {
                    center: [39, -105.5],
                    zoom: minZoomValue,
                    zoomSnap: 0,

                    maxBoundsViscosity: 1.0,
                    dragging: false,
                    zoomControl: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false,
                    tap: false

                }
                maxPopupWith = 200
            }

            else if (window.matchMedia('(min-width: 1201px)').matches) {

                maxPopupWith = 150

                minZoomValue = 7

                mapOptions = {
                    center: [39, -105.5],
                    zoom: minZoomValue,
                    zoomSnap: 0,

                    maxBoundsViscosity: 1.0,
                    dragging: false,
                    zoomControl: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false,
                    tap: false
                }
            }

            else {
                maxPopupWith = 150
                coloradoBounds = [
                    [35.9, -111.3], // юго-запад (с запасом)
                    [43, -100]  // северо-восток (с запасом)
                ]

                minZoomValue = 7
                mapOptions = {
                    center: [39, -105.5],
                    zoom: 7,
                    zoomSnap: 0,
                    maxBounds: coloradoBounds,
                    maxBoundsViscosity: 1.0,
                    // dragging: false,
                    // zoomControl: false,
                    // scrollWheelZoom: false,
                    // doubleClickZoom: false,
                    // boxZoom: false,
                    // keyboard: false,
                    // tap: false
                }
            }





            function loadMap() {
                const map = L.map('map', mapOptions);

                // серый фон (Carto)
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    // attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                    subdomains: 'abcd',
                    minZoom: minZoomValue
                }).addTo(map);

                let geojson;

                fetch(urlGeoFile)
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

                        // popup для каждого объекта
                        function onEachFeature(feature, layer) {
                            let geoIdFile = feature.properties.GEOID; // нужный geoid
                            let districtData = districtListDataServer.find(
                                item => +item.acf.geoid === +geoIdFile
                            );


                            let name = feature.properties.NAME;
                            let url = ''
                            let score = ''
                            console.log('districtData,', districtData)
                            if (districtData && +districtData.acf.geoid == +geoIdFile) {
                                url = districtData.link

                                if (districtData.acf?.years[0]?.overall_score) {
                                    score = (+districtData.acf.years[1].overall_score).toFixed(2)
                                    console.log('bingo2', score)
                                }
                                else {
                                    score = 'N/A'
                                }

                                console.log('bingo', url)
                            }
                            else {
                                score = 'N/A'
                            }


                            let popupContent = `
                                <div class="map-pop" style="font-size: 14px; line-height: 1.4;">
                                    <p class="map-pop__title">${name}</p>
                                    <p class="map-pop__value">Overall Score: <b> ${score}</b></p>
                                    <p class="map-pop__link">
                                        <a href="${url}" >
                                            VIEW ALL DISTRICT DATA 
                                        </a>
                                    </p>
                                    
                                </div>
                            `;

                            layer.bindPopup(popupContent, {
                                maxWidth: maxPopupWith,   // максимальная ширина в пикселях
                                minWidth: 50,   // минимальная ширина (опционально)
                                className: 'custom-popup' // кастомный класс для дополнительных стилей
                            });

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

                // document.querySelector('.map-home-select .select__input').addEventListener('input', () => {
                //     console.log('test 2')
                //     document.getElementById('addressInput').value = ""
                //     let currentDistryctIDValue = document.querySelector('.map-home-select .select__input').value;
                //     console.log(currentDistryctIDValue)

                //     if (!geojson) return;

                //     geojson.eachLayer(layer => {
                //         if (layer.feature.properties.GEOID == currentDistryctIDValue) {
                //             // Подсветка
                //             layer.setStyle({
                //                 weight: 2.5,
                //                 color: "#fff",
                //                 fillColor: "#91B4D3",
                //                 fillOpacity: 1
                //             });

                //             // Центрируем на объекте
                //             if (layer.getBounds && typeof layer.getBounds().getCenter === 'function') {
                //                 map.setView(layer.getBounds().getCenter(), map.getZoom());
                //             } else if (layer.getLatLng) {
                //                 map.setView(layer.getLatLng(), map.getZoom());

                //             }

                //             if (window.matchMedia('(max-width: 765px)').matches) {
                //                 document.getElementById("map").scrollIntoView({
                //                     behavior: "smooth",
                //                     block: "start"
                //                 });
                //             }

                //             // Показываем popup


                //             let geoIdFile = layer.feature.properties.GEOID; // нужный geoid
                //             let districtData = districtListDataServer.find(
                //                 item => +item.acf.geoid === +geoIdFile
                //             );


                //             let name = layer.feature.properties.NAME;
                //             let url = ''
                //             let score = ''
                //             console.log('districtData,', districtData)
                //             if (districtData && +districtData.acf.geoid == +geoIdFile) {
                //                 url = districtData.link

                //                 if (districtData.acf?.years[0]?.overall_score) {
                //                     score = (+districtData.acf.years[1].overall_score).toFixed(2)
                //                     console.log('bingo2', score)
                //                 }
                //                 else {
                //                     score = 'N/A'
                //                 }

                //                 console.log('bingo', url)
                //             }
                //             else {
                //                 score = 'N/A'
                //             }


                //             let popupContent = `
                //                 <div class="map-pop" style="font-size: 14px; line-height: 1.4;">
                //                     <p class="map-pop__title">${name}</p>
                //                     <p class="map-pop__value">Overall Score: <b> ${score}</b></p>
                //                     <p class="map-pop__link">
                //                         <a href="${url}" >
                //                             VIEW ALL DISTRICT DATA
                //                         </a>
                //                     </p>

                //                 </div>
                //             `;


                //             layer.bindPopup(popupContent).openPopup();

                //         } else {
                //             geojson.resetStyle(layer);
                //         }
                //     });
                // });



                // Поиск по адресу через Google Geocoding
                document.getElementById('searchBtn').addEventListener('click', () => {
                    const address = document.getElementById('addressInput').value;
                    if (!address || !geojson) return;

                    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyDthpqDp8dKmzG9uL5RNpFx2RSaYtnYTXI`)
                        .then(res => res.json())
                        .then(data => {

                            console.log(data)
                            if (!data.results.length) { alert("District not found"); return; }

                            const { lat, lng } = data.results[0].geometry.location;
                            const point = turf.point([lng, lat]);

                            let found = false;

                            geojson.eachLayer(layer => {
                                const polygon = layer.feature;
                                if (turf.booleanPointInPolygon(point, polygon)) {
                                    // Подсветка найденного дистрикта
                                    layer.setStyle({ weight: 2.5, color: "#fff", fillColor: "#91B4D3", fillOpacity: 1 });
                                    map.setView(layer.getBounds().getCenter(), map.getZoom());



                                    let geoIdFile = layer.feature.properties.GEOID; // нужный geoid
                                    let districtData = districtListDataServer.find(
                                        item => +item.acf.geoid === +geoIdFile
                                    );

                                    console.log('geoIdFile', geoIdFile, districtData, districtListDataServer)
                                    let name = layer.feature.properties.NAME;
                                    let url = ''
                                    let score = ''
                                    console.log('districtData,', districtData)
                                    if (districtData && +districtData.acf.geoid == +geoIdFile) {
                                        url = districtData.link

                                        if (districtData.acf?.years[0]?.overall_score) {
                                            score = (+districtData.acf.years[1].overall_score).toFixed(2)
                                            console.log('bingo2', score)
                                        }
                                        else {
                                            score = 'N/A'
                                        }

                                        console.log('bingo', url)
                                    }
                                    else {
                                        score = 'N/A'
                                    }


                                    let popupContent = `
                                <div class="map-pop" style="font-size: 14px; line-height: 1.4;">
                                    <p class="map-pop__title">${name}</p>
                                    <p class="map-pop__value">Overall Score: <b> ${score}</b></p>
                                    <p class="map-pop__link">
                                        <a href="${url}" >
                                            VIEW ALL DISTRICT DATA
                                        </a>
                                    </p>
                                    
                                </div>
                            `;



                                    layer.bindPopup(popupContent).openPopup();
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

                            if (!found) alert("District not found");
                        });
                });

            }

        }

    }



    mapSearchLoad()



    //preloader
    function preloaderEnd() {
        let preloaderConteiner = document.querySelector('.preloader-conteiner');
        setTimeout(() => {
            preloaderConteiner.classList.add('hidePreloader')
        }, 500)
    }

    function preloaderStart() {
        let preloaderConteiner = document.querySelector('.preloader-conteiner');
        setTimeout(() => {
            preloaderConteiner.classList.remove('hidePreloader')
        }, 200)
    }




    //Скрипты страницы статистики
    let statSec = document.querySelector('.district-stat-sec')

    if (statSec) {


        //DATA
        const yearReal = new Date().getFullYear();

        let loadStatusCurrentDistrict = null

        let slug = '';
        if (devMod == true) {
            // slug = 'mapleton-1';
            // slug = 'otis-r-3';

            // slug = 'weld-county-school-district-re-3j';
            slug = 'arickaree-r-2';

        }
        else {
            slug = window.location.pathname.split('/').filter(Boolean).pop();
        }


        let endpoint = `${urlDomain}/wp-json/wp/v2/district?slug=${slug}`;

        let dataCurrentDistrict = null

        let dataDopDistrict = null

        let currentSelectYearRangeValue = null

        let currentDistrictServerData = null

        let dopDistrictSelectValue = null

        let currentYearListForRange = null

        let currentDistrictYearListForChart = null;

        let dopDistrictYearListForChart = null

        let multiDistrictData = null

        let allMembers = null




        //EVENT
        // 1. Создаём событие
        let DopDistrictLoaded = new CustomEvent("LoadDopDataDistrict", {
            detail: { message: "Привет!" } // можно передать данные
        });

        let changeRange = new CustomEvent("changeRangeEvent", {
            detail: { message: "Привет!" } // можно передать данные
        });


        //METHODS


        //получаем дату для текущего дистрикта
        async function getDataCurrentDistrict() {
            try {
                let dataServer = await fetch(endpoint)

                let response = await dataServer.json()

                if (response) {
                    loadStatusCurrentDistrict = true
                    dataCurrentDistrict = response[0]
                    multiDistrictData = false
                    if (dataCurrentDistrict?.acf?.members) {
                        allMembers = dataCurrentDistrict.acf.members
                    }
                    else {
                        allMembers = []
                    }

                    console.log('allMembers', allMembers)


                    //берм масив городов и сортируем его по возрастанию
                    currentDistrictYearListForChart = getAndSortYearListForChart(dataCurrentDistrict)

                    //рендерим доступные года ля ползунка
                    loadHtmlDistrictsListYearsRange()

                    //вызываем метод получения всех дистриктов для выпад списка
                    loalAddDistrictList()

                    //получаем членов
                    // getMembersData()


                    //получаем супера
                    loadHtmlSuper()
                    loadHtmlMembers()
                    // getSuperintendent()

                    //вызываем метод для рендеринга названия текущего дистрикта
                    renderTitleCurrentDistrict()

                    //скачивание данных при клике
                    // loadDataDistrictScript(dataCurrentDistrict)

                }

                console.log('Current district data', response)
            }

            catch (error) {
                loadStatusCurrentDistrict = false
                console.log('error', error)
            }
        }

        getDataCurrentDistrict()



        //подгрузка с сервера списка всех дистриктов для сравнения
        async function loalAddDistrictList() {
            let dataServer = await fetch(`${urlDomain}/wp-json/wp/v2/district?_fields=title,slug,link`)

            let response = await dataServer.json()
            console.log('all district', response)
            if (response) {
                preloaderEnd()
                loadHtmlDistrictsListAside(response)
                loadHtmlDistrictsListHeader(response)


                buildingChartAndDataModel_CONTROLLER()
            }
        }

        //получение данных для доп дистрикта
        async function getDopDistrictData(slugDistrict) {

            preloaderStart()



            try {
                let dataServer = await fetch(`${urlDomain}/wp-json/wp/v2/district?slug=${slugDistrict}`)

                let response = await dataServer.json()

                if (response) {

                    dopDistrictSelectValue = response[0]

                    dopDistrictYearListForChart = getAndSortYearListForChart(dopDistrictSelectValue)

                    document.dispatchEvent(DopDistrictLoaded);
                }

                console.log('dop district data', response)
                console.log('dopDistrictSelectValue ss', dopDistrictSelectValue, response[0])
                preloaderEnd()
            }

            catch (error) {
                preloaderEnd()
                console.log('error', error)
            }
        }

        //кнопка скачивания
        function loadDataDistrictScript(data) {
            let btn = document.querySelector('.district-stat-sec__header-export-btn')
            let fileTile = document.querySelector('.district-stat-sec__title').innerText.replaceAll(" ", "_");
            console.log('download district data', data)
            btn.addEventListener('click', () => {
                downloadFile(data, fileTile)
            })
        }

        //формирование файла .csv
        function downloadFile(data, filename = 'school-district.csv') {
            if (typeof data !== 'object') return;

            // Собираем все уникальные заголовки по всем разделам
            const allTitles = new Set();

            for (const sectionKey in data) {
                const section = data[sectionKey];
                if (!Array.isArray(section)) continue;
                section.forEach(item => {
                    item.data?.forEach(d => allTitles.add(d.title));
                    item.diagramData?.forEach(d => allTitles.add(d.title));
                });
            }

            const titles = Array.from(allTitles);

            // Первая строка — заголовки (перед ними добавляем "Year")
            let csv = ['Year', ...titles].join(',') + '\n';

            // Получаем все годы
            const years = new Set();
            for (const sectionKey in data) {
                const section = data[sectionKey];
                section.forEach(item => years.add(item.year));
            }

            const sortedYears = Array.from(years).sort((a, b) => a - b);

            // Для каждого года собираем значения по всем заголовкам
            sortedYears.forEach(year => {
                const row = [year]; // год в первую колонку
                titles.forEach(title => {
                    let value = '';
                    for (const sectionKey in data) {
                        const section = data[sectionKey];
                        const foundItem = section.find(item => item.year === year);
                        if (foundItem) {
                            const foundData = foundItem.data?.find(d => d.title === title)
                                || foundItem.diagramData?.find(d => d.title === title);
                            if (foundData) {
                                value = foundData.value ?? '';
                                break;
                            }
                        }
                    }
                    // экранируем запятые и кавычки
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    row.push(value);
                });
                csv += row.join(',') + '\n';
            });

            // Скачивание
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }


        //рендерим список дистриктов в выпадаюнщий список
        function loadHtmlDistrictsListAside(districtsListArray) {
            let districtListWrapper = document.querySelector('.controll-container__select-wrapper .select__list')
            districtListWrapper.innerHTML = ''
            console.log('districtsListArray', districtsListArray)

            districtsListArray.sort((a, b) => {
                return a.title.rendered.localeCompare(b.title.rendered, 'en', { sensitivity: 'base' });
            });

            districtsListArray.sort((a, b) => {
                if (a.title.rendered === 'State') return -1;
                if (b.title.rendered === 'State') return 1;
                return 0;
            });

            for (let i = 0; i < districtsListArray.length; i++) {
                let newListElement = document.createElement('li')
                newListElement.classList.add('select__item')

                if (districtsListArray[i].title.rendered == 'State') {
                    newListElement.classList.add('select__item--state')
                }
                if (districtsListArray[i].title.rendered == 'State') {
                    newListElement.innerHTML = `Colorado`
                }
                else {
                    newListElement.innerHTML = `${districtsListArray[i].title.rendered}`
                }

                newListElement.setAttribute('data-value', districtsListArray[i].slug)


                districtListWrapper.appendChild(newListElement)
            }
        }

        //рендерим список дистриктов в выпадающий список в шапке
        function loadHtmlDistrictsListHeader(districtsListArray) {
            let districtListWrapper = document.querySelector('.district-stat-select--header .select__list')
            districtListWrapper.innerHTML = ''

            districtsListArray.sort((a, b) => {
                return a.title.rendered.localeCompare(b.title.rendered, 'en', { sensitivity: 'base' });
            });

            districtsListArray = districtsListArray.filter(item => item.title.rendered !== 'State');

            for (let i = 0; i < districtsListArray.length; i++) {
                let newListElement = document.createElement('li')
                newListElement.classList.add('select__item')
                // if (districtsListArray[i].title.rendered == 'State') {
                //     newListElement.classList.add('select__item--state')
                // }
                newListElement.setAttribute('data-value', districtsListArray[i].slug)
                newListElement.innerHTML = `
                <a href="${districtsListArray[i].link}">${districtsListArray[i].title.rendered}</a>
                `
                districtListWrapper.appendChild(newListElement)
            }
        }


        //рендерит заголовок дистрикта в шапке
        function renderTitleCurrentDistrict() {
            let htmlDistrictTitleElement = document.querySelector('.district-stat-sec__title')
            htmlDistrictTitleElement.innerHTML = `${dataCurrentDistrict.title.rendered}`
        }




        //получаем список id учасников
        function getMembersData() {

            if (dataCurrentDistrict?.acf?.school_board_members?.length > 0) {

                let membersList = dataCurrentDistrict.acf.school_board_members
                let membersListString = ''

                for (let i = 0; i < membersList.length; i++) {

                    if (i == +membersList.length - 1) {
                        membersListString = membersListString + membersList[i]
                    }
                    else {
                        membersListString = membersListString + membersList[i] + ','
                    }
                }

                getCurrentMember(membersListString, 1)

            }
        }

        //получаем id для супера
        function getSuperintendent() {
            if (dataCurrentDistrict?.acf?.superintendent) {
                let superintendentValue = dataCurrentDistrict.acf.superintendent

                getCurrentMember(superintendentValue, 0)
            }
        }



        //метод получения учасников
        async function getCurrentMember(idMember, typeRequest) {
            let url = ''
            if (typeRequest === 1) {
                url = `${urlDomain}/wp-json/wp/v2/member/?include=${idMember}`
            }
            else {
                url = `${urlDomain}/wp-json/wp/v2/member/${idMember}`
            }
            console.log(url)
            try {

                let dataServer = await fetch(url);

                let response = await dataServer.json()

                if (response) {

                    if (typeRequest === 1) {
                        console.log('membeers list', response)
                        loadHtmlMembers(response)


                    }
                    else {
                        loadHtmlSuper(response)
                        console.log('super', response)
                    }


                }


            }
            catch {

            }
        }


        function loadHtmlSuper() {
            let data = allMembers[0]
            let superWrapper = document.querySelector('.super-wrap')
            superWrapper.style.display = 'block'
            let superWrapperList = document.querySelector('.super-wrap__list')

            let defaultImage

            if (devMod == true) {
                defaultImage = '../img/_src/user.png'
            }
            else {
                defaultImage = '/wp-content/themes/csi/img/_src/user.png'

            }

            let superUserComponentHtml = `
            <div class="section-users-container__user user-element">
                <img src="${data.photo || defaultImage}" alt="" class="user-element__img">
                <div class="user-element__data">
                    <p class="user-element__name">${data.name}</p>
                    <ul class="user-element__contacts-list">
                        <li class="user-element__contacts-list-element">${data.type}</li>
                    </ul>
                </div>

            </div>
            `
            superWrapperList.insertAdjacentHTML('beforeend', superUserComponentHtml)

        }


        function loadHtmlMembers() {
            let membersList = allMembers
            let membersWrapper = document.querySelector('.members-wrap')
            membersWrapper.style.display = 'block'
            let membersWrapperList = document.querySelector('.members-wrap__list')
            console.log('allMembers', allMembers)

            let defaultImage

            if (devMod == true) {
                defaultImage = '../img/_src/user.png'
            }
            else {
                defaultImage = '/wp-content/themes/csi/img/_src/user.png'

            }


            if (membersList.length > 1) {
                membersWrapper.style.display = 'block'
                for (let i = 1; i < membersList.length; i++) {
                    console.log(i)
                    memberData = membersList[i]
                    let memberUserComponentHtml = `
                <div class="section-users-container__user user-element">
                    <img src="${memberData.photo || defaultImage}" alt="" class="user-element__img">
                    <div class="user-element__data">
                        <p class="user-element__name">${memberData.name}</p>
                        <ul class="user-element__contacts-list">
                            <li class="user-element__contacts-list-element">${memberData.type}</li>
                        </ul>
                    </div>

                </div>
                `
                    membersWrapperList.insertAdjacentHTML('beforeend', memberUserComponentHtml)
                }
            }

            else {
                membersWrapper.style.display = 'none'
            }

        }




        //контроллер управления и запуска построения графиков и данных
        function buildingChartAndDataModel_CONTROLLER() {

            multiDistrictCheckScript()

            customSelect()
            customRange()

            chartJsInitial()
            dataBoxsInitial()

            scoreChartValueTitle()
        }



        //переключатель сравнивания нескольких дистриктов 
        function multiDistrictCheckScript() {
            let selectControlx = document.querySelector('.district-stat-select--controll')
            let selectControlInputx = selectControlx.querySelector('.select__input')
            let clearDopDistrict = selectControlx.querySelector('.select__head-clear ')

            selectControlInputx.addEventListener('input', () => {
                console.log('ss', selectControlInputx.value)
                if (selectControlInputx.value && selectControlInputx.value != '') {
                    selectControlx.classList.add('activ-select')
                    multiDistrictData = true


                    getDopDistrictData(selectControlInputx.value)

                }
                else {
                    selectControlx.classList.remove('activ-select')
                    multiDistrictData = false
                    document.dispatchEvent(DopDistrictLoaded);
                    dopDistrictSelectValue = null
                }
            })

            clearDopDistrict.addEventListener('click', function () {
                selectControlx.classList.remove('activ-select')
                selectControlInputx.value = '';
                selectControlx.querySelector('.select__head').innerHTML = 'Select the state or another district'
                console.log('selectControlInputx.value', selectControlInputx.value)
                selectControlInputx?.dispatchEvent(new Event("input", { bubbles: true }));

                document.dispatchEvent(DopDistrictLoaded);
                multiDistrictData = false
                dopDistrictSelectValue = null
            })
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
                        const list = this.nextElementSibling; // ul
                        if (list) list.style.display = "block";
                    }
                });
            });

            // Клик по .select__item
            document.querySelectorAll(".select__item").forEach(item => {
                item.addEventListener("click", function () {
                    const list = this.parentElement;
                    const select = list.parentElement;
                    const head = select.querySelector('.select__head');
                    const input = select.querySelector('.select__input');

                    document.querySelectorAll(".select__head").forEach(h => h.classList.remove("open"));
                    list.style.display = "none";

                    head.textContent = truncateString(this.textContent, 26);
                    if (input) input.value = this.getAttribute('data-value');

                    //  диспатчим событие на реальном input
                    input?.dispatchEvent(new Event("input", { bubbles: true }));
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


        //подставляем значения в ползунок до до того как он отрендерится 
        function loadHtmlDistrictsListYearsRange() {
            const range = document.getElementById('range');
            const timeLineYearMarksWrapper = document.querySelector('.timeline .marks')

            timeLineYearMarksWrapper.innerHTML = ''

            let yearList = dataCurrentDistrict.acf.years

            yearList.sort((a, b) => +a.year - +b.year);

            let minYear = 0
            let maxYear = null
            let yearArray = []
            console.log('dataCurrentDistrict', dataCurrentDistrict)


            for (let i = 0; i < yearList.length; i++) {

                let objectArray = {
                    'year': +yearList[i].year,
                    'id': i
                }
                yearArray.push(objectArray)

            }

            maxYear = yearArray.length - 1

            console.log('minYear', minYear)
            console.log('maxYear', maxYear)
            range.setAttribute('min', minYear)
            range.setAttribute('max', maxYear)
            range.setAttribute('value', maxYear)

            console.log('yearArray', yearArray)

            yearArray.forEach(element => {
                let newYearTitleElement = document.createElement('span')
                newYearTitleElement.innerHTML = `${element.year}`
                timeLineYearMarksWrapper.appendChild(newYearTitleElement)
            });


            currentYearListForRange = yearArray

        }

        //инициализация ползунка
        function customRange() {

            const range = document.getElementById('range');
            const timeLineYearListText = document.querySelectorAll('.timeline .marks span')
            const fullingLine = document.querySelector('.timeline__row-line-fulling')
            const timeLineRangeCustom = document.querySelector('.timeline__row-line')


            timeLineYearListText[currentYearListForRange.length - 1].classList.add('active')

            fullingLine.style.width = '0%'

            timeLineRangeCustom.style.borderRadius = '0 20px 20px 0'

            currentSelectYearRangeValue = currentYearListForRange.length - 1



            range.addEventListener('input', () => {
                currentSelectYearRangeValue = range.value
                console.log("Выбран год:", range.value);

                let stapValue = 100 / (+currentYearListForRange.length - 1)
                let partProcent = 100 - (stapValue * +currentSelectYearRangeValue)
                console.log('length', currentYearListForRange.length - 1)
                console.log('stapValue', stapValue)
                console.log('partProcent', partProcent)

                for (let i = 0; i < timeLineYearListText.length; i++) {
                    timeLineYearListText[i].classList.remove('active')
                }

                timeLineYearListText[currentSelectYearRangeValue].classList.add('active')
                fullingLine.style.width = partProcent + '%'

                if (+currentSelectYearRangeValue == 0) {
                    timeLineRangeCustom.style.borderRadius = '20px 0 0 20px'
                }
                else if (+currentSelectYearRangeValue == +currentYearListForRange.length - 1) {
                    timeLineRangeCustom.style.borderRadius = '0 20px 20px 0'
                }
                else {
                    timeLineRangeCustom.style.borderRadius = '0 0 0 0'
                }

                document.dispatchEvent(changeRange);
            });
        }


        //получение присвоение и сортировка годов по возрастанию
        // function getAndSortYearListForChart() {
        //     currentDistrictYearListForChart = dataCurrentDistrict.acf.years

        //     currentDistrictYearListForChart.sort((a, b) => +a.year - +b.year);

        //     console.log('currentDistrictYearListForChart', currentDistrictYearListForChart)
        // }


        function getAndSortYearListForChart(dataObjectDistrict) {

            let objectDistr = dataObjectDistrict.acf.years


            objectDistr.sort((a, b) => +a.year - +b.year);

            console.log('currentDistrictYearListForChart', objectDistr)

            return objectDistr;
        }




        //инициализация графика
        function chartJsInitial() {

            const range = document.getElementById('range');

            const selectControl = document.querySelector('.district-stat-select--controll')

            const selectControlInput = selectControl.querySelector('.select__input')

            const btnTestAddData = document.querySelector('.controll-container__select-wrapper')


            //создаем масив  годами
            const labelsCurrentDistryctsYears = currentDistrictYearListForChart.map(item => item.year);

            //создаем масив с значениями для графика
            const dataCurrentDistryctsOveralScore = currentDistrictYearListForChart.map(item => item.overall_score);

            console.log('labelsCurrentDistryctsYears', labelsCurrentDistryctsYears)
            console.log('dataCurrentDistryctsOveralScore', dataCurrentDistryctsOveralScore)

            let dataChart = {
                // labels: [currentDistrictServerData[0].year, currentDistrictServerData[1].year, currentDistrictServerData[2].year],
                labels: labelsCurrentDistryctsYears,
                datasets: [{
                    label: 'Overall Score',
                    // data: [+currentDistrictServerData[0].value, +currentDistrictServerData[1].value, +currentDistrictServerData[2].value],
                    data: dataCurrentDistryctsOveralScore,
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
                            max: 100,
                            beginAtZero: true,
                            grid: {
                                drawTicks: false,   // убрать маленькие деления
                                drawBorder: false,  // убрать границу оси
                                display: false      // полностью скрыть линии сетки
                            },
                            ticks: {
                                color: '#9B9B9B',
                                font: {
                                    size: 14,
                                    family: 'Arial',
                                    weight: '300'
                                },
                                callback: function (value) {
                                    // показываем только нужные значения
                                    const allowed = [0, 20, 40, 60, 80, 100];
                                    return allowed.includes(value) ? value : null;
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

                const index = +currentSelectYearRangeValue;

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


            // отслеживае изменение выпадающего списка





            document.addEventListener('LoadDopDataDistrict', () => {
                console.log('ssSS', selectControlInput.value)
                dopDistrictSelectValue = selectControlInput.value


                //создаем масив  годами
                const labelsCurrentDistryctsYears = currentDistrictYearListForChart.map(item => item.year);

                //создаем масив с значениями для графика
                const dataCurrentDistryctsOveralScore = currentDistrictYearListForChart.map(item => item.overall_score);


                if (dopDistrictYearListForChart && multiDistrictData == true) {

                    //создаем масив  годами
                    const labelsCurrentDopDistryctsYears = dopDistrictYearListForChart.map(item => item.year);

                    //создаем масив с значениями для графика
                    const dataCurrentDopDistryctsOveralScore = dopDistrictYearListForChart.map(item => item.overall_score);



                    dataChart = {
                        // labels: ['2019', '2023', '2024'],
                        labels: labelsCurrentDistryctsYears,
                        datasets: [{
                            label: 'Current',
                            // data: [+currentDistrictServerData[0].value, +currentDistrictServerData[1].value, +currentDistrictServerData[2].value],
                            data: dataCurrentDistryctsOveralScore,
                            borderWidth: 8,
                            borderColor: '#013364',
                        },

                        {
                            label: 'Сomparable',
                            data: dataCurrentDopDistryctsOveralScore,
                            borderWidth: 5,
                            borderColor: '#559EC7',
                            borderDash: [10, 10]
                        }],
                    }
                }
                else {
                    dataChart = {
                        labels: labelsCurrentDistryctsYears,
                        datasets: [{
                            label: 'Overall Score',
                            data: dataCurrentDistryctsOveralScore,
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


        //рендеринг значения зааголовка для рафика
        function scoreChartValueTitle() {

            let titleRow = document.querySelector('.graf-container__title-row')
            let currentScoreWrapper = document.querySelector('.graf-container__title--current')
            let dopScoreWrapper = document.querySelector('.graf-container__title--current-dop')

            let currentScoreValue = currentScoreWrapper.querySelector('.graf-container__title-value')
            let dopScoreValue = dopScoreWrapper.querySelector('.graf-container__title-value')

            let dopScoreStateTitle = document.querySelector('.graf-container__title--current-dop-text')



            // dopDistrictSelectValue
            //задаем значение для первоначальной загрузки
            currentScoreValue.innerHTML = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100)) / 100 + '%'
            currentScoreValue.classList.add('red')
            //чекаем подгрузку нового дистрикта для сравнения
            document.addEventListener('LoadDopDataDistrict', () => {
                if (dopDistrictYearListForChart && multiDistrictData == true) {

                    let titleDopDostrict = document.querySelector('.controll-container__select-wrapper .select__head').innerText

                    dopScoreStateTitle.innerHTML = truncateString(titleDopDostrict, 20)

                    let valueCurrent = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100)) / 100
                    let valueDop = Math.floor((+dopDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100)) / 100

                    titleRow.classList.add('active')
                    currentScoreValue.innerHTML = valueCurrent + '%'
                    dopScoreValue.innerHTML = valueDop + '%'

                    dopScoreWrapper.classList.add('active')

                    if (valueDop > valueCurrent) {
                        currentScoreValue.classList.add('red')
                        currentScoreValue.classList.remove('green')

                    }
                    else if (valueDop < valueCurrent) {
                        currentScoreValue.classList.add('green')
                        currentScoreValue.classList.remove('red')
                    }
                    else {
                        currentScoreValue.classList.remove('green')
                        currentScoreValue.classList.remove('red')
                    }
                }
                else {
                    currentScoreValue.innerHTML = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100)) / 100 + '%'
                    dopScoreWrapper.classList.remove('active')
                    currentScoreValue.classList.remove('green')
                    currentScoreValue.classList.add('red')
                    titleRow.classList.remove('active')
                }
            })

            //чекаем смену ползунка
            document.addEventListener('changeRangeEvent', () => {
                if (dopDistrictYearListForChart && multiDistrictData == true) {
                    let valueCurrent = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100)) / 100
                    let valueDop = Math.floor((+dopDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100)) / 100


                    currentScoreValue.innerHTML = valueCurrent + '%'
                    dopScoreValue.innerHTML = valueDop + '%'
                    currentScoreValue.classList.add('red')
                    dopScoreWrapper.classList.add('active')

                    if (valueDop > valueCurrent) {
                        currentScoreValue.classList.add('red')
                        currentScoreValue.classList.remove('green')
                    }
                    else if (valueDop < valueCurrent) {
                        currentScoreValue.classList.add('green')
                        currentScoreValue.classList.remove('red')
                    }
                    else {
                        currentScoreValue.classList.remove('green')
                        currentScoreValue.classList.remove('red')
                    }
                }
                else {
                    currentScoreValue.innerHTML = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100)) / 100 + '%'
                    dopScoreWrapper.classList.remove('active')
                    currentScoreValue.classList.remove('green')
                    currentScoreValue.classList.add('red')
                }
            })

            console.log('currentDistrictYearListForChart', +currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score, currentScoreValue)
        }




        //инициализация и рендер карточек данных
        function dataBoxsInitial() {

            let enrollmentAndChoiceCurrentDistrictArray = []

            let enrollmentAndChoiceDopDistrictArray = []


            let proficiencyCurrentDistrictArray = []

            let proficiencyDopDistrictArray = []


            let financeyCurrentDistrictArray = []

            let financeyDopDistrictArray = []


            let staffingCurrentDistrictArray = []

            let staffingDopDistrictArray = []

            let districtDataClasterDownload


            for (let i = 0; i < currentDistrictYearListForChart.length; i++) {
                let objectNewEnrollment = {

                    'year': +currentDistrictYearListForChart[i].year ?? '',

                    'data': [
                        {
                            'value': currentDistrictYearListForChart[i].overall_public_enrollment
                                ? +currentDistrictYearListForChart[i].overall_public_enrollment
                                : currentDistrictYearListForChart[i].overall_public_enrollment === 0
                                    ? 0
                                    : 'N/A',
                            'value_number': currentDistrictYearListForChart[i].overall_public_enrollment
                                ? +currentDistrictYearListForChart[i].overall_public_enrollment
                                : currentDistrictYearListForChart[i].overall_public_enrollment === 0
                                    ? 0
                                    : null,
                            'title': 'Overall public enrollment',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },

                        {
                            'value': currentDistrictYearListForChart[i].percent_in_charter_data
                                ? +currentDistrictYearListForChart[i].percent_in_charter_data + '%'
                                : currentDistrictYearListForChart[i].percent_in_charter_data === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Percent in Charter Schools'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].percent_in_private_enrollment
                                ? +currentDistrictYearListForChart[i].percent_in_private_enrollment
                                : currentDistrictYearListForChart[i].percent_in_private_enrollment === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Private enrollment',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },

                        // {
                        //     'value': currentDistrictYearListForChart[i].percent_utilizing_open_enrollment
                        //         ? +currentDistrictYearListForChart[i].percent_utilizing_open_enrollment
                        //         : currentDistrictYearListForChart[i].percent_utilizing_open_enrollment === 0
                        //             ? 0
                        //             : 'N/A',
                        //     'title': 'Percent Utilizing Open Enrollment'
                        // },
                        {
                            'value': currentDistrictYearListForChart[i].intra_district_choice
                                ? +currentDistrictYearListForChart[i].intra_district_choice + '%'
                                : currentDistrictYearListForChart[i].intra_district_choice === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Choice Within School District',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },

                        {
                            'value': currentDistrictYearListForChart[i].inter_district_choice
                                ? +currentDistrictYearListForChart[i].inter_district_choice + '%'
                                : currentDistrictYearListForChart[i].inter_district_choice === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Choice Across School District Lines',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },
                        {
                            'value': currentDistrictYearListForChart[i].absenteeism_rate
                                ? (+currentDistrictYearListForChart[i].absenteeism_rate) + '%'
                                : currentDistrictYearListForChart[i].absenteeism_rate === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Chronic absenteeism rate',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            },
                            'revers_color_value': true,
                        },

                        {
                            'value': currentDistrictYearListForChart[i].share_of_students_qualified_for_free_or_reduced_price_lunch
                                ? (+currentDistrictYearListForChart[i].share_of_students_qualified_for_free_or_reduced_price_lunch) + '%'
                                : currentDistrictYearListForChart[i].share_of_students_qualified_for_free_or_reduced_price_lunch === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Share of Students Qualified for Free or Reduced-price Lunch',
                            'compareStatus': true
                        },
                    ]
                }

                let objectNewProficiency = {
                    'year': +currentDistrictYearListForChart[i].year ?? '',
                    'data': [
                        {
                            'value': currentDistrictYearListForChart[i].rates_of_3rd_grade_language_arts
                                ? +currentDistrictYearListForChart[i].rates_of_3rd_grade_language_arts + '%'
                                : currentDistrictYearListForChart[i].rates_of_3rd_grade_language_arts === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'English language arts proficiency rate (grades 3–8)',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },

                        {
                            'value': currentDistrictYearListForChart[i].high_school_graduation_rate_within_6_years
                                ? +currentDistrictYearListForChart[i].high_school_graduation_rate_within_6_years + '%'
                                : currentDistrictYearListForChart[i].high_school_graduation_rate_within_6_years === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'High school 6-year graduation rate',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },

                        {
                            'value': currentDistrictYearListForChart[i].rates_of_3rd_grade_mathematics
                                ? +currentDistrictYearListForChart[i].rates_of_3rd_grade_mathematics + '%'
                                : currentDistrictYearListForChart[i].rates_of_3rd_grade_mathematics === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Mathematics proficiency rate (grades 3–8)',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },

                        // {
                        //     'value': currentDistrictYearListForChart[i].psat_average_score
                        //         ? +currentDistrictYearListForChart[i].psat_average_score
                        //         : currentDistrictYearListForChart[i].psat_average_score === 0
                        //             ? 0
                        //             : 'N/A',
                        //     'title': 'PSAT Average Score'
                        // },
                    ]
                }

                let objectNewFinancey = {
                    'year': +currentDistrictYearListForChart[i].year ?? '',
                    'data': [
                        {
                            'value': currentDistrictYearListForChart[i].spending_per_student
                                ? '$' + Math.trunc(+currentDistrictYearListForChart[i].spending_per_student)
                                : currentDistrictYearListForChart[i].spending_per_student === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Spending per student',
                            'type': 'money'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].instructional_spending_total_share_of_spending
                                ? +currentDistrictYearListForChart[i].instructional_spending_total_share_of_spending + '%'
                                : currentDistrictYearListForChart[i].instructional_spending_total_share_of_spending === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Instructional share of total spending',
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },

                    ],
                    'diagramData': [
                        {
                            'title': 'Federal revenue',
                            'value': currentDistrictYearListForChart[i].district_total_revenue_copy.federal
                                ? +currentDistrictYearListForChart[i].district_total_revenue_copy.federal
                                : currentDistrictYearListForChart[i].district_total_revenue_copy.federal === 0
                                    ? 0
                                    : null,
                        },

                        {
                            'title': 'State revenue',
                            'value': currentDistrictYearListForChart[i].district_total_revenue_copy.state
                                ? +currentDistrictYearListForChart[i].district_total_revenue_copy.state
                                : currentDistrictYearListForChart[i].district_total_revenue_copy.state === 0
                                    ? 0
                                    : null,
                        },

                        {
                            'title': 'Local revenue',
                            'value': currentDistrictYearListForChart[i].district_total_revenue_copy.local
                                ? +currentDistrictYearListForChart[i].district_total_revenue_copy.local
                                : currentDistrictYearListForChart[i].district_total_revenue_copy.local === 0
                                    ? 0
                                    : null,
                        },
                    ]
                }


                let objectNewStaffing = {
                    'year': +currentDistrictYearListForChart[i].year ?? '',
                    'data': [
                        {
                            'value': currentDistrictYearListForChart[i].teacher_student_ratio
                                ? (+currentDistrictYearListForChart[i].teacher_student_ratio).toFixed(0)
                                : currentDistrictYearListForChart[i].teacher_student_ratio === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Student–teacher ratio',
                            'type': 'more-one',
                            'revers_color_value': true,
                        },

                        {
                            'value': currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff
                                ? (+getNumberBeforeColon(currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff))
                                : currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Instructional staff to administrative staff ratio',
                            'type': 'more-one',
                            'compareStatus': true,
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            },
                            'hide_status': true,
                        },


                        // {
                        //     'value': currentDistrictYearListForChart[i].staffing_administrative_staff
                        //         ? (+currentDistrictYearListForChart[i].staffing_administrative_staff).toFixed(0)
                        //         : currentDistrictYearListForChart[i].staffing_administrative_staff === 0
                        //             ? 0
                        //             : 'N/A',
                        //     'value2': currentDistrictYearListForChart[i].staffing_instructional_staff
                        //         ? (+currentDistrictYearListForChart[i].staffing_instructional_staff).toFixed(0)
                        //         : currentDistrictYearListForChart[i].staffing_instructional_staff === 0
                        //             ? 0
                        //             : 'N/A',
                        //     'valueFull': currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff !== null &&
                        //         currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff !== undefined &&
                        //         currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff !== '' &&
                        //         currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff !== '*' &&
                        //         currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff.toString().toUpperCase() !== 'N/A'
                        //         ? currentDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff
                        //         : 'N/A',
                        //     'title': 'Instructional staff to administrative staff ratio',
                        //     'type': 'versus',
                        //     'compareStatus': true,
                        //     'inform': {
                        //         'status': true,
                        //         'type': 'simple'
                        //     }
                        // },

                        {
                            'value': currentDistrictYearListForChart[i].ratio_of_psychologists_students
                                ? (+currentDistrictYearListForChart[i].ratio_of_psychologists_students).toFixed(0)
                                : currentDistrictYearListForChart[i].ratio_of_psychologists_students === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Student–psychologist ratio',
                            'type': 'more-one',
                            'revers_color_value': true,
                        },

                        {
                            'value': currentDistrictYearListForChart[i].total_behavioral_incidents
                                ? (+currentDistrictYearListForChart[i].total_behavioral_incidents).toFixed(0)
                                : currentDistrictYearListForChart[i].total_behavioral_incidents === 0
                                    ? 0
                                    : 'N/A',
                            'title': 'Disciplinary incidents per 1,000 students',
                            'revers_color_value': true,
                            'inform': {
                                'status': true,
                                'type': 'simple'
                            }
                        },
                    ]
                }

                enrollmentAndChoiceCurrentDistrictArray.push(objectNewEnrollment)
                proficiencyCurrentDistrictArray.push(objectNewProficiency)
                financeyCurrentDistrictArray.push(objectNewFinancey)
                staffingCurrentDistrictArray.push(objectNewStaffing)
            }

            districtDataClasterDownload = {
                "objectNewEnrollment": enrollmentAndChoiceCurrentDistrictArray,
                "objectNewProficiency": proficiencyCurrentDistrictArray,
                "objectNewFinancey": financeyCurrentDistrictArray,
                "objectNewStaffing": staffingCurrentDistrictArray,
            }

            //вызов метода для скачивания файла
            loadDataDistrictScript(districtDataClasterDownload)


            console.log('enrollmentAndChoiceCurrentDistrictArray', enrollmentAndChoiceCurrentDistrictArray)
            console.log('proficiencyCurrentDistrictArray', proficiencyCurrentDistrictArray)
            console.log('financeyCurrentDistrictArray', financeyCurrentDistrictArray)
            console.log('staffingCurrentDistrictArray', staffingCurrentDistrictArray)

            renderEnrollHtmlBox(1, enrollmentAndChoiceCurrentDistrictArray)
            renderProficiencyHtmlBox(1, proficiencyCurrentDistrictArray)
            renderFinanceyHtmlBox(1, financeyCurrentDistrictArray)
            renderStaffingHtmlBox(1, staffingCurrentDistrictArray)

            normalisationBoxInfoTitle()
            onResizeEnd(normalisationBoxInfoTitle)



            //метод вычленения инфы для второго дистрикта 
            function getDopDistrictData() {
                for (let i = 0; i < dopDistrictYearListForChart.length; i++) {
                    let objectNewEnrollment = {

                        'year': +dopDistrictYearListForChart[i].year ?? '',

                        'data': [
                            {
                                'value': dopDistrictYearListForChart[i].overall_public_enrollment
                                    ? +dopDistrictYearListForChart[i].overall_public_enrollment
                                    : dopDistrictYearListForChart[i].overall_public_enrollment === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Overall public enrollment'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].percent_in_charter_data
                                    ? +dopDistrictYearListForChart[i].percent_in_charter_data + '%'
                                    : dopDistrictYearListForChart[i].percent_in_charter_data === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Percent in Charter Schools'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].percent_in_private_enrollment
                                    ? +dopDistrictYearListForChart[i].percent_in_private_enrollment
                                    : dopDistrictYearListForChart[i].percent_in_private_enrollment === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Private enrollment'
                            },
                            // {
                            //     'value': dopDistrictYearListForChart[i].percent_utilizing_open_enrollment
                            //         ? +dopDistrictYearListForChart[i].percent_utilizing_open_enrollment
                            //         : dopDistrictYearListForChart[i].percent_utilizing_open_enrollment === 0
                            //             ? 0
                            //             : 'N/A',
                            //     'title': 'Percent Utilizing Open Enrollment'
                            // },

                            {
                                'value': dopDistrictYearListForChart[i].intra_district_choice
                                    ? +dopDistrictYearListForChart[i].intra_district_choice + '%'
                                    : dopDistrictYearListForChart[i].intra_district_choice === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Choice Within School District'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].inter_district_choice
                                    ? +dopDistrictYearListForChart[i].inter_district_choice + '%'
                                    : dopDistrictYearListForChart[i].inter_district_choice === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Choice Across School District Lines'
                            },
                            {
                                'value': dopDistrictYearListForChart[i].absenteeism_rate
                                    ? (+dopDistrictYearListForChart[i].absenteeism_rate) + '%'
                                    : dopDistrictYearListForChart[i].absenteeism_rate === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Chronic absenteeism rate',
                                'revers_color_value': true,
                            },
                            {
                                'value': dopDistrictYearListForChart[i].share_of_students_qualified_for_free_or_reduced_price_lunch
                                    ? (+dopDistrictYearListForChart[i].share_of_students_qualified_for_free_or_reduced_price_lunch) + '%'
                                    : dopDistrictYearListForChart[i].share_of_students_qualified_for_free_or_reduced_price_lunch === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Share of Students Qualified for Free or Reduced-price Lunch',
                                'compareStatus': true
                            },
                        ]
                    }

                    let objectNewProficiency = {
                        'year': +dopDistrictYearListForChart[i].year ?? '',
                        'data': [
                            {
                                'value': dopDistrictYearListForChart[i].rates_of_3rd_grade_language_arts
                                    ? +dopDistrictYearListForChart[i].rates_of_3rd_grade_language_arts + '%'
                                    : dopDistrictYearListForChart[i].rates_of_3rd_grade_language_arts === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'English language arts proficiency rate (grades 3–8)'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].high_school_graduation_rate_within_6_years
                                    ? +dopDistrictYearListForChart[i].high_school_graduation_rate_within_6_years + '%'
                                    : dopDistrictYearListForChart[i].high_school_graduation_rate_within_6_years === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'High school 6-year graduation rate'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].rates_of_3rd_grade_mathematics
                                    ? +dopDistrictYearListForChart[i].rates_of_3rd_grade_mathematics + '%'
                                    : dopDistrictYearListForChart[i].rates_of_3rd_grade_mathematics === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Mathematics proficiency rate (grades 3–8)'
                            },

                            // {
                            //     'value': dopDistrictYearListForChart[i].psat_average_score
                            //         ? +dopDistrictYearListForChart[i].psat_average_score
                            //         : dopDistrictYearListForChart[i].psat_average_score === 0
                            //             ? 0
                            //             : 'N/A',
                            //     'title': 'PSAT Average Score'
                            // },
                        ]
                    }

                    let objectNewFinancey = {
                        'year': +dopDistrictYearListForChart[i].year ?? '',
                        'data': [
                            {
                                'value': dopDistrictYearListForChart[i].spending_per_student
                                    ? '$' + Math.trunc(+dopDistrictYearListForChart[i].spending_per_student)
                                    : dopDistrictYearListForChart[i].spending_per_student === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Spending per student',
                                'type': 'money'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].instructional_spending_total_share_of_spending
                                    ? +dopDistrictYearListForChart[i].instructional_spending_total_share_of_spending + '%'
                                    : dopDistrictYearListForChart[i].instructional_spending_total_share_of_spending === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Instructional share of total spending'
                            },

                        ],
                        'diagramData': [
                            {
                                'title': 'Federal revenue',
                                'value': dopDistrictYearListForChart[i].district_total_revenue_copy.federal
                                    ? +dopDistrictYearListForChart[i].district_total_revenue_copy.federal
                                    : dopDistrictYearListForChart[i].district_total_revenue_copy.federal === 0
                                        ? 0
                                        : null,
                            },

                            {
                                'title': 'State revenue',
                                'value': dopDistrictYearListForChart[i].district_total_revenue_copy.state
                                    ? +dopDistrictYearListForChart[i].district_total_revenue_copy.state
                                    : dopDistrictYearListForChart[i].district_total_revenue_copy.state === 0
                                        ? 0
                                        : null,
                            },

                            {
                                'title': 'Local revenue',
                                'value': dopDistrictYearListForChart[i].district_total_revenue_copy.local
                                    ? +dopDistrictYearListForChart[i].district_total_revenue_copy.local
                                    : dopDistrictYearListForChart[i].district_total_revenue_copy.local === 0
                                        ? 0
                                        : null,
                            },
                        ]
                    }

                    let objectNewStaffing = {
                        'year': +dopDistrictYearListForChart[i].year ?? '',
                        'data': [
                            {
                                'value': dopDistrictYearListForChart[i].teacher_student_ratio
                                    ? (+dopDistrictYearListForChart[i].teacher_student_ratio).toFixed(0)
                                    : dopDistrictYearListForChart[i].teacher_student_ratio === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Student–teacher ratio',
                                'type': 'more-one',
                                'revers_color_value': true,
                            },

                            {
                                'value': dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff
                                    ? (+getNumberBeforeColon(dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff))
                                    : dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Instructional staff to administrative staff ratio',
                                'type': 'more-one',
                                'compareStatus': true,
                                'inform': {
                                    'status': true,
                                    'type': 'simple'
                                },
                                'hide_status': true,
                            },

                            // {
                            //     'value': dopDistrictYearListForChart[i].staffing_administrative_staff
                            //         ? (+dopDistrictYearListForChart[i].staffing_administrative_staff).toFixed(0)
                            //         : dopDistrictYearListForChart[i].staffing_administrative_staff === 0
                            //             ? 0
                            //             : 'N/A',
                            //     'value2': dopDistrictYearListForChart[i].staffing_instructional_staff
                            //         ? (+dopDistrictYearListForChart[i].staffing_instructional_staff).toFixed(0)
                            //         : dopDistrictYearListForChart[i].staffing_instructional_staff === 0
                            //             ? 0
                            //             : 'N/A',
                            //     'valueFull': dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff !== null &&
                            //         dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff !== undefined &&
                            //         dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff !== '' &&
                            //         dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff !== '*' &&
                            //         dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff.toString().toUpperCase() !== 'N/A'
                            //         ? dopDistrictYearListForChart[i].ratio_of_instructional_staff_to_administrative_staff
                            //         : 'N/A',
                            //     'title': 'Instructional staff to administrative staff ratio',
                            //     'type': 'versus',
                            //     'compareStatus': false
                            // },

                            {
                                'value': dopDistrictYearListForChart[i].ratio_of_psychologists_students
                                    ? (+dopDistrictYearListForChart[i].ratio_of_psychologists_students).toFixed(0)
                                    : dopDistrictYearListForChart[i].ratio_of_psychologists_students === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Student–psychologist ratio',
                                'type': 'more-one',
                                'revers_color_value': true,
                            },

                            {
                                'value': dopDistrictYearListForChart[i].total_behavioral_incidents
                                    ? (+dopDistrictYearListForChart[i].total_behavioral_incidents).toFixed(0)
                                    : dopDistrictYearListForChart[i].total_behavioral_incidents === 0
                                        ? 0
                                        : 'N/A',
                                'title': 'Disciplinary incidents per 1,000 students',
                                'revers_color_value': true,
                                'inform': {
                                    'status': true,
                                    'type': 'simple'
                                }
                            },
                        ]
                    }



                    enrollmentAndChoiceDopDistrictArray.push(objectNewEnrollment)
                    proficiencyDopDistrictArray.push(objectNewProficiency)
                    financeyDopDistrictArray.push(objectNewFinancey)
                    staffingDopDistrictArray.push(objectNewStaffing)


                }

                console.log('enrollmentAndChoiceDopDistrictArray', enrollmentAndChoiceDopDistrictArray)
                console.log('proficiencyDopDistrictArray', proficiencyDopDistrictArray)
                console.log('financeyDopDistrictArray', financeyDopDistrictArray)
                console.log('staffingDopDistrictArray', staffingDopDistrictArray)
            }

            //срабатывание тригера на смену дистрикта для сравнения
            document.addEventListener('LoadDopDataDistrict', () => {
                //очистка массивов после смены доп дистрикта для сравнения
                enrollmentAndChoiceDopDistrictArray = []
                proficiencyDopDistrictArray = []
                financeyDopDistrictArray = []
                staffingDopDistrictArray = []

                if (dopDistrictYearListForChart && multiDistrictData == true) {

                    getDopDistrictData()

                    if (currentSelectYearRangeValue == 0) {
                        renderEnrollHtmlBox(4, enrollmentAndChoiceCurrentDistrictArray, enrollmentAndChoiceDopDistrictArray)
                        renderProficiencyHtmlBox(4, proficiencyCurrentDistrictArray, proficiencyDopDistrictArray)
                        renderFinanceyHtmlBox(4, financeyCurrentDistrictArray, financeyDopDistrictArray)
                        renderStaffingHtmlBox(4, staffingCurrentDistrictArray, staffingDopDistrictArray)
                    }
                    else {
                        renderEnrollHtmlBox(3, enrollmentAndChoiceCurrentDistrictArray, enrollmentAndChoiceDopDistrictArray)
                        renderProficiencyHtmlBox(3, proficiencyCurrentDistrictArray, proficiencyDopDistrictArray)
                        renderFinanceyHtmlBox(3, financeyCurrentDistrictArray, financeyDopDistrictArray)
                        renderStaffingHtmlBox(3, staffingCurrentDistrictArray, staffingDopDistrictArray)
                    }

                }
                else {
                    if (currentSelectYearRangeValue == 0) {
                        renderEnrollHtmlBox(2, enrollmentAndChoiceCurrentDistrictArray)
                        renderProficiencyHtmlBox(2, proficiencyCurrentDistrictArray)
                        renderFinanceyHtmlBox(2, financeyCurrentDistrictArray)
                        renderStaffingHtmlBox(2, staffingCurrentDistrictArray)
                    }
                    else {
                        renderEnrollHtmlBox(1, enrollmentAndChoiceCurrentDistrictArray)
                        renderProficiencyHtmlBox(1, proficiencyCurrentDistrictArray)
                        renderFinanceyHtmlBox(1, financeyCurrentDistrictArray)
                        renderStaffingHtmlBox(1, staffingCurrentDistrictArray)
                    }
                }

                normalisationBoxInfoTitle()
            })

            //срабатывание тригера на смену ползунка года
            document.addEventListener('changeRangeEvent', () => {
                //очистка массивов доп дистрикта после смены ползунка
                enrollmentAndChoiceDopDistrictArray = []
                proficiencyDopDistrictArray = []
                financeyDopDistrictArray = []
                staffingDopDistrictArray = []

                if (dopDistrictYearListForChart && multiDistrictData == true) {

                    getDopDistrictData()

                    if (currentSelectYearRangeValue == 0) {
                        renderEnrollHtmlBox(4, enrollmentAndChoiceCurrentDistrictArray, enrollmentAndChoiceDopDistrictArray)
                        renderProficiencyHtmlBox(4, proficiencyCurrentDistrictArray, proficiencyDopDistrictArray)
                        renderFinanceyHtmlBox(4, financeyCurrentDistrictArray, financeyDopDistrictArray)
                        renderStaffingHtmlBox(4, staffingCurrentDistrictArray, staffingDopDistrictArray)
                    }
                    else {
                        renderEnrollHtmlBox(3, enrollmentAndChoiceCurrentDistrictArray, enrollmentAndChoiceDopDistrictArray)
                        renderProficiencyHtmlBox(3, proficiencyCurrentDistrictArray, proficiencyDopDistrictArray)
                        renderFinanceyHtmlBox(3, financeyCurrentDistrictArray, financeyDopDistrictArray)
                        renderStaffingHtmlBox(3, staffingCurrentDistrictArray, staffingDopDistrictArray)
                    }

                    console.log('staffingDopDistrictArray', staffingDopDistrictArray)
                }
                else {

                    if (currentSelectYearRangeValue == 0) {
                        renderEnrollHtmlBox(2, enrollmentAndChoiceCurrentDistrictArray)
                        renderProficiencyHtmlBox(2, proficiencyCurrentDistrictArray)
                        renderFinanceyHtmlBox(2, financeyCurrentDistrictArray)
                        renderStaffingHtmlBox(2, staffingCurrentDistrictArray)
                    }
                    else {
                        renderEnrollHtmlBox(1, enrollmentAndChoiceCurrentDistrictArray)
                        renderProficiencyHtmlBox(1, proficiencyCurrentDistrictArray)
                        renderFinanceyHtmlBox(1, financeyCurrentDistrictArray)
                        renderStaffingHtmlBox(1, staffingCurrentDistrictArray)
                    }

                }

                normalisationBoxInfoTitle()
            })
        }

        //рендер первого кластера блоков данных Enroll
        function renderEnrollHtmlBox(typeRenderBox, dataArray, dataArrayDop) {

            let wrapper = document.querySelector('.acordeon-data-claster--enrollment-and-choise')
            let row = wrapper.querySelector('.acordeon-data-claster__row')
            row.innerHTML = ""

            let maxYearItem
            let minYearItem

            let maxYearItemDop
            let minYearItemDop

            if (typeRenderBox == 1) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV1(maxYearItem.data[i])
                    console.log(maxYearItem.data[i])
                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            else if (typeRenderBox == 2) {
                row.innerHTML = ""

                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                minYearItem = dataArray.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                for (let i = 0; i < minYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV2(maxYearItem.data[i], minYearItem.data[i],)
                    console.log(minYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }



            else if (typeRenderBox == 3) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                maxYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV3(maxYearItem.data[i], maxYearItemDop.data[i])
                    console.log(maxYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            else if (typeRenderBox == 4) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                maxYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                minYearItem = dataArray.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                minYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV4(maxYearItem.data[i], minYearItem.data[i], maxYearItemDop.data[i], minYearItemDop.data[i])
                    console.log(maxYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            console.log('maxYearItem', maxYearItem);



        }

        //рендер второго кластера блоков данных Proficiency
        function renderProficiencyHtmlBox(typeRenderBox, dataArray, dataArrayDop) {

            let wrapper = document.querySelector('.acordeon-data-claster--proficiency')
            let row = wrapper.querySelector('.acordeon-data-claster__row')
            row.innerHTML = ""

            let maxYearItem
            let minYearItem

            let maxYearItemDop
            let minYearItemDop

            if (typeRenderBox == 1) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV1(maxYearItem.data[i])
                    console.log(maxYearItem.data[i])
                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            else if (typeRenderBox == 2) {
                row.innerHTML = ""

                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                minYearItem = dataArray.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                for (let i = 0; i < minYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV2(maxYearItem.data[i], minYearItem.data[i],)
                    console.log(minYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            else if (typeRenderBox == 3) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                maxYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV3(maxYearItem.data[i], maxYearItemDop.data[i])
                    console.log(maxYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            else if (typeRenderBox == 4) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                maxYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                minYearItem = dataArray.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                minYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV4(maxYearItem.data[i], minYearItem.data[i], maxYearItemDop.data[i], minYearItemDop.data[i])
                    console.log(maxYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }
            console.log('maxYearItem', maxYearItem);
        }

        //рендер третьего кластера блоков данных Financey
        function renderFinanceyHtmlBox(typeRenderBox, dataArray, dataArrayDop) {


            let wrapper = document.querySelector('.acordeon-data-claster--finance')
            let row = wrapper.querySelector('.acordeon-data-claster__col')
            let diagramContainer = wrapper.querySelector('.chart-claster-wrapper-x')

            row.innerHTML = ""
            diagramContainer.innerHTML = ""

            let maxYearItem
            let minYearItem

            let maxYearItemDop
            let minYearItemDop


            let diargamColorList = [
                '#013364',
                '#0273B2',
                '#CE3538',
                '#037971',
                '#D58D21'
            ]

            let diargamColorListFront = [
                '#307FCC',
                '#707070',
                '#FDAFB1',
                '#73F2E9',
                '#FFE2B7'
            ]

            if (typeRenderBox == 1) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV1(maxYearItem.data[i])
                    row.insertAdjacentHTML('beforeend', htmlElement);
                    console.log(maxYearItem.data[i])
                }



                let htmlElementDiagram = htmlDataDiagramV1(maxYearItem.diagramData, diargamColorList)
                diagramContainer.insertAdjacentHTML('beforeend', htmlElementDiagram);
                console.log('diagram data', maxYearItem.diagramData)

                loadChartFinanceType1(maxYearItem.diagramData, diargamColorList)
            }

            else if (typeRenderBox == 2) {
                row.innerHTML = ""

                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                minYearItem = dataArray.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                for (let i = 0; i < minYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV2(maxYearItem.data[i], minYearItem.data[i],)
                    console.log(minYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }




                let htmlElementDiagram = htmlDataDiagramV2(maxYearItem.diagramData, minYearItem.diagramData, diargamColorList, diargamColorListFront)
                diagramContainer.insertAdjacentHTML('beforeend', htmlElementDiagram);
                console.log('diagram data', maxYearItem.diagramData)

                loadChartFinanceType2(maxYearItem.diagramData, minYearItem.diagramData, diargamColorList, diargamColorListFront)
            }

            else if (typeRenderBox == 3) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                maxYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV3(maxYearItem.data[i], maxYearItemDop.data[i])
                    console.log(maxYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }


                let htmlElementDiagram = htmlDataDiagramV3(maxYearItem.diagramData, maxYearItemDop.diagramData, diargamColorList)
                diagramContainer.insertAdjacentHTML('beforeend', htmlElementDiagram);
                console.log('diagram data', maxYearItem.diagramData)

                loadChartFinanceType3(maxYearItem.diagramData, maxYearItemDop.diagramData, diargamColorList)
            }

            else if (typeRenderBox == 4) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                maxYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                minYearItem = dataArray.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                minYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV4(maxYearItem.data[i], minYearItem.data[i], maxYearItemDop.data[i], minYearItemDop.data[i])
                    console.log(maxYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }


                let htmlElementDiagram = htmlDataDiagramV4(maxYearItem.diagramData, minYearItem.diagramData, maxYearItemDop.diagramData, minYearItemDop.diagramData, diargamColorList, diargamColorListFront)
                diagramContainer.insertAdjacentHTML('beforeend', htmlElementDiagram);
                console.log('diagram data', maxYearItem.diagramData)

                loadChartFinanceType4(maxYearItem.diagramData, minYearItem.diagramData, maxYearItemDop.diagramData, minYearItemDop.diagramData, diargamColorList, diargamColorListFront)

                console.log('maxYearItem.diagramData', maxYearItem.diagramData)
            }
        }

        //рендер четвертого кластера блоков данных Staffing
        function renderStaffingHtmlBox(typeRenderBox, dataArray, dataArrayDop) {
            let wrapper = document.querySelector('.acordeon-data-claster--staffing')
            let row = wrapper.querySelector('.acordeon-data-claster__row')
            row.innerHTML = ""

            let maxYearItem
            let minYearItem

            let maxYearItemDop
            let minYearItemDop

            if (typeRenderBox == 1) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV1(maxYearItem.data[i])
                    console.log(maxYearItem.data[i])
                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            else if (typeRenderBox == 2) {
                row.innerHTML = ""

                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                minYearItem = dataArray.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                for (let i = 0; i < minYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV2(maxYearItem.data[i], minYearItem.data[i],)
                    console.log(minYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            else if (typeRenderBox == 3) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                maxYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV3(maxYearItem.data[i], maxYearItemDop.data[i])
                    console.log('asddddddddd', maxYearItem.data[i], maxYearItemDop.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }

            else if (typeRenderBox == 4) {
                row.innerHTML = ""
                maxYearItem = dataArray.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                maxYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year > prev.year ? curr : prev
                );

                minYearItem = dataArray.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                minYearItemDop = dataArrayDop.reduce((prev, curr) =>
                    curr.year < prev.year ? curr : prev
                );

                for (let i = 0; i < maxYearItem.data.length; i++) {
                    let htmlElement = htmlDataBoxV4(maxYearItem.data[i], minYearItem.data[i], maxYearItemDop.data[i], minYearItemDop.data[i])
                    console.log(maxYearItem.data[i])

                    row.insertAdjacentHTML('beforeend', htmlElement);
                }
            }
            console.log('maxYearItem', maxYearItem);
        }

        //информ блок тип 1
        function htmlDataBoxV1(data) {
            let blueMob = false
            let customValueElement = ''
            let informPopup = ''
            let hideBox = data.hide_status

            if (data.type && data.type == 'more-one') {

                if (data.value == '-' || data.value == 'N/A') {
                    customValueElement = 'N/A'
                }
                else {

                    customValueElement = `${data.value}:1`
                }
            }
            else if (data.type && data.type == 'versus') {
                customValueElement = `${data.valueFull}`
            }
            else {
                customValueElement = formatTruncated(data.value)
            }

            if (data.title == 'Overall public enrollment'
                || data.title == 'High school 6-year graduation rate'
                || data.title == 'Spending per student') {
                blueMob = true
            }
            else {
                blueMob = false
            }

            //comas for money
            if (data.type == 'money' || data.title == 'Overall public enrollment' || data.title == 'Private enrollment') {
                customValueElement = addCommas(customValueElement, data.type)
            }
            if (data.type == 'money') {
                customValueElement = '$' + customValueElement
            }


            //inform popup
            if (data.inform?.status == true) {
                if (data.inform.type == 'simple') {
                    informPopup = htmlInformPopupSinple()
                }
            }
            else {
                informPopup = ''
            }

            let htmlCode = `
                <div
                class="district-data-element district-data-element-v1 ${blueMob ? 'district-data-element--blue-mod' : ''} ${hideBox ? 'district-data-element--hide-mod' : ''}">
                <div class="district-data-element-v1__wrapper">
                    <div class="district-data-element-v1__top-values">
                        <div class="district-data-element-v1__top-values-title">${data.title}</div>
                        <div class="district-data-element-v1__top-values-value">${customValueElement}</div>
                    </div>
                </div>

                ${informPopup}

            </div>
            `

            return htmlCode
        }

        //информ блок тип 2
        function htmlDataBoxV2(data, data2) {
            let blueMob = false
            let riseMod = null

            let informPopup = ''

            let customValueElement = ''

            let hideBox = data.hide_status

            let reversStatus = data.revers_color_value

            if (data.type && data.type == 'more-one') {

                if (data.value == '-' || data.value == 'N/A') {
                    customValueElement = 'N/A'
                }
                else {

                    customValueElement = `${data.value}:1`
                }

            }
            else if (data.type && data.type == 'versus') {
                customValueElement = `${data.valueFull}`
            }
            else {
                customValueElement = formatTruncated(data.value)
            }

            let customValueElement2 = ''

            if (data2.type && data2.type == 'more-one') {
                if (data2.value == '-' || data2.value == 'N/A') {
                    customValueElement2 = 'N/A'
                }
                else {

                    customValueElement2 = `${data2.value}:1`
                }
            }
            else if (data2.type && data2.type == 'versus') {
                customValueElement2 = `${data2.valueFull}`
            }
            else {
                customValueElement2 = formatTruncated(data2.value)
            }


            if (data.title == 'Overall public enrollment'
                || data.title == 'High school 6-year graduation rate'
                || data.title == 'Spending per student') {
                blueMob = true
            }
            else {
                blueMob = false
            }



            if (data.compareStatus != false && data.value && data2.value) {


                if (+cleanNumberString(data.value) > +cleanNumberString(data2.value)) {
                    riseMod = true
                }
                else if (+cleanNumberString(data.value) < +cleanNumberString(data2.value)) {
                    riseMod = false
                }
                else {
                    riseMod = null
                }
            }

            //comas for money
            if (data.type == 'money' || data.title == 'Overall public enrollment' || data.title == 'Private enrollment') {
                customValueElement = addCommas(customValueElement, data.type)
            }
            if (data.type == 'money') {
                customValueElement = '$' + customValueElement
            }

            if (data2.type == 'money' || data2.title == 'Overall public enrollment' || data2.title == 'Private enrollment') {
                customValueElement2 = addCommas(customValueElement2, data2.type)
            }

            if (data2.type == 'money') {
                customValueElement2 = '$' + customValueElement2
            }


            //inform popup
            if (data.inform?.status == true) {
                if (data.inform.type == 'simple') {
                    informPopup = htmlInformPopupSinple()
                }
            }
            else {
                informPopup = ''
            }

            //revers color scheme
            if (reversStatus && reversStatus == true && riseMod != null) {

                riseMod = !riseMod
            }

            // if (data.title == 'Staffing - Administrative staff versus instructional staff') {
            //     riseMod = null
            // }



            let htmlCode = `
                <div class="district-data-element district-data-element-v2 
                ${blueMob ? 'district-data-element--light-blue-mod' : ''}
                ${riseMod == true ? 'district-data-element--rise-mod' : ''}
                ${riseMod == false ? 'district-data-element--down-mod' : ''}
                ${reversStatus == true && riseMod == false ? 'district-data-element--down-mod-ar-top' : ''}
                ${reversStatus == true && riseMod == true ? 'district-data-element--down-mod-ar-down' : ''}
                ${hideBox ? 'district-data-element--hide-mod' : ''}    
                ">

                <div class="district-data-element-v2__current">
                    <div class="district-data-element-v2__current-top">
                        <p class="district-data-element-v2__current-title">${data.title}</p>
                        <p class="district-data-element-v2__current-subtitle">CURRENT</p>
                    </div>

                    <div class="district-data-element-v2__current-value-row">
                        <div class="district-data-element-v2__current-value-ar">
                            <svg width="16" height="40" viewBox="0 0 16 40" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.70711 0.792893C8.31658 0.402369 7.68342 0.402369 7.29289 0.792893L0.928932 7.15685C0.538408 7.54738 0.538408 8.18054 0.928932 8.57107C1.31946 8.96159 1.95262 8.96159 2.34315 8.57107L8 2.91421L13.6569 8.57107C14.0474 8.96159 14.6805 8.96159 15.0711 8.57107C15.4616 8.18054 15.4616 7.54738 15.0711 7.15685L8.70711 0.792893ZM8 39.5H9L9 1.5H8H7L7 39.5H8Z"
                                    fill="#037971" />
                            </svg>
                        </div>
                        <div class="district-data-element-v2__current-value">${customValueElement}</div>
                    </div>
                </div>

                <div class="district-data-element-v2__past">
                    <div class="district-data-element-v2__past-value">${customValueElement2}</div>
                    <p class="district-data-element-v2__past-year">2019</p>
                </div>

                ${informPopup}

            </div>
            `

            return htmlCode
        }

        //информ блок тип 3
        function htmlDataBoxV3(data, dataDop) {
            let titleDopDostrict = document.querySelector('.controll-container__select-wrapper .select__head').innerText

            if (titleDopDostrict.includes("Colorado State")) {

                if (data.title != 'Disciplinary incidents per 1,000 students') {
                    titleDopDostrict = 'STATE'
                }
                else {
                    titleDopDostrict = 'Per district average'
                }
            }
            let blueMob = false
            let riseMod1 = null
            let riseMod2 = null
            let yearCurrent = data.year
            let reversStatus = data.revers_color_value

            let informPopup = ''

            let hideBox = data.hide_status


            let customValueElement = ''

            if (data.type && data.type == 'more-one') {

                if (data.value == '-' || data.value == 'N/A') {
                    customValueElement = 'N/A'
                }
                else {

                    customValueElement = `${data.value}:1`
                }

            }
            else if (data.type && data.type == 'versus') {
                customValueElement = `${data.valueFull}`
            }
            else {
                customValueElement = formatTruncated(data.value)
            }

            let customValueElement2 = ''

            if (dataDop.type && dataDop.type == 'more-one') {
                if (dataDop.value == '-' || dataDop.value == 'N/A') {
                    customValueElement2 = 'N/A'
                }
                else {

                    customValueElement2 = `${dataDop.value}:1`
                }
            }
            else if (dataDop.type && dataDop.type == 'versus') {
                customValueElement2 = `${dataDop.valueFull}`
            }
            else {
                customValueElement2 = formatTruncated(dataDop.value)
            }



            if (data.title == 'Overall public enrollment'
                || data.title == 'High school 6-year graduation rate'
                || data.title == 'Spending per student') {
                blueMob = true
            }
            else {
                blueMob = false
            }

            let val1 = parseFloat(data.value.toString().replace(/[^\d.-]/g, ''));
            let val2 = parseFloat(dataDop.value.toString().replace(/[^\d.-]/g, ''));


            if (data.compareStatus != false) {
                if (val1 < val2) {
                    riseMod1 = false;
                } else if (val1 > val2) {
                    riseMod1 = true;
                }
                else {
                    riseMod1 = null
                }
            }


            //comas for money
            if (data.type == 'money' || data.title == 'Overall public enrollment' || data.title == 'Private enrollment') {
                customValueElement = addCommas(customValueElement, data.type)
            }
            if (data.type == 'money') {
                customValueElement = '$' + customValueElement
            }

            if (dataDop.type == 'money' || dataDop.title == 'Overall public enrollment' || dataDop.title == 'Private enrollment') {
                customValueElement2 = addCommas(customValueElement2, dataDop.type)
            }

            if (dataDop.type == 'money') {
                customValueElement2 = '$' + customValueElement2
            }



            //inform popup
            if (data.inform?.status == true) {
                if (data.inform.type == 'simple') {
                    informPopup = htmlInformPopupSinple()
                }
            }
            else {
                informPopup = ''
            }


            //revers color scheme
            if (reversStatus && reversStatus == true && riseMod1 != null) {
                riseMod1 = !riseMod1
            }

            // if (data.title == 'Staffing - Administrative staff versus instructional staff') {
            //     riseMod1 = null
            // }

            // if (dataDop.title == 'Staffing - Administrative staff versus instructional staff') {
            //     riseMod2 = null
            // }


            let htmlCode = `
                <div
                class="district-data-element district-data-element-v2 district-data-element-v2--dop district-data-element-v2--no-border
                ${blueMob ? 'district-data-element--light-blue-mod' : ''}
                ${hideBox ? 'district-data-element--hide-mod' : ''}  
                ">

                <div class="district-data-element-v2__current">
                    <div class="district-data-element-v2__current-top">
                        <p class="district-data-element-v2__current-title">${data.title}</p>
                        
                    </div>


                    <div class="district-data-element-v2__values-row">

                        <div class="district-data-element-v2__value-claster 
                        ${riseMod1 == false ? 'district-data-element--down-mod' : ''}
                        ${riseMod1 == true ? 'district-data-element--rise-mod' : ''} 
                        ${reversStatus == true && riseMod1 == false ? 'district-data-element--down-mod-ar-top' : ''}
                        ${reversStatus == true && riseMod1 == true ? 'district-data-element--down-mod-ar-down' : ''}
                         
                        ">
                            <p class="district-data-element-v2__value-claster-title">CURRENT
                                DISTRICT</p>
                            <div class="district-data-element-v2__current-value-row">
                                <div class="district-data-element-v2__current-value-ar">
                                    <svg width="16" height="40" viewBox="0 0 16 40"
                                        fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8.70711 0.792893C8.31658 0.402369 7.68342 0.402369 7.29289 0.792893L0.928932 7.15685C0.538408 7.54738 0.538408 8.18054 0.928932 8.57107C1.31946 8.96159 1.95262 8.96159 2.34315 8.57107L8 2.91421L13.6569 8.57107C14.0474 8.96159 14.6805 8.96159 15.0711 8.57107C15.4616 8.18054 15.4616 7.54738 15.0711 7.15685L8.70711 0.792893ZM8 39.5H9L9 1.5H8H7L7 39.5H8Z"
                                            fill="#037971" />
                                    </svg>
                                </div>

                                <div class="district-data-element-v2__current-value">${customValueElement}
                                </div>
                            </div>
                        </div>

                        <div
                            class="district-data-element-v2__value-claster 
                   
                            ">
                            <p class="district-data-element-v2__value-claster-title">${truncateString(titleDopDostrict)}</p>
                            <div class="district-data-element-v2__current-value-row">
                                <div class="district-data-element-v2__current-value-ar">
                                    <svg width="16" height="40" viewBox="0 0 16 40"
                                        fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8.70711 0.792893C8.31658 0.402369 7.68342 0.402369 7.29289 0.792893L0.928932 7.15685C0.538408 7.54738 0.538408 8.18054 0.928932 8.57107C1.31946 8.96159 1.95262 8.96159 2.34315 8.57107L8 2.91421L13.6569 8.57107C14.0474 8.96159 14.6805 8.96159 15.0711 8.57107C15.4616 8.18054 15.4616 7.54738 15.0711 7.15685L8.70711 0.792893ZM8 39.5H9L9 1.5H8H7L7 39.5H8Z"
                                            fill="#037971" />
                                    </svg>
                                </div>
                                <div class="district-data-element-v2__current-value">${customValueElement2}
                                </div>
                            </div>
                        </div>




                    </div>

                </div>

        
                ${informPopup}

            </div>
            `

            return htmlCode
        }

        //информ блок тип 4
        function htmlDataBoxV4(data, data2, dataDop, dataDop2) {
            let titleDopDostrict = document.querySelector('.controll-container__select-wrapper .select__head').innerText

            if (titleDopDostrict.includes("Colorado State")) {

                if (data.title != 'Disciplinary incidents per 1,000 students') {
                    titleDopDostrict = 'STATE'
                }
                else {
                    titleDopDostrict = 'Per district average'
                }
            }

            let blueMob = false
            let riseMod1 = null
            let riseMod2 = null

            let informPopup = ''

            let hideBox = data.hide_status

            let customValueElement = ''

            let reversStatus = data.revers_color_value

            if (data.type && data.type == 'more-one') {

                if (data.value == '-' || data.value == 'N/A') {
                    customValueElement = 'N/A'
                }
                else {

                    customValueElement = `${data.value}:1`
                }

            }
            else if (data.type && data.type == 'versus') {
                customValueElement = `${data.valueFull}`
            }
            else {
                customValueElement = formatTruncated(data.value)
            }

            let customValueElement2 = ''

            if (data2.type && data2.type == 'more-one') {
                if (data2.value == '-' || data2.value == 'N/A') {
                    customValueElement2 = 'N/A'
                }
                else {

                    customValueElement2 = `${data2.value}:1`
                }
            }
            else if (data2.type && data2.type == 'versus') {
                customValueElement2 = `${data2.valueFull}`
            }
            else {
                customValueElement2 = formatTruncated(data2.value)
            }


            let customValueElementDop = ''

            if (dataDop.type && dataDop.type == 'more-one') {
                if (dataDop.value == '-' || dataDop.value == 'N/A') {
                    customValueElementDop = 'N/A'
                }
                else {

                    customValueElementDop = `${dataDop.value}:1`
                }
            }
            else if (dataDop.type && dataDop.type == 'versus') {
                customValueElementDop = `${dataDop.valueFull}`
            }
            else {
                customValueElementDop = formatTruncated(dataDop.value)
            }


            let customValueElementDop2 = ''

            if (dataDop2.type && dataDop2.type == 'more-one') {
                if (dataDop2.value == '-' || dataDop2.value == 'N/A') {
                    customValueElementDop2 = 'N/A'
                }
                else {

                    customValueElementDop2 = `${dataDop2.value}:1`
                }
            }
            else if (dataDop2.type && dataDop2.type == 'versus') {
                customValueElementDop2 = `${dataDop2.valueFull}`
            }
            else {
                customValueElementDop2 = formatTruncated(dataDop2.value)
            }




            if (data.title == 'Overall public enrollment'
                || data.title == 'High school 6-year graduation rate'
                || data.title == 'Spending per student') {
                blueMob = true
            }
            else {
                blueMob = false
            }

            let val1 = parseFloat(data.value.toString().replace(/[^\d.-]/g, ''));
            let val1_old = parseFloat(data2.value.toString().replace(/[^\d.-]/g, ''));
            let val2 = parseFloat(dataDop.value.toString().replace(/[^\d.-]/g, ''));
            let val2_old = parseFloat(dataDop2.value.toString().replace(/[^\d.-]/g, ''));


            if (data.compareStatus != false) {
                if (val1 < val1_old) {
                    riseMod1 = false;
                } else if (val1 > val1_old) {
                    riseMod1 = true;
                }
            }

            if (dataDop.compareStatus != false) {
                if (val2 < val2_old) {
                    riseMod2 = false;
                } else if (val2 > val2_old) {
                    riseMod2 = true;
                }
            }



            //comas for money
            if (data.type == 'money' || data.title == 'Overall public enrollment' || data.title == 'Private enrollment') {
                customValueElement = addCommas(customValueElement, data.type)
            }
            if (data.type == 'money') {
                customValueElement = '$' + customValueElement
            }


            if (data2.type == 'money' || data2.title == 'Overall public enrollment' || data2.title == 'Private enrollment') {
                customValueElementDop = addCommas(customValueElementDop, data2.type)
            }

            if (data2.type == 'money') {
                customValueElementDop = '$' + customValueElementDop
            }


            if (dataDop.type == 'money' || dataDop.title == 'Overall public enrollment' || dataDop.title == 'Private enrollment') {
                customValueElement2 = addCommas(customValueElement2, dataDop.type)
            }

            if (dataDop.type == 'money') {
                customValueElement2 = '$' + customValueElement2
            }


            if (dataDop2.type == 'money' || dataDop2.title == 'Overall public enrollment' || dataDop2.title == 'Private enrollment') {
                customValueElementDop2 = addCommas(customValueElementDop2, dataDop2.type)
            }

            if (dataDop2.type == 'money') {
                customValueElementDop2 = '$' + customValueElementDop2
            }



            //inform popup
            if (data.inform?.status == true) {
                if (data.inform.type == 'simple') {
                    informPopup = htmlInformPopupSinple()
                }
            }
            else {
                informPopup = ''
            }



            //revers color scheme
            if (reversStatus && reversStatus == true) {

                if (riseMod1 != null) {
                    riseMod1 = !riseMod1
                }

                if (riseMod2 != null) {
                    riseMod2 = !riseMod2
                }

            }



            // if (data.title == 'Staffing - Administrative staff versus instructional staff') {
            //     riseMod1 = null
            // }

            // if (dataDop.title == 'Staffing - Administrative staff versus instructional staff') {
            //     riseMod2 = null
            // }


            let htmlCode = `
                <div class="district-data-element district-data-element--no-arrows district-data-element-v2 district-data-element-v2--dop 
                ${blueMob ? 'district-data-element--light-blue-mod' : ''}
                ${hideBox ? 'district-data-element--hide-mod' : ''} 
                ">

                <div class="district-data-element-v2__current">
                    <div class="district-data-element-v2__current-top">
                        <p class="district-data-element-v2__current-title">${data.title}</p>
                    </div>


                    <div class="district-data-element-v2__values-row">

                        <div
                            class="district-data-element-v2__value-claster 
                            ${riseMod1 == false ? 'district-data-element--down-mod' : ''}
                            ${riseMod1 == true ? 'district-data-element--rise-mod' : ''} 
                            ${reversStatus == true && riseMod1 == false ? 'district-data-element--down-mod-ar-top' : ''}
                            ${reversStatus == true && riseMod1 == true ? 'district-data-element--down-mod-ar-down' : ''}
                              
                            
                            ">
                            <p class="district-data-element-v2__value-claster-title">CURRENT
                                DISTRICT</p>
                            <div class="district-data-element-v2__current-value-row">
                                <div class="district-data-element-v2__current-value-ar">
                                    <svg width="16" height="40" viewBox="0 0 16 40"
                                        fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8.70711 0.792893C8.31658 0.402369 7.68342 0.402369 7.29289 0.792893L0.928932 7.15685C0.538408 7.54738 0.538408 8.18054 0.928932 8.57107C1.31946 8.96159 1.95262 8.96159 2.34315 8.57107L8 2.91421L13.6569 8.57107C14.0474 8.96159 14.6805 8.96159 15.0711 8.57107C15.4616 8.18054 15.4616 7.54738 15.0711 7.15685L8.70711 0.792893ZM8 39.5H9L9 1.5H8H7L7 39.5H8Z"
                                            fill="#037971" />
                                    </svg>
                                </div>
                                <div class="district-data-element-v2__current-value">${customValueElement}
                                </div>
                            </div>
                        </div>

                        <div
                            class="district-data-element-v2__value-claster 
                            ${riseMod2 == false ? 'district-data-element--down-mod' : ''}
                            ${riseMod2 == true ? 'district-data-element--rise-mod' : ''} 

                            ${reversStatus == true && riseMod2 == false ? 'district-data-element--down-mod-ar-top' : ''}
                            ${reversStatus == true && riseMod2 == true ? 'district-data-element--down-mod-ar-down' : ''}   
                            ">
                            <p class="district-data-element-v2__value-claster-title">${truncateString(titleDopDostrict)}</p>
                            <div class="district-data-element-v2__current-value-row">
                                <div class="district-data-element-v2__current-value-ar">
                                    <svg width="16" height="40" viewBox="0 0 16 40"
                                        fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8.70711 0.792893C8.31658 0.402369 7.68342 0.402369 7.29289 0.792893L0.928932 7.15685C0.538408 7.54738 0.538408 8.18054 0.928932 8.57107C1.31946 8.96159 1.95262 8.96159 2.34315 8.57107L8 2.91421L13.6569 8.57107C14.0474 8.96159 14.6805 8.96159 15.0711 8.57107C15.4616 8.18054 15.4616 7.54738 15.0711 7.15685L8.70711 0.792893ZM8 39.5H9L9 1.5H8H7L7 39.5H8Z"
                                            fill="#037971" />
                                    </svg>
                                </div>
                                <div class="district-data-element-v2__current-value">${customValueElementDop}
                                </div>
                            </div>
                        </div>


                    </div>

                </div>

                <div class="district-data-element-v2__past-row">
                    <div class="district-data-element-v2__past">
                        <div class="district-data-element-v2__past-value">${customValueElement2}</div>
                        <p class="district-data-element-v2__past-year">2019</p>
                    </div>

                    <div class="district-data-element-v2__past">
                        <div class="district-data-element-v2__past-value">${customValueElementDop2}</div>
                        <p class="district-data-element-v2__past-year">2019</p>
                    </div>
                </div>

                ${informPopup}


            </div>
            `

            return htmlCode
        }


        //информ подскзка type simple
        function htmlInformPopupSinple() {
            let htmlCode = `
            <div class="district-data-element-info">
                <div class="district-data-element-info__icon-wrapper">
                    <div
                        class="district-data-element-info__data-container  district-data-element-info__data-container--big">
                        <div class="district-data-element-info__data-container-wrapper">
                            <div
                                class="district-data-element-info__data-container-wrapper-text">
                                For definition, <a href="https://coloradoeducationdashboard.com/about#definitions">click here.</a>
                            </div>
                        </div>
                    </div>

                    <div class="district-data-element-info__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1882 7.3739C12.8803 7.4792 13.5267 7.00351 13.632 6.3114C13.7374 5.61928 13.2616 4.97284 12.5695 4.86753C11.8774 4.76222 11.231 5.23791 11.1257 5.93003C11.0204 6.62214 11.4961 7.26859 12.1882 7.3739ZM11.0985 8.91768C10.637 8.84747 10.2061 9.16461 10.1359 9.62601C10.0657 10.0874 10.3828 10.5184 10.8442 10.5886L9.82723 17.2722C9.75702 17.7337 10.0741 18.1646 10.5356 18.2348C10.997 18.305 11.4279 17.9879 11.4981 17.5265L12.6423 10.0074C12.7125 9.54598 12.3953 9.11502 11.9339 9.04481L11.0985 8.91768Z" fill="#013364"/>
                        </svg>
                    </div>
                </div>
            </div>`

            return htmlCode
        }

        function htmlInformPopupRate() {
            let htmlCode = `
            <div class="district-data-element-info info-rate-popup">
                <p class="district-data-element-info__text">Display by socio
                    economic
                    status</p>
                <div class="district-data-element-info__icon-wrapper">
                    <div
                        class="district-data-element-info__data-container  district-data-element-info__data-container--small">
                        <div class="district-data-element-info__data-container-wrapper">
                            <div
                                class="district-data-element-info__data-container-wrapper-rate">
                                <p
                                    class="district-data-element-info__data-container-wrapper-rate-title">
                                    LSE RATE
                                </p>
                                <div
                                    class="district-data-element-info__data-container-wrapper-rate-value red-text-mod">
                                    <svg width="8" height="20" viewBox="0 0 8 20"
                                        fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M3.64645 19.8536C3.84171 20.0488 4.15829 20.0488 4.35355 19.8536L7.53553 16.6716C7.7308 16.4763 7.7308 16.1597 7.53553 15.9645C7.34027 15.7692 7.02369 15.7692 6.82843 15.9645L4 18.7929L1.17157 15.9645C0.976311 15.7692 0.659728 15.7692 0.464466 15.9645C0.269204 16.1597 0.269204 16.4763 0.464466 16.6716L3.64645 19.8536ZM4 0L3.5 0L3.5 19.5H4H4.5L4.5 0L4 0Z"
                                            fill="#CE3538" />
                                    </svg>

                                    <span>60%</span>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="district-data-element-info__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1882 7.3739C12.8803 7.4792 13.5267 7.00351 13.632 6.3114C13.7374 5.61928 13.2616 4.97284 12.5695 4.86753C11.8774 4.76222 11.231 5.23791 11.1257 5.93003C11.0204 6.62214 11.4961 7.26859 12.1882 7.3739ZM11.0985 8.91768C10.637 8.84747 10.2061 9.16461 10.1359 9.62601C10.0657 10.0874 10.3828 10.5184 10.8442 10.5886L9.82723 17.2722C9.75702 17.7337 10.0741 18.1646 10.5356 18.2348C10.997 18.305 11.4279 17.9879 11.4981 17.5265L12.6423 10.0074C12.7125 9.54598 12.3953 9.11502 11.9339 9.04481L11.0985 8.91768Z" fill="#013364"/>
                        </svg>
                    </div>
                </div>
            </div>`

            return htmlCode
        }



        //диаграма тип 1
        function htmlDataDiagramV1(data, diargamColorList) {


            let listValues = ''

            for (let i = 0; i < data.length; i++) {

                let liElement = `
                <li class="chart-diagram-value-list__element">
                        <span class="chart-diagram-value-list__element-value" style="background: ${diargamColorList[i]}"></span>
                    <span class="chart-diagram-value-list__element-text">${data[i].title}</span>
                </li>
                `

                listValues = listValues + liElement
            }

            let htmlCode = `
            <div class="acordeon-data-claster__chart acordeon-data-claster__chart--type-1">

                <div class="acordeon-data-claster__chart-diagram-wrapper">

                    <div
                        class="acordeon-data-claster__chart-diagram-wrapper-chart-1">
                        <canvas id="financeChart1"
                            class=" graf-container__chart stat-district-chart"></canvas>
                    </div>
                    <div
                        class="acordeon-data-claster__chart-diagram-wrapper-chart-2">
                    </div>

                </div>

                <div class="acordeon-data-claster__chart-diagram-value">
                    <ul
                        class="chart-diagram-value-list chart-diagram-value-list--main">
                        ${listValues}
                    </ul>
                </div>
            </div>
            `
            return htmlCode
        }

        //диаграма тип 2
        function htmlDataDiagramV2(data, data2, diargamColorList, diargamColorListFront) {
            let listValues = ''
            let listValuesFront = ''

            for (let i = 0; i < data.length; i++) {

                let liElementFront = `
                <li class="chart-diagram-value-list__element">
                    <span class="chart-diagram-value-list__element-value" style="background: ${diargamColorListFront[i]}"></span>
                </li> 
                `

                let liElement = `
                <li class="chart-diagram-value-list__element">
                    <span class="chart-diagram-value-list__element-value" style="background: ${diargamColorList[i]}"></span>
                    <span class="chart-diagram-value-list__element-text">${data2[i].title}</span>
                </li>
                `

                listValues = listValues + liElement
                listValuesFront = listValuesFront + liElementFront
            }

            let htmlCode = `
            <div class="acordeon-data-claster__chart acordeon-data-claster__chart--type-1">

                <div class="acordeon-data-claster__chart-diagram-wrapper">

                    <div
                        class="acordeon-data-claster__chart-diagram-wrapper-chart-1 acordeon-data-claster__chart-diagram-wrapper-chart-1--shadow">
                        <canvas id="financeChart2"
                            class=" graf-container__chart stat-district-chart"></canvas>
                    </div>
                    <div
                        class="acordeon-data-claster__chart-diagram-wrapper-chart-2">
                        <canvas id="financeChart3"
                            class=" graf-container__chart stat-district-chart"></canvas>
                    </div>

                </div>

                <div class="acordeon-data-claster__chart-diagram-value-two">
                    <div
                        class="acordeon-data-claster__chart-diagram-value-two-header">
                        <div
                            class="acordeon-data-claster__chart-diagram-value-two-header-1">
                            2019</div>
                        <div
                            class="acordeon-data-claster__chart-diagram-value-two-header-1">
                            2025</div>
                    </div>

                    <ul class="chart-diagram-value-list chart-diagram-value-list--sub">

                        ${listValuesFront}

                    </ul>

                    <ul class="chart-diagram-value-list chart-diagram-value-list--main">

                        ${listValues}

                    </ul>
                </div>
            </div>
            `

            return htmlCode
        }

        //диаграма тип 3
        function htmlDataDiagramV3(data, data2, diargamColorList) {
            let listValues = ''
            let listValuesFront = ''
            let titleDopDostrict = document.querySelector('.controll-container__select-wrapper .select__head').innerText

            for (let i = 0; i < data.length; i++) {


                let liElement = `
                <li class="chart-diagram-value-list__element">
                    <span class="chart-diagram-value-list__element-value" style="background: ${diargamColorList[i]}"></span>
                    <span class="chart-diagram-value-list__element-text">${data[i].title}</span>
                </li>
                `

                listValues = listValues + liElement

            }

            let htmlCode = `
            <div class="acordeon-data-claster__chart-claster">
                <div
                    class="acordeon-data-claster__chart acordeon-data-claster__chart--type-2">
                
                    <div
                        class="acordeon-data-claster__chart-diagram-wrapper acordeon-data-claster__chart-diagram-wrapper--small">
                        <p
                            class="acordeon-data-claster__chart--type-3-row-chart-box-title">
                            DISTRICT
                        </p>
                        <div
                            class="acordeon-data-claster__chart-diagram-wrapper-chart-1 ">
                            <canvas id="financeChart4"
                                class=" graf-container__chart stat-district-chart"></canvas>
                        </div>

                    </div>

                    <div
                        class="acordeon-data-claster__chart-diagram-wrapper acordeon-data-claster__chart-diagram-wrapper--small">

                        <p
                            class="acordeon-data-claster__chart--type-3-row-chart-box-title">
                            ${titleDopDostrict}
                        </p>

                        <div
                            class="acordeon-data-claster__chart-diagram-wrapper-chart-1 ">
                            <canvas id="financeChart5"
                                class=" graf-container__chart stat-district-chart"></canvas>
                        </div>
            
                    </div>

                    <div class="acordeon-data-claster__chart-diagram-value">

                        <ul
                            class="chart-diagram-value-list chart-diagram-value-list--main">
                            ${listValues}
                        </ul>
                    </div>
                </div>
            </div>
            `

            return htmlCode
        }

        //диаграма тип 4
        function htmlDataDiagramV4(data1Current, data1Old, data2Current, data2Old, diargamColorList, diargamColorListFront) {
            let titleDopDostrict = document.querySelector('.controll-container__select-wrapper .select__head').innerText
            let titleCols = ''

            let colorRow = ''
            let colorRow2 = ''

            for (let i = 0; i < data1Current.length; i++) {

                let colorRowElement = `
                <div class="claster-value-table__col">
                    <span class="claster-value-table__el-value" style="background: ${diargamColorList[i]}"></span>
                </div>
                `

                let colorRowElement2 = `
                <div class="claster-value-table__col">
                    <span class="claster-value-table__el-value" style="background: ${diargamColorListFront[i]}"></span>
                </div>
                `


                let colTitleElement = `
                <div class="claster-value-table__col">
                    <span class="claster-value-table__el-title">${data1Current[i].title}</span>
                </div>
                `
                colorRow = colorRow + colorRowElement

                colorRow2 = colorRow2 + colorRowElement2

                titleCols = titleCols + colTitleElement
            }


            let htmlCode = `
            <div class="acordeon-data-claster__chart acordeon-data-claster__chart--type-3">
                <div class="acordeon-data-claster__chart--type-3-row">
                    <div class="acordeon-data-claster__chart--type-3-row-chart-box">
                        <p
                            class="acordeon-data-claster__chart--type-3-row-chart-box-title">
                            DISTRICT
                        </p>
                        <div
                            class="acordeon-data-claster__chart-diagram-wrapper acordeon-data-claster__chart-diagram-wrapper--small">

                            <div
                                class="acordeon-data-claster__chart-diagram-wrapper-chart-1 ">
                                <canvas id="financeChart6"
                                    class=" graf-container__chart stat-district-chart"></canvas>
                            </div>
                            <div
                                class="acordeon-data-claster__chart-diagram-wrapper-chart-2">
                                <canvas id="financeChart7"
                                    class=" graf-container__chart stat-district-chart"></canvas>
                            </div>

                        </div>
                    </div>

                    <div class="acordeon-data-claster__chart--type-3-row-chart-box">
                        <p
                            class="acordeon-data-claster__chart--type-3-row-chart-box-title">
                            ${titleDopDostrict}
                        </p>
                        <div
                            class="acordeon-data-claster__chart-diagram-wrapper acordeon-data-claster__chart-diagram-wrapper--small">

                            <div
                                class="acordeon-data-claster__chart-diagram-wrapper-chart-1 ">
                                <canvas id="financeChart8"
                                    class=" graf-container__chart stat-district-chart"></canvas>
                            </div>
                            <div
                                class="acordeon-data-claster__chart-diagram-wrapper-chart-2">
                                <canvas id="financeChart9"
                                    class=" graf-container__chart stat-district-chart"></canvas>
                            </div>

                        </div>
                    </div>

                </div>

                <div class="acordeon-data-claster__chart--type-3-table-wrapper">
                    <div
                        class="acordeon-data-claster__chart--type-3-table claster-value-table">
                        <div
                            class="claster-value-table__row claster-value-table__row--header">
                            <div class="claster-value-table__col">

                            </div>
                            ${titleCols}

                        </div>


                        <div class="claster-value-table__row ">
                            <div class="claster-value-table__col">
                                <span
                                    class="claster-value-table__el-year">2025</span>
                            </div>
                            ${colorRow}
                          

                        </div>



                        <div class="claster-value-table__row ">
                            <div class="claster-value-table__col">
                                <span
                                    class="claster-value-table__el-year claster-value-table__el-year--old">2019</span>
                            </div>
                            ${colorRow2}

                        </div>


                    </div>
                </div>



            </div>
            `

            return htmlCode
        }

        // настройки для диаграм данных
        const optionsSettings = {
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

        //тип диаграмы 1 - одна диаграма
        function loadChartFinanceType1(dataForDiagram, diargamColorList) {
            let ctx = document.getElementById('financeChart1');
            let valueList = []
            let titleList = []

            for (let i = 0; i < dataForDiagram.length; i++) {
                valueList.push(+dataForDiagram[i].value)
                titleList.push(dataForDiagram[i].title)
            }

            let chartDistrict = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: titleList,
                    datasets: [{
                        label: '2025',
                        data: valueList,
                        backgroundColor: diargamColorList,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });

        }

        //тип диаграмы 2 - диаграма в диаграме для 1 дистрикта
        function loadChartFinanceType2(dataForDiagram, dataForDiagram2, diargamColorList, diargamColorListFront) {

            const ctx2 = document.getElementById('financeChart2');
            const ctx3 = document.getElementById('financeChart3');

            let valueList = []
            let titleList = []

            let valueList2 = []
            let titleList2 = []

            for (let i = 0; i < dataForDiagram.length; i++) {
                valueList.push(+dataForDiagram[i].value)
                titleList.push(dataForDiagram[i].title)

                valueList2.push(+dataForDiagram2[i].value)
                titleList2.push(dataForDiagram2[i].title)
            }

            const chartDistrict2 = new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: titleList2,
                    datasets: [{
                        label: '2019',
                        data: valueList2,
                        backgroundColor: diargamColorListFront,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });

            const chartDistrict3 = new Chart(ctx3, {
                type: 'pie',
                data: {
                    labels: titleList,
                    datasets: [{
                        label: '2025',
                        data: valueList,
                        backgroundColor: diargamColorList,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });
        }

        //тип диаграмы 3 - две диаграмы разных дстриктов
        function loadChartFinanceType3(dataForDiagram, dataForDiagram2, diargamColorList) {
            const ctx4 = document.getElementById('financeChart4');
            const ctx5 = document.getElementById('financeChart5');

            let valueList = []
            let titleList = []

            let valueList2 = []
            let titleList2 = []

            for (let i = 0; i < dataForDiagram.length; i++) {
                valueList.push(+dataForDiagram[i].value)
                titleList.push(dataForDiagram[i].title)

                valueList2.push(+dataForDiagram2[i].value)
                titleList2.push(dataForDiagram2[i].title)
            }

            const chartDistrict4 = new Chart(ctx4, {
                type: 'pie',
                data: {
                    labels: titleList,
                    datasets: [{
                        label: '2025',
                        data: valueList,
                        backgroundColor: diargamColorList,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });

            const chartDistrict5 = new Chart(ctx5, {
                type: 'pie',
                data: {
                    labels: titleList2,
                    datasets: [{
                        label: '2019',
                        data: valueList2,
                        backgroundColor: diargamColorList,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });

        }
        //тип диаграмы 4 - 4диаграмы
        function loadChartFinanceType4(data1Current, data1Old, data2Current, data2Old, diargamColorList, diargamColorListFront) {
            const ctx6 = document.getElementById('financeChart6');
            const ctx7 = document.getElementById('financeChart7');
            const ctx8 = document.getElementById('financeChart8');
            const ctx9 = document.getElementById('financeChart9');

            let valueList = []
            let titleList = []

            let valueList2 = []
            let titleList2 = []


            let valueDopList = []
            let titleDopList = []

            let valueDopList2 = []
            let titleDopList2 = []

            for (let i = 0; i < data1Current.length; i++) {
                valueList.push(+data1Current[i].value)
                titleList.push(data1Current[i].title)

                valueList2.push(+data1Old[i].value)
                titleList2.push(data1Old[i].title)


                valueDopList.push(+data2Current[i].value)
                titleDopList.push(data2Current[i].title)

                valueDopList2.push(+data2Old[i].value)
                titleDopList2.push(data2Old[i].title)
            }

            const chartDistrict6 = new Chart(ctx6, {
                type: 'pie',
                data: {
                    labels: titleList2,
                    datasets: [{
                        label: '2019',
                        data: valueList2,
                        backgroundColor: diargamColorListFront,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });

            const chartDistrict7 = new Chart(ctx7, {
                type: 'pie',
                data: {
                    labels: titleList,
                    datasets: [{
                        label: '2025',
                        data: valueList,
                        backgroundColor: diargamColorList,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });

            const chartDistrict8 = new Chart(ctx8, {
                type: 'pie',
                data: {
                    labels: titleDopList2,
                    datasets: [{
                        label: '2019',
                        data: valueDopList2,
                        backgroundColor: diargamColorListFront,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });

            const chartDistrict9 = new Chart(ctx9, {
                type: 'pie',
                data: {
                    labels: titleDopList,
                    datasets: [{
                        label: '2025',
                        data: valueDopList,
                        backgroundColor: diargamColorList,
                        borderWidth: 0
                        // hoverOffset: 4
                    }]
                },
                options: optionsSettings
            });
        }


        function onResizeEnd(callback, delay = 1000) {
            let resizeTimer;

            window.addEventListener("resize", () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    callback();
                }, delay);
            });
        }


        //нормализация высот заголовков блоков
        function normalisationBoxInfoTitle() {
            const allRows = document.querySelectorAll('.acordeon-data-claster__row');

            allRows.forEach(row => {
                // Массив классов, для которых нужно выровнять высоту
                const titleClasses = [
                    '.district-data-element-v2__current-title',
                    '.district-data-element-v1__top-values-title'
                ];

                titleClasses.forEach(selector => {
                    const titles = row.querySelectorAll(selector);
                    if (!titles.length) return;

                    // Сбрасываем высоту перед измерением
                    titles.forEach(title => {
                        title.style.height = 'auto';
                    });

                    // Находим максимальную высоту
                    const maxHeight = Math.max(...Array.from(titles).map(title => title.offsetHeight));

                    // Присваиваем одинаковую высоту
                    titles.forEach(title => {
                        title.style.height = `${maxHeight}px`;
                    });
                });
            });
        }

        //приведение строки в нормальный вид удалаем символы оставляем числа
        function cleanNumberString(str) {
            return +parseFloat(str.toString().replace(/[^\d.-]/g, ''));
        }

        //обрезка строки
        function truncateString(str, countText = 20) {
            if (str.length > countText) {
                return str.slice(0, countText - 3) + '...';
            }
            return str;
        }



        function formatTruncated(value) {
            return value
            // Проверяем, является ли значением число
            if (typeof value !== 'number' || isNaN(value)) return value;

            // Обрезаем без округления до 3 знаков после запятой
            const truncated = Math.trunc(value * 1000) / 1000;

            // Красиво форматируем (разделители тысяч, без лишних нулей)
            return truncated.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            });
        }

        //запятая для цен
        function addCommas(data, dataType) {
            let stringNumber = cleanNumberString(data)
            let formatted = String(stringNumber).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            if (dataType && dataType == 'money') {
                return formatted
            }
            else {
                return formatted
            }

        }


        //обрезка до двоиточия
        function getNumberBeforeColon(str) {
            // Проверяем, что вход — строка
            if (typeof str !== 'string') return null

            // Разделяем строку по двоеточию
            const parts = str.split(':')

            // Берём первую часть и преобразуем в число
            const num = Number(parts[0])

            // Если не число — возвращаем null
            return isNaN(num) ? null : num
        }






    }










});