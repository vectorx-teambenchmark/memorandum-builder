<script setup>
import { computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useAuthStore from '../stores/auth';
import ContentEditor from '../components/ContentEditor.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const recordId = computed(()=>{
    return (Array.isArray(route.params.recordId) && route.params.recordId.length > 0) ? route.params.recordId[0]:'';
});


//lifecycle hook desgined to run before component is inserted into DOM
onBeforeMount(()=>{
    console.log('RecordId param: %s',JSON.stringify(route.params.recordId,null,"\t"));
    console.log('onBeforeMount executed.');
    if(!authStore.isAuthenticated) {
        router.push({name:'home',params:route.params});
    }
})

</script>

<template>
    <div>
        <ContentEditor v-if="route.params.recordId.length > 0" v-bind:record-id="recordId" v-bind:api-url="authStore.apiUrl" 
            v-bind:access-token="authStore.bearerToken" />
    </div>
</template>