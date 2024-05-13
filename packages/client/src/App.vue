<!-- App.vue -->

<script setup>
import { ref } from 'vue';
import Mapcomponent from './modules/home/index.vue';
import CalendarComponent from './components/Calendar.vue';
import ClusterGraphComponent from './components/ClusterGraph.vue';
import RivermapComponent from './components/Rivermap.vue';

const date = ref('2022-03-01');
const handleDateUpdate = (newDate) => {
	date.value = newDate;
}


const selectedId1 = ref('null');
const selectedId2 = ref('null');
var nextChangeId = 1;
const handleSelectedIdUpdate = (newId) => {
	if (newId === 'null') {
		if (selectedId1.value == 'null') {
			selectedId2.value = 'null';
			nextChangeId = 1;
		} else if (nextChangeId === 1) {
			selectedId1.value = 'null';
			nextChangeId = 2;
		} else {
			selectedId2.value = 'null';
			nextChangeId = 1;
		}
	} else if (selectedId1.value == newId) {
		selectedId1.value = 'null';
		nextChangeId = 1;
	} else if (selectedId2.value == newId) {
		selectedId2.value = 'null';
		nextChangeId = selectedId1.value == 'null' ? 1 : 2;
		console.log('selectedId1: ', selectedId1.value);
		console.log('nextChangeId: ', nextChangeId);
	} else if (selectedId1.value === 'null') {
		selectedId1.value = newId;
		nextChangeId = 2;
	} else if (selectedId2.value === 'null') {
		selectedId2.value = newId;
		nextChangeId = 1;
	} else if (nextChangeId === 1) {
		selectedId1.value = newId;
		nextChangeId = 2;
	} else {
		selectedId2.value = newId;
		nextChangeId = 1;
	}
	if (selectedId1.value === 'null')
		selectedId1.value = 'null';
	if (selectedId2.value === 'null')
		selectedId2.value = 'null';
}

const updateSelectedIdByIndex = (newId, index) => {
	if (index == 1) {
		selectedId1.value = newId;
		nextChangeId = newId == null ? 1 : 2;
	}
	else if (index == 2) {
		selectedId2.value = newId;
		nextChangeId = newId == null ? 2 : 1;
	}
	else
		console.error('Invalid selectedId index: ', index);
}

</script>

<template>
	<div class="wrapper">
		<div class="calendar">
			<CalendarComponent :date="date" @update:date="handleDateUpdate">
			</CalendarComponent>
			<p>当前日期：{{ date }}</p>
		</div>
		<div id="chart" class="map">
			<Mapcomponent :date="date" :selectedId1="selectedId1" :selectedId2="selectedId2"></Mapcomponent>
		</div>
		<div class="timeline">
			<div class="time-point"></div>
		</div>
		<div id="river-chart" class="rivermap">
			<RivermapComponent :date="date"></RivermapComponent>
		</div>
		<div class="scatter-plot">
			<ClusterGraphComponent :selectedId1="selectedId1" :selectedId2="selectedId2"
				@update:selectedId="handleSelectedIdUpdate" @update:selectedIdByIndex="updateSelectedIdByIndex">
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