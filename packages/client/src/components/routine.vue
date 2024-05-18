<template>
	<div ref="chart" style="width: 100%; height: 100%"></div>
</template>

<script>
import * as echarts from 'echarts';
import HttpHelper from '../common/utils/axios_helper';
import Urls from '../common/urls/index';
import bus from '../common/utils/bus';

export default {
	data() {
		return {
			chart: null,
			alldata: null,
			data: [],
			columns: [],
			participantId: ['null', 'null'],
			startTime: +new Date("2022-03-01T00:00:00"),
			current_time: '2022-03-01',
			types: [
				{ name: 'AtHome', color: '#0077cc' },
				{ name: 'Transport', color: '#ffbb33' },
				{ name: 'AtRecreation', color: '#66cc66' },
				{ name: 'AtRestaurant', color: '#cc0000' },
				{ name: 'AtWork', color: '#9933cc' },
				{ name: 'null', color: '#808080' },
			],
		};
	},

	props: {
		selectedId1: {
			required: true,
		},
		selectedId2: {
			required: true,
		},
	},

	async mounted() {
		this.chart = echarts.init(this.$refs.chart);
		await this.loadData();
		this.generateRountine(this.alldata, this.columns);
		this.renderChart();

		// bus.on('participantID', (participantID) => {
		// 	const label = String(participantID);
		// 	console.log(label);
		// 	if (this.participantId.length >= 2) {
		// 		this.participantId.shift();
		// 	}
		// 	this.participantId.push(label);
		// 	this.generateRountine(this.alldata, this.columns);
		// 	this.renderChart();
		// });

		bus.on('time', async (time) => {
			const label = String(time);
			console.log(label);
			this.current_time = label;
			await this.loadData(); // update
			this.generateRountine(this.alldata, this.columns);
			this.renderChart();
		});
	},

	watch: {
		selectedId1: function (newId) {
			this.participantId[1] = this.selectedId1.id;
			this.generateRountine(this.alldata, this.columns);
			this.renderChart();
		},
		selectedId2: function (newId) {
			this.participantId[0] = this.selectedId2.id;
			this.generateRountine(this.alldata, this.columns);
			this.renderChart();
		}
	},

	methods: {
		async loadData() {
			try {
				const centers = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/dailyrountine/' + this.current_time + '.csv' });
				this.alldata = centers;
				console.table(this.alldata.slice(0, 5));
				this.columns = Object.keys(centers[0]);

			} catch (error) {
				console.error("Failed to load centers data:", error);
			}
		},

		generateRountine(alldata, columns) {
			this.data = []; // reinit
			for (let index = 0; index < 2; index++) {
				const selectedId = (index ? this.selectedId2.id : this.selectedId1.id);
				const nullId = (selectedId == 'null' || selectedId == null || selectedId == undefined);

				const participantRow = alldata.find(row => String(parseInt(row.participantId)) === (nullId ? '2' : selectedId));
				const timeKeys = Object.keys(participantRow).filter(key => key !== 'participantId');
				for (let i = 1; i < columns.length - 1; i++) {
					const timeKey1 = timeKeys[i]
					const timeKey2 = timeKeys[i + 1]
					const new_1 = this.createTimeStringWithLeadingZeros(String(timeKey1));
					const new_2 = this.createTimeStringWithLeadingZeros(String(timeKey2));
					const date1 = new Date('2022-03-01T' + new_1);
					const date2 = new Date('2022-03-01T' + new_2);
					const duration = date2.getTime() - date1.getTime();
					const typeItem = this.types.find(type => type.name === participantRow[timeKey1]);
					if (nullId || typeItem?.name == undefined)
						this.data.push({
							name: 'null',
							value: [2 - index, date1.getTime(), date2.getTime(), duration], 
							itemStyle: {
								normal: {
									color: '#808080'
								}
							}
						});
					else
						this.data.push({
							name: typeItem.name,
							value: [2 - index, date1.getTime(), date2.getTime(), duration], 
							itemStyle: {
								normal: {
									color: typeItem.color
								}
							}
						});
				}
			}
		},

		createTimeStringWithLeadingZeros(timeString) {
			const parts = timeString.split(':');
			const hours = parts[0].length < 2 ? '0' + parts[0] : parts[0];
			return hours + ':' + parts[1] + ':' + parts[2];
		},

		renderChart() {
			this.chart.setOption({
				graphic: this.generateLegendGraphic(),
				tooltip: {
					formatter: (params) => {
						return params.marker + params.name;
					}
				},
				title: {
					text: 'Daily Routine',
					left: 'center',
					textStyle: {
						color: '#fff',
						fontStyle: 'italic'
					}
				},
				xAxis: {
					show: false
				},
				yAxis: {
					type: 'category',
					data: this.participantId,
					axisLabel: {
						formatter: (value) => {
							return 'ID:' + value;
						}
					},
				},
				grid: {
					height: '80%',
					top: "15px",
					left: "50px"
				},
				xAxis: {
					show: false,
					min: this.startTime,
					scale: true,
					axisLabel: {
						formatter: (val) => {
							return Math.max(0, val - this.startTime) / (300) + ' ms';
						}
					},
					axisLine: {
						lineStyle: {
							color: '#fff'
						}
					},
					axisTick: {
						show: false,
					}
				},
				yAxis: {
					show: true,
					data: this.participantId,
					axisLine: {
						lineStyle: {
							color: '#fff'
						}
					},
					axisTick: {
						show: true,
					},
					axisLabel: {
						formatter: (val) => {
							if (val >= 1000)
								return 'ID' + val;
							return 'ID ' + val;
						}
					},
					// offset: -10
				},
				series: [
					{
						type: 'custom',
						renderItem: this.renderItem,
						itemStyle: {
							opacity: 0.8
						},
						encode: {
							x: [1, 2],
							y: 0
						},
						data: this.data
					}
				]
			});
		},

		renderItem(params, api) {
			const categoryIndex = api.value(0);
			const start = api.coord([api.value(1), categoryIndex]);
			const end = api.coord([api.value(2), categoryIndex]);
			const height = api.size([0, 1])[1] * 0.6;
			return {
				type: 'rect',
				shape: {
					x: start[0],
					y: start[1] + height * 1.2,
					width: end[0] - start[0],
					height: height
				},
				style: api.style()
			};
		},

		generateLegendGraphic() {
			const legendItemWidth = 10; // Width of each legend item
			const legendItemHeight = 10; // Height of each legend item
			const legendItemMargin = 50; // Margin between legend items

			return {
				type: 'group',
				left: 'center', 
				bottom: 2, 
				layout: 'horizontal', 
				align: 'center', 
				children: this.types.map((type, index) => ({
					type: 'group',
					left: index = legendItemMargin + index * (legendItemWidth + legendItemMargin),
					children: [
						{
							type: 'rect',
							left: 0,
							top: 0,
							shape: {
								width: legendItemWidth,
								height: legendItemHeight,
							},
							style: {
								fill: type.color,
							},
						},
						{
							type: 'text',
							left: 0,
							top: legendItemHeight + 2, 
							style: {
								text: type.name,
								fill: '#fff',
								fontSize: 8,
							},
						},
					],
				})),
			};
		},

	}
};
</script>

<style>
/* Add any necessary styles here */
</style>
