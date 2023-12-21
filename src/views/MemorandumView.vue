<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';
import VersionHeading from '../components/VersionHeading.vue';
import VersionTocManager from '../components/VersionTocManager.vue';
import SectionManager from '../components/SectionManager.vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const recordId = computed(()=>{
    return route.params?.recordId;
})

const versionInfo = ref({});
const sectionInfo = ref([]);
const contentInfo = ref([]);
const isRecordVersion = computed(()=>{
    return selectedRecord.value?.attributes?.type === 'MemorandumSection__c';
});
const selectedRecord = ref({});
const isLastSection = computed(()=>{
    let selectedIndex = sectionInfo.value.findIndex( item => item.Id === selectedRecord.value.Id );
    return selectedIndex === sectionInfo.value.length - 1;
});

function updateSelectedRecord(event){
    selectedRecord.value = event.detail;
}

function moveUp(arr, currentIndex) {
  if (currentIndex === 0) {
    return arr;
  }
  const removedItem = arr.splice(currentIndex, 1)[0];
  arr.splice(currentIndex - 1, 0, removedItem);
  return arr;
}

function moveDown(arr, currentIndex) {
  if (currentIndex === arr.length - 1) {
    return arr;
  }
  const removedItem = arr.splice(currentIndex, 1)[0];
  arr.splice(currentIndex + 1, 0, removedItem);
  return arr;
}

function handleMoveSectionUp(sectionId){
    let sectionIndex = sectionInfo.value.findIndex(item => item.Id === sectionId);
    if(sectionIndex !== -1) {
        sectionInfo.value = moveUp(sectionInfo.value,sectionIndex);
        //reorder all of the sectionInfos
        var count = 1;
        sectionInfo.value.forEach(item => {
            item.Order__c = count;
            count++;
        });
        //update the reordering
        updateSections(sectionInfo.value);
    }
}
function handleMoveSectionDown(sectionId){
    let sectionIndex = sectionInfo.value.findIndex(item => item.Id === sectionId);
    if(sectionIndex !== -1){
        sectionInfo.value = moveDown(sectionInfo.value,sectionIndex);
        //reorder all of the sectionInfos
        var count = 1;
        sectionInfo.value.forEach(item => {
            item.Order__c = count;
            count++;
        });
        //update the reordering
        updateSections(sectionInfo.value);
    }
}

async function updateSections(sectionArray) {
    let payload = {allOrNone:true,records:[]};
    payload.records = sectionArray.map(element =>{
        let retObj = {attributes:element.attributes,Id:element.Id,Order__c:element.Order__c};
        return retObj;
    });
    let updateEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/composite/sobjects/`;
    try {
        let result = await axios({
            method:'patch',
            url:updateEndpoint,
            data:payload,
            headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
        });
        console.log('Update Result: %s',JSON.stringify(result,null,"\t"));
    } catch(e) {
        console.log('Error: %s',JSON.stringify(e,null,"\t"));
    }

}



async function obtainSections(){
    let sectionQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c FROM MemorandumSection__c WHERE Parent__c ='${recordId.value}' ORDER BY Order__c ASC`);
    let sectionendpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${sectionQuery}`;
    //get section records
    let sectionResponse = await axios({
        method: 'get',
        url: sectionendpoint,
        responseType:'json',
        headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
    });
    sectionInfo.value = sectionResponse.data.records.map(item => item);
}

async function obtainContents(){
    let contentQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c, DisplayRecordName__c FROM MemorandumContent__c WHERE Parent__r.Parent__c ='${recordId.value}' ORDER BY Order__c ASC`);
    let contentendpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${contentQuery}`;
    //get content records
    let contentResponse  = await axios({
        method:'get',
        url:contentendpoint,
        responseType:'json',
        headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
    });
    contentInfo.value = contentResponse.data.records.map(item => item);
}


onBeforeMount(async () => {
    if(typeof(recordId.value) === 'string'){
        let versionendpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${recordId.value}`;
        try {

            //get version record
            let response = await axios({
                method:'get',
                url:versionendpoint,
                responseType:'json',
                headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
            });
            versionInfo.value = response.data;
            obtainSections();
            obtainContents();    
        } catch(e) {
            switch(e.response.status){
                case 401:
                    authStore.$reset();
                    router.push({name:'home'});
                    break;
                default:
                    console.log('Error: %s',JSON.stringify(e,null,"\t"));
            }
        }
    }
})
</script>

<template>
    <div class="slds-grid slds-wrap">
        <div class="slds-col slds-size_1-of-1">
            <VersionHeading v-bind:version-info="versionInfo"/>
        </div>
        <div class="slds-col slds-size_1-of-5 slds-var-p-around_small">
            <VersionTocManager v-bind:sections="sectionInfo" v-bind:contents="contentInfo" v-on:selection="updateSelectedRecord"/>
        </div>
        <div class="slds-col slds-size_4-of-5 slds-var-p-around_small">
            <SectionManager v-if="isRecordVersion" v-bind:api-token="authStore.bearerToken"
                v-bind:url-base="authStore.apiUrl" v-bind:section-id="selectedRecord.Id" v-bind:is-last="isLastSection" v-on:sectionupdate="obtainSections"
                v-on:movesectionup="handleMoveSectionUp" v-on:movesectiondown="handleMoveSectionDown"/>
        </div>
    </div>
</template>