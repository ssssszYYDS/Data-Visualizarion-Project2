<!-- ClusterGraph.vue -->

<template>
    <button @click="setId_null" style="width: 100%; height: 20%;">
        set selectedId to null
    </button>
    <button @click="setId1" style="width: 100%; height: 20%;">
        set selectedId to '1'
    </button>
    <button @click="setId2" style="width: 100%; height: 20%;">
        set selectedId to '25'
    </button>
    <button @click="setId666" style="width: 100%; height: 20%;">
        set selectedId to '666'
    </button>
    <p id="paragraph" style="width: 100%; height: 20%;">
        selectedId1: <span id="selectedId1"></span>, selectedId2: <span id="selectedId2"></span>
    </p>

</template>

<script>
export default {
    name: 'ClusterGraph',

    props: {
        selectedId1: {
            type: String,
            required: true
        },
        selectedId2: {
            type: String,
            required: true
        },
    },

    watch: {
        selectedId1: function (newId) {
            document.getElementById('selectedId1').innerText = newId == null ? 'null' : newId;
        },
        selectedId2: function (newId) {
            document.getElementById('selectedId2').innerText = newId == null ? 'null' : newId;
        },
    },

    mounted() {
        document.getElementById('selectedId1').innerText = this.selectedId1 == null ? 'null' : this.selectedId1;
        document.getElementById('selectedId2').innerText = this.selectedId2 == null ? 'null' : this.selectedId2;
    },

    methods: {
        setId_null() {
            console.log('set selectedId to null');
            this.$emit('update:selectedId', null);
        },

        setId1() {
            console.log('set selectedId to \'1\'');
            this.$emit('update:selectedId', '1');
        },

        setId2() {
            console.log('set selectedId to \'25\'');
            this.$emit('update:selectedId', '25');
        },

        setId666() {
            console.log('set selectedId to \'666\'');
            this.$emit('update:selectedId', '666');
        },
    }
}
</script>
