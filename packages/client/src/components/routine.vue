<template>
  <div ref="chart" style="width: 100%; height: 80%;"></div>
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
      alldata_1: null,
      data: [],
      columns:[],
      participantId: ["1","2"],
      startTime: +new Date("2022-03-01T00:00:00"),
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
  },
  methods: {
    async loadData() {
      try {
        this.data = []; // 清空之前的数据
        const centers = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/2022-03-01.csv' });
        const centers_1 = await HttpHelper.post(Urls.getCSVData, { path: 'CSVData/2022-03-05.csv' });
        this.alldata = centers;
        this.alldata_1 = centers_1;
        const firstRow = centers[0];
        this.columns = Object.keys(firstRow);
        // console.log("money data colums: ",Object.keys(firstRow));
        // console.log("centers data: ");
        // console.log(centers);
        // console.log("participantRow:", this.columns);
        this.generateRountine(this.alldata, this.participantId[0],this.columns,0);
        this.generateRountine(this.alldata, this.participantId[1],this.columns,1);
        // this.generateRountine(this.alldata_1, this.participantId[0],this.columns,2);
        // this.generateRountine(this.alldata_1, this.participantId[1],this.columns,3);
        this.renderChart();
      } catch (error) {
        console.error("Failed to load centers data:", error);
      }
    },
    generateRountine(alldata, initlabel, columns,index) {
      let baseTime = this.startTime;
      const participantRow = alldata.find(row => row.participantId === initlabel);
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
        const typeItem = this.types.find(type=>type.name===participantRow[timeKey1]);
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
        tooltip: {
          formatter: (params) => {
            return params.marker + params.name + ': ' + params.value[3] + ' ms';
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
        dataZoom: [
          {
            type: 'slider',
            filterMode: 'weakFilter',
            showDataShadow: false,
            top: 400,
            labelFormatter: ''
          },
          {
            type: 'inside',
            filterMode: 'weakFilter'
          }
        ],
        grid: {
          height: '50%', // 使用百分比设置高度
          // top: '-50px' // 调整y轴位置的值，可以根据需要调整
        },
        xAxis: {
          show:false,
          min: this.startTime,
          scale: true,
          axisLabel: {
            formatter: (val) => {
              return Math.max(0, val - this.startTime) + ' ms';
            }
          }
        },
        yAxis: {
          show:false,
          data: this.participantId,
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
          y: start[1] - height / 2,
          width: end[0] - start[0],
          height: height
        },
        style: api.style()
      };
    }
  }
};
</script>

<style>
/* Add any necessary styles here */
</style>
