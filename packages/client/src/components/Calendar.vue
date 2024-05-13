<!-- Calendar.vue -->

<template>
    <button @click="setDate1" style="width: 100%; height: 30%;">
        set date to '2022-03-01'
    </button>
    <button @click="setDate2" style="width: 100%; height: 30%;">
        set date to '2022-03-05'
    </button>
</template>

<script>
export default {
    name: 'Calendar',

    props: {
        date: {
            type: String,
            required: true
        }
    },

    methods: {
        setDate1() {
            console.log('set date to 2023-03-01');
            this.$emit('update:date', '2022-03-01');
        },

        setDate2() {
            console.log('set date to 2023-03-05');
            this.$emit('update:date', '2022-03-05');
        },
    }
}
</script>
