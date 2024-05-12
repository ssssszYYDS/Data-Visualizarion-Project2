<!-- App.vue -->

<script setup>
import { ref } from 'vue';
import Mapcomponent from './modules/home/index.vue';
import CategoriesComponent from './components/Categories.vue';
import ClusterGraphComponent from './components/ClusterGraph.vue';
import RivermapComponent from './components/Rivermap.vue';

const date = ref('2022-03-01');
const selectedId = ref(null);

const handleDateUpdate = (newDate) => {
  date.value = newDate;
}
const handleSelectedIdUpdate = (newId) => {
  selectedId.value = newId;
}

</script>

<template>
  <div class="wrapper">
    <div class="calendar">
      <CategoriesComponent :date="date" @update:date="handleDateUpdate">
      </CategoriesComponent>
      <p>当前日期：{{ date }}</p>
    </div>
    <div id="chart" class="map">
      <Mapcomponent :date="date" :selectedId="selectedId"></Mapcomponent>
    </div>
    <div class="timeline">
      <div class="time-point"></div>
    </div>
    <div id="river-chart" class="rivermap">
      <RivermapComponent :date="date"></RivermapComponent>
    </div>
    <div class="scatter-plot">
      <ClusterGraphComponent :selectedId="selectedId" @update:selectedId="handleSelectedIdUpdate">
      </ClusterGraphComponent>
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