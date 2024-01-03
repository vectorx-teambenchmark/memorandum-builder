<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';

const props = defineProps({
    versionId:{
        type:String,
        required: true
    },
    tocDisplay:{
        type:Boolean,
        default(){
            return false;
        }
    },
    allowApprovalRequestSubmittal:{
        type:Boolean,
        default(){
            return false;
        }
    }
});
const emit = defineEmits(['update:tocDisplay','approvalRequestSubmitted']);
const authStore = useAuthStore();
const router = useRouter();

const approvalProcessId = ref('');
const approvalProcessName = ref('');
const memorandumVersion = ref({});
const approverId = ref('');

//computed properties
const tocToggleButtonLabel = computed(()=>{
    return (props.tocDisplay) ? 'Hide Table Of Contents':'Show Table of Contents';
});
const versionId = computed(()=>{
    return props.versionId;
});
const versionName = computed(()=>{
    return memorandumVersion.value.VersionName__c;
});
const versionStatus = computed(()=>{
    return memorandumVersion.value.Status__c;
});
const canonicalVersionNumber = computed(()=>{
    return memorandumVersion.value.CanonicalVersion__c;
});
const requestSubmitted = computed(()=>{
    return props.allowApprovalRequestSubmittal;
});

// functions
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
async function getApprovalProcess(){
    let processApprovalEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/process/approvals/`;
    try {
        let processApprovalResponse = await axios.get(processApprovalEndpoint,{responseType:'json',headers:{'authorization':`Bearer ${authStore.bearerToken}`}});
        let memorandumVersionApproval = processApprovalResponse.data.approvals.MemorandumVersion__c[0];
        approvalProcessId.value = memorandumVersionApproval.id;
        approvalProcessName.value = memorandumVersionApproval.name;
    } catch(e) {
        handleCalloutException(e);
    }
}
async function obtainMemorandumVersionInfo(versionIdIn){
    let memorandumVersionUri = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${versionIdIn}`;
    try {
        let memorandumVersionResponse = await axios.get(memorandumVersionUri,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        memorandumVersion.value = memorandumVersionResponse.data;
    } catch(e) {
        handleCalloutException(e);
    }
}
async function determineDefaultApproverId(versionIdIn){
    if(versionIdIn === undefined || versionIdIn === null || versionIdIn.length === 0) {
        return;
    }
    let approverQuery = encodeURIComponent(`SELECT Id, ParentMarketingMaterial__r.Opportunity__r.DT_Managing_Director__c FROM MemorandumVersion__c WHERE Id ='${versionIdIn}'`);
    let approverUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${approverQuery}`;
    try {
        let approverResponse = await axios.get(approverUrl,{headers:{'authorization':`Bearer ${authStore.bearerToken}`},responseType:'json'});
        let approverResponseId = approverResponse.data.records[0]?.ParentMarketingMaterial__r?.Opportunity__r?.DT_Managing_Director__c;
        approverId.value = (approverResponseId === undefined || approverResponseId === null) ? import.meta.env.VITE_SALESFORCE_DEFAULT_APPROVER : approverResponseId;
        console.log('Approver ID Value: %s',JSON.stringify(approverId.value,null,"\t"));
    } catch(e) {
        handleCalloutException(e);
    }
}

async function handleSubmitApprovalRequest() {
    //get the currentuser's Id
    let currentUserUri = new URL(authStore.idUrl);
    let currentUserId = currentUserUri.pathname.split('/').pop();
    //build the post object - based on the information from https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_process_approvals_post.htm
    let dataObj = {requests:[{ actionType:'Submit', contextActorId: currentUserId, contextId: versionId.value, nextApproverIds:[approverId.value], processDefinitionNameOrId: approvalProcessId.value }]};
    //make the post to the approvals endpoint.
    try {
        let approvalRequestEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/process/approvals/`;
        await axios.post(approvalRequestEndpoint,dataObj,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        emit('approvalRequestSubmitted');
    } catch(e) {
        console.log('Error Submitting Approval Request: %s',JSON.stringify(e,null,"\t"));
    }
}

//watchers
watch(versionId,(newValue)=>{
    determineDefaultApproverId(newValue);
    obtainMemorandumVersionInfo(newValue);
});

//lifecycle functions
onBeforeMount(async () => {
    getApprovalProcess();
});
</script>

<template>
    <div class="slds-page-header">
        <div class="slds-page-header__row">
            <div class="slds-page-header__col-title">
                <div class="slds-media">
                    <div class="slds-media__figure">
                        <span class="slds-icon_container slds-icon-standard-document" title="Memorandum Version">
                            <svg class="slds-icon slds-page-header__icon" aria-hidden="true">
                                <use xlink:href="/src/assets/icons/standard-sprite/svg/symbols.svg#document"></use>
                            </svg>
                            <span class="slds-assistive-text">memorandum version</span>
                        </span>
                    </div>
                    <div class="slds-media__body">
                        <div class="slds-page-header__name">
                            <div class="slds-page-header__name-title">
                                <h1><span class="slds-page-header__title">{{ versionName }}</span></h1>
                            </div>
                        </div>
                        <p class="slds-page-header__name-meta">{{ versionStatus }} &#9900; Canonical Version {{ canonicalVersionNumber }}</p>
                    </div>
                </div>
            </div>
            <div class="slds-page-header__col-actions">
                <div class="slds-page-header__controls">
                    <div class="slds-page-header__control">
                        <ul class="slds-button-group-list">
                            <li>
                                <button class="slds-button slds-button_neutral" v-on:click="emit('update:tocDisplay',!props.tocDisplay)">{{ tocToggleButtonLabel }}</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_neutral" disabled>Preview Version</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_neutral" v-bind:disabled="requestSubmitted" v-on:click="handleSubmitApprovalRequest">Submit for Approval</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>