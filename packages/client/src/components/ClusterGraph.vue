<!-- ClusterGraph.vue -->

<template>
    <button @click="setId_null" style="width: 100%; height: 25%;">
        set selectedId to null
    </button>
    <button @click="setId1" style="width: 100%; height: 25%;">
        set selectedId to '1'
    </button>
    <button @click="setId2" style="width: 100%; height: 25%;">
        set selectedId to '25'
    </button>
    <button @click="setId666" style="width: 100%; height: 25%;">
        set selectedId to '666'
    </button>
</template>

<script>
export default {
    name: 'ClusterGraph',

    props: {
        selectedId: {
            type: String,
            required: true
        }
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
