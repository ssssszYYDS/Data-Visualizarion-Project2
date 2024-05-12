<!-- Categories.vue -->

<template>
    <button @click="setDate1" style="width: 100%; height: 30%;">
        setDate to '2022-03-01'
    </button>
    <button @click="setDate2" style="width: 100%; height: 30%;">
        setDate to '2022-03-05'
    </button>
</template>

<script>
export default {
    name: 'Categories',

    props: {
        date: {
            type: String,
            required: true
        }
    },

    methods: {
        setDate1() {
            console.log('set date to 2023-03-01');
            this.$emit('update:date', '2022-03-01'); // 触发 update:date 事件，并传递新的日期值
        },

        setDate2() {
            console.log('set date to 2023-03-05');
            this.$emit('update:date', '2022-03-05'); // 触发 update:date 事件，并传递新的日期值
        },
    }
}
</script>
