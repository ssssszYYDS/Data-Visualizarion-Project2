<template>
      <div ref="main" style="width: 100%; height:100%;"></div>
      <div v-if="selectedData.length > 0" class="selected-data">
        <h3>Selected Data Indices:</h3>
        <ul>
          <li v-for="(item, index) in selectedData" :key="index">{{ item }}</li>
        </ul>
      </div>
</template>
  
  <script>
  import * as echarts from 'echarts';
import { fa } from 'element-plus/es/locale/index.mjs';
  
  export default {
    name: 'NewOverviewComponent',
    data() {
      return {
        myChart: null,
        xAxisData: [],
        Wage: [],
        Shelter: [],
        Education: [],
        Food: [],
        Recreation:[],

        AtHome:[],
        AtRecreation:[],
        AtRestaurant:[],
        AtWork:[],
        Transport:[],
        selectedData: []
      };
    },
    mounted() {
        this.generateData();
        this.generateDataTime();
        this.renderChart();
    },
    methods: {
      generateData() {
        this.xAxisData=["202203", "202204", "202205", "202206", "202207","202208", "202209", "202210", "202211", "202212","202301", "202302", "202303", "202304", "202305"],
        this.Wage = [
                        6402719, 3468756, 3623067, 3608882, 3485798,
                        3763807, 3610503, 3483352, 3607155, 3627931,
                        3623060, 3292643, 3767956, 3326739, 2940645
                    ];
        this.Shelter = [
                            1162645, 559918, 558450, 558450, 558450,
                            558450, 558450, 558450, 558450, 558450,
                            558450, 558450, 558450, 558450, 558450
                        ];
        this.Education = [
                            28707,11423, 11423, 11423, 11423,
                            11423, 11423, 11423, 11423, 11423,
                            11423, 11423, 11423, 11423, 11423
                        ];
        this.Food = [
                        327843, 304297, 313555, 302909, 313819,
                        312841, 302878, 313577, 302847, 313102,
                        313271, 282477, 312974, 303816, 242305
                    ];
        this.Recreation = [
                                649590, 389694, 336418, 314808, 329613,
                                306962, 301910, 326722, 288290, 316620,
                                311579, 271126, 295210, 310294, 224251
                            ]
      },
      generateDataTime(){
        this.AtHome = [0.5246291594482403,0.5968379103535354,0.6115411931818182,
                        0.606623658459596, 0.6225098769957641,0.6081021912675139,
                        0.6092050715488215,0.6235320696888237,0.6130377998737374,
                        0.6156573293418052,0.617096366894754, 0.6181954334352782,
                        0.6103828099543825,0.6281309185606061,0.6147825927172363];
        this.AtRecreation = [0.08773595923421668,0.0563604797979798, 0.04693800403225806,
                                0.04526120580808081,0.04613295250896057,0.0428488514173998, 
                                0.04357980850168350,0.04570541605571848,0.04161589856902357,
                                0.04421228413163897,0.0435290404040404, 0.04201572674509137,
                                0.04129767941511893,0.04477667297979798,0.040860611682461946];
        this.AtRestaurant = [0.015986386544479512,0.01564749053030303, 0.015497464565004887,
                                0.015375105218855219,0.015506119664385793,0.01550191939556859, 
                                0.015405092592592592,0.015457243809058325,0.015422716750841751,
                                0.015423641658520691,0.015437642554578038,0.015404183492878492,
                                0.015445915811339198,0.01559698547979798, 0.01526841201369155];
        this.AtWork = [0.24971549394823847,0.23492042824074075,0.23741675830889541,
                                0.24409077756734007,0.22862979594330402,0.24635276657706093,
                                0.24424110900673401,0.22849385997067448,0.24400239372895624,
                                0.23767641129032258,0.23741675830889541,0.23879929862228572,
                                0.24657194424079504,0.22555068918350168,0.24358068251537135];
        this.Transport = [0.12193300082482503,0.09623369107744108,0.08860657991202346,
                            0.08864925294612795,0.08722125488758553,0.08719427134245683,
                            0.08756891835016835,0.08681141047572499,0.08592119107744108,
                            0.08703033357771262,0.08652019183773216,0.08558535770446622,
                            0.0863016505783643,0.0859447337962963,0.08550770107123887];
                            this.AtHome = this.AtHome.map(value => (value * 24).toFixed(1));
                            this.AtRecreation = this.AtRecreation.map(value => (value * 24).toFixed(1));
                            this.AtRestaurant = this.AtRestaurant.map(value => (value * 24).toFixed(1));
                            this.AtWork = this.AtWork.map(value => (value * 24).toFixed(1));
                            this.Transport = this.Transport.map(value => (value * 24).toFixed(1));
      },
      renderChart() {
        // 获取父容器的宽度和高度
        const myChart = echarts.init(this.$refs.main);
        myChart.setOption({
            title: {
                text: 'Monthly Expenditure',
                left: 'center',
                top:'3%',
                textStyle: {
                color: '#fff',
              }
            },
          legend: [
            {
                data: ['Wage','Shelter','Education','Food','Recreation'],
                right: '3%',
                orient: 'vertical',
                top: '20%',
                textStyle: {
                color: '#fff',
              }
            },
            {
                data: ['AtHome','AtRecreation','AtRestaurant','AtWork','Transport'],
                right: '1%',
                orient: 'vertical',
                bottom: '20%',
                inactiveColor: '#ccc', // 将第二套图例的所有项设置为灰色显示
                textStyle: {
                color: '#fff',
              }
            }
        ],
        //   brush: {
        //     toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
        //     xAxisIndex: 0
        //   },
          toolbox: {
            feature: {
              magicType: {
                type: ['stack']
              },
              dataView: {}
            }
          },
          tooltip: {
            trigger: 'axis',
            position: function (point, params, dom, rect, size) {
                // 提示框浮动位置
                var res = [point[0] + 10, point[1] - 10];
                // 如果提示框超出了页面宽度，则放置在鼠标的左边
                if (res[0] + size.contentSize[0] > size.viewSize[0]) {
                res[0] = point[0] - size.contentSize[0] - 10;
                }
                // 如果提示框超出了页面高度，则放置在鼠标的上方
                if (res[1] + size.contentSize[1] > size.viewSize[1]) {
                res[1] = point[1] - size.contentSize[1] + 10;
                }
                return res;
            }
          },
          yAxis: {
            data: this.xAxisData,
            axisLine: { onZero: true },
            splitLine: { show: false },
            splitArea: { show: false },
            axisLabel: {show: false},
            axisTick: { show: false },
            inverse: true,
            scale: true,
            
          },
          xAxis: [
         {
            axisLine: { onZero: true },
            splitLine: { show: false },
            splitArea: { show: false },
            axisTick: { show: false },
            axisLabel: {show: false},
          },
          {
            axisLine: { onZero: true },
            splitLine: { show: false },
            splitArea: { show: false },
            axisTick: { show: false },
            axisLabel: {show: false},
            scale: false,
          },
        ],
          grid: {
            bottom: 0,
            left: 10
          },
          series: [
            {
              name: 'Wage',
              type: 'bar',
              stack: 'one',
              emphasis: this.emphasisStyle,
              data: this.Wage,
              xAxisIndex: 0
            },
            {
              name: 'Shelter',
              type: 'bar',
              stack: 'two',
              emphasis: this.emphasisStyle,
              data: this.Shelter,
              xAxisIndex: 0
            },
            {
              name: 'Education',
              type: 'bar',
              stack: 'two',
              emphasis: this.emphasisStyle,
              data: this.Education,
              xAxisIndex: 0
            },
            {
              name: 'Food',
              type: 'bar',
              stack: 'two',
              emphasis: this.emphasisStyle,
              data: this.Food,
              xAxisIndex: 0
            },
            {
              name: 'Recreation',
              type: 'bar',
              stack: 'two',
              emphasis: this.emphasisStyle,
              data: this.Recreation,
              xAxisIndex: 0
            },

            {
                name: 'AtHome',
                type: 'line',
                data: this.AtHome,
                xAxisIndex: 1,
                show: false,
            },
            {
                name: 'AtRecreation',
                type: 'line',
                data: this.AtRecreation,
                xAxisIndex: 1,
                show: false,
            },
            {
                name: 'AtRestaurant',
                type: 'line',
                data: this.AtRestaurant,
                xAxisIndex: 1,
                show: false,
            },
            {
                name: 'AtWork',
                type: 'line',
                data: this.AtWork,
                xAxisIndex: 1,
                show: false,
            },
            {
                name: 'Transport',
                type: 'line',
                data: this.Transport,
                xAxisIndex: 1,
                show: false,
            }
          ]

        });
  
        // myChart.on('brushSelected', params => {
        //   const brushed = [];
        //   const brushComponent = params.batch[0];
        //   for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
        //     const rawIndices = brushComponent.selected[sIdx].dataIndex;
        //     brushed.push('[Series ' + sIdx + '] ' + rawIndices.join(', '));
        //   }
        //   this.selectedData = brushed;
        // });


        // this.$once('hook:beforeDestroy', () => {
        //   myChart.dispose();
        // });
      
    }
    }
  };
  </script>
  
  <style scoped>
  .echarts-container {
    width: 100%; /* 设置父容器的宽度为 100% */
    height: 100%; /* 设置父容器的高度为 100% */
  }
  .selected-data {
    margin-top: 20px;
  }
  .selected-data h3 {
    margin-bottom: 10px;
  }
  .selected-data ul {
    list-style-type: none;
    padding-left: 0;
  }
  .selected-data li {
    margin-bottom: 5px;
  }

  </style>