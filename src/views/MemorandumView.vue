<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';
import VersionHeading from '../components/VersionHeading.vue';
import VersionTocManager from '../components/VersionTocManager.vue';
import SectionManager from '../components/SectionManager.vue';
import ContentEditor from '../components/ContentEditor.vue';

const authStore = useAuthStore();
const route = useRoute();

const recordId = computed(()=>{
    return route.params?.recordId;
});

const versionInfo = ref({});
const versionDisplayToc = ref(true);
const versionSections = ref([]);
const versionContents = ref([]);
const selectedRecord = ref({});
const queryEndpoint = computed(()=>{
    return `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=`;
})
const isSectionSelected = computed(()=>{
    return selectedRecord.value?.attributes?.type === 'MemorandumSection__c';
})
const isContentSelected = computed(()=>{
    return selectedRecord.value?.attributes?.type === 'MemorandumContent__c';
})

function handleRecordSelection(selectionId){
    let identifiedRecord = versionSections.value.find(section => section.Id === selectionId);
    if(identifiedRecord === undefined) {
        identifiedRecord = versionContents.value.find(content => content.Id === selectionId);
    }
    selectedRecord.value = identifiedRecord;
}

async function refreshVersionSections(){
    let sectionQuery = encodeURIComponent(`SELECT Id, Name, Order__c FROM MemorandumSection__c WHERE Parent__c ='${recordId.value}' ORDER BY Order__c ASC`);
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
    } catch(e) {
        console.log('%c Error Retrieving Verision Sections: %s','background:black;color:red',JSON.stringify(e,null,"\t"));
    }
}
async function refreshVersionContents(){
    console.log('refreshVersionContents executed.');
    let contentsQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c, Body__c FROM MemorandumContent__c WHERE Parent__r.Parent__c ='${recordId.value}' ORDER BY Order__c ASC`);
    let contentsEndpoint = queryEndpoint.value + contentsQuery;
    try {
        let contentsResponse = await axios({
            method:'get',
            url:contentsEndpoint,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        versionContents.value = contentsResponse.data.records.map((item,index,arr)=>{
            let {Id, Name, Order__c, Parent__c, attributes } = item;
            let isFirst = (index === 0) ? true:false;
            let isLast = (index === (arr.length-1)) ? true:false;
            return {attributes, Id, Name, Order__c, Parent__c, isFirst, isLast};
        });
    } catch(e) {
        console.log('%c Error Retrieving Version Content: %s',JSON.stringify(e,null,"\t"));
    }
}

onBeforeMount(async () => {
    if(recordId.value.length > 0){
        let versionEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${recordId.value}`;
        try {
            let versionResponse = await axios({
                method:'get',
                url:versionEndpoint,
                responseType:'json',
                headers:{'authorization':`Bearer ${authStore.bearerToken}`}
            });
            console.log('Memorandum Version Data: %s',JSON.stringify(versionResponse,null,"\t"));
            versionInfo.value = versionResponse.data;
            refreshVersionSections();
            refreshVersionContents();
        } catch(e) {
            console.log('%c Error Retrieving Version Info: %s ','background:black;color:red',JSON.stringify(e,null,"\t"));
        }
    }
});
</script>

<template>
    <div class="slds-grid slds-wrap">
        <div class="slds-col slds-size_1-of-1 slds-var-p-around_x-small">
            <VersionHeading v-bind:version-info="versionInfo" v-model:toc-display="versionDisplayToc"/>
        </div>
        <div v-if="versionDisplayToc" class="slds-col slds-size_1-of-5 slds-var-p-around_small">
            <VersionTocManager v-bind:sections="versionSections" v-bind:contents="versionContents" 
                v-on:selection="handleRecordSelection"/>
        </div>
        <div v-bind:class="{'slds-col':true, 'slds-size_1-of-1':!versionDisplayToc,'slds-size_4-of-5':versionDisplayToc,'slds-var-p-around_small':true}">
            <SectionManager v-if="isSectionSelected" v-bind:section-id="selectedRecord.Id" v-on:sectionupdate="refreshVersionSections" 
                v-on:sectiondelete="refreshVersionSections" v-on:contentselection="handleRecordSelection" v-on:contentupdate="refreshVersionContents"/>
            <ContentEditor v-if="isContentSelected" v-bind:record-id="selectedRecord.Id" v-bind:api-url="authStore.apiUrl" v-bind:access-token="authStore.bearerToken"
                v-bind:id-url="authStore.idUrl" v-bind:content-title="selectedRecord.Name" v-bind:body-content="selectedRecord.Body__c"/>
        </div>
    </div>
</template>