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
			participantId: ["1", "2"],
			startTime: +new Date("2022-03-01T00:00:00"),
			current_time: '2022-03-01',
			types: [
				{ name: 'AtHome', color: '#7b9ce1' },
				{ name: 'Transport', color: '#bd6d6c' },
				{ name: 'AtRecreation', color: '#75d874' },
				{ name: 'AtRestaurant', color: '#e0bc78' },
				{ name: 'AtWork', color: '#dc77dc' },
			]
		};
	},
	mounted() {
		this.chart = echarts.init(this.$refs.chart);
		this.loadData();
		bus.on('participantID', (participantID) => {
			const label = String(participantID);
			console.log(label);
			if (this.participantId.length >= 2) {
				this.participantId.shift();
			}
			this.participantId.push(label);
			this.loadData(); // 更新数据
		});
		bus.on('time', (time) => {
			const label = String(time);
			console.log(label);
			this.current_time = label;
			this.loadData(); // 更新数据
		});
	},
	methods: {
		async loadData() {
			try {
				this.data = []; // 清空之前的数据
				const centers = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/dailyrountine/'+ this.current_time+'.csv' });
				this.alldata = centers;	
				console.table(this.alldata.slice(0, 5));
				console.log('CSVData/dailyrountine/'+ this.current_time+'.csv');

				const firstRow = centers[0];
				this.columns = Object.keys(firstRow);
				console.log("money data colums: ",Object.keys(firstRow));
				// console.log("centers data: ");
				// console.log(centers);
				// console.log("participantRow:", this.columns);
				this.generateRountine(this.alldata, this.participantId[0], this.columns, 0);
				this.generateRountine(this.alldata, this.participantId[1], this.columns, 1);
	
				this.renderChart();
			} catch (error) {
				console.error("Failed to load centers data:", error);
			}
		},
		generateRountine(alldata, initlabel, columns, index) {
			let baseTime = this.startTime;
			console.log(initlabel);
			const participantRow = alldata.find(row => String(parseInt(row.participantId)) === initlabel);
			console.log(participantRow)
			const timeKeys = Object.keys(participantRow).filter(key => key !== 'participantId');
			for (let i = 1; i < columns.length - 1; i++) {
				const timeKey1 = timeKeys[i]
				const timeKey2 = timeKeys[i + 1]
				const new_1 = this.createTimeStringWithLeadingZeros(String(timeKey1));
				const new_2 = this.createTimeStringWithLeadingZeros(String(timeKey2));
				// console.log(('2022-03-01T' + new_1));
				const date1 = new Date('2022-03-01T' + new_1);
				const date2 = new Date('2022-03-01T' + new_2);
				const timeDifference = date2.getTime() - date1.getTime();
				// console.log(timeDifference);
				const typeItem = this.types.find(type => type.name === participantRow[timeKey1]);
				// console.log(participantRow[timeKey1]);
				// console.log(typeItem);
				const duration = timeDifference;
				this.data.push({
					name: typeItem.name,
					value: [index + 1, date1.getTime(), date2.getTime(), duration], // 使用 index 区分数据
					itemStyle: {
						normal: {
							color: typeItem.color
						}
					}
				});
				baseTime += duration;
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
						return params.marker + params.name + ': ' + 5 + ' min';
					}
				},
				title: {
					text: 'Daily Routine',
					left: 'center',
					textStyle: {
						color: '#fff', // 设置图例文字颜色为白色
						fontStyle:'italic'
					}
				},
				xAxis: {
					show: false // 隐藏 x 轴
				},
				yAxis: {
					type: 'category',
					data: this.participantId,
					axisLabel: {
						formatter: (value) => {
							return 'ID: ' + value; // 格式化显示 ID
						}
					}
				},
				grid: {
					height: '80%', // 使用百分比设置高度
					top:"15px"
				},
				xAxis: {
					show: false,
					min: this.startTime,
					scale: true,
					axisLabel: {
						formatter: (val) => {
							return Math.max(0, val - this.startTime)/(300) + ' ms';
						}
					},
					axisLine: {
						lineStyle: {
							color: '#fff' // 设置轴线颜色为白色
						}
					},
					axisTick: {
						show: false, // 隐藏刻度线
					}
				},
				yAxis: {
					show: true,
					data: this.participantId,
					axisLine: {
						lineStyle: {
							color: '#fff' // 设置轴线颜色为白色
						}
					},
					axisTick: {
						show: true, // 隐藏刻度线
					},					
					axisLabel: {
						formatter: (val) => {
							return "ID "+ val;
						}
					},
					
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
					y: start[1] + height*1.2,
					width: end[0] - start[0],
					height: height
				},
				style: api.style()
			};
		},
		generateLegendGraphic() {
			const legendItemWidth = 10; // Width of each legend item
			const legendItemHeight = 10; // Height of each legend item
			const legendItemMargin = 5; // Margin between legend items
			const legendWidth = legendItemWidth; // Total width of legend

			return {
				type: 'group',
				right: 1,
				top: 'center',
				layout: 'vertical',
				align: 'left',
				children: this.types.map((type, index) => ({
				type: 'group',
				left: 0,
				top: index * (legendItemHeight + legendItemMargin),
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
					left: legendItemWidth + 5,
					top: 3,
					style: {
						text: type.name,
						fill: '#fff',
						fontSize: 10,
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
