<template>
	<div class="wrapper">
		<div class="calendar">
			<button @click="toDetail" style="width: 100%; height: 100%;">
				Calendar
			</button>
		</div>
		<div id="chart" class="map">

		</div>
		<div class="timeline">
			<div class="time-point" @mousedown="startDrag" @mouseup="stopDrag"></div>
		</div>
		<div class="under-timeline-plot">
			<button @click="toDetail" style="width: 100%; height: 100%;">
				Under-Timeline-Plot
			</button>
		</div>
		<div class="scatter-plot">
			<button @click="toDetail" style="width: 100%; height: 100%;">
				Scatter-Plot
			</button>
		</div>
		<div class="daily-life-plot">
			<button @click="toDetail" style="width: 100%; height: 100%;">
				Daily-Life-Plot
			</button>
		</div>
		<div class="overview">
			<button @click="toDetail" style="width: 100%; height: 100%;">
				Overview
			</button>
		</div>
		<!-- <div class="request">
			<button @click="renderBuildings" style="width: 100%; height: 100%;">
				Render buildings
			</button>
		</div> -->
	</div>
</template>

<script>
import { useRouter } from 'vue-router';
import HttpHelper from '../../common/utils/axios_helper';
import Urls from '../../common/urls/index';

export default {
	name: 'Dashboard',

	data() {
		return {
			svg: null, // 保存SVG引用以便重新绘制
			buildings: null, // 保存建筑物数据
			transports: null, // 保存交通数据
			xScale: null,
			yScale: null,
			speedColorScale: null,
			timeScale: null,
		};
	},

	mounted() {
		this.initBuildings();
		this.initTransports('2023-03-03');

		window.addEventListener('resize', this.redrawBuildings);
	},

	beforeDestroy() {
		window.removeEventListener('resize', this.redrawBuildings);
	},

	methods: {
		async initBuildings() {
			try {
				const res = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/building.csv' });
				console.log("buildings data: ");
				console.log(res);
				this.buildings = res
				if (res != null) {
					this.drawBuildings(res);
				} else {
					console.error("Failed to load buildings data:", res);
				}
			} catch (error) {
				console.error("Failed to load buildings data:", error);
			}
		},

		drawBuildings(data) {
			if (this.svg) {
				this.svg.remove();
			}

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
				"Commercial": "lightblue",
				"Residental": "lightgreen",
				"School": "lightcoral",
				"Other": "yellow"
			}

			this.svg = d3.select("#chart").append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.style("background-color", "lightgrey")
				.style("border", "1px solid black")

			this.xScale = d3.scaleLinear()
				.domain([min_x, max_x])
				.range([width * (1 - picture_range) / 2, width - width * (1 - picture_range) / 2]);
			this.yScale = d3.scaleLinear()
				.domain([min_y, max_y])
				.range([0, height * picture_range]);

			this.svg.selectAll("polygon")
				.data(data)
				.enter()
				.append("polygon")
				.attr("points", d => d.location.split(", ").map(point => {
					const [x, y] = point.split(" ").map(parseFloat);
					return this.xScale(x) + " " + this.yScale(y);
				}).join(" "))
				.attr("fill", d => buildingType2color[d.buildingType])
				.attr("stroke", "black")
				.attr("stroke-width", 0.8)
				.on("mouseover", (event, d) => {
					d3.select(event.currentTarget).attr("fill", "orange").attr("stroke-width", 1.2);
				})
				.on("mouseout", (event, d) => {
					d3.select(event.currentTarget).attr("fill", buildingType2color[d.buildingType]).attr("stroke-width", 0.8);
				});
		},

		redrawBuildings() {
			if (this.buildings)
				this.drawBuildings(this.buildings); // 重新绘制建筑物
		},

		// date format: '2023-03-03', range: '2022-03-01' to '2023-05-24'
		async initTransports(date) {
			try {
				const res = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/Transports/transports_' + date + '.csv' });

				var parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
				var formatTime = d3.timeFormat('%Y-%m-%d %H:%M:%S');
				// Parse the time and calculate average speed
				res.forEach(function (d) {
					d.timeStamp = parseTime(d.day + ' ' + d.time);
					d.timeStampFloat = d.timeStamp.getTime();
				});

				const width = d3.select("#chart").node().getBoundingClientRect().width;
				this.timeScale = d3.scaleTime()
					.domain([0, width])
					.range(d3.extent(res.map(d => d.timeStampFloat)));

				this.speedColorScale = d3.scaleLinear()
					.domain([250, 350, 450])
					.range(["red", "orange", "green"]);

				this.transports = res
				console.log("transports data: ");
				console.log(this.transports);
				if (res != null) {
					this.drawTimeline(res);
				} else {
					console.error("Failed to load transports data:", res);
				}
			} catch (error) {
				console.error("Failed to load transports data:", error);
			}
		},

		drawTimeline(data) {
			if (this.timeline) {
				this.timeline.remove();
			}

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

			const width = d3.select("#chart").node().getBoundingClientRect().width;

			var dragBehavior = d3.drag()
				.on("drag", (event) => {
					var startTime = new Date().getTime();
					this.clearTransportsScatterPlot();

					var x = event.x;
					var max_x = this.timeline.node().getBoundingClientRect().width - this.handle.node().getBoundingClientRect().width;
					if (x < 0) {
						x = 0;
					} else if (x > max_x) {
						x = max_x;
					}
					this.handle.style("left", x + "px");

					var curTime = x / max_x * (this.timeScale.range()[1] - this.timeScale.range()[0]) + this.timeScale.range()[0];
					var selectData = this.selectDataByCurTime(curTime);
					this.drawTransportsScatterPlot(selectData);

					console.log("drag consuming time: " + (new Date().getTime() - startTime) + "ms");
				});
			this.handle.call(dragBehavior);
		},


		selectDataByCurTime(curTime) {
			var leftMaxTimeStamp = parseFloat(d3.max(this.transports, d => d.timeStampFloat <= curTime ? d.timeStampFloat : -Infinity));
			var rightMinTimeStamp = parseFloat(d3.min(this.transports, d => d.timeStampFloat >= curTime ? d.timeStampFloat : Infinity));
			// 边缘情况
			if (leftMaxTimeStamp == rightMinTimeStamp)
				if (parseFloat(d3.min(this.transports, d => d.timeStampFloat > curTime ? d.timeStampFloat : Infinity)) == Infinity) {
					leftMaxTimeStamp = parseFloat(d3.max(this.transports, d => d.timeStampFloat < curTime ? d.timeStampFloat : -Infinity));
					rightMinTimeStamp = parseFloat(d3.min(this.transports, d => d.timeStampFloat >= curTime ? d.timeStampFloat : Infinity));
					console.log("case1" + leftMaxTimeStamp + " " + rightMinTimeStamp)
				} else {
					leftMaxTimeStamp = parseFloat(d3.max(this.transports, d => d.timeStampFloat <= curTime ? d.timeStampFloat : -Infinity));
					rightMinTimeStamp = parseFloat(d3.min(this.transports, d => d.timeStampFloat > curTime ? d.timeStampFloat : Infinity));
				}

			var leftSelectedData = this.transports.filter(d => d.timeStampFloat === leftMaxTimeStamp);
			var rightSelectedData = this.transports.filter(d => d.timeStampFloat === rightMinTimeStamp);
			var curRelativeTime = (curTime - leftMaxTimeStamp) / (rightMinTimeStamp - leftMaxTimeStamp);
			var timeFormat = d3.timeFormat('%Y-%m-%d %H:%M:%S');

			var selectData = leftSelectedData.filter(leftData =>
				rightSelectedData.some(rightData => rightData.participantId === leftData.participantId)
			).map(leftData => {
				var rightData = rightSelectedData.find(d => d.participantId === leftData.participantId);
				var tempData = {};
				tempData.participantId = leftData.participantId;
				tempData.timeStampFloat = curTime;
				tempData.timeStamp = timeFormat(new Date(curTime));
				tempData.loc_x = (1 - curRelativeTime) * leftData.loc_x + curRelativeTime * rightData.loc_x;
				tempData.loc_y = (1 - curRelativeTime) * leftData.loc_y + curRelativeTime * rightData.loc_y;
				// tempData.speed = Math.sqrt((rightData.loc_x - leftData.loc_x) ** 2 + (rightData.loc_y - leftData.loc_y) ** 2);
				tempData.speed = Math.abs(rightData.loc_x - leftData.loc_x) + Math.abs(rightData.loc_y - leftData.loc_y);
				return tempData;
			});
			return selectData;
		},

		drawTransportsScatterPlot(selectData) {
			// Draw the scatter plot
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
			this.svg.selectAll("circle.scatter-point")
				.remove();
		},
	}
}

</script>


<style scoped>
.wrapper {
	display: grid;
	grid-template-columns: repeat(20, 1fr);
	grid-template-rows: repeat(20, 2.8vh);
	gap: 10px;
	height: 100%;
	width: 100%;
}

.calendar {
	grid-area: 1 / 1 / 16 / 5;
}

.map {
	grid-area: 1 / 5 / 39 / 17;
}

.scatter-plot {
	grid-area: 1 / 17 / 9 / 21;
}

.overview {
	grid-area: 16 / 1 / 56 / 5;
}

.timeline {
	grid-area: 39 / 5 / 41 / 17;
}

.under-timeline-plot {
	grid-area: 41 / 5 / 56 / 17;
}


.daily-life-plot {
	grid-area: 9 / 17 / 56 / 21;
}

.request {
	grid-area: 1 / 1 / 2 / 2;
}
</style>



<!-- <script setup>

import { useRouter } from 'vue-router';
import HttpHelper from '../../common/utils/axios_helper';
import Urls from '../../common/urls/index';

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