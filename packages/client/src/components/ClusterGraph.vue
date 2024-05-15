<script>
import * as d3 from 'd3';
import { useRouter } from 'vue-router';
import HttpHelper from '../common/utils/axios_helper';
import Urls from '../common/urls/index';
import bus from '../common/utils/bus';
export default {
	data() {
		return {
			clusterData: null,
			colorScale: null,
			xScale: null,
			yScale: null,
			svg: null,
			tooltip: null,
		};
	},
	name: 'ClusterGraph',
	props: {
		date: {
			type: String,
			required: true,
		},
		selectedId1: {
			required: true
		},
		selectedId2: {
			required: true
		},
	},

	watch: {
		date: async function (newDate) {
			const filteredData = await this.getFilteredData();
			this.plotScatter(filteredData);
		}
	},

	async mounted() {
		this.initScatter();
	},
	methods: {
		async initScatter() {
			try {
				const clusterData = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/Clusters/TSNE.csv' });
				this.clusterData = clusterData;
				console.log("cluster data: ");
				console.table(this.clusterData.slice(0, 5));

				const filteredData = await this.getFilteredData();

				this.plotScatter(filteredData);
			} catch (error) {
				console.error("Failed to load cluster data:", error);
			}
		},
		async getFilteredData() {
			try {
				const occurrenceData = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/Clusters/occurrence.csv' });
				const occurrenceDayData = d3.filter(occurrenceData, (d) => d.day === this.date);
				const occurrenceIdData = occurrenceDayData[0].occurrence.split('|');

				const filteredData = this.clusterData.filter((d) => occurrenceIdData.includes(d.id));
				console.log("filtered cluster data: ");
				console.table(filteredData.slice(0, 5));

				if (filteredData != null) {
					return filteredData;
				} else {
					console.error("No cluster data found for the selected date.");
				}
			} catch (error) {
				console.error("Failed to load occurrence data:", error);
			}
		},

		plotScatter(data) {
			if (this.svg) {
				this.svg.remove();
			}
			const x = data.map((d) => +d.X),
				y = data.map((d) => +d.Y),
				labels = data.map((d) => +d.label);
			const xTolerant = (d3.max(x) - d3.min(x)) / 10,
				yTolerant = (d3.max(y) - d3.min(y)) / 10;
			const uniqueLabels = labels.filter((d, i) => labels.indexOf(d) == i).sort((a, b) => a - b);

			const width = d3.select(".scatter-plot").node().getBoundingClientRect().width;
			const height = d3.select(".scatter-plot").node().getBoundingClientRect().height;
			const picture_range = 1.0;

			this.xScale = d3.scaleLinear()
				.domain([d3.min(x) - xTolerant, d3.max(x) + xTolerant])
				.range([width * (1 - picture_range) / 2, width - width * (1 - picture_range) / 2]);
			this.yScale = d3.scaleLinear()
				.domain([d3.min(y) - yTolerant, d3.max(y) + yTolerant])
				.range([0, height * picture_range]);
			this.colorScale = d3.scaleOrdinal()
				.domain([5, 0, 4, 1, 2, 3])
				.range(["#FF0033", "#ff9966", "#0099FF", "#FFCC00", "#99CC00", "#9966CC"]);
			this.svg = d3.select(".scatter-plot").append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.style("background-color", "#404a59")
				.style("border", "1px solid #ccc");
			this.svg.append("text")
				.attr("x", width / 2)
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.attr("fill", "#fff")
				.attr("font-style", "italic")
				.style("font-size", "16px")
				.style("font-weight", "bold")
				.text("Different Life Patterns");

			this.svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", (d) => this.xScale(d.X))
				.attr("cy", (d) => this.yScale(d.Y) + 8)
				.attr("r", 1.8)
				.attr("fill", (d) => this.colorScale(d.label))
				.attr("id", (d, i) => i)
				.on("mouseover", (event, d) => this.selected(event, d, event.pageX, event.pageY))
				.on("mouseout", (event, d) => this.unselected(event, d))
				.on("click", (event, d) => this.clicked(event, d));
			for (let i = 1; i < 3; i++) {
				this.svg.append("line")
					.attr("x1", 0)
					.attr("y1", height / 3 * i)
					.attr("x2", width)
					.attr("y2", height / 3 * i)
					.attr("stroke", "white")
					.attr("stroke-dasharray", "5")
					.attr("stroke-width", "1")
					.attr("opacity", 0.8);
			}
			for (let i = 1; i < 4; i++) {
				this.svg.append("line")
					.attr("x1", width / 4 * i)
					.attr("y1", 0)
					.attr("x2", width / 4 * i)
					.attr("y2", height)
					.attr("stroke", "white")
					.attr("stroke-dasharray", "5")
					.attr("stroke-width", "1")
					.attr("opacity", 0.8);
			}
			const legendItemWidth = 60; // Width of each legend item
			const legendItemMargin = 20; // Margin between legend items
			const legendWidth = uniqueLabels.length * (legendItemWidth + legendItemMargin); // Total width of legend

			const legend = this.svg.append("g")
				.attr("class", "legend")
				.attr("transform", `translate(${(width - legendWidth) / 120}, ${height - 8})`);

			const legendItems = legend.selectAll(".legend-item")
				.data(uniqueLabels)
				.enter()
				.append("g")
				.attr("class", "legend-item")
				.attr("transform", (d, i) => `translate(${i * (legendItemWidth + legendItemMargin) / 1.8}, 0)`);

			legendItems.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", legendItemWidth / 2)
				.attr("height", 8)
				.attr("fill", (d) => this.colorScale(d));

			legendItems.append("text")
				.attr("x", legendItemWidth / 4)
				.attr("y", 8)
				.attr("text-anchor", "middle").style("font-size", "10px")
				.text((d) => d);
		},
		selected(event, d, pageX, pageY) {
			d3.select(event.currentTarget)
				.transition()
				.duration(200)
				.attr("r", 8)
				.attr("stroke", "white")
				.attr("stroke-width", "2px");
			this.showTooltip(d, pageX, pageY);
		},

		unselected(event, d) {
			d3.select(event.currentTarget)
				.transition()
				.duration(200)
				.attr("r", 1.8)
				.attr("stroke-width", "0px");

			this.hideTooltip();
		},
		clicked(event, d) {
			// console.log(d.id)
			// console.log(d.label)
			bus.emit('participantID', d.id);
			bus.emit('labelID', d.label);
			this.$emit('update:selectedId', d.id, d.label);
		},
		showTooltip(d, pageX, pageY) {
			this.tooltip = d3.select(".scatter-plot").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0)
				.html(`<strong>Participant ID:</strong> ${d.id} <br> <strong>Label ID:</strong> ${d.label}`)
				.style("left", pageX + "px")
				.style("top", pageY + "px");

			this.tooltip.transition()
				.duration(200)
				.style("opacity", .9);
		},
		hideTooltip() {
			this.tooltip.transition()
				.duration(200)
				.style("opacity", 0)
				.remove();
		},
	},
};
</script>

<style>
.tooltip {
	position: absolute;
	background-color: white;
	color: black;
	padding: 8px;
	border-radius: 5px;
	pointer-events: none;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.cluster-graph {
	background-color: #404a59;
}
</style>