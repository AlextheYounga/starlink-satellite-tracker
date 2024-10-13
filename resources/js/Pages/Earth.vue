<template>
    <Head title="Earth" />
	<div class="bg-transparent"></div>
</template>

<script>
import { Head } from '@inertiajs/vue3';
import { renderEarth } from '@/Three/earth';

export default {
    components: {
        Head,
    },

    created() {
        renderEarth();
    },
}
</script>