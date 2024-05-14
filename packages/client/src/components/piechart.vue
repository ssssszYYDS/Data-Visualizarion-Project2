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
			selectedLabels: []
		};
	},
	mounted() {
		this.loadData();
		bus.on('participantID', (participantID) => {
			const label =  participantID;
			if (this.selectedLabels.length >= 2) {
				this.selectedLabels.shift();
			}
			this.selectedLabels.push(label);
			console.log("selected labels: " + this.selectedLabels);
			this.updateCharts(1);
			this.updateCharts(2);
		});
	},
	methods: {
		async loadData() {
			try {
				const centers = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/Clusters/Id_cluster.csv' });
				this.alldata = centers;
				// console.log("centers data: ");
				// console.log(centers);
				this.chartData1 = this.generateChartData(this.alldata, this.initlabel1);
				this.chartData2 = this.generateChartData(this.alldata, this.initlabel2);
				this.renderChart(1);
				this.renderChart(2);
			} catch (error) {
				console.error("Failed to load centers data:", error);
			}
		},
		generateChartData(centers, selectedLabel) {
			return {
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
						'Home',
						'Work',
						'Transport',
						'Restaurant',
						'Recreation',
						'Wage',
						'Shelter',
						'Edu',
						'Food',
						'Play'
					],
					textStyle: {
						color: '#fff'
					}
				},
				series: [
					{
						name: 'Money Weighting: ID ' + selectedLabel,
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
						data: centers.map(item => ({ value: parseFloat(item[selectedLabel]), name: item[''] })).slice(5)
					},
					{
						name: 'Participant ID ' + selectedLabel,
						type: 'pie',
						radius: ['45%', '60%'],
						labelLine: {
							length: 15
						},
						label: {
							formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}/: }  {per|{d}%}',
							backgroundColor: '#F6F8FC',
							borderColor: '#8C8D8E',
							borderWidth: 1,
							borderRadius: 4,
							rich: {
								a: {
									color: '#4C5058',
									lineHeight: 20,
									fontSize: 14,
									fontWeight: 'bold',
									align: 'center'
								},
								hr: {
									borderColor: '#8C8D8E',
									width: '100%',
									borderWidth: 1,
									height: 0
								},
								b: {
									color: '#4C5058',
									fontSize: 13,
									fontWeight: 'bold',
									lineHeight: 20
								},
								per: {
									color: '#fff',
									backgroundColor: '#4C5058',
									padding: [3, 4],
									borderRadius: 4
								},
								p: {
									color: '#6E7079',
									lineHeight: 20,
									align: 'center'
								},
								c: {
									color: '#4C5058',
									lineHeight: 20,
									align: 'center'
								}
							}
						},
						data: centers.map(item => ({ value: parseFloat(item[selectedLabel]), name: item[''] })).slice(0, 5)
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
				myChart.setOption(chartData);
			}
		},
		updateCharts() {
			this.chartData1 = this.generateChartData(this.alldata, this.selectedLabels[0]);
			if (this.selectedLabels[1] == null) {
				this.chartData2 = this.generateChartData(this.alldata, this.initlabel2);
			}
			else {
				this.chartData2 = this.generateChartData(this.alldata, this.selectedLabels[1]);
			}
			this.renderChart(1);
			this.renderChart(2);
		}
	}
};
</script>

<style scoped>
.echarts-container {
	width: 100%;
	height: 400px;
	margin-bottom: -20px;
}
</style>
