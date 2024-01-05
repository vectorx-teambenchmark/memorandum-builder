<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';
import SelectorBox from '../components/SelectorBox.vue';
import MemorandumVersionForm from '../components/MemorandumVersionForm.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

//computed properties
const marketingMaterialId = computed(()=>{
    return route.params?.recordId;
});
const cmmName = computed(()=>{
    return cmm.value.Name;
});

const cmm = ref({});
const versionOptionArray = ref([]);
const displayVersionForm = ref(false);

//functions
function handleCalloutException(e) {
    switch(e.response.status) {
        case 401:
            authStore.$reset();
            router.push({name:'home'});
            break;
        default:
            console.log('There was an error: %s',JSON.stringify(e,null,"\t"));
    }
}
function navigateToVersion(versionId){
    router.push({name:'memorandumversion',params:{recordId:versionId}});
}

async function retrieveCmm(cmmId){
    try {
        let cmmUri = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/Client_Marketing_Material__c/${cmmId}`;
        let cmmResponse = await axios({
            method:'get',
            url:cmmUri,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        cmm.value = cmmResponse.data;
    } catch(e) {
        handleCalloutException(e);
    }
}
async function retrieveVersionsByParentId(cmmId){
    try {
        let versionQuery = encodeURIComponent(`SELECT Id, Name, CanonicalVersion__c, Status__c, VersionName__c, VersionNotes__c FROM MemorandumVersion__c WHERE ParentMarketingMaterial__c = '${cmmId}'`);
        let versionQueryUri = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${versionQuery}`;
        let versionQueryResponse = await axios({
            method:'get',
            url:versionQueryUri,
            responseType:'json',
            headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
        });
        versionOptionArray.value = versionQueryResponse.data.records.map((versionRec)=>{
            return {'label':`${versionRec.VersionName__c} (${versionRec.Status__c}) ${(versionRec.VersionNotes__c !== undefined && versionRec.VersionNotes__c !== null) ? '- ' + versionRec.VersionNotes__c:''}`,
                'value':versionRec.Id};
        });
    } catch(e) {
        handleCalloutException(e);
    }
}
async function handleVersionCreate(payload){
    try {
        console.log('Payload passed into handleVersionCreate: %s',JSON.stringify(payload,null,"\t"));
        let createVersionUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/`;
        let createVersionResponse = await axios({
            method:'post',
            data:payload,
            url:createVersionUrl,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        navigateToVersion(createVersionResponse.data.id);
    } catch(e) {
        handleCalloutException(e);
    }
}

onBeforeMount(()=>{
    retrieveCmm(marketingMaterialId.value);
    retrieveVersionsByParentId(marketingMaterialId.value);
})
</script>

<template>
    <div class="slds-container_x-large bmark-centered">
        <div class="slds-page-header">
            <div class="slds-page-header__row">
                <div class="slds-page-header__col-title">
                    <div class="slds-media">
                        <div class="slds-media__figure">
                            <span class="slds-icon-container" title="Client Marketing Material">
                                <svg class="slds-icon slds-page-header__icon" aria-hidden="true">
                                    <use xlink:href="/src/assets/icons/standard-sprite/svg/symbols.svg#form"></use>
                                </svg>
                                <span class="slds-assistive-text">Client Marketing Material</span>
                            </span>
                        </div>
                        <div class="slds-media__body">
                            <div class="slds-page-header__name">
                                <div class="slds-page-header__name-title">
                                    <h1>
                                        <span class="slds-page-header__title slds-truncate" v-bind:title="cmmName">{{ cmmName  }}</span>
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="slds-grid slds-wrap slds-box slds-theme_default">
            <div class="slds-col slds-size_1-of-1 slds-var-m-bottom_small">
                <SelectorBox label="Memorandum Version" placeholder="Select Version" v-bind:options="versionOptionArray" v-on:selection="navigateToVersion($event.detail.selection.value)"/>
            </div>
            <div class="slds-col slds-size_1-of-1">
                <button v-bind:class="{'slds-button':true, 'slds-button_brand':!displayVersionForm, 'slds-button_destructive':displayVersionForm}" v-on:click="displayVersionForm = !displayVersionForm">{{ (displayVersionForm) ? 'Cancel New Version':'Create New Version' }}</button>
            </div>
            <div v-if="displayVersionForm" class="slds-col slds-size_1-of-1">
                <MemorandumVersionForm v-bind:api-token="authStore.bearerToken" v-bind:url-base="authStore.apiUrl" v-bind:cmm-id="marketingMaterialId" v-on:cancel="displayVersionForm = false" v-on:save="handleVersionCreate($event.detail)"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .bmark-centered {
        margin: 0 auto;
    }
</style>