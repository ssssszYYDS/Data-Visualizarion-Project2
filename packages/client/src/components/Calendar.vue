<template>
	<button style="width: 100%; height: 100%; background-color: #404a59;">
		<div class="calendar" ref="chart"></div>
	</button>

</template>

<script>
import * as echarts from 'echarts';
import bus from '../common/utils/bus';
export default {
	data() {
		return {
			calendarInstance: null,
			cellWidth: 0,
			cellHeight: 0
		};
	},
	name: 'Calendar',

	props: {
		date: {
			type: String,
			required: true
		}
	},
	mounted() {
		this.initChart();
		window.addEventListener('resize', this.resizeChart);
	},
	destroyed() {
		window.removeEventListener('resize', this.resizeChart);
	},
	methods: {
		initChart() {
			const chartDom = this.$refs.chart;
			this.calendarInstance = echarts.init(chartDom);
			const option = {
				backgroundColor: '#404a59',
				title: {

					text: 'Calendar',
					// subtext: '2022-3 to 2023-5',
					left: 'center',
					top: 60,
					textStyle: {
						color: '#fff',
						fontSize: 28,
						fontStyle: 'italic'
					}
				},
				tooltip: {
					trigger: 'item',
					formatter: function (params) {
						const date = echarts.format.formatTime('yyyy-MM-dd', params.value[0]);
						return '<span style="color: black; font-weight: bold;">Date:</span> ' + date;
					}
				},
				// legend: {
				// top: '30',
				// left: '100',
				// data: ['Steps', 'Top 12'],
				// textStyle: {
				// 	color: '#fff'
				// }
				// },
				calendar: [
					{
						top: 180,
						left: 'center',
						range: ['2022-03-01', '2022-7-31'],
						splitLine: {
							show: true,
							lineStyle: {
								color: '#A09089',
								width: 4,
								type: 'solid'
							}
						},
						yearLabel: {
							formatter: '{start}  1st',
							color: '#fff',
							position: 'top',
							fontSize: 18,
							margin: 20
						},
						monthLabel: {
							color: '#fff',
							nameMap: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
						},
						dayLabel: {
							firstDay: 1,
							fontFamily: 'Verdana',
							color: '#FFFF00',
							fontSize: 7,
							nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
							margin: 5,
							show: true
						},
						itemStyle: {
							color: '#323c48',
							borderWidth: 1,
							borderColor: '#A09089'
						},
						cellSize: [18, 18]
					},
					{
						top: 390,
						left: 'center',
						range: ['2022-8-1', '2022-12-31'],
						splitLine: {
							show: true,
							lineStyle: {
								color: '#A09089',
								width: 4,
								type: 'solid'
							}
						},
						monthLabel: {
							color: '#fff',
							nameMap: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
						},
						yearLabel: {
							formatter: '{start}  2nd',
							color: '#fff',
							position: 'top',
							fontSize: 18,
							margin: 20
						},
						dayLabel: {
							firstDay: 1,
							color: '#FFFF00',
							fontFamily: 'Verdana',
							fontSize: 7,
							nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
							margin: 5,
							show: true
						},
						itemStyle: {
							color: '#323c48',
							borderWidth: 1,
							borderColor: '#A09089'
						},
						cellSize: [18, 18]
					},
					{
						top: 600,
						left: 'center',
						range: ['2023-1-1', '2023-5-24'],
						splitLine: {
							show: true,
							lineStyle: {
								color: '#A09089',
								width: 4,
								type: 'solid'
							}
						},
						monthLabel: {
							color: '#fff',
							nameMap: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
						},
						yearLabel: {
							formatter: '{start}  3rd',
							color: '#fff',
							position: 'top',
							fontSize: 18,
							margin: 20
						},
						dayLabel: {
							firstDay: 1,
							fontFamily: 'Verdana',
							color: '#FFFF00',
							fontSize: 7,
							nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
							margin: 5,
							show: true
						},
						itemStyle: {
							color: '#323c48',
							borderWidth: 1,
							borderColor: '#A09089'
						},
						cellSize: [18, 18]
					}
				],
				series: [
					{
						type: 'scatter',
						coordinateSystem: 'calendar',
						symbol: 'rect',
						symbolSize: function (val) {
							return [20, 20];
						},
						itemStyle: {
							color: 'transparent'
						},
						label: {
							show: true,
							fontWeight: 'bold',
							formatter: function (params) {
								return echarts.format.formatTime('dd', params.value[0]);
							},
							color: '#fff',
							fontFamily: 'Arial',
							fontSize: 9,
							offset: [0, 0]
						},
						data: this.getVirtualData("2022")
					},
					{
						type: 'scatter',
						coordinateSystem: 'calendar',
						calendarIndex: 1, 
						symbol: 'rect',
						symbolSize: function (val) {
							return [20, 20];
						},
						itemStyle: {
							color: 'transparent'
						},
						label: {
							show: true,
							fontWeight: 'bold',
							formatter: function (params) {
								return echarts.format.formatTime('dd', params.value[0]);
							},
							color: '#fff',
							fontFamily: 'Arial',
							fontSize: 10,
							offset: [0, 0],
						},
						data: this.getVirtualData("2022") 
					},
					{
						type: 'scatter',
						coordinateSystem: 'calendar',
						calendarIndex: 2, 
						symbol: 'rect',
						symbolSize: function (val) {
							return [20, 20];
						},
						itemStyle: {
							color: 'transparent'
						},
						label: {
							show: true,
							fontWeight: 'bold',
							formatter: function (params) {
								return echarts.format.formatTime('dd', params.value[0]);
							},
							color: '#fff',
							fontFamily: 'Arial',
							fontSize: 10,
							offset: [0, 0]
						},
						data: this.getVirtualData("2022") 
					}
				]
			};
			this.calendarInstance.setOption(option);
			this.resizeChart(); 
			this.calendarInstance.on('click', this.handleCellClick);
		},
		resizeChart() {
			const chartDom = this.$refs.chart;
			const width = chartDom.clientWidth;
			const height = chartDom.clientHeight - 50;
			this.cellWidth = Math.floor(width / 26);
			this.cellHeight = Math.floor(height / 4); 
			this.calendarInstance.setOption({
				title: {
					top: this.cellHeight / 6,
				},
				calendar: [{
					cellSize: [this.cellWidth, this.cellWidth],
					top: this.cellHeight * 0.9
				},
				{
					cellSize: [this.cellWidth, this.cellWidth],
					top: this.cellHeight * 2.1
				},
				{
					cellSize: [this.cellWidth, this.cellWidth],
					top: this.cellHeight * 3.3
				}],
				series: [{
					label: {
						fontSize: this.cellWidth / 2 + 1
					}
				},
				{
					label: {
						fontSize: this.cellWidth / 2 + 1
					}
				},
				{
					label: {
						fontSize: this.cellWidth / 2 + 1
					}
				}]
			});
		},
		handleCellClick(params) {
			if (params.componentType === 'series') {
				this.$emit('update:date', params.value[0]); 
				bus.emit('time', params.value[0]);
			}
		},
		getVirtualData(year) {
			const dateStart = +echarts.time.parse(year + '-03-01');
			const dateEnd = +echarts.time.parse(+year + 1 + '-05-24');
			const dayTime = 3600 * 24 * 1000;
			const data = [];
			for (let time = dateStart; time <= dateEnd; time += dayTime) {
				data.push([echarts.time.format(time, '{yyyy}-{MM}-{dd}', false)]);
			}
			return data;
		}
	}
};
</script>

<style scoped>
.calendar {
	width: 100%;
	height: 100%;
}
</style>
