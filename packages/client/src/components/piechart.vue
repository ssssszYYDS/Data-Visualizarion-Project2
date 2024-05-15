<template>
	<div>
		<div class="echarts-container" ref="echartsRef1"></div>
		<div class="echarts-container" ref="echartsRef2"></div>
	</div>
</template>

<script>
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
import HttpHelper from '../common/utils/axios_helper';
import Urls from '../common/urls/index';
import bus from '../common/utils/bus';

export default {
	data() {
		return {
			chartData1: null,
			chartData2: null,
			alldata: null,
			initlabel1: '1',
			initlabel2: '2',
			selectedLabels: [],
			nullDataOption: {
				title: {
					text: "ID null",
					top: "20%",
					right: 0,
					textStyle: {
						color: '#fff',
						fontSize: 24,
						fontStyle: 'italic',
					}
				},
				tooltip: {
					trigger: 'item',
					formatter: '{a}: {d}%',
				},
				grid: {
					right: "25%",
					left: "25%",
				},
				legend: {
					data: [
						'null',
					],
					textStyle: { color: '#fff' },
					itemWidth: 20, // 调整图例项宽度
					itemHeight: 10, // 调整图例项高度
				},
				series: [
					{
						name: 'Money Weighting: ID null',
						type: 'pie',
						selectedMode: 'single',
						radius: [0, '30%'],
						label: {
							position: 'inner',
							fontSize: 10,
							textStyle: {
								color: '#fff'
							}
						},
						labelLine: { show: false },
						data: [{ value: 0, name: 'null', itemStyle: { color: '#808080' } }
						]
					},
					{
						name: 'Participant ID null',
						type: 'pie',
						radius: ['45%', '60%'],
						data: [{ value: 0, name: 'null', itemStyle: { color: '#808080' } }],
					}
				]
			}
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

	mounted() {
		this.loadData();
		this.renderChart(1);
		this.renderChart(2);
	},

	watch: {
		selectedId1: function (newId) {
			this.chartData1 = this.generateChartData(this.alldata, this.selectedId1.id);
			this.renderChart(1);
		},
		selectedId2: function (newId) {
			this.chartData2 = this.generateChartData(this.alldata, this.selectedId2.id);
			this.renderChart(2);
		}
	},

	methods: {
		async loadData() {
			try {
				const centers = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/Clusters/Id_cluster.csv' });
				this.alldata = centers;
				this.chartData1 = this.generateChartData(this.alldata, this.selectedId1.id);
				this.chartData2 = this.generateChartData(this.alldata, this.selectedId2.id);
			} catch (error) {
				console.error("Failed to load centers data:", error);
			}
		},
		generateChartData(centers, selectedLabel) {
			if (selectedLabel == 'null' || selectedLabel == null || selectedLabel == undefined)
				return null;
			return {
				title: {
					text: "ID " + selectedLabel,
					top: "20%",
					right: 0,
					textStyle: {
						color: '#fff',
						fontSize: 24,
						fontStyle: 'italic',
					}
				},
				tooltip: {
					trigger: 'item',
					formatter: '{a}: {d}%',
				},
				grid: {
					top: '100%', // 调整图表向上移动的值
					right: "25%",
					left: "25%",

				},
				legend: {
					data: [
						'Home',
						'Transport',
						'Recreation',
						'Restaurant',
						'Work',
						'Wage',
						'Shelter',
						'Edu',
						'Food',
						'Play'
					],
					textStyle: {
						color: '#fff'
					},
					itemWidth: 20, // 调整图例项宽度
					itemHeight: 10, // 调整图例项高度
					bottom: 26,
				},
				series: [
					{
						name: 'Money Weighting',
						type: 'pie',
						selectedMode: 'single',
						radius: [0, '30%'],
						label: {
							position: 'inner',
							fontSize: 10,
							textStyle: {
								color: '#fff'
							}
						},
						labelLine: {
							show: false
						},
						data: centers.map((item, index) => ({
							value: parseFloat(item[selectedLabel]),
							name: item[''],
							itemStyle: {
								color: ['#0077cc', '#ffbb33', '#66cc66', '#cc0000', '#9933cc', '#46B0FF', '#ff69b4', '#33FF49', '#6600cc', '#ff8800'][index]
							}
						})).slice(5)
					},
					{
						name: 'Time Weighting',
						type: 'pie',
						radius: ['45%', '60%'],
						data: centers.map((item, index) => ({
							value: parseFloat(item[selectedLabel]),
							name: item[''],
							itemStyle: {
								color: ['#0077cc', '#ffbb33', '#66cc66', '#cc0000', '#9933cc', '#46B0FF', '#ff69b4', '#33FF49', '#6600cc', '#ff8800'][index]
							}
						})).slice(0, 5)
					}
				]
			};
		},
		renderChart(chartNumber) {
			let echartsRef = this.$refs['echartsRef' + chartNumber];
			if (echartsRef._chart) {
				echartsRef._chart.dispose();
			}
			let myChart = echarts.init(echartsRef);
			let chartData = chartNumber === 1 ? this.chartData1 : this.chartData2;
			if (chartData) {
				console.log("chartData: ");
				console.log(chartData);
				myChart.setOption(chartData);
			} else {
				console.log("No data for chart " + chartNumber);
				myChart.setOption(this.nullDataOption);
			}
		},
	}
};
</script>

<style scoped>
.echarts-container {
	width: 100%;
	height: 400px;
	/* margin-bottom: 0px; */
	margin-top: -36px;
}
</style>
