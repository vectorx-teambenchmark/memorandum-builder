<script setup>
import axios from 'axios';
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useAuthStore from '../stores/auth';
import ContentEditor from '../components/ContentEditor.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const contentTitle = ref('');
const contentBody = ref('');
const displayEditor = ref(false);
const hasRecordId = computed(()=>{
    return route.params?.recordId !== undefined && route.params?.recordId !== null && route.params?.recordId?.length > 0;
});
const recordId = computed(()=>{
    let retVal;
    if(Array.isArray(route.params?.recordId)){
        retVal = route.params.recordId[0];
    } else {
        retVal = (route.params?.recordId !== undefined && route.params?.recordId !== null) ? route.params.recordId : '';
    }
    return retVal;
});


//lifecycle hook desgined to run before component is inserted into DOM
onBeforeMount(()=>{
    //if the user is not authenticated, redirect to authentication route.
    if(!authStore.isAuthenticated) {
        authStore.$reset();
        router.push({name:'home',params:route.params});
    }
    //obtain record data
    window.console.log('Record ID: %s',JSON.stringify(recordId.value,null,"\t"));
    let recordApiUrl = `${authStore.apiUrl}/services/data/v58.0/sobjects/memorandumcontent__c/${recordId.value}`;
    axios.get(recordApiUrl,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${authStore.bearerToken}`
        }
    }).then( response => {
        window.console.log('Response from Record Query: %s',JSON.stringify(response,null,"\t"));
        contentTitle.value = response?.data?.Name !== undefined && response?.data?.Name !== null ? response?.data?.Name:'';
        contentBody.value = response?.data?.Body__c !== undefined && response?.data?.Body__c !== null
            ? response?.data?.Body__c : '';
        displayEditor.value = true;
    }).catch( err => {
        window.console.log('There was an Error Retrieving the records: %s',JSON.stringify(err.message,null,"\t"));
        authStore.$reset();
        router.push({name:'home',params:route.params});
    });

});
</script>

<template>
    <div>
        <ContentEditor v-if="hasRecordId && displayEditor" v-bind:access-token="authStore.bearerToken" 
            v-bind:api-url="authStore.apiUrl" v-bind:record-id="recordId" v-bind:content-title="contentTitle" 
            v-bind:body-content="contentBody"/>
        <div v-if="!hasRecordId" class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content">
                <div class="box has-text-centered">
                    <p class="is-size-2 ">No Record ID provided.</p>
                </div>
            </div>
        </div>
    </div>
</template>