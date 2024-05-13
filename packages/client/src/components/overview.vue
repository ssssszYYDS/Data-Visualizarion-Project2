<script>
  import HttpHelper from '../common/utils/axios_helper';
  import Urls from '../common/urls/index';
  export default {
    name: 'Overviewcomponent',

    // props: {
    //     date: {
    //         type: String,
    //         required: true,
    //     },
    // },

    data() {
        return {
            svg: null, // Save SVG reference for redrawing
            moneyData: null,
            timeData: null,
            width: 0,
            height: 0,
            marginRatio: { top: 0.01, right: 0.01, bottom: 0.01, left: 0.01 }, // 10% 的边距
            margin:null,
        };
    },

    // watch: {
    //     date: function (newDate) {
    //         this.initRiverMap(newDate); // 监听 date 的变化，并重新运行 initRiverMap 方法
    //     }
    // },

    beforeUnmount() {
    },
    mounted() {
      this.initData();
      
    },
  
    methods: {
      async initData() {
        const moneyData = await HttpHelper.post(Urls.getCSVData, { path: `CSVData/money.csv`, });
        this.moneyData = moneyData;
        const timeData = await HttpHelper.post(Urls.getCSVData, { path: `CSVData/time.csv`, });
        this.timeData = timeData;

        const width = d3.select(".overview").node().getBoundingClientRect().width;
        const height = d3.select(".overview").node().getBoundingClientRect().height;
        this.width = width;
        this.height = height;
        console.log("width",width);
        console.log("height",height);
        const margin = {
          top: this.marginRatio.top * height,
          right: this.marginRatio.right * width,
          bottom: this.marginRatio.bottom * height,
          left: this.marginRatio.left * width
        };
        this.margin = margin;
        const svg = d3.select(".overview")
          .append("svg")
          .attr('width', width)
          .attr('height', height)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
        this.svg = svg;

        this.drawChart(this.moneyData,this.svg);
        this.drawLineGraph(this.timeData,this.svg);
      },
      drawChart(data,svg) {
        const width = this.width;
        const height = this.height;
        const margin = this.margin;
        console.log("margin",this.margin);
        // 计算图表的内部宽度和高度
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
  
          // 获取子组和组的列表
          const subgroups =  ["Wage","Shelter","Recreation","Food","Education"];
          const groups = data.map(d => d.group);
          // 创建 Y 轴
          const y = d3.scaleBand()
            .range([0, innerHeight])
            .domain(groups)
            .padding([0.1]);
          svg.append("g")
            .call(d3.axisLeft(y));
  
          // 创建颜色比例尺
          const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);
  
          // 创建 X 轴
          const x = d3.scaleLinear()
            .domain([0, 10000000])
            .range([0, innerWidth]);
  
          // 堆叠数据
          const stackedData = d3.stack()
            .keys(subgroups)(data);
          console.log("stacked data",stackedData);
          // 创建堆叠条形图
          svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .attr("class", d => "myRect " + d.key)
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("y", d => y(d.data.group))
            .attr("x", d => x(d[0]))
            .attr("width", d => x(d[1]) - x(d[0]))
            .attr("height", y.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", (event, d) => { // 鼠标悬停时高亮特定子组
              const subGroupName = d3.select(event.target.parentNode).datum().key;
              d3.selectAll(".myRect").style("opacity", 0.2);
              d3.selectAll("." + subGroupName).style("opacity", 1);
            })
            .on("mouseleave", () => { // 鼠标离开时恢复正常状态
              d3.selectAll(".myRect").style("opacity", 1);
            });

            // Add legend
            const legend = this.svg
                .selectAll('.legend')
                .data(subgroups)
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', (d, i) => `translate(0,${i * 0.2 * height})`);

            legend.append('rect')
                .attr('x', "85%")
                .attr('y', "10%")
                .attr('width', "10%")
                .attr('height', "1%")
                .style('fill', color);

            legend.append('text')
                .attr('x', "11.3%")
                .attr('y', "90%")
                .attr('dy', '.35em')
                .style('text-anchor', 'start')
                .text((d) => d);
      
      },
      drawLineGraph(data,svg){
        const width = this.width;
        const height = this.height;
        console.log("margin",this.margin);
        // List of groups (here I have one group per column)
        var allGroup = ["AtHome","AtRecreation","AtRestaurant","AtWork","Transport"];

        // Reformat the data: we need an array of arrays of {x, y} tuples
        const dataReady = allGroup.map( function(grpName) { // .map allows to do something for each element of the list
          return {
            name: grpName,
            values: data.map(function(d) {
              return {value: +d[grpName],time: d.time};
            })
          };
        });
        // I strongly advise to have a look to dataReady with
        console.log(dataReady)

        // A color scale: one color for each group
        const myColor = d3.scaleOrdinal()
          .domain(allGroup)
          .range(d3.schemeSet2);

        // Add X axis --> it is a date format
        // 创建X轴比例尺
        const dates = data.map(d => d.time);
        const y = d3.scaleBand()
          .domain(dates)
          .range([0, height])
          .padding(0.1); // 可选，用于设置条形之间的间隔
        // svg.append("g")
        //   .attr("transform", `translate(0, ${height})`)
        //   .call(d3.axisBottom(x));

        // Add X axis
        const x = d3.scaleLinear()
          .domain( [0,5000000])
          .range([0,width]);
        // svg.append("g")
        //   .call(d3.axisLeft(y));

        // Add the lines
        const line = d3.line()
          .x(d => x(+d.value))
          .y(d => y(d.time));

        svg.selectAll("myLines")
          .data(dataReady)
          .join("path")
            .attr("class", d => d.name)
            .attr("d", d => line(d.values))
            .attr("stroke", d => myColor(d.name))
            .style("stroke-width", 3)
            .style("fill", "none")

        // Add the points
        svg
          // First we need to enter in a group
          .selectAll("myDots")
          .data(dataReady)
          .join('g')
            .style("fill", d => myColor(d.name))
            .attr("class", d => d.name)
          // Second we need to enter in the 'values' part of this group
          .selectAll("myPoints")
          .data(d => d.values)
          .join("circle")
            .attr("cy", d => y(d.time))
            .attr("cx", d => x(d.value))
            .attr("r", 4)
            .attr("stroke", "white")
      }
    }
  };
  </script>
  
  <style scoped>
  /* 添加样式 */
  </style>
  