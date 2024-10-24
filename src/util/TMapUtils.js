export class TMapUtils {
    selectAddr(el) {

        layui.util.event('lay-event', {
            map: function () {
                let location = undefined
                layui.layer.open({
                    title: "选择定位"
                    , type: 1
                    , content: `<div class="map" id="selectAddrMap" style="width: 100%; height: 100%;"></div>`
                    , area: ['950px', '650px']
                    , btn: ['保存', '取消']
                    , shadeClose: false
                    , btnAlign: 'c'
                    , success: function (layero, index) {
                        let map = new TMap.Map('selectAddrMap', {
                            zoom: 14
                        });
                        let ipLocation = new TMap.service.IPLocation();
                        ipLocation
                            .locate({})
                            .then((result2) => {
                                map.setCenter(result2.result.location);
                            })
                            .catch((error) => {
                                console.error('定位失败', error)
                            });

                        //初始化marker图层
                        let markerLayer = new TMap.MultiMarker({
                            id: 'marker-layer',
                            map: map
                        });
                        map.on('click', (evt) => {
                            let lat = evt.latLng.getLat().toFixed(6);
                            let lng = evt.latLng.getLng().toFixed(6);
                            location = { lat, lng }
                            markerLayer.setGeometries([])
                            markerLayer.add({ position: evt.latLng });
                        })
                    },
                    yes: function (index, layero) {
                        if (!location) {
                            layui.layer.msg("你还没选择位置！");
                            return false;
                        }
                        layui.$(el).val(location.lng + ',' + location.lat);
                        layui.layer.close(index);
                    }
                })
            }
        });
    }
}
