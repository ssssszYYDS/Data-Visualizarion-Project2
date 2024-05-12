<script setup>
import Mapcomponent from './modules/home/index.vue';
// import GameCategoriesComponent from './components/GameCategories.vue';
// import PicturesComponent from './components/Pictures.vue';
// import BarChartComponent from './components/BarChart.vue';
import RivermapComponent from './components/Rivermap.vue';
// import FeatureClusterComponent from './components/FeatureCluster.vue';
// import WordCloudComponent from './components/WordCloud.vue';
// import FunCommentsComponent from './components/FunComments.vue';
// import SaveComponent from './components/Save.vue';

// const date = '2022-03-01';
const date = '2022-03-05';
</script>

<template>
  <div class="wrapper">
    <div class="calendar">
      <button @click="toDetail" style="width: 100%; height: 100%;">
        Calendar
      </button>
    </div>
    <div id="chart" class="map">
      <Mapcomponent :date="date"></Mapcomponent>
    </div>
    <div class="timeline">
      <div class="time-point"></div>
    </div>
    <div id="river-chart" class="rivermap">
      <!-- <button @click="toDetail" style="width: 100%; height: 100%;">
        Under-Timeline-Plot
      </button> -->
      <RivermapComponent :date="date"></RivermapComponent>
    </div>
    <div class="scatter-plot">
      <button @click="toDetail" style="width: 100%; height: 100%;">
        Scatter-Plot
      </button>
    </div>
    <div class="daily-life-plot">
      <button @click="toDetail" style="width: 100%; height: 100%;">
        Daily-Life-Plot
      </button>
    </div>
    <div class="overview">
      <button @click="toDetail" style="width: 100%; height: 100%;">
        Overview
      </button>
    </div>
    <!-- <div class="request">
      <button @click="renderBuildings" style="width: 100%; height: 100%;">
        Render buildings
      </button>
    </div> -->
  </div>
</template>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  grid-template-rows: repeat(20, 2.8vh);
  gap: 10px;
  height: 100%;
  width: 100%;
}

.calendar {
  grid-area: 1 / 1 / 10 / 5;
}

.map {
  grid-area: 1 / 5 / 39 / 17;
}

.clock {
  grid-area: 31 / 14 / 38 / 16;
}

.scatter-plot {
  grid-area: 1 / 17 / 9 / 21;
}

.overview {
  grid-area: 10 / 1 / 56 / 5;
}

.timeline {
  grid-area: 39 / 5 / 41 / 17;
}

.rivermap {
  grid-area: 41 / 5 / 56 / 17;
}


.daily-life-plot {
  grid-area: 9 / 17 / 56 / 21;
}

.request {
  grid-area: 1 / 1 / 2 / 2;
}
</style>