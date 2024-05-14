<template>
	<button style="width: 100%; height: 100%;">
		<div class="calendar" ref="chart"></div>
	</button>

</template>

<script>
import * as echarts from 'echarts';

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
			function getVirtulData(year, month, day) {
				year = year || '2022';
				month = month || '3';
				let date = new Date(`${year}-${month}-${day}`);
				let end = new Date(year, month, 0);
				let dayTime = 3600 * 24 * 1000;
				let data = [];
				for (let time = date.getTime(); time <= end.getTime(); time += dayTime) {
					let currentDate = new Date(time);
					let formattedDate = currentDate.getFullYear() + '-' + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentDate.getDate()).slice(-2);
					data.push([formattedDate, currentDate.getDate()]);
				}
				return data;
			}
			const option = {
				calendar: [
					{
						left: 'center',
						top: 'middle',
						cellSize: [this.cellWidth, this.cellHeight],
						yearLabel: { show: false },
						orient: 'vertical',
						dayLabel: {
							firstDay: 1,
							nameMap: 'cn'
						},
						monthLabel: {
							show: false
						},
						range: '2022-3',
						cellStyle: {
							fill: 'rgba(0, 0, 0, 0.05)', // 背景颜色
							stroke: 'black' // 边框颜色
						}
					}
				],
				series: [
					{
						type: 'custom',
						coordinateSystem: 'calendar',
						renderItem: function (params, api) {
							const cellPoint = api.coord(api.value(0));
							const cellWidth = params.coordSys.cellWidth;
							const cellHeight = params.coordSys.cellHeight;

							return {
								type: 'text',
								style: {
									x: cellPoint[0],
									y: cellPoint[1],
									text: api.value(1), // 显示日期
									fill: 'black', // 修改数字颜色为黑色
									textFont: api.font({ fontSize: 14 }),
									textAlign: 'center',
									textVerticalAlign: 'middle'
								}
							};
						},
						dimensions: ['date', 'day'],
						data: getVirtulData('2022', '3', '1')
					}
				]
			};
			this.calendarInstance.setOption(option);
			this.resizeChart(); // 初始调整大小
			this.calendarInstance.on('click', this.handleCellClick);
		},
		resizeChart() {
			const chartDom = this.$refs.chart;
			const width = chartDom.clientWidth;
			const height = chartDom.clientHeight - 50;
			this.cellWidth = Math.floor(width / 7); // 每周7天
			this.cellHeight = Math.floor(height / 6); // 6行
			this.calendarInstance.setOption({
				calendar: {
					cellSize: [this.cellWidth, this.cellHeight]
				}
			});
		},
		handleCellClick(params) {
			if (params.componentType === 'series') {
				this.$emit('update:date', params.value[0]); // 使用this.$emit而不是this.emit
				// this.$emit('update:selectedId', 'null', null);
				// this.$emit('update:selectedId', 'null', null);
				// alert('The day you have chose: ' + params.value[0]); // 显示正确的日期
			}
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
