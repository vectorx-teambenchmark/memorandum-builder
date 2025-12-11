<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';
import useMemorandumVersionStore from '../stores/memorandumVersion';
import VersionHeading from '../components/VersionHeading.vue';
import VersionTocManager from '../components/VersionTocManager.vue';
import VersionProcessManager from '../components/VersionProcessManager.vue';
import SectionManager from '../components/SectionManager.vue';
import ContentEditor from '../components/ContentEditor.vue';

const authStore = useAuthStore();
const memorandumVersionStore = useMemorandumVersionStore();
const route = useRoute();
const router = useRouter();

const versionInfo = ref({});
const versionDisplayToc = ref(true);
const versionSections = ref([]);
const versionContents = ref([]);
const selectedRecord = ref({});
const requestSubmitted = ref(false);

const recordId = computed(()=>{
    return route.params?.recordId;
});
const queryEndpoint = computed(()=>{
    return `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=`;
});
const isSectionSelected = computed(()=>{
    return selectedRecord.value?.attributes?.type === 'MemorandumSection__c';
});
const isContentSelected = computed(()=>{
    return selectedRecord.value?.attributes?.type === 'MemorandumContent__c';
});
const isPublished = computed(()=>{
    return versionInfo.value?.Status__c === 'Published';
})

function handleCalloutException(e) {
    if(e?.response?.status !== undefined){
        switch(e.response.status) {
            case 401:
                authStore.$reset();
                router.push({name:'home',params:{recordId:recordId.value}});
                break;
            default:
                console.log('There was an error: %s',JSON.stringify(e,null,"\t"));
        }
    } else {
        console.error('There was a general Error');
        console.dir(e);
    }
}
function handleVersionDataChange(){
    refreshVersionInfo();
    refreshVersionSections();
    refreshVersionContents();
    determineApprovalStatus();
}
function handleRecordSelection(selectionId){
    let identifiedRecord = versionSections.value.find(section => section.Id === selectionId);
    if(identifiedRecord === undefined) {
        identifiedRecord = versionContents.value.find(content => content.Id === selectionId);
    }
    selectedRecord.value = identifiedRecord;
}

