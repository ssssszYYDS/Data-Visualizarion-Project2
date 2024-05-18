<template>

</template>

<script>
import HttpHelper from '../common/utils/axios_helper';
import Urls from '../common/urls/index';

export default {
	name: 'RiverMapComponent',

	props: {
		date: {
			type: String,
			required: true,
		},
	},

	data() {
		return {
			svg: null, // Save SVG reference for redrawing
			riverData: null,
		};
	},

	mounted() {
		this.initRiverMap(this.date);
	},

	watch: {
		date: function (newDate) {
			this.initRiverMap(newDate); 
		}
	},

	beforeUnmount() {
	},

	methods: {
		async initRiverMap(date) {
			const riverData = await HttpHelper.post(Urls.getCSVData, { path: `CSVData/Mode/mode_${date}.csv`, });

			this.riverData = riverData;
			console.log('riverMap data: ');
			console.table(this.riverData.slice(0, 5));

			this.drawRiverMap(this.riverData);
		},

		drawRiverMap(data) {
			if (this.svg) {
				this.svg.remove();
			}

			const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
			const states = [...new Set(data.map((d) => d.state))]; // Get unique states

			const width = d3.select('#river-chart').node().getBoundingClientRect().width;
			const height = d3.select('#river-chart').node().getBoundingClientRect().height;

			this.svg = d3.select('#river-chart')
				.append('svg')
				.attr('width', "100%")
				.attr('height', "100%")
				.style("background-color", "#404a59")
				.style("border", "1px solid black");


			const xScale = d3.scaleTime()
				.range([0, width])
				// .domain(d3.extent(data, (d) => parseTime(d.day + ' ' + d.time)))
				.domain([parseTime(this.date + ' ' + '00:00:00'), parseTime(this.date + ' ' + '23:55:00')]);
			console.log("xScale: ", xScale.domain());

			var timeStampsTotalCounts = {};
			data.forEach((d) => {
				const time = parseTime(d.day + ' ' + d.time);
				if (timeStampsTotalCounts[time] === undefined) { timeStampsTotalCounts[time] = 0; }
				timeStampsTotalCounts[time] += parseInt(d.count);
			});
			var maxCount = d3.max(Object.values(timeStampsTotalCounts));
			const yScale = d3.scaleLinear().range([height * 0.9, 0]).domain([0, maxCount]);

			const colorScale = d3
				.scaleOrdinal()
				.domain(states)
				.range(['#0077cc', '#ffbb33', '#66cc66', '#cc0000', '#9933cc']);


			var timeStampsY0 = {};
			data.forEach((d) => {
				const time = parseTime(d.day + ' ' + d.time);
				if (timeStampsY0[time] === undefined) { timeStampsY0[time] = 0; }
				d.y0 = timeStampsY0[time];
				timeStampsY0[time] += parseInt(d.count);
				d.y1 = timeStampsY0[time];
			});

			const area = d3
				.area()
				.curve(d3.curveBasis)
				.x((d) => xScale(parseTime(d.day + ' ' + d.time)))
				.y0((d) => yScale(d.y0))
				.y1((d) => yScale(d.y1));

			states.forEach(state => {
				this.svg.append('path')
					.datum(data.filter((d) => d.state === state))
					.attr('fill', colorScale(state))
					.attr('d', area);
			});

			// Add legend
			const legend = this.svg
				.selectAll('.legend')
				.data(states)
				.enter()
				.append('g')
				.attr('class', 'legend')
				.attr('transform', (d, i) => `translate(${i * 0.2 * width},0)`);

			legend.append('rect')
				.attr('x', "10%")
				.attr('y', "85%")
				.attr('width', "1%")
				.attr('height', "10%")
				.style('fill', colorScale);

			legend.append('text')
				.attr('x', "11.3%")
				.attr('y', "90%")
				.attr('dy', '.35em')
				.style('text-anchor', 'start')
				.text((d) => d)
				.attr("fill", "#fff");
		},

		removeSvg() {
			if (this.svg) {
				this.svg.remove();
				this.svg = null;
			}
		},
	},
};


</script>