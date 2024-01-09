<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';

//constructed properties
const props = defineProps({
    versionId: {
        type: String,
        required: true,
        default(){
            return '';
        }
    }
});
const router = useRouter();
const authStore = useAuthStore();

//computed properties
const isUrlValid = computed(()=>{
    return false;
});

//reactive properties
const versionInfo = ref({});
const communitiesList = ref([]);

//internal functions
function handleCalloutException(e) {
    switch(e.response.status) {
        case 401:
            authStore.$reset();
            router.push({name:'home',params:{recordId:props.versionId}});
            break;
        default:
            console.log('There was an error: %s',JSON.stringify(e,null,"\t"));
    }
}
async function obtainVersionInfo(versionIdIn) {
    try {
        //build Link to obtain record info
        let versionInfoUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${versionIdIn}`;
        let versionInfoResponse = await axios.get(versionInfoUrl,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        versionInfo.value = versionInfoResponse.data;
    } catch(e) {
        handleCalloutException(e);
    }
}
function handlePreviewGenerationInfo(){
    console.log('handlePrevewGenerationInfo executed');
}
async function getCommunities(){
    let communitiesUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/connect/communities/?status=Live`;
    try {
        let communitiesResponse = await axios.get(communitiesUrl,{
            headers: { 'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        communitiesList.value = communitiesResponse.data.communities;
        console.log('Communities Info: %s',JSON.stringify(communitiesList.value,null,"\t"));
    } catch(e) {
        handleCalloutException(e);
    }
}

//lifecycle methods
onBeforeMount(() => {
    obtainVersionInfo(props.versionId);
    getCommunities();
});
</script>

<template>
    <div class="slds-grid slds-wrap">
        <div v-if="!isUrlValid" class="slds-col slds-size_1-of-1">
            <p class="slds-text-longform">If you need to share the content of the Selected Memorandum Version Externally, the press the 'Generate Preview Link' button.</p>
            <button class="slds-button slds-button_brand" v-on:click="handlePreviewGenerationInfo">Generate Preview Link</button>
        </div>
    </div>
</template>