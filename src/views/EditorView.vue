<script setup>
import { computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useAuthStore from '../stores/auth';
import ContentEditor from '../components/ContentEditor.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const hasRecordId = computed(()=>{
    return route.params?.recordId !== undefined && route.params?.recordId !== null;
});
const recordId = computed(()=>{
    return (Array.isArray(route.params?.recordId)) ? route.params?.recordId[0]:'';
});


//lifecycle hook desgined to run before component is inserted into DOM
onBeforeMount(()=>{
    console.log('onBeforeMount executed.');
    if(!authStore.isAuthenticated) {
        router.push({name:'home',params:route.params});
    }
})

</script>

<template>
    <div>
        <ContentEditor v-if="hasRecordId" v-bind:record-id="recordId" v-bind:api-url="authStore.apiUrl" 
            v-bind:access-token="authStore.bearerToken" />
        <div v-else class="modal">
            <div class="modal-background"></div>
            <div class="modal-content">
                <div class="box has-text-centered">
                    <p class="is-size-2 ">No Record ID provided.</p>
                </div>
            </div>
        </div>
    </div>
</template>