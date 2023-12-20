<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';
import VersionHeading from '../components/VersionHeading.vue';
import VersionTocManager from '../components/VersionTocManager.vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const versionInfo = ref({});
const sectionInfo = ref([]);
const contentInfo = ref([]);

onBeforeMount(async () => {
    let recordId = route.params?.recordId;
    console.log('Record ID is %s',JSON.stringify(recordId,null,"\t"));
    if(typeof(recordId) === 'string'){
        let versionendpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${recordId}`;
        let sectionQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c FROM MemorandumSection__c WHERE Parent__c ='${recordId}' ORDER BY Order__c ASC`);
        let sectionendpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${sectionQuery}`;
        let contentQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c, DisplayRecordName__c FROM MemorandumContent__c WHERE Parent__r.Parent__c ='${recordId}' ORDER BY Order__c ASC`);
        let contentendpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${contentQuery}`;
        try {

            //get version record
            let response = await axios({
                method:'get',
                url:versionendpoint,
                responseType:'json',
                headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
            });
            versionInfo.value = response.data;
            //get section records
            let sectionResponse = await axios({
                method: 'get',
                url: sectionendpoint,
                responseType:'json',
                headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
            });
            sectionInfo.value = sectionResponse.data.records.map(item => item);
            //get content records
            let contentResponse  = await axios({
                method:'get',
                url:contentendpoint,
                responseType:'json',
                headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
            });
            contentInfo.value = contentResponse.data.records.map(item => item);

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
        <div class="slds-col slds-size_1-of-5">
            <VersionTocManager v-bind:sections="sectionInfo" v-bind:contents="contentInfo"/>
        </div>
        <div class="slds-col slds-size_4-of-5">

        </div>
    </div>
</template>