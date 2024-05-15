<!-- App.vue -->

<script setup>
import { ref } from 'vue';
import Mapcomponent from './modules/home/index.vue';
import CalendarComponent from './components/Calendar.vue';
import ClusterGraphComponent from './components/ClusterGraph.vue';
import Piecomponent from './components/piechart.vue';
import RivermapComponent from './components/Rivermap.vue';
import RountineComponent from './components/routine.vue';
import NewOverviewComponent from './components/overviewNew.vue';
const date = ref('2022-03-01');
const handleDateUpdate = (newDate) => {
	date.value = newDate;
}


const selectedId1 = ref({ id: 'null', label: null });
const selectedId2 = ref({ id: 'null', label: null });
var nextChangeId = 1;
const handleSelectedIdUpdate = (newId, newLabel) => {
	if (newId === 'null') {
		if (selectedId1.value.id == 'null') {
			selectedId2.value = { id: 'null', label: null };
			nextChangeId = 1;
		} else if (nextChangeId === 1) {
			selectedId1.value = { id: 'null', label: null };
			nextChangeId = 2;
		} else {
			selectedId2.value = { id: 'null', label: null };
			nextChangeId = 1;
		}
	} else if (selectedId1.value.id == newId) {
		selectedId1.value = { id: 'null', label: null };
		nextChangeId = 1;
	} else if (selectedId2.value.id == newId) {
		selectedId2.value = { id: 'null', label: null };
		nextChangeId = selectedId1.value.id == 'null' ? 1 : 2;
	} else if (selectedId1.value.id === 'null') {
		selectedId1.value = { id: newId, label: newLabel };
		nextChangeId = 2;
	} else if (selectedId2.value.id === 'null') {
		selectedId2.value = { id: newId, label: newLabel };
		nextChangeId = 1;
	} else if (nextChangeId === 1) {
		selectedId1.value = { id: newId, label: newLabel };
		nextChangeId = 2;
	} else {
		selectedId2.value = { id: newId, label: newLabel };
		nextChangeId = 1;
	}
}

</script>

<template>
	<div class="wrapper" style="background-color: #BFD9DE">
		<div class="calendar">
			<CalendarComponent :date="date" @update:date="handleDateUpdate" :selectedId1=selectedId1
				:selectedId2=selectedId2 @update:selectedId="handleSelectedIdUpdate">
			</CalendarComponent>
		</div>
		<div id="chart" class="map">
			<Mapcomponent :date="date" :selectedId1=selectedId1 :selectedId2=selectedId2>
			</Mapcomponent>
		</div>
		<div class="timeline">
			<div class="time-point"></div>
		</div>
		<div id="river-chart" class="rivermap">
			<RivermapComponent :date="date"></RivermapComponent>
		</div>
		<div class="scatter-plot">

			<ClusterGraphComponent :date="date" :selectedId1=selectedId1 :selectedId2=selectedId2
				@update:selectedId="handleSelectedIdUpdate">
			</ClusterGraphComponent>

		</div>
		<div class="daily-life-plot">
			<button style="width: 100%; height: 100%; background-color: #404a59;">
				<Piecomponent :selectedId1=selectedId1 :selectedId2=selectedId2></Piecomponent>
			</button>
		</div>
		<div class="routine">
			<button style="width: 100%; height: 100%; background-color: #404a59;">
				<RountineComponent :selectedId1=selectedId1 :selectedId2=selectedId2></RountineComponent>
			</button>
		</div>
		<div class="overview">
			<button style="width: 100%; height: 100%; background-color: #404a59;">
				<NewOverviewComponent></NewOverviewComponent>
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
	grid-area: 1 / 1 / 16 / 5;
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
	grid-area: 16 / 1 / 56 / 5;
}

.timeline {
	grid-area: 39 / 5 / 41 / 17;
}

.rivermap {
	grid-area: 41 / 5 / 56 / 17;
}


.routine {
	grid-area: 39 / 17 / 56 / 21;
}


.daily-life-plot {
	grid-area: 9 / 17 / 39 / 21;
}

.request {
	grid-area: 1 / 1 / 2 / 2;
}
</style>