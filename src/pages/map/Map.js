import { Page } from "../../framework/Page.js";
import AMapLoader from '@amap/amap-jsapi-loader';
import { Http } from "../../util/Http.js";
import mapPng from '../../../public/images/map-blue.png'
import { CacheService } from "../../CacheService.js";

export class Map extends Page {

    async onShow() {
        let { AMap, map } = await this.initMap();

        let markers = await this.getMarkers(AMap);
        map.add(markers);
        map.setFitView();
    }

    /**
     *
     * @returns {Promise<AMap.Marker[]>}
     */
    async getMarkers(AMap) {
        let res = await Http.get(`map/markers`);
        if (!res.data || res.data.length === 0) {
            return []
        }
        layui.$(`.communities`).html(res.data.length)
        return res.data.map(data => {
            let marker = new AMap.Marker({
                position: new AMap.LngLat(data.lng, data.lat),
                title: data.name,
                extData: data,
                label: {
                    content: data.name
                },
                icon: new AMap.Icon({
                    size: new AMap.Size(40, 40),
                    image: mapPng,
                    imageSize: new AMap.Size(40, 40)
                })
            });
            marker.on('click', function (e) {
                console.log(e)
            });
            return marker;
        })
    }

    async initMap() {
        window._AMapSecurityConfig = { securityJsCode: "1653815f7167806711393b5f8ca26740", }
        let AMap = await AMapLoader.load({
            key: CacheService.systemConfig[CacheService.cacheKey.configSubKey.aMapKeyWebPage],
            version: "2.0",
            plugins: [ 'AMap.ToolBar', 'AMap.Scale', 'AMap.MapType' ]
        });
        const map = new AMap.Map('communityMap', {
            zoom: 10,
            viewMode: '3D',
            showIndoorMap: false,
        });
        let toolbar = new AMap.ToolBar();
        map.addControl(toolbar);
        let scale = new AMap.Scale();
        map.addControl(scale);
        let mapType = new AMap.MapType();
        map.addControl(mapType);
        return { AMap, map };
    }
}
