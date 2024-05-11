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
			<button @click="toDetail" style="width: 100%; height: 100%;">
				Timeline
			</button>
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
		};
	},

	mounted() {
		this.initBuildings();
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
				this.data = res
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

			const xScale = d3.scaleLinear()
				.domain([min_x, max_x])
				.range([width * (1 - picture_range) / 2, width - width * (1 - picture_range) / 2]);
			const yScale = d3.scaleLinear()
				.domain([min_y, max_y])
				.range([0, height * picture_range]);

			this.svg.selectAll("polygon")
				.data(data)
				.enter()
				.append("polygon")
				.attr("points", d => d.location.split(", ").map(point => {
					const [x, y] = point.split(" ").map(parseFloat);
					return xScale(x) + " " + yScale(y);
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
			console.log("redrawing buildings...");
			if (!this.data) return; // 确保数据存在
			console.log("drawBuildings...");
			this.drawBuildings(this.data); // 重新绘制建筑物
		}
	}
}

</script>


<style scoped>
.wrapper {
	display: grid;
	grid-template-columns: repeat(20, 1fr);
	grid-template-rows: repeat(20, 4.24vh);
	gap: 10px;
	height: 100%;
	width: 100%;
}

.calendar {
	grid-area: 1 / 1 / 7 / 5;
}

.map {
	grid-area: 1 / 5 / 16 / 17;
}

.scatter-plot {
	grid-area: 1 / 17 / 9 / 21;
}

.overview {
	grid-area: 7 / 1 / 21 / 5;
}

.timeline {
	grid-area: 16 / 5 / 17 / 17;
}

.under-timeline-plot {
	grid-area: 17 / 5 / 21 / 17;
}


.daily-life-plot {
	grid-area: 9 / 17 / 21 / 21;
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


var initTransports = function () {
	d3.csv("../CSVdata/Transports/transports_2023-03-03.csv").then(function (data) {
		var parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
		var formatTime = d3.timeFormat('%Y-%m-%d %H:%M:%S');

		// Parse the time and calculate average speed
		data.forEach(function (d) {
			d.timeStamp = parseTime(d.day + ' ' + d.time);
			d.timeStampFloat = d.timeStamp.getTime();
		});


		// Create a time scale for the x-axis
		var timeScale = d3.scaleTime()
			.domain([0, width])
			.range(d3.extent(data, function (d) { return d.timeStampFloat; }));

		// Create a color scale for the scatter plot
		var speedColorScale = d3.scaleLinear()
			.domain([100, 250, 400])
			.range(["red", "orange", "green"]);


		var timeline = d3.select(".timeline")

		var handle = timeline.select(".handle");
		var dragBehavior = d3.drag()
			.on("drag", function dragEvent(event) {
				clearScatterPlot();
				deleteSpeedPlot();

				var x = event.x;
				var max_x = timeline.node().getBoundingClientRect().width - handle.node().getBoundingClientRect().width;
				if (x < 0) {
					x = 0;
				} else if (x > max_x) {
					x = max_x;
				}
				handle.style("left", x + "px");
				var curTime = x / max_x * (timeScale.range()[1] - timeScale.range()[0]) + timeScale.range()[0];


				console.log("curTime: " + formatTime(new Date(curTime)));
				// console.log("selectData.min_speed: " + d3.min(selectData, function (d) { return d.speed; }));
				// console.log("selectData.max_speed: " + d3.max(selectData, function (d) { return d.speed; }));

				var selectData = selectDataByCurTime(curTime);
				drawScatterPlot(selectData);

				var sortedSpeeds = getSpeedBySelectedData(selectData);
				plotSpeed(sortedSpeeds, 60, 0.75);
			});
		handle.call(dragBehavior);

		function selectDataByCurTime(curTime) {
			var leftMaxTimeStamp = parseFloat(d3.max(data, d => d.timeStampFloat <= curTime ? d.timeStampFloat : -Infinity));
			var rightMinTimeStamp = parseFloat(d3.min(data, d => d.timeStampFloat >= curTime ? d.timeStampFloat : Infinity));
			// 边缘情况
			if (leftMaxTimeStamp == rightMinTimeStamp)
				if (parseFloat(d3.min(data, d => d.timeStampFloat > curTime ? d.timeStampFloat : Infinity)) == Infinity) {
					leftMaxTimeStamp = parseFloat(d3.max(data, d => d.timeStampFloat < curTime ? d.timeStampFloat : -Infinity));
					rightMinTimeStamp = parseFloat(d3.min(data, d => d.timeStampFloat >= curTime ? d.timeStampFloat : Infinity));
					console.log("case1" + leftMaxTimeStamp + " " + rightMinTimeStamp)
				} else {
					leftMaxTimeStamp = parseFloat(d3.max(data, d => d.timeStampFloat <= curTime ? d.timeStampFloat : -Infinity));
					rightMinTimeStamp = parseFloat(d3.min(data, d => d.timeStampFloat > curTime ? d.timeStampFloat : Infinity));
				}

			var leftSelectedData = data.filter(d => d.timeStampFloat === leftMaxTimeStamp);
			var rightSelectedData = data.filter(d => d.timeStampFloat === rightMinTimeStamp);
			var curRelativeTime = (curTime - leftMaxTimeStamp) / (rightMinTimeStamp - leftMaxTimeStamp);

			var selectData = [];
			for (let i = 0; i < leftSelectedData.length; i++) {
				for (let j = 0; j < rightSelectedData.length; j++) {
					if (leftSelectedData[i].participantId == rightSelectedData[j].participantId) {
						var tempData = {};
						tempData.participantId = leftSelectedData[i].participantId;
						tempData.timeStampFloat = curTime;
						tempData.timeStamp = formatTime(new Date(curTime));
						tempData.loc_x = (1 - curRelativeTime) * leftSelectedData[i].loc_x + curRelativeTime * rightSelectedData[j].loc_x;
						tempData.loc_y = (1 - curRelativeTime) * leftSelectedData[i].loc_y + curRelativeTime * rightSelectedData[j].loc_y;
						tempData.speed = Math.sqrt((rightSelectedData[j].loc_x - leftSelectedData[i].loc_x) ** 2 + (rightSelectedData[j].loc_y - leftSelectedData[i].loc_y) ** 2);
						selectData.push(tempData);
						break;
					}
				}
			}
			return selectData;
		}

		function selectDataById(id) {
			return data.filter(d => d.participantId === id);
		}

		function getSpeedBySelectedData(selectData) {
			var speeds = [];
			for (let i = 0; i < selectData.length; i++) {
				speeds.push(selectData[i].speed);
			}
			var sortedSpeeds = speeds.sort(function (a, b) { return a - b; });
			return sortedSpeeds;
		}

		function plotSpeed(sortedSpeeds, Y_max, gamma) {
			// Calculate the count for each range
			var countData = [];
			for (var i = 0; i <= 500; i += 50) {
				var count = sortedSpeeds.filter(function (d) {
					return i != 500 ? d >= i && d < i + 50 : d >= i;
				}).length;
				countData.push({ range: i, count: count });
			}

			// Create scales for x and y axes
			var xScale = d3.scaleBand()
				.domain(countData.map(function (d) { return d.range; }))
				.range([0, width])
				.padding(0.1);

			var yScale = d3.scaleLinear()
				.domain([0, Y_max])
				.range([height, 0]);

			// Create line generator
			var line = d3.line()
				.x(function (d) { return xScale(d.range) + xScale.bandwidth() / 2; })
				.y(function (d) { return yScale(d.count ** gamma); });

			// Append the line chart
			svg.append("path")
				.datum(countData)
				.attr("class", "line-chart")
				.attr("d", line)
				.attr("fill", "none")
				.attr("stroke", "blue")
				.attr("stroke-width", 2);

			// Append the x axis
			svg.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(xScale));

			// Append the y axis
			svg.append("g")
				.call(d3.axisLeft(yScale));
		}

		function deleteSpeedPlot() {
			svg.selectAll(".line-chart").remove();
			svg.selectAll("g").remove();
		}

		function drawScatterPlot(selectData) {
			// Draw the scatter plot
			svg.selectAll("circle")
				.data(selectData)
				.enter()
				.append("circle")
				.attr("class", "scatter-point")
				.attr("cx", function (d) { return xScale(d.loc_x); })
				.attr("cy", function (d) { return yScale(d.loc_y); })
				.attr("r", 2)
				.attr("fill-opacity", 1.0)
				.attr("fill", function (d) { return speedColorScale(d.speed); })
				// TODO
				.on("mouseover", function (d) {
					var newSelectedData = data.filter(d => d.participantId === d.participantId);
					d3.select(this)
						.attr("fill", "yellow")
						.attr("stroke-width", 1.2);
				})
				.on("mouseout", function (d) {
					console.log("mouseout " + d.participantId);
					d3.selectAll("circle.scatter-point.id")
						.attr("fill", function (d) {
							return speedColorScale(d.speed);
						})
						.attr("stroke-width", 0.8);
				});

		};

		function clearScatterPlot() {
			// Update the scatter plot
			svg.selectAll("circle.scatter-point")
				.remove();
		};
	});
};

</script> -->

<style lang="less"></style>