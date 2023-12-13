<script setup>
import SalesforceAuth from '../components/SalesforceAuth.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
</script>

<template>
  <div class="slds-var-m-vertical_xx-large slds-grid slds-wrap grid_vertical-align-center">
    <div class="slds-col slds-size_1-of-1 slds-align_absolute-center">
      <SalesforceAuth v-on:authenticated="router.push({ name: 'memorandumversion', params: route.params })"/>
    </div>
  </div>
</template>