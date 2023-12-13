<script setup>
import VersionFinder from '../components/VersionFinder.vue'
import { useRoute } from 'vue-router'

const route = useRoute();

</script>

<template>
    <div class="slds-container_large">
        <VersionFinder />
    </div>
</template>