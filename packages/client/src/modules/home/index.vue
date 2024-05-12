<!-- index.vue -->


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
	},

	data() {
		return {
			svg: null, // 保存SVG引用以便重新绘制
			buildings: null, // 保存建筑物数据
			initBuildingsOpacitySplit: 0.1,
			transports: null, // 保存交通数据
			xScale: null,
			yScale: null,
			speedColorScale: null,
			timeScale: null,
			curTime: null,
			rellativeDay: null,
			curRealTime: null,
		};
	},

	async mounted() {
		this.initBuildings();
		await this.initTransports(this.date);
		this.drawTimeline();
	},

	watch: {
		date: function (newDate) {
			this.initTransports(newDate);
		}
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

			console.log("minRent: " + minRent);
			console.log("maxRent: " + maxRent);

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

			const width = d3.select("#chart").node().getBoundingClientRect().width;
			const height = d3.select("#chart").node().getBoundingClientRect().height;
			const picture_range = 1.0;

			const buildingType2color = {
				"Commercial": "#5F9EA0",   // 兰青色
				"Residental": "#8B4513",   // 红棕色
				"School": "#32CD32",       // 草绿色
				"Other": "#FFFF00"         // 黄色
			};


			this.svg = d3.select("#chart").append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.style("background-color", "lightgrey")
				.style("border", "1px solid black");

			this.xScale = d3.scaleLinear()
				.domain([min_x, max_x])
				.range([width * (1 - picture_range) / 2, width - width * (1 - picture_range) / 2]);
			this.yScale = d3.scaleLinear()
				.domain([min_y, max_y])
				.range([0, height * picture_range]);

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
				.attr("stroke", "black")
				.attr("stroke-width", 0.8)
				.attr("stroke-opacity", d => d.opacity)
				.on("mouseover", (event, d) => {
					d3.select(event.currentTarget).attr("fill", "orange").attr("stroke-width", 1.2);
				})
				.on("mouseout", (event, d) => {
					d3.select(event.currentTarget).attr("fill", buildingType2color[d.buildingType]).attr("stroke-width", 0.8);
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
				console.log("transports data: ");
				console.log(transportsData);

				// Parse the time
				var parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
				transportsData.forEach(function (d) {
					d.timeStamp = parseTime(d.day + ' ' + d.time);
					d.timeStampFloat = d.timeStamp.getTime();
				});

				const width = d3.select("#chart").node().getBoundingClientRect().width;
				this.timeScale = d3.scaleTime()
					.domain([0, width])
					.range(d3.extent(transportsData.map(d => d.timeStampFloat)));

				this.speedColorScale = d3.scaleLinear()
					.domain([250, 350, 450])
					.range(["red", "orange", "green"]);

				this.transports = transportsData
				console.log("transports data: ");
				console.log(this.transports);
				if (transportsData != null) {
					this.clearTransportsScatterPlot();

					// 测试绘制轨迹图
					console.log("data selected by id: ", 25);
					this.drawTransportsTracePlot(this.selectDataById(25));
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
				.style("border", "1px solid black");
			this.handle = this.timeline.append("div")
				.attr("class", "handle")
				.style("position", "relative")
				.style("left", "0px")
				.style("top", "0px")
				.style("width", "10px")
				.style("height", "100%")
				.style("background-color", "blue");

			// 绘制时间标签
			this.curRealTime = d3.timeFormat('%Y-%m-%d %H:%M:%S')(new Date(this.timeScale.range()[0]));
			this.svg.append("text")
				.attr("x", "95%")
				.attr("y", "95%")
				.attr("text-anchor", "end")
				.attr("dominant-baseline", "bottom")
				.style("font-size", "30px")
				.text(this.curRealTime);

			// 定义拖拽行为
			this.handle.call(d3.drag()
				.on("drag", (event) => {
					var startTime = new Date().getTime();

					var x = event.x;
					var max_x = this.timeline.node().getBoundingClientRect().width - this.handle.node().getBoundingClientRect().width;
					x = Math.max(0, Math.min(x, max_x));
					this.handle.style("left", x + "px");

					this.rellativeDay = x / max_x;
					this.curTime = x / max_x * (this.timeScale.range()[1] - this.timeScale.range()[0]) + this.timeScale.range()[0];
					var selectData = this.selectDataByCurTime(this.curTime);
					this.drawTransportsScatterPlot(selectData);

					this.svg.selectAll("text")
						.text(this.curRealTime);

					console.log("drag consuming time: " + (new Date().getTime() - startTime) + "ms");
				}));
		},

		clearTimeline() {
			console.log("clearTimeline");
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
				.attr("r", 2)
				.attr("fill-opacity", 1.0)
				.attr("fill", (d) => { return this.speedColorScale(d.speed); })
		},

		clearTransportsScatterPlot() {
			if (this.svg)
				this.svg.selectAll("circle.scatter-point")
					.remove();
		},

		drawTransportsTracePlot(selectData) {
			// Draw the trace plot with arrows
			this.clearTransportsTracePlot();

			const arrowColor = "black";

			// 定义箭头标记
			this.svg.append("defs").append("marker")
				.attr("id", "arrowhead")
				.attr("viewBox", "0 0 10 10")
				.attr("refX", 8)
				.attr("refY", 5)
				.attr("markerWidth", 12)
				.attr("markerHeight", 12)
				.attr("orient", "auto")
				// .attr("opacity", 0.8)
				.attr("fill", arrowColor)
				.append("path")
				.attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z");

			// 绘制线条并添加箭头标记
			this.svg.selectAll("line")
				.data(selectData.slice(0, selectData.length - 1))
				.enter()
				.append("line")
				.attr("class", "trace-line")
				.attr("x1", (d, i) => { return this.xScale(d.loc_x); })
				.attr("y1", (d, i) => { return this.yScale(d.loc_y); })
				.attr("x2", (d, i) => { return this.xScale(selectData[i + 1].loc_x); })
				.attr("y2", (d, i) => { return this.yScale(selectData[i + 1].loc_y); })
				.attr("stroke", arrowColor)
				.attr("stroke-width", 1)
				.attr("stroke-opacity", 1)
				.attr("marker-end", "url(#arrowhead)");


			// 根据停留时间绘制圆圈
			var stayTime = 0;
			var lastData = selectData[0];
			selectData.forEach((data) => {
				stayTime = (data.timeStampFloat - lastData.timeStampFloat) / 1000;
				this.svg.append("circle")
					.attr("class", "trace-point")
					.attr("cx", this.xScale(data.loc_x))
					.attr("cy", this.yScale(data.loc_y))
					.attr("r", (d) => { return (stayTime / 20) ** 0.5; })
					.attr("fill", "gray")
					.attr("fill-opacity", 0.8)
				lastData = data;
			});
		},

		clearTransportsTracePlot() {
			this.svg.selectAll("line.trace-line")
				.remove();
			this.svg.selectAll("circle.trace-point")
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