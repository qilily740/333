# 地图与城市数据维护

以下命令均从仓库根目录执行。工具会写入指定输出文件；更新后请核对文件差异。数据来源与许可见 [assets/EARTH-SOURCES.md](../../assets/EARTH-SOURCES.md)。

| 工具 | 用途 | 环境 |
| --- | --- | --- |
| [build-earth-paper.py](build-earth-paper.py) | 将 Natural Earth 陆地多边形转为地图 SVG | Python 3 标准库 |
| [build-earth-city-aliases.swift](build-earth-city-aliases.swift) | 为城市资料补充简体中文别名 | Swift、Foundation |
| [enrich-earth-cities.py](enrich-earth-cities.py) | 为城市资料补充 GeoNames 人口及地理类别 | Python 3 标准库 |

```sh
python3 tools/earth/build-earth-paper.py /path/ne_110m_land.zip assets/earth-paper.svg
swift -module-cache-path /tmp/iris-earth-swift-cache tools/earth/build-earth-city-aliases.swift assets/earth-cities.json
python3 tools/earth/enrich-earth-cities.py assets/earth-cities.json /path/cities15000.zip
```

地球运行代码位于 [earth-core.js](../../scripts/earth-core.js) 与 [earth.js](../../scripts/earth.js)，双人旅行地图位于 [travel-map.js](../../scripts/travel-map.js)。