async function determineApprovalStatus() {
    if(recordId.value === undefined || recordId.value?.length === 0){
        return;
    }
    let processInstanceQuery = encodeURIComponent(`SELECT Id, LastActorId, Status FROM ProcessInstance WHERE TargetObjectId ='${recordId.value}'`);
    let processInstanceEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${processInstanceQuery}`;
    try {
        let processInstanceResponse = await axios.get(processInstanceEndpoint,{responseType:'json',headers:{'authorization':`Bearer ${authStore.bearerToken}`}});
        requestSubmitted.value = false;
        for(let processInstanceRec of processInstanceResponse.data.records) {
            if(processInstanceRec.Status === 'Pending'){
                requestSubmitted.value = true;
            }
        }
    } catch(e) {
        handleCalloutException(e);
    }
}
async function refreshVersionInfo(){
    if(recordId.value === undefined || recordId.value?.length === 0){
        return;
    }
    let versionInfoUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${recordId.value}/`;
    try {
        let versionInfoResponse = await axios.get(versionInfoUrl,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        versionInfo.value = versionInfoResponse.data;
        memorandumVersionStore.setVersionInfo(versionInfo.value);
    } catch(e) {
        handleCalloutException(e);
    }
}
async function refreshVersionSections(){
    let sectionQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c FROM MemorandumSection__c WHERE Parent__c ='${recordId.value}' ORDER BY Order__c ASC`);
    let sectionEndpoint = queryEndpoint.value + sectionQuery;
    try {
        let sectionResponse = await axios({
            method:'get',
            url:sectionEndpoint,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        versionSections.value = sectionResponse.data.records.map((item,index,arr)=>{
            let {Id, Name, Order__c, attributes} = item;
            let isFirst = (index === 0) ? true:false;
            let isLast = (index === (arr.length-1)) ? true:false;
            return {Id, Name, Order__c, attributes, isFirst, isLast};
        });
        //if the selectedRecord is a MemorandumSection__c type and it cannot be found, it wwas removed and needs to be emptied.
        if(isSectionSelected.value){
            let selectedRecordIndex = versionSections.value.findIndex( item => item.Id === selectedRecord.value.Id);
            if(selectedRecordIndex < 0){
                selectedRecord.value = {};
            }
        }
    } catch(e) {
        handleCalloutException(e);
    }
}
async function refreshVersionContents(){
    let contentsQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c, ActiveComments__c, ResolvedComments__c, ExternalComments__c, Body__c FROM MemorandumContent__c WHERE Parent__r.Parent__c ='${recordId.value}' ORDER BY Order__c ASC`);
    let contentsEndpoint = queryEndpoint.value + contentsQuery;
    try {
        let contentsResponse = await axios({
            method:'get',
            url:contentsEndpoint,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        versionContents.value = contentsResponse.data.records.map((item,index,arr)=>{
            let {Id, Name, Order__c, Parent__c, ActiveComments__c, ResolvedComments__c, ExternalComments__c, attributes } = item;
            let isFirst = (index === 0) ? true:false;
            let isLast = (index === (arr.length-1)) ? true:false;
            return {attributes, Id, Name, Order__c, Parent__c, ActiveComments__c, ResolvedComments__c, ExternalComments__c, isFirst, isLast};
        });
    } catch(e) {
        handleCalloutException(e);
    }
}
watch(()=>router.params?.recordId,(newValue)=>{
    console.log('router recordId Paramter changed.');
    if(newValue.length > 0){
        selectedRecord.value = {};
        refreshVersionInfo();
        refreshVersionSections();
        refreshVersionContents();
        determineApprovalStatus();
    }
});
onBeforeMount(() => {
    if(recordId.value.length > 0 && authStore.isAuthenticated){
        refreshVersionInfo();
        refreshVersionSections();
        refreshVersionContents();
        determineApprovalStatus();
    } else {
        router.push({name:'home',params:{recordId:recordId.value}});
    }
});
</script>

<template>
    <div class="slds-grid slds-wrap">
        <div class="slds-col slds-size_1-of-1 slds-var-p-around_x-small">
            <VersionHeading v-bind:version-id="recordId" v-bind:allow-approval-request-submittal="requestSubmitted" v-model:toc-display="versionDisplayToc" v-on:approval-request-submitted="handleVersionDataChange"/>
        </div>
        <div v-if="requestSubmitted" class="slds-col slds-size_1-of-1 slds-var-p-around_small ">
            <VersionProcessManager v-bind:version-id="recordId" v-on:approval-process-status-change="handleVersionDataChange"/>
        </div>
        <div v-if="versionDisplayToc" class="slds-col slds-size_1-of-4 slds-var-p-around_small">
            <VersionTocManager v-bind:version-id="recordId" v-bind:sections="versionSections" v-bind:contents="versionContents" 
                v-bind:in-approval="requestSubmitted" v-on:selection="handleRecordSelection" v-on:sectionadded="refreshVersionSections"/>
        </div>
        <div v-bind:class="{'slds-col':true, 'slds-size_1-of-1':!versionDisplayToc,'slds-size_3-of-4':versionDisplayToc,'slds-var-p-around_small':true}">
            <SectionManager v-if="isSectionSelected" v-bind:section-id="selectedRecord.Id" v-on:sectionupdate="refreshVersionSections" 
                v-bind:restrict-editing="requestSubmitted || isPublished" v-on:sectiondelete="refreshVersionSections" v-on:contentselection="handleRecordSelection" 
                v-on:contentupdate="refreshVersionContents"/>
            <ContentEditor v-if="isContentSelected" :key="selectedRecord.Id" v-bind:record-id="selectedRecord.Id" v-bind:api-url="authStore.apiUrl" v-bind:access-token="authStore.bearerToken"
                v-bind:id-url="authStore.idUrl" v-bind:approval-request-submitted="requestSubmitted" v-bind:is-published="isPublished" v-on:contentupdated="refreshVersionContents"/>
        </div>
    </div>
</template>