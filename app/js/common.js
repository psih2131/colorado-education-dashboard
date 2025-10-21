
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
                // let urlDomain = 'http://district-dashbord.test'
                let urlDomain = 'https://csi.theprojectview.com'

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
                // fetch('../js/map.geojson')
                fetch('/wp-content/themes/csi/js/map.geojson')
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
                    // attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                    subdomains: 'abcd',

                    minZoom: 7.5
                }).addTo(map);

                let geojson;

                // fetch('../js/map.geojson')
                //     // fetch('/wp-content/themes/csi/js/map.geojson')
                //     .then(res => res.json())
                //     .then(data => {
                //         // базовый стиль
                //         function style() {
                //             return {
                //                 color: "#D6D9DB",
                //                 weight: 1.5,
                //                 fillColor: "#609DC9",
                //                 fillOpacity: 1
                //             };
                //         }

                //         // подсветка при наведении
                //         function highlightFeature(e) {
                //             const layer = e.target;
                //             layer.setStyle({
                //                 weight: 2.5,
                //                 color: "#fff",
                //                 fillColor: "#91B4D3",
                //                 fillOpacity: 1
                //             });
                //             layer.bringToFront();
                //         }

                //         // возврат к исходному стилю
                //         function resetHighlight(e) {
                //             geojson.resetStyle(e.target);
                //         }



                //         function onEachFeature(feature, layer) {
                //             layer.bindPopup(feature.properties.NAME);
                //             layer.on({
                //                 mouseover: highlightFeature,
                //                 mouseout: resetHighlight
                //             });
                //         }

                //         geojson = L.geoJSON(data, {
                //             style,
                //             onEachFeature
                //         }).addTo(map);
                //     });



                // fetch('../js/map.geojson')
                fetch('/wp-content/themes/csi/js/map.geojson')
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
                                item => item.acf.geoid === geoIdFile
                            );


                            let name = feature.properties.NAME;
                            let url = ''
                            let score = ''
                            console.log('districtData,', districtData)
                            if (districtData && +districtData?.acf?.geoid == +geoIdFile) {
                                url = districtData.link

                                if (districtData.acf?.years[0]?.overall_score) {
                                    score = (+districtData.acf.years[0].overall_score * 100).toFixed(2)
                                    console.log('bingo2', score)
                                }
                                else {
                                    score = '-'
                                }

                                console.log('bingo', url)
                            }
                            else {
                                score = '-'
                            }


                            let popupContent = `
                                <div class="map-pop" style="font-size: 14px; line-height: 1.4;">
                                    <p class="map-pop__title">${name}</p>
                                    <p class="map-pop__value">Overall Score: <b> ${score}</b></p>
                                    <p class="map-pop__link">
                                        <a href="${url}" >
                                            VIEW ALL DATA
                                        </a>
                                    </p>
                                    
                                </div>
                            `;

                            layer.bindPopup(popupContent);

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


                            let geoIdFile = layer.feature.properties.GEOID; // нужный geoid
                            let districtData = districtListDataServer.find(
                                item => item.acf.geoid === geoIdFile
                            );


                            let name = layer.feature.properties.NAME;
                            let url = ''
                            let score = ''
                            console.log('districtData,', districtData)
                            if (districtData && +districtData?.acf?.geoid == +geoIdFile) {
                                url = districtData.link

                                if (districtData.acf?.years[0]?.overall_score) {
                                    score = (+districtData.acf.years[0].overall_score * 100).toFixed(2)
                                    console.log('bingo2', score)
                                }
                                else {
                                    score = '-'
                                }

                                console.log('bingo', url)
                            }
                            else {
                                score = '-'
                            }


                            let popupContent = `
                                <div class="map-pop" style="font-size: 14px; line-height: 1.4;">
                                    <p class="map-pop__title">${name}</p>
                                    <p class="map-pop__value">Overall Score: <b> ${score}</b></p>
                                    <p class="map-pop__link">
                                        <a href="${url}" >
                                            VIEW ALL DATA
                                        </a>
                                    </p>
                                    
                                </div>
                            `;


                            layer.bindPopup(popupContent).openPopup();

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



                                    let geoIdFile = layer.feature.properties.GEOID; // нужный geoid
                                    let districtData = districtListDataServer.find(
                                        item => item.acf.geoid === geoIdFile
                                    );


                                    let name = layer.feature.properties.NAME;
                                    let url = ''
                                    let score = ''
                                    console.log('districtData,', districtData)
                                    if (districtData && +districtData?.acf?.geoid == +geoIdFile) {
                                        url = districtData.link

                                        if (districtData.acf?.years[0]?.overall_score) {
                                            score = (+districtData.acf.years[0].overall_score * 100).toFixed(2)
                                            console.log('bingo2', score)
                                        }
                                        else {
                                            score = '-'
                                        }

                                        console.log('bingo', url)
                                    }
                                    else {
                                        score = '-'
                                    }


                                    let popupContent = `
                                <div class="map-pop" style="font-size: 14px; line-height: 1.4;">
                                    <p class="map-pop__title">${name}</p>
                                    <p class="map-pop__value">Overall Score: <b> ${score}</b></p>
                                    <p class="map-pop__link">
                                        <a href="${url}" >
                                            VIEW ALL DATA
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

                            if (!found) alert("District dont finded");
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

        // let slug = 'mapleton-1';
        let slug = window.location.pathname.split('/').filter(Boolean).pop();

        // let urlDomain = 'http://district-dashbord.test'

        let urlDomain = 'https://csi.theprojectview.com'

        let endpoint = `${urlDomain}/wp-json/wp/v2/district?slug=${slug}`;

        let dataCurrentDistrict = null

        let currentSelectYearRangeValue = null

        let currentDistrictServerData = null

        let dopDistrictSelectValue = null

        let currentYearListForRange = null

        let currentDistrictYearListForChart = null;

        let dopDistrictYearListForChart = null

        let multiDistrictData = null



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

                    //берм масив городов и сортируем его по возрастанию
                    currentDistrictYearListForChart = getAndSortYearListForChart(dataCurrentDistrict)

                    //рендерим доступные года ля ползунка
                    loadHtmlDistrictsListYearsRange()

                    //вызываем метод получения всех дистриктов для выпад списка
                    loalAddDistrictList()

                    //получаем членов
                    getMembersData()

                    //получаем супера
                    getSuperintendent()

                    //вызываем метод для рендеринга названия текущего дистрикта
                    renderTitleCurrentDistrict()

                    //скачивание данных при клике
                    loadDataDistrictScript(dataCurrentDistrict)

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
            btn.addEventListener('click', () => {
                downloadFile(data)
            })
        }

        function downloadFile(data, filename = 'file.txt', type = 'text/plain') {
            // Если пришёл объект — превращаем в строку
            const content = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;

            const blob = new Blob([content], { type });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;

            // Триггерим скачивание
            link.click();

            // Чистим ссылку из памяти
            URL.revokeObjectURL(link.href);
        }

        //рендерим список дистриктов в выпадающий список
        function loadHtmlDistrictsListAside(districtsListArray) {
            let districtListWrapper = document.querySelector('.controll-container__select-wrapper .select__list')
            districtListWrapper.innerHTML = ''

            for (let i = 0; i < districtsListArray.length; i++) {
                let newListElement = document.createElement('li')
                newListElement.classList.add('select__item')
                newListElement.setAttribute('data-value', districtsListArray[i].slug)
                newListElement.innerHTML = `${districtsListArray[i].title.rendered}`

                districtListWrapper.appendChild(newListElement)
            }
        }

        //рендерим список дистриктов в выпадающий список в шапке
        function loadHtmlDistrictsListHeader(districtsListArray) {
            let districtListWrapper = document.querySelector('.district-stat-select--header .select__list')
            districtListWrapper.innerHTML = ''

            for (let i = 0; i < districtsListArray.length; i++) {
                let newListElement = document.createElement('li')
                newListElement.classList.add('select__item')
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


        function loadHtmlSuper(data) {
            let superWrapper = document.querySelector('.super-wrap')
            superWrapper.style.display = 'block'
            let superWrapperList = document.querySelector('.super-wrap__list')

            let superUserComponentHtml = `
            <div class="section-users-container__user user-element">
                <img src="${data.acf.photo.url}" alt="" class="user-element__img">
                <div class="user-element__data">
                    <p class="user-element__name">${data.title.rendered}</p>
                    <ul class="user-element__contacts-list">
                        <li class="user-element__contacts-list-element">${data.acf.office_address}</li>
                        <li class="user-element__contacts-list-element">${data.acf.email}</li>
                        <li class="user-element__contacts-list-element">${data.acf.phone}</li>
                    </ul>
                </div>

            </div>
            `
            superWrapperList.insertAdjacentHTML('beforeend', superUserComponentHtml)

        }


        function loadHtmlMembers(data) {
            let membersList = data
            let membersWrapper = document.querySelector('.members-wrap')
            membersWrapper.style.display = 'block'
            let membersWrapperList = document.querySelector('.members-wrap__list')
            console.log(data.length)
            for (let i = 0; i < membersList.length; i++) {
                console.log(i)
                memberData = membersList[i]
                let memberUserComponentHtml = `
                <div class="section-users-container__user user-element">
                    <img src="${memberData.acf.photo.url}" alt="" class="user-element__img">
                    <div class="user-element__data">
                        <p class="user-element__name">${memberData.title.rendered}</p>
                        <ul class="user-element__contacts-list">
                            <li class="user-element__contacts-list-element">${memberData.acf.office_address}</li>
                            <li class="user-element__contacts-list-element">${memberData.acf.email}</li>
                            <li class="user-element__contacts-list-element">${memberData.acf.phone}</li>
                        </ul>
                    </div>

                </div>
                `
                membersWrapperList.insertAdjacentHTML('beforeend', memberUserComponentHtml)
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
                    const input = select.querySelector('.select__input'); // исправлено

                    document.querySelectorAll(".select__head").forEach(h => h.classList.remove("open"));
                    list.style.display = "none";

                    head.textContent = this.textContent;
                    if (input) input.value = this.getAttribute('data-value');

                    // ВАЖНО: диспатчим событие на реальном input
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
            const dataCurrentDistryctsOveralScore = currentDistrictYearListForChart.map(item => item.overall_score * 100);

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
                const dataCurrentDistryctsOveralScore = currentDistrictYearListForChart.map(item => item.overall_score * 100);


                if (dopDistrictYearListForChart && multiDistrictData == true) {

                    //создаем масив  годами
                    const labelsCurrentDopDistryctsYears = dopDistrictYearListForChart.map(item => item.year);

                    //создаем масив с значениями для графика
                    const dataCurrentDopDistryctsOveralScore = dopDistrictYearListForChart.map(item => item.overall_score * 100);



                    dataChart = {
                        // labels: ['2019', '2023', '2024'],
                        labels: labelsCurrentDistryctsYears,
                        datasets: [{
                            label: 'Overall Score',
                            // data: [+currentDistrictServerData[0].value, +currentDistrictServerData[1].value, +currentDistrictServerData[2].value],
                            data: dataCurrentDistryctsOveralScore,
                            borderWidth: 8,
                            borderColor: '#013364',
                        },

                        {
                            label: 'Overall Score',
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

            let currentScoreWrapper = document.querySelector('.graf-container__title--current')
            let dopScoreWrapper = document.querySelector('.graf-container__title--current-dop')

            let currentScoreValue = currentScoreWrapper.querySelector('.graf-container__title-value')
            let dopScoreValue = dopScoreWrapper.querySelector('.graf-container__title-value')


            //задаем значение для первоначальной загрузки
            currentScoreValue.innerHTML = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100) * 100) / 100

            //чекаем подгрузку нового дистрикта для сравнения
            document.addEventListener('LoadDopDataDistrict', () => {
                if (dopDistrictYearListForChart && multiDistrictData == true) {

                    let valueCurrent = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100) * 100) / 100
                    let valueDop = Math.floor((+dopDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100) * 100) / 100


                    currentScoreValue.innerHTML = valueCurrent
                    dopScoreValue.innerHTML = valueDop

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
                    currentScoreValue.innerHTML = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100) * 100) / 100
                    dopScoreWrapper.classList.remove('active')
                    currentScoreValue.classList.remove('green')
                    currentScoreValue.classList.remove('red')
                }
            })

            //чекаем смену ползунка
            document.addEventListener('changeRangeEvent', () => {
                if (dopDistrictYearListForChart && multiDistrictData == true) {
                    let valueCurrent = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100) * 100) / 100
                    let valueDop = Math.floor((+dopDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100) * 100) / 100


                    currentScoreValue.innerHTML = valueCurrent
                    dopScoreValue.innerHTML = valueDop

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
                    currentScoreValue.innerHTML = Math.floor((+currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100) * 100) / 100
                    dopScoreWrapper.classList.remove('active')
                    currentScoreValue.classList.remove('green')
                    currentScoreValue.classList.remove('red')
                }
            })

            console.log('currentDistrictYearListForChart', +currentDistrictYearListForChart[+currentSelectYearRangeValue].overall_score * 100, currentScoreValue)
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


            for (let i = 0; i < currentDistrictYearListForChart.length; i++) {
                let objectNewEnrollment = {

                    'year': +currentDistrictYearListForChart[i].year ?? '',

                    'data': [
                        {
                            'value': currentDistrictYearListForChart[i].overall_public_enrollment
                                ? +currentDistrictYearListForChart[i].overall_public_enrollment
                                : currentDistrictYearListForChart[i].overall_public_enrollment === 0
                                    ? 0
                                    : '-',
                            'value_number': currentDistrictYearListForChart[i].overall_public_enrollment
                                ? +currentDistrictYearListForChart[i].overall_public_enrollment
                                : currentDistrictYearListForChart[i].overall_public_enrollment === 0
                                    ? 0
                                    : null,
                            'title': 'Overall public enrollment'
                        },
                        {
                            'value': currentDistrictYearListForChart[i].percent_in_private_enrollment
                                ? +currentDistrictYearListForChart[i].percent_in_private_enrollment
                                : currentDistrictYearListForChart[i].percent_in_private_enrollment === 0
                                    ? 0
                                    : '-',
                            'title': 'Percent in Private enrollment (CDE)'
                        },
                        {
                            'value': currentDistrictYearListForChart[i].percent_in_charter_data
                                ? +currentDistrictYearListForChart[i].percent_in_charter_data
                                : currentDistrictYearListForChart[i].percent_in_charter_data === 0
                                    ? 0
                                    : '-',
                            'title': 'Percent in Charter data (on CDE website)'
                        },
                        {
                            'value': currentDistrictYearListForChart[i].percent_utilizing_open_enrollment
                                ? +currentDistrictYearListForChart[i].percent_utilizing_open_enrollment
                                : currentDistrictYearListForChart[i].percent_utilizing_open_enrollment === 0
                                    ? 0
                                    : '-',
                            'title': 'Percent Utilizing Open Enrollment'
                        },
                        {
                            'value': currentDistrictYearListForChart[i].absenteeism_rate
                                ? (Math.floor((+currentDistrictYearListForChart[i].absenteeism_rate * 100) * 100) / 100) + '%'
                                : currentDistrictYearListForChart[i].absenteeism_rate === 0
                                    ? 0
                                    : '-',
                            'title': 'Absenteeism Rate'
                        },
                    ]
                }

                let objectNewProficiency = {
                    'year': +currentDistrictYearListForChart[i].year ?? '',
                    'data': [
                        {
                            'value': currentDistrictYearListForChart[i].rates_of_3rd_grade_language_arts
                                ? +currentDistrictYearListForChart[i].rates_of_3rd_grade_language_arts
                                : currentDistrictYearListForChart[i].rates_of_3rd_grade_language_arts === 0
                                    ? 0
                                    : '-',
                            'title': 'Rates of 3rd Grade Language Arts'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].high_school_graduation_rate_within_6_years
                                ? +currentDistrictYearListForChart[i].high_school_graduation_rate_within_6_years
                                : currentDistrictYearListForChart[i].high_school_graduation_rate_within_6_years === 0
                                    ? 0
                                    : '-',
                            'title': 'High school graduation rate (within 6 years)'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].rates_of_3rd_grade_mathematics
                                ? +currentDistrictYearListForChart[i].rates_of_3rd_grade_mathematics
                                : currentDistrictYearListForChart[i].rates_of_3rd_grade_mathematics === 0
                                    ? 0
                                    : '-',
                            'title': 'Rates of 3rd Grade Mathematics'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].psat_average_score
                                ? +currentDistrictYearListForChart[i].psat_average_score
                                : currentDistrictYearListForChart[i].psat_average_score === 0
                                    ? 0
                                    : '-',
                            'title': 'PSAT Average Score'
                        },
                    ]
                }

                let objectNewFinancey = {
                    'year': +currentDistrictYearListForChart[i].year ?? '',
                    'data': [
                        {
                            'value': currentDistrictYearListForChart[i].spending_per_student
                                ? Math.trunc(+currentDistrictYearListForChart[i].spending_per_student)
                                : currentDistrictYearListForChart[i].spending_per_student === 0
                                    ? 0
                                    : '-',
                            'title': 'Spending per student'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].instructional_spending_total_share_of_spending
                                ? +currentDistrictYearListForChart[i].instructional_spending_total_share_of_spending
                                : currentDistrictYearListForChart[i].instructional_spending_total_share_of_spending === 0
                                    ? 0
                                    : '-',
                            'title': 'Instructional spending/ total share of spending'
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
                                ? (+currentDistrictYearListForChart[i].teacher_student_ratio).toFixed(1)
                                : currentDistrictYearListForChart[i].teacher_student_ratio === 0
                                    ? 0
                                    : '-',
                            'title': 'Teacher student ratio',
                            'type': 'more-one'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].staffing_administrative_staff
                                ? (+currentDistrictYearListForChart[i].staffing_administrative_staff).toFixed(0)
                                : currentDistrictYearListForChart[i].staffing_administrative_staff === 0
                                    ? 0
                                    : '-',
                            'value2': currentDistrictYearListForChart[i].staffing_instructional_staff
                                ? (+currentDistrictYearListForChart[i].staffing_instructional_staff).toFixed(0)
                                : currentDistrictYearListForChart[i].staffing_instructional_staff === 0
                                    ? 0
                                    : '-',
                            'title': 'Staffing - Administrative staff versus instructional staff',
                            'type': 'versus'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].ratio_of_psychologists_students
                                ? (+currentDistrictYearListForChart[i].ratio_of_psychologists_students).toFixed(0)
                                : currentDistrictYearListForChart[i].ratio_of_psychologists_students === 0
                                    ? 0
                                    : '-',
                            'title': 'Ratio of psychologists: students',
                            'type': 'more-one'
                        },

                        {
                            'value': currentDistrictYearListForChart[i].total_behavioral_incidents
                                ? (+currentDistrictYearListForChart[i].total_behavioral_incidents).toFixed(0)
                                : currentDistrictYearListForChart[i].total_behavioral_incidents === 0
                                    ? 0
                                    : '-',
                            'title': 'Total behavioral incidents'
                        },
                    ]
                }

                enrollmentAndChoiceCurrentDistrictArray.push(objectNewEnrollment)
                proficiencyCurrentDistrictArray.push(objectNewProficiency)
                financeyCurrentDistrictArray.push(objectNewFinancey)
                staffingCurrentDistrictArray.push(objectNewStaffing)
            }


            console.log('enrollmentAndChoiceCurrentDistrictArray', enrollmentAndChoiceCurrentDistrictArray)
            console.log('proficiencyCurrentDistrictArray', proficiencyCurrentDistrictArray)
            console.log('financeyCurrentDistrictArray', financeyCurrentDistrictArray)
            console.log('staffingCurrentDistrictArray', staffingCurrentDistrictArray)

            renderEnrollHtmlBox(1, enrollmentAndChoiceCurrentDistrictArray)
            renderProficiencyHtmlBox(1, proficiencyCurrentDistrictArray)
            renderFinanceyHtmlBox(1, financeyCurrentDistrictArray)
            renderStaffingHtmlBox(1, staffingCurrentDistrictArray)

            normalisationBoxInfoTitle()




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
                                        : '-',
                                'title': 'Overall public enrollment'
                            },
                            {
                                'value': dopDistrictYearListForChart[i].percent_in_private_enrollment
                                    ? +dopDistrictYearListForChart[i].percent_in_private_enrollment
                                    : dopDistrictYearListForChart[i].percent_in_private_enrollment === 0
                                        ? 0
                                        : '-',
                                'title': 'Percent in Private enrollment (CDE)'
                            },
                            {
                                'value': dopDistrictYearListForChart[i].percent_in_charter_data
                                    ? +dopDistrictYearListForChart[i].percent_in_charter_data
                                    : dopDistrictYearListForChart[i].percent_in_charter_data === 0
                                        ? 0
                                        : '-',
                                'title': 'Percent in Charter data (on CDE website)'
                            },
                            {
                                'value': dopDistrictYearListForChart[i].percent_utilizing_open_enrollment
                                    ? +dopDistrictYearListForChart[i].percent_utilizing_open_enrollment
                                    : dopDistrictYearListForChart[i].percent_utilizing_open_enrollment === 0
                                        ? 0
                                        : '-',
                                'title': 'Percent Utilizing Open Enrollment'
                            },
                            {
                                'value': dopDistrictYearListForChart[i].absenteeism_rate
                                    ? (Math.floor((+dopDistrictYearListForChart[i].absenteeism_rate * 100) * 100) / 100) + '%'
                                    : dopDistrictYearListForChart[i].absenteeism_rate === 0
                                        ? 0
                                        : '-',
                                'title': 'Absenteeism Rate'
                            },
                        ]
                    }

                    let objectNewProficiency = {
                        'year': +dopDistrictYearListForChart[i].year ?? '',
                        'data': [
                            {
                                'value': dopDistrictYearListForChart[i].rates_of_3rd_grade_language_arts
                                    ? +dopDistrictYearListForChart[i].rates_of_3rd_grade_language_arts
                                    : dopDistrictYearListForChart[i].rates_of_3rd_grade_language_arts === 0
                                        ? 0
                                        : '-',
                                'title': 'Rates of 3rd Grade Language Arts'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].high_school_graduation_rate_within_6_years
                                    ? +dopDistrictYearListForChart[i].high_school_graduation_rate_within_6_years
                                    : dopDistrictYearListForChart[i].high_school_graduation_rate_within_6_years === 0
                                        ? 0
                                        : '-',
                                'title': 'High school graduation rate (within 6 years)'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].rates_of_3rd_grade_mathematics
                                    ? +dopDistrictYearListForChart[i].rates_of_3rd_grade_mathematics
                                    : dopDistrictYearListForChart[i].rates_of_3rd_grade_mathematics === 0
                                        ? 0
                                        : '-',
                                'title': 'Rates of 3rd Grade Mathematics'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].psat_average_score
                                    ? +dopDistrictYearListForChart[i].psat_average_score
                                    : dopDistrictYearListForChart[i].psat_average_score === 0
                                        ? 0
                                        : '-',
                                'title': 'PSAT Average Score'
                            },
                        ]
                    }

                    let objectNewFinancey = {
                        'year': +dopDistrictYearListForChart[i].year ?? '',
                        'data': [
                            {
                                'value': dopDistrictYearListForChart[i].spending_per_student
                                    ? Math.trunc(+dopDistrictYearListForChart[i].spending_per_student)
                                    : dopDistrictYearListForChart[i].spending_per_student === 0
                                        ? 0
                                        : '-',
                                'title': 'Spending per student'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].instructional_spending_total_share_of_spending
                                    ? +dopDistrictYearListForChart[i].instructional_spending_total_share_of_spending
                                    : dopDistrictYearListForChart[i].instructional_spending_total_share_of_spending === 0
                                        ? 0
                                        : '-',
                                'title': 'Instructional spending/ total share of spending'
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
                                    ? (+dopDistrictYearListForChart[i].teacher_student_ratio).toFixed(1)
                                    : dopDistrictYearListForChart[i].teacher_student_ratio === 0
                                        ? 0
                                        : '-',
                                'title': 'Teacher student ratio',
                                'type': 'more-one'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].staffing_administrative_staff
                                    ? (+dopDistrictYearListForChart[i].staffing_administrative_staff).toFixed(0)
                                    : dopDistrictYearListForChart[i].staffing_administrative_staff === 0
                                        ? 0
                                        : '-',
                                'value2': dopDistrictYearListForChart[i].staffing_instructional_staff
                                    ? (+dopDistrictYearListForChart[i].staffing_instructional_staff).toFixed(0)
                                    : dopDistrictYearListForChart[i].staffing_instructional_staff === 0
                                        ? 0
                                        : '-',
                                'title': 'Staffing - Administrative staff versus instructional staff',
                                'type': 'versus'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].ratio_of_psychologists_students
                                    ? (+dopDistrictYearListForChart[i].ratio_of_psychologists_students).toFixed(0)
                                    : dopDistrictYearListForChart[i].ratio_of_psychologists_students === 0
                                        ? 0
                                        : '-',
                                'title': 'Ratio of psychologists: students',
                                'type': 'more-one'
                            },

                            {
                                'value': dopDistrictYearListForChart[i].total_behavioral_incidents
                                    ? (+dopDistrictYearListForChart[i].total_behavioral_incidents).toFixed(0)
                                    : dopDistrictYearListForChart[i].total_behavioral_incidents === 0
                                        ? 0
                                        : '-',
                                'title': 'Total behavioral incidents'
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



        //информ блок тип 1
        function htmlDataBoxV1(data) {
            let blueMob = false
            let customValueElement = ''

            if (data.type && data.type == 'more-one') {
                customValueElement = `${data.value}:1`
            }
            else if (data.type && data.type == 'versus') {
                customValueElement = `${data.value}/${data.value2}`
            }
            else {
                customValueElement = data.value
            }

            if (data.title == 'Overall public enrollment'
                || data.title == 'High school graduation rate (within 6 years)'
                || data.title == 'Spending per student') {
                blueMob = true
            }
            else {
                blueMob = false
            }

            let htmlCode = `
                <div
                class="district-data-element district-data-element-v1 ${blueMob ? 'district-data-element--blue-mod' : ''}">
                <div class="district-data-element-v1__wrapper">
                    <div class="district-data-element-v1__top-values">
                        <div class="district-data-element-v1__top-values-title">${data.title}</div>
                        <div class="district-data-element-v1__top-values-value">${customValueElement}</div>
                    </div>
                </div>

                

                <div class="district-data-element-info">
                    <div class="district-data-element-info__icon-wrapper">
                        <div
                            class="district-data-element-info__data-container  district-data-element-info__data-container--big">
                            <div class="district-data-element-info__data-container-wrapper">
                                <div
                                    class="district-data-element-info__data-container-wrapper-text">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    Maecenas nec convallis massa.
                                </div>
                            </div>
                        </div>

                        <div class="district-data-element-info__icon">
                            <svg width="10" height="9" viewBox="0 0 10 9" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0 1C0 0.447715 0.447715 0 1 0H9C9.55228 0 10 0.447715 10 1V6.5C10 7.05228 9.55228 7.5 9 7.5H6.70711L5.35355 8.85355C5.15829 9.04882 4.84171 9.04882 4.64645 8.85355L3.29289 7.5H1C0.447715 7.5 0 7.05228 0 6.5V1ZM9 1H1V6.5H3.5C3.63261 6.5 3.75979 6.55268 3.85355 6.64645L5 7.79289L6.14645 6.64645C6.24021 6.55268 6.36739 6.5 6.5 6.5H9V1Z"
                                    fill="#013364" />
                                <path
                                    d="M5.75 3.75C5.75 4.16421 5.41421 4.5 5 4.5C4.58579 4.5 4.25 4.16421 4.25 3.75C4.25 3.33579 4.58579 3 5 3C5.41421 3 5.75 3.33579 5.75 3.75Z"
                                    fill="#013364" />
                                <path
                                    d="M7.75 3.75C7.75 4.16421 7.41421 4.5 7 4.5C6.58579 4.5 6.25 4.16421 6.25 3.75C6.25 3.33579 6.58579 3 7 3C7.41421 3 7.75 3.33579 7.75 3.75Z"
                                    fill="#013364" />
                                <path
                                    d="M3.75 3.75C3.75 4.16421 3.41421 4.5 3 4.5C2.58579 4.5 2.25 4.16421 2.25 3.75C2.25 3.33579 2.58579 3 3 3C3.41421 3 3.75 3.33579 3.75 3.75Z"
                                    fill="#013364" />
                            </svg>

                        </div>
                    </div>
                </div>

            </div>
            `

            return htmlCode
        }

        //информ блок тип 2
        function htmlDataBoxV2(data, data2) {
            let blueMob = false
            let riseMod = null

            let customValueElement = ''

            if (data.type && data.type == 'more-one') {

                if (data.value == '-') {
                    customValueElement = '-'
                }
                else {

                    customValueElement = `${data.value}:1`
                }

            }
            else if (data.type && data.type == 'versus') {
                customValueElement = `${data.value}/${data.value2}`
            }
            else {
                customValueElement = data.value
            }

            let customValueElement2 = ''

            if (data2.type && data2.type == 'more-one') {
                if (data2.value == '-') {
                    customValueElement2 = '-'
                }
                else {

                    customValueElement2 = `${data2.value}:1`
                }
            }
            else if (data2.type && data2.type == 'versus') {
                customValueElement2 = `${data2.value}/${data2.value2}`
            }
            else {
                customValueElement2 = data2.value
            }


            if (data.title == 'Overall public enrollment'
                || data.title == 'High school graduation rate (within 6 years)'
                || data.title == 'Spending per student') {
                blueMob = true
            }
            else {
                blueMob = false
            }

            if (data.value > data2.value) {
                riseMod = true
            }
            else if (data.value < data2.value) {
                riseMod = false
            }
            else {
                riseMod = null
            }

            if (data.title == 'Staffing - Administrative staff versus instructional staff') {
                riseMod = null
            }



            let htmlCode = `
                <div class="district-data-element district-data-element-v2 
                ${blueMob ? 'district-data-element--light-blue-mod' : ''}
                ${riseMod == true ? 'district-data-element--rise-mod' : ''}
                ${riseMod == false ? 'district-data-element--down-mod' : ''}   
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


                <div class="district-data-element-info">
                    <div class="district-data-element-info__icon-wrapper">
                        <div
                            class="district-data-element-info__data-container  district-data-element-info__data-container--big">
                            <div class="district-data-element-info__data-container-wrapper">
                                <div
                                    class="district-data-element-info__data-container-wrapper-text">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    Maecenas nec convallis massa.
                                </div>

                            </div>
                        </div>

                        <div class="district-data-element-info__icon">
                            <svg width="10" height="9" viewBox="0 0 10 9" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0 1C0 0.447715 0.447715 0 1 0H9C9.55228 0 10 0.447715 10 1V6.5C10 7.05228 9.55228 7.5 9 7.5H6.70711L5.35355 8.85355C5.15829 9.04882 4.84171 9.04882 4.64645 8.85355L3.29289 7.5H1C0.447715 7.5 0 7.05228 0 6.5V1ZM9 1H1V6.5H3.5C3.63261 6.5 3.75979 6.55268 3.85355 6.64645L5 7.79289L6.14645 6.64645C6.24021 6.55268 6.36739 6.5 6.5 6.5H9V1Z"
                                    fill="#013364" />
                                <path
                                    d="M5.75 3.75C5.75 4.16421 5.41421 4.5 5 4.5C4.58579 4.5 4.25 4.16421 4.25 3.75C4.25 3.33579 4.58579 3 5 3C5.41421 3 5.75 3.33579 5.75 3.75Z"
                                    fill="#013364" />
                                <path
                                    d="M7.75 3.75C7.75 4.16421 7.41421 4.5 7 4.5C6.58579 4.5 6.25 4.16421 6.25 3.75C6.25 3.33579 6.58579 3 7 3C7.41421 3 7.75 3.33579 7.75 3.75Z"
                                    fill="#013364" />
                                <path
                                    d="M3.75 3.75C3.75 4.16421 3.41421 4.5 3 4.5C2.58579 4.5 2.25 4.16421 2.25 3.75C2.25 3.33579 2.58579 3 3 3C3.41421 3 3.75 3.33579 3.75 3.75Z"
                                    fill="#013364" />
                            </svg>

                        </div>
                    </div>
                </div>

            </div>
            `

            return htmlCode
        }

        //информ блок тип 3
        function htmlDataBoxV3(data, dataDop) {
            let blueMob = false
            let riseMod1 = null
            let riseMod2 = null


            let customValueElement = ''

            if (data.type && data.type == 'more-one') {

                if (data.value == '-') {
                    customValueElement = '-'
                }
                else {

                    customValueElement = `${data.value}:1`
                }

            }
            else if (data.type && data.type == 'versus') {
                customValueElement = `${data.value}/${data.value2}`
            }
            else {
                customValueElement = data.value
            }

            let customValueElement2 = ''

            if (dataDop.type && dataDop.type == 'more-one') {
                if (dataDop.value == '-') {
                    customValueElement2 = '-'
                }
                else {

                    customValueElement2 = `${dataDop.value}:1`
                }
            }
            else if (dataDop.type && dataDop.type == 'versus') {
                customValueElement2 = `${dataDop.value}/${dataDop.value2}`
            }
            else {
                customValueElement2 = dataDop.value
            }



            if (data.title == 'Overall public enrollment'
                || data.title == 'High school graduation rate (within 6 years)'
                || data.title == 'Spending per student') {
                blueMob = true
            }
            else {
                blueMob = false
            }

            let val1 = parseFloat(data.value.toString().replace(/[^\d.-]/g, ''));
            let val2 = parseFloat(dataDop.value.toString().replace(/[^\d.-]/g, ''));

            if (val1 < val2) {
                riseMod1 = false;
            } else if (val1 > val2) {
                riseMod1 = true;
            }

            if (data.title == 'Staffing - Administrative staff versus instructional staff') {
                riseMod1 = null
            }

            if (dataDop.title == 'Staffing - Administrative staff versus instructional staff') {
                riseMod2 = null
            }


            let htmlCode = `
                <div
                class="district-data-element district-data-element-v2 district-data-element-v2--dop district-data-element-v2--no-border
                ${blueMob ? 'district-data-element--light-blue-mod' : ''}
                ">

                <div class="district-data-element-v2__current">
                    <div class="district-data-element-v2__current-top">
                        <p class="district-data-element-v2__current-title">${data.title}</p>
                        
                    </div>


                    <div class="district-data-element-v2__values-row">

                        <div class="district-data-element-v2__value-claster 
                        ${riseMod1 == false ? 'district-data-element--down-mod' : ''}
                        ${riseMod1 == true ? 'district-data-element--rise-mod' : ''} 
                        ">
                            <p class="district-data-element-v2__value-claster-title">CURRENT
                                DISTRICT</p>
                            <div class="district-data-element-v2__current-value-row">

                                <div class="district-data-element-v2__current-value">${customValueElement}
                                </div>
                            </div>
                        </div>

                        <div
                            class="district-data-element-v2__value-claster 
                            ${riseMod1 == true ? 'district-data-element--down-mod' : ''}
                            ${riseMod1 == false ? 'district-data-element--rise-mod' : ''} 
                            ">
                            <p class="district-data-element-v2__value-claster-title">CO
                                STATE AVG.</p>
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

        


            </div>
            `

            return htmlCode
        }

        //информ блок тип 4
        function htmlDataBoxV4(data, data2, dataDop, dataDop2) {
            let blueMob = false
            let riseMod1 = null
            let riseMod2 = null

            let customValueElement = ''

            if (data.type && data.type == 'more-one') {

                if (data.value == '-') {
                    customValueElement = '-'
                }
                else {

                    customValueElement = `${data.value}:1`
                }

            }
            else if (data.type && data.type == 'versus') {
                customValueElement = `${data.value}/${data.value2}`
            }
            else {
                customValueElement = data.value
            }

            let customValueElement2 = ''

            if (data2.type && data2.type == 'more-one') {
                if (data2.value == '-') {
                    customValueElement2 = '-'
                }
                else {

                    customValueElement2 = `${data2.value}:1`
                }
            }
            else if (data2.type && data2.type == 'versus') {
                customValueElement2 = `${data2.value}/${data2.value2}`
            }
            else {
                customValueElement2 = data2.value
            }


            let customValueElementDop = ''

            if (dataDop.type && dataDop.type == 'more-one') {
                if (data2.value == '-') {
                    customValueElementDop = '-'
                }
                else {

                    customValueElementDop = `${dataDop.value}:1`
                }
            }
            else if (dataDop.type && dataDop.type == 'versus') {
                customValueElementDop = `${dataDop.value}/${dataDop.value2}`
            }
            else {
                customValueElementDop = dataDop.value
            }


            let customValueElementDop2 = ''

            if (dataDop2.type && dataDop2.type == 'more-one') {
                if (data2.value == '-') {
                    customValueElementDop2 = '-'
                }
                else {

                    customValueElementDop2 = `${dataDop2.value}:1`
                }
            }
            else if (dataDop2.type && dataDop2.type == 'versus') {
                customValueElementDop2 = `${dataDop2.value}/${dataDop2.value2}`
            }
            else {
                customValueElementDop2 = dataDop2.value
            }




            if (data.title == 'Overall public enrollment'
                || data.title == 'High school graduation rate (within 6 years)'
                || data.title == 'Spending per student') {
                blueMob = true
            }
            else {
                blueMob = false
            }

            let val1 = parseFloat(data.value.toString().replace(/[^\d.-]/g, ''));
            let val2 = parseFloat(dataDop.value.toString().replace(/[^\d.-]/g, ''));

            if (val1 < val2) {
                riseMod1 = false;
            } else if (val1 > val2) {
                riseMod1 = true;
            }


            if (data.title == 'Staffing - Administrative staff versus instructional staff') {
                riseMod1 = null
            }

            if (dataDop.title == 'Staffing - Administrative staff versus instructional staff') {
                riseMod2 = null
            }


            let htmlCode = `
                <div class="district-data-element district-data-element-v2 district-data-element-v2--dop 
                ${blueMob ? 'district-data-element--light-blue-mod' : ''}
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
                            ${riseMod1 == true ? 'district-data-element--down-mod' : ''}
                            ${riseMod1 == false ? 'district-data-element--rise-mod' : ''} 
                            ">
                            <p class="district-data-element-v2__value-claster-title">CO
                                STATE AVG.</p>
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




            </div>
            `

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

                        <div
                            class="acordeon-data-claster__chart-diagram-wrapper-chart-1 ">
                            <canvas id="financeChart4"
                                class=" graf-container__chart stat-district-chart"></canvas>
                        </div>

                    </div>

                    <div
                        class="acordeon-data-claster__chart-diagram-wrapper acordeon-data-claster__chart-diagram-wrapper--small">

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
                            CO STATE AVG.
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















    }










});