import AMapLoader from '@amap/amap-jsapi-loader';
import mapBluePng from "../../public/images/map-blue.png";
import { CacheService } from "../CacheService.js";

export class CommunityMapUtil {

    static dom = `
        <div>
            <div class="layui-form">
                <input type="text" id="queryInput" name="" placeholder="请输入小区名称查询" class="layui-input">
            </div>
            <div id="communityMap" style="width: 900px;height: ${ 600 - 146 }px"></div>
        </div>
    `

    static getAddr(addr) {
        return new Promise((resolve, reject) => {
            let selectAddr = addr;
            layui.layer.open({
                title: `选择小区`
                , type: 1
                , content: CommunityMapUtil.dom
                , area: ['900px', '600px']
                , btn: ['绑定', '取消']
                , resize: false
                , btnAlign: 'c'
                , success: async () => {
                    layui.form.render();
                    let { AMap, map, autoComplete, placeSearch, geocoder } = await CommunityMapUtil.initMap();
                    // 回显选择的点
                    let marker;
                    if (selectAddr) {
                        map.setCenter(new AMap.LngLat(selectAddr.lng, selectAddr.lat))
                        marker = new AMap.Marker({
                            position: new AMap.LngLat(selectAddr.lng, selectAddr.lat),
                            title: selectAddr.name,
                            label: { content: selectAddr.name },
                            icon: new AMap.Icon({ size: new AMap.Size(30, 30), image: mapBluePng, imageSize: new AMap.Size(30, 30) })
                        });
                        map.add(marker)
                    }
                    // 手动选点
                    map.on('click', (e) => {
                        console.log(e)
                        if (marker) marker.remove()
                        marker = new AMap.Marker({
                            position: new AMap.LngLat(e.lnglat.lng, e.lnglat.lat),
                            icon: new AMap.Icon({
                                size: new AMap.Size(30, 30),
                                image: mapBluePng,
                                imageSize: new AMap.Size(30, 30)
                            })
                        });
                        map.add(marker);
                        geocoder.getAddress(new AMap.LngLat(e.lnglat.lng, e.lnglat.lat), (status, result) => {
                            console.log(status)
                            console.log(result)
                            if (status === 'error') {
                                layui.layer.msg(`地址解析失败：${ result }`)
                                return
                            }
                            let addressComponent = result.regeocode.addressComponent
                            let poi = result.regeocode.pois[0]
                            let aoi = result.regeocode.aois[0]
                            selectAddr = {
                                prov: addressComponent.province,
                                city: addressComponent.city,
                                zone: addressComponent.district,
                                addr: addressComponent.township + poi?.address + poi?.name,
                                name: poi?.name,
                                commId: aoi?.id,
                                lng: poi?.location.lng,
                                lat: poi?.location.lat,
                                adcode: aoi?.adcode
                            }
                        });

                    })
                    autoComplete.on("select", (e) => {
                        placeSearch.setCity(e.poi.adcode);
                        placeSearch.search(e.poi.name, (status, result) => {
                            if (status === 'error') {
                                layui.layer.msg(`地图搜索失败：${ result }`)
                                return
                            }
                            if (result.info === 'OK' && result.poiList.count === 1) {
                                selectAddr = CommunityMapUtil.copyAddrInfo(result.poiList.pois[0])
                            }
                        });
                    });
                    placeSearch.on("markerClick", (e) => {
                        selectAddr = CommunityMapUtil.copyAddrInfo(e.data)
                    })
                }
                , yes: function (index) {
                    if (selectAddr === undefined) {
                        layui.layer.msg(`您还未选择小区，请先选择一个小区`)
                        return false
                    } else {
                        layui.layer.close(index)
                    }
                }
                , end: () => {
                    resolve(selectAddr)
                }
            })
        })
    }

    static copyAddrInfo(poiInfo) {
        return {
            prov: poiInfo.pname,
            city: poiInfo.cityname,
            zone: poiInfo.adname,
            addr: poiInfo.address,
            name: poiInfo.name,
            commId: poiInfo.id,
            lng: poiInfo.location.lng,
            lat: poiInfo.location.lat,
            adcode: poiInfo.adcode
        }
    }


    static async initMap() {
        window._AMapSecurityConfig = { securityJsCode: "3e2ec049faa4cc623386c43bd1a8042a", }
        let AMap = await AMapLoader.load({ key: CacheService.systemConfig[CacheService.cacheKey.configSubKey.aMapKeyWebPage], version: "2.0", });
        const map = new AMap.Map('communityMap', { resizeEnable: true });
        setTimeout(() => {
            layui.$(`.amap-sug-result`).css('z-index', layui.layer.zIndex + 1)
        }, 100)
        let { autoComplete, placeSearch, geocoder } = await CommunityMapUtil.loadPlugin(AMap, map);
        return { AMap, map, autoComplete, placeSearch, geocoder }
    }

    static async loadPlugin(AMap, map) {
        return new Promise((resolve, reject) => {
            AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete', 'AMap.Geocoder'], () => {
                let autoComplete = new AMap.AutoComplete({
                    input: "queryInput",
                    type: '120000|120100|120200|120201|120202|120203|120300|120301|120302|120303|120304|190700',
                    datatype: 'poi'
                });
                let placeSearch = new AMap.PlaceSearch({
                    map: map,
                    type: '商务住宅',
                    autoFitView: true
                });
                autoComplete.on('error', e => {
                    if (e.type === 'error' && e.info === 'USER_DAILY_QUERY_OVER_LIMIT') {
                        layui.layer.msg(`输入提示API流量已使用完，请联系管理员充值`)
                    }
                })
                let geocoder = new AMap.Geocoder({
                    radius: 1,
                    extensions: "all" //返回地址描述以及附近兴趣点和道路信息，默认“base”
                });
                return resolve({ autoComplete, placeSearch, geocoder })
            })
        });
    }
}
