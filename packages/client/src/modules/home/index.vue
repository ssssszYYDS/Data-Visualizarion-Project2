<!-- index.vue -->
<template>
</template>

<script>
import { useRouter } from 'vue-router';
import HttpHelper from '../../common/utils/axios_helper';
import Urls from '../../common/urls/index';

export default {
	name: 'Mapcomponent',

	props: {
		date: {
			type: String,
			required: true,
		},
		selectedId1: {
			required: true,
		},
		selectedId2: {
			required: true,
		},
	},

	data() {
		return {
			svg: null, // SVG图
			width: null, // SVG图 宽度
			height: null, // SVG图 高度
			buildings: null, // 建筑物数据
			initBuildingsOpacitySplit: 0.3, // 建筑物透明度的最低值
			transports: null, // 交通数据
			xScale: null, // x坐标比例尺
			yScale: null, // y坐标比例尺
			speedColorScale: d3.scaleLinear() // 速度颜色映射
				.domain([250, 350, 470])
				.range(["FF4F4D", "#FF8742", "#9BFF85"]),
			timeScale: null, // 时间比例尺
			curTime: d3.timeParse('%Y-%m-%d %H:%M:%S')(this.date + ' 00:00:00').getTime(), // 当前时间, 例: 2023-03-03 00:00:00
			relativeDay: null, // 当前时间相对于一天的比例, [0, 1]
			curRealTime: null, // 当前真实时间
		};
	},

	async mounted() {
		await this.initBuildings();
		await this.initTransports(this.date);
		this.defineGlowEffect()
		this.drawTimeline();
	},

	watch: {
		date: async function (newDate) {
			await this.initTransports(newDate);
			this.drawTimeText();
		},
		selectedId1: async function (newId) {
			this.drawTransportsTracePlot(this.selectedId1.id, this.selectedId1.label, this.selectedId2.id, this.selectedId2.label);
		},
		selectedId2: async function (newId) {
			this.drawTransportsTracePlot(this.selectedId1.id, this.selectedId1.label, this.selectedId2.id, this.selectedId2.label);
		},
	},


	methods: {
		async initBuildings() {
			try {
				const buildings = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/building.csv' });
				this.buildings = buildings


				console.log("buildings data: ");
				console.log(buildings);

				if (buildings != null) {
					this.drawBuildings(buildings);
				} else {
					console.error("Failed to load buildings data:", buildings);
				}
			} catch (error) {
				console.error("Failed to load buildings data:", error);
			}
		},

		async initBuildingsOpacityByApartment(buildings, split) {
			// 根据租金设置建筑物的透明度
			const apartments = await HttpHelper.post(Urls.getCSVData, { path: 'Attributes/Apartments.csv' });
			const rents = apartments.map(apt => parseFloat(apt.rentalCost));
			const minRent = Math.min(...rents);
			const maxRent = Math.max(...rents);

			buildings.forEach((building) => {
				const apartment = apartments.find((apt) => apt.buildingId === building.buildingId);
				if (apartment) {
					const rent = parseFloat(apartment.rentalCost);
					const opacity = (rent - minRent) / (maxRent - minRent) * (1 - split) + split;
					building.opacity = opacity;
				} else {
					building.opacity = 100;
				}
			});
		},

		async initBuildingsOpacityByCheckin(buildings, split) {
			// 根据checkin设置建筑物的透明度
			const checkinJournalCounts = await HttpHelper.post(Urls.getCSVData, { path: 'Journals/CheckinJournalCounts.csv' });
			var maxJournals = 0;
			Object.keys(checkinJournalCounts).forEach((key) => {
				maxJournals = Math.max(maxJournals, parseInt(checkinJournalCounts[key].count))
			});
			const k = -2500;
			const a = (-(1 - split) * maxJournals + Math.sqrt(((1 - split) * maxJournals) ** 2 - 4 * (1 - split) * maxJournals * k)) / (1 - split) / 2;
			const b = split - k / a;
			buildings.forEach((building) => {
				if (checkinJournalCounts[building.buildingId] == null)
					building.opacity = 0.3;
				else {
					const number = parseInt(checkinJournalCounts[building.buildingId].count);
					// building.opacity = number / maxJournals * 0.7 + 0.3;
					building.opacity = k / (number + a) + b;
				}
			});
		},

		async drawBuildings(data) {
			this.removeSvg();

			const coordinates = data.flatMap(d => d.location.split(", ").map(point => {
				const [x, y] = point.split(" ").map(parseFloat);
				return [x, y];
			}));

			const xValues = coordinates.map(point => point[0]);
			const yValues = coordinates.map(point => point[1]);
			const min_x = Math.min(...xValues);
			const max_x = Math.max(...xValues);
			const min_y = Math.min(...yValues);
			const max_y = Math.max(...yValues);

			this.width = d3.select("#chart").node().getBoundingClientRect().width;
			this.height = d3.select("#chart").node().getBoundingClientRect().height;
			const picture_range = 1.0;

			const buildingType2color = {
				"Commercial": "#9EFAFF",   // 兰青色
				"Residental": '#FF61D0',//"#8B4513",   // 红棕色
				"School": "#32CD32",       // 草绿色
				"Other": "#000000"         // 黑色
			};


			this.svg = d3.select("#chart").append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.style("background-color", "#404a59")
				.style("border", "0px solid white")
				.style("border-radius", "10px");

			this.xScale = d3.scaleLinear()
				.domain([min_x, max_x])
				.range([this.width * (1 - picture_range) / 2, this.width - this.width * (1 - picture_range) / 2]);
			this.yScale = d3.scaleLinear()
				.domain([min_y, max_y])
				.range([0, this.height * picture_range]);

			// await this.initBuildingsOpacityByApartment(buildings, this.initBuildingsOpacitySplit); // 根据租金设置建筑物的透明度
			await this.initBuildingsOpacityByCheckin(this.buildings, this.initBuildingsOpacitySplit); // 根据checkin设置建筑物的透明度

			this.svg.selectAll("polygon")
				.data(data)
				.enter()
				.append("polygon")
				.attr("points", d => d.location.split(", ").map(point => {
					const [x, y] = point.split(" ").map(parseFloat);
					return this.xScale(x) + " " + this.yScale(y);
				}).join(" "))
				.attr("fill", d => buildingType2color[d.buildingType])
				.attr("fill-opacity", d => d.opacity)
				.attr("stroke", "#D1F0FF")// pale blue
				.attr("stroke-width", 0.5)
				.attr("stroke-opacity", d => d.opacity)
				.on("mouseover", (event, d) => {
					d3.select(event.currentTarget)
						.attr("fill", "orange")
						.attr("fill-opacity", 1.0)
						.attr("stroke-width", 1.2)
						.attr("stroke-opacity", 1.0);
				})
				.on("mouseout", (event, d) => {
					d3.select(event.currentTarget)
						.attr("fill", buildingType2color[d.buildingType])
						.attr("fill-opacity", d.opacity)
						.attr("stroke-width", 0.8)
						.attr("stroke-opacity", d.opacity);
				});
		},

		removeSvg() {
			if (this.svg) {
				this.svg.remove();
				this.svg = null;
			}
		},

		// date format: '2023-03-03', range: '2022-03-01' to '2023-05-24'
		async initTransports(date) {
			try {
				const transportsData = await HttpHelper.post(Urls.getCSVData, { path: `CSVData/Transports/transports_${date}.csv` });

				// Parse the time
				var parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
				transportsData.forEach(function (d) {
					d.timeStamp = parseTime(d.day + ' ' + d.time);
					d.timeStampFloat = d.timeStamp.getTime();
				});


				this.timeScale = d3.scaleTime()
					.domain([0, this.width])
					.range([parseTime(this.date + ' 00:00:00').getTime(), parseTime(this.date + ' 23:55:00').getTime()]);

				this.transports = transportsData
				console.log("transports data: ");
				console.log(this.transports);
				if (transportsData != null) {
					this.clearTransportsScatterPlot();

					// 绘制轨迹图
					if (this.selectedId1 != 'null')
						this.drawTransportsTracePlot(this.selectedId1.id, this.selectedId1.label);
					if (this.selectedId2 != 'null')
						this.drawTransportsTracePlot(this.selectedId2.id, this.selectedId2.label);
				} else {
					console.error("Failed to load transports data:", transportsData);
				}
			} catch (error) {
				console.error("Failed to load transports data:", error);
			}
		},

		drawTimeline() {
			this.clearTimeline();

			// 设置时间轴和时间轴滑块
			this.timeline = d3.select(".timeline")
				.attr("class", "timeline")
				.style("width", "100%")
				.style("height", "100%")
				.style("border", "1px solid white")
				.style("background-color", "grey")
				.style("border-radius", "10px");
			this.handle = this.timeline.append("div")
				.attr("class", "handle")
				.style("position", "relative")
				.style("left", "0px")
				.style("top", "0px")
				.style("width", "10px")
				.style("height", "100%")
				.style("border-radius", "4px")
				.style("background-color", "white");

			this.drawTimeText();

			// 定义拖拽行为
			this.handle.call(d3.drag()
				.on("drag", (event) => {
					var startTime = new Date().getTime();

					var x = event.x;
					var max_x = this.width - this.handle.node().getBoundingClientRect().width;
					x = Math.max(0, Math.min(x, max_x));
					this.handle.style("left", x + "px");

					this.relativeDay = x / max_x;
					this.curTime = x / max_x * (this.timeScale.range()[1] - this.timeScale.range()[0]) + this.timeScale.range()[0];
					var selectData = this.selectDataByCurTime(this.curTime);
					this.drawTransportsScatterPlot(selectData);

					this.svg.selectAll("text")
						.text(this.curRealTime);

					console.log("drag consuming time: " + (new Date().getTime() - startTime) + "ms");
				}));
		},

		clearTimeline() {
			if (this.svg)
				this.svg.selectAll("text")
					.remove();
			if (this.timeline) {
				this.timeline.remove();
				this.timeline = null;
			}
			if (this.handle) {
				this.handle.remove();
				this.handle = null;
			}
		},

		drawTimeText() {
			this.clearTimeText();
			this.curRealTime = this.date + d3.timeFormat(' %H:%M:%S')(new Date(this.curTime));
			this.svg.append("text")
				.attr("x", "95%")
				.attr("y", "95%")
				.attr("text-anchor", "end")
				.attr("dominant-baseline", "bottom")
				.style("font-size", "30px")
				.attr("font-family", "Arial, Helvetica, sans-serif")
				.attr("font-weight", "bold")
				.attr("fill", "#fff") // 设置字体颜色为白色
				.text(this.curRealTime);
		},

		clearTimeText() {
			if (this.svg)
				this.svg.selectAll("text")
					.remove();
		},


		selectDataByCurTime(curTime) {
			var leftMaxTimeStamp = parseFloat(d3.max(this.transports, d => d.timeStampFloat <= curTime ? d.timeStampFloat : -Infinity));
			var rightMinTimeStamp = parseFloat(d3.min(this.transports, d => d.timeStampFloat >= curTime ? d.timeStampFloat : Infinity));
			// 边缘情况
			if (leftMaxTimeStamp == rightMinTimeStamp)
				if (parseFloat(d3.min(this.transports, d => d.timeStampFloat > curTime ? d.timeStampFloat : Infinity)) == Infinity) {
					leftMaxTimeStamp = parseFloat(d3.max(this.transports, d => d.timeStampFloat < curTime ? d.timeStampFloat : -Infinity));
					rightMinTimeStamp = parseFloat(d3.min(this.transports, d => d.timeStampFloat >= curTime ? d.timeStampFloat : Infinity));
				} else {
					leftMaxTimeStamp = parseFloat(d3.max(this.transports, d => d.timeStampFloat <= curTime ? d.timeStampFloat : -Infinity));
					rightMinTimeStamp = parseFloat(d3.min(this.transports, d => d.timeStampFloat > curTime ? d.timeStampFloat : Infinity));
				}

			var leftSelectedData = this.transports.filter(d => d.timeStampFloat === leftMaxTimeStamp);
			var rightSelectedData = this.transports.filter(d => d.timeStampFloat === rightMinTimeStamp);
			var curRelativeTime = (curTime - leftMaxTimeStamp) / (rightMinTimeStamp - leftMaxTimeStamp);

			var timeFormat = d3.timeFormat('%Y-%m-%d %H:%M:%S');
			this.curRealTime = timeFormat(new Date(curTime));
			var selectData = leftSelectedData.filter(leftData =>
				rightSelectedData.some(rightData => rightData.participantId === leftData.participantId)
			).map(leftData => {
				var rightData = rightSelectedData.find(d => d.participantId === leftData.participantId);
				var tempData = {};
				tempData.participantId = leftData.participantId;
				tempData.timeStampFloat = curTime;
				tempData.timeStamp = this.curRealTime;
				tempData.loc_x = (1 - curRelativeTime) * leftData.loc_x + curRelativeTime * rightData.loc_x;
				tempData.loc_y = (1 - curRelativeTime) * leftData.loc_y + curRelativeTime * rightData.loc_y;
				// speed = sqrt((x1 - x2) ^ 2 + (y1 - y2) ^ 2)
				// tempData.speed = Math.sqrt((leftData.loc_x - rightData.loc_x) ** 2 + (leftData.loc_y - rightData.loc_y) ** 2);
				// speed = |x1 - x2| + |y1 - y2|
				tempData.speed = Math.abs(leftData.loc_x - rightData.loc_x) + Math.abs(leftData.loc_y - rightData.loc_y);
				return tempData;
			});
			return selectData;
		},

		selectDataById(id) {
			return this.transports.filter(d => d.participantId == id);
		},

		drawTransportsScatterPlot(selectData) {
			this.clearTransportsScatterPlot();
			// 画散点图
			this.svg.selectAll("circle")
				.data(selectData)
				.enter()
				.append("circle")
				.attr("class", "scatter-point")
				.attr("cx", (d) => { return this.xScale(d.loc_x); })
				.attr("cy", (d) => { return this.yScale(d.loc_y); })
				.attr("r", 2.5)
				.attr("fill-opacity", 1.0)
				.attr("fill", (d) => { return this.speedColorScale(d.speed); })
				// 添加发光特效
				.style("filter", "url(#glow)");
		},

		// 在适当的地方定义发光效果滤镜
		defineGlowEffect() {
			// 创建一个滤镜
			var defs = this.svg.append("defs");

			var filter = defs.append("filter")
				.attr("id", "glow");

			// 添加高斯模糊
			filter.append("feGaussianBlur")
				.attr("stdDeviation", 100)
				.attr("result", "coloredBlur");

			// 将原始图像与模糊图像叠加
			var feMerge = filter.append("feMerge");

			feMerge.append("feMergeNode")
				.attr("in", "coloredBlur");
			feMerge.append("feMergeNode")
				.attr("in", "SourceGraphic");
		},

		clearTransportsScatterPlot() {
			if (this.svg)
				this.svg.selectAll("circle.scatter-point")
					.remove();
		},

		drawTransportsTracePlot(id1, label1, id2, label2) {
			console.log("id1: " + id1 + ", label1: " + label1 + ", id2: " + id2 + ", label2: " + label2);
			this.clearTransportsTracePlot();

			const label2Color = {
				0: { "arrowColor": "orange", "circleColor": "orange" },
				1: { "arrowColor": "yellow", "circleColor": "yellow" },
				2: { "arrowColor": "green", "circleColor": "#00FF6A" },
				3: { "arrowColor": "purple", "circleColor": "#FF66E5" },
				4: { "arrowColor": "blue", "circleColor": "#24A0FF" },
				5: { "arrowColor": "red", "circleColor": "#FF6B6B" },
			};

			if (id1 != 'null' && id1 != undefined) {
				const selectData = this.selectDataById(id1);
				console.log("selectData1 length: " + selectData.length);
				const arrowColor = label2Color[label1].arrowColor;
				const circleColor = label2Color[label1].circleColor;

				// 定义箭头标记
				this.svg.append("defs").append("marker")
					.attr("id", `arrowhead${arrowColor}`)
					.attr("viewBox", "0 0 10 10")
					.attr("refX", 8)
					.attr("refY", 5)
					.attr("markerWidth", 12)
					.attr("markerHeight", 12)
					.attr("orient", "auto")
					.attr("opacity", 0.8)
					.attr("fill", arrowColor)
					.append("path")
					.attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z");

				// 额外绘制新的线条并添加箭头标记
				this.svg.selectAll(`line.trace-line1`)
					.data(selectData.slice(0, -1))
					.enter()
					.append("line")
					.attr("class", `trace-line1`)
					.attr("x1", (d) => { return this.xScale(d.loc_x); })
					.attr("y1", (d) => { return this.yScale(d.loc_y); })
					.attr("x2", (d, i) => { return this.xScale(selectData[i + 1].loc_x); })
					.attr("y2", (d, i) => { return this.yScale(selectData[i + 1].loc_y); })
					.attr("stroke", arrowColor)
					.attr("stroke-width", 1)
					.attr("marker-end", `url(#arrowhead${arrowColor})`);

				// 根据停留时间绘制圆圈
				var stayTime = 0;
				var lastData = selectData[0];
				selectData.forEach((data) => {
					stayTime = (data.timeStampFloat - lastData.timeStampFloat) / 1000;
					this.svg.append("circle")
						.attr("class", `trace-point`)
						.attr("cx", this.xScale(data.loc_x))
						.attr("cy", this.yScale(data.loc_y))
						.attr("r", (d) => { return (stayTime / 20) ** 0.5; })
						.attr("fill", circleColor)
						.attr("fill-opacity", 0.3)
					lastData = data;
				});
			}
			if (id2 != 'null' && id2 != undefined) {
				const selectData = this.selectDataById(id2);
				console.log("selectData2 length: " + selectData.length);
				const arrowColor = label2Color[label2].arrowColor;
				const circleColor = label2Color[label2].circleColor;

				// 定义箭头标记
				this.svg.append("defs").append("marker")
					.attr("id", `arrowhead${arrowColor}`)
					.attr("viewBox", "0 0 10 10")
					.attr("refX", 8)
					.attr("refY", 5)
					.attr("markerWidth", 12)
					.attr("markerHeight", 12)
					.attr("orient", "auto")
					.attr("opacity", 0.8)
					.attr("fill", arrowColor)
					.append("path")
					.attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z");

				// 额外绘制新的线条并添加箭头标记
				this.svg.selectAll(`line.trace-line2`)
					.data(selectData.slice(0, -1))
					.enter()
					.append("line")
					.attr("class", `trace-line2`)
					.attr("x1", (d) => { return this.xScale(d.loc_x); })
					.attr("y1", (d) => { return this.yScale(d.loc_y); })
					.attr("x2", (d, i) => { return this.xScale(selectData[i + 1].loc_x); })
					.attr("y2", (d, i) => { return this.yScale(selectData[i + 1].loc_y); })
					.attr("stroke", arrowColor)
					.attr("stroke-width", 1)
					.attr("marker-end", `url(#arrowhead${arrowColor})`);

				// 根据停留时间绘制圆圈
				var stayTime = 0;
				var lastData = selectData[0];
				selectData.forEach((data) => {
					stayTime = (data.timeStampFloat - lastData.timeStampFloat) / 1000;
					this.svg.append("circle")
						.attr("class", `trace-point`)
						.attr("cx", this.xScale(data.loc_x))
						.attr("cy", this.yScale(data.loc_y))
						.attr("r", (d) => { return (stayTime / 20) ** 0.5; })
						.attr("fill", circleColor)
						.attr("fill-opacity", 0.3)
					lastData = data;
				});
			}
		},

		clearTransportsTracePlot() {
			this.svg.selectAll(`line.trace-line1`)
				.remove();
			this.svg.selectAll(`line.trace-line2`)
				.remove();
			this.svg.selectAll(`circle.trace-point`)
				.remove();
		},
	}
}

</script>






<!-- <script setup>

const router = useRouter();
const toDetail = async () => {
	router.push('/detail');
};

// 测试发送请求
const sendMessage = async () => {
	// var res = await HttpHelper.post(Urls.getDetail, { name: 'test' });
	// console.log(res);
	var res = await HttpHelper.post(Urls.aa, { name: 'test' });
	console.log(res);
};

const getData = async (path) => {
	var res = await HttpHelper.post(Urls.getCSVData, { path: path });
	console.log(res);
	return res;
};

</script> -->

<style lang="less"></style>