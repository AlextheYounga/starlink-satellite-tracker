<template>
    <Head title="Earth" />
	<div class="bg-transparent"></div>
</template>

<script>
import { Head } from '@inertiajs/vue3';
import { renderEarthScene } from '@/Three/scene';

export default {
    components: {
        Head,
    },
	props: {
		satellites: {
			type: Array,
			required: true,
		},
	},
    created() {
        renderEarthScene(this.satellites);
    },
}
</script>