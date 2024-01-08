<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';
import SelectorBox from '../components/SelectorBox.vue';

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
const statusOptions = ref([]);
const showCloneForm = ref(false);
const showErrMess = ref(false);
const errMess = ref('');
const communitiesList = ref([]);

const newVersionCanonicalVersion = ref(0);
const newVersionStatus = ref('');
const newVersionDescription = ref('');

//computed properties
const tocToggleButtonLabel = computed(()=>{
    return (props.tocDisplay) ? 'Hide Table Of Contents':'Show Table of Contents';
});
const versionId = computed(()=>{
    return props.versionId;
});
const versionName = computed(()=>{
    return memorandumVersion.value.VersionName__c + ((memorandumVersion.value.VersionNotes__c !== undefined && memorandumVersion.value.VersionNotes__c !== null) ? ' - ' + memorandumVersion.value.VersionNotes__c : '');
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
const isPublished = computed(()=>{
    return memorandumVersion.value?.Status__c === 'Published';
})

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
function isNotEmpty(str) {
  return !!str && str.trim();
}
function handleStatusSelection(eventItem){
    newVersionStatus.value = eventItem.detail.selection.value;
}
function redirectToPreview(){
    //find the networkId of the Preview URL
    let previewCommunity = communitiesList.value.find(communityElement => communityElement.name === 'Invite Confirmation');
    let previewStartUrl = `/cim-preview?c__rid=${versionId.value}`;
    //build base of redirectUrl
    //let redirectUrl = `${authStore.apiUrl}/servlet/networks/switch?networkId=${previewCommunity.id}&startUrl=${previewStartUrl}`;
    let redirectUrl = `${previewCommunity.siteUrl}${previewStartUrl}`;
    window.open(redirectUrl,'_blank');
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
async function getCommunities(){
    let communitiesUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/connect/communities/?status=Live`;
    try {
        let communitiesResponse = await axios.get(communitiesUrl,{
            headers: { 'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        communitiesList.value = communitiesResponse.data.communities;
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
    let approverQuery = encodeURIComponent(`SELECT Id, ParentMarketingMaterial__r.Opportunity__r.Transaction_Director__c, ParentMarketingMaterial__r.Opportunity__r.Benchmark_Entity__r.Country__c FROM MemorandumVersion__c WHERE Id ='${versionIdIn}'`);
    let approverUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${approverQuery}`;
    try {
        let approverResponse = await axios.get(approverUrl,{headers:{'authorization':`Bearer ${authStore.bearerToken}`},responseType:'json'});
        let approverResponseId = approverResponse.data.records[0]?.ParentMarketingMaterial__r?.Opportunity__r?.Transaction_Director__c;
        approverId.value = (approverResponseId === undefined || approverResponseId === null) ? import.meta.env.VITE_SALESFORCE_DEFAULT_APPROVER : approverResponseId;
    } catch(e) {
        handleCalloutException(e);
    }
}
async function handleCloneVersion(versionIdIn){
    showErrMess.value = false;
    errMess.value = '';
    if(!isNotEmpty(versionIdIn)) {
        return;
    }
    //make sure the fields are populated
    if(!isNotEmpty(newVersionStatus.value) || !isNotEmpty(newVersionDescription.value)){
        errMess.value = 'All Fields must be populated.';
        showErrMess.value = true;
        return;
    }
    let cloneVersionUrl = `${authStore.apiUrl}/services/apexrest/imservice/`;
    let formData = {
        versionId:versionIdIn,
        newCanonicalVersion:newVersionCanonicalVersion.value,
        versionStatus:newVersionStatus.value,
        versionNotes:newVersionDescription.value
    };
    try {
        let cloneVersionResponse = await axios({
            method:'post',
            url:cloneVersionUrl,
            data: formData,
            responseType:'json',
            headers:{
                'Authorization':`Bearer ${authStore.bearerToken}`
            }
        });
        showCloneForm.value = false;
        let newVersionId = cloneVersionResponse.data;
        newVersionCanonicalVersion.value = 0;
        newVersionStatus.value = '';
        newVersionDescription.value = '';
        //redirect to new Version
        router.push({name:'memorandumversion',params:{recordId:newVersionId}});
    } catch(e) {
        handleCalloutException(e);
    }
}
async function handleSubmitApprovalRequest() {
    //get the currentuser's Id
    let currentUserUri = new URL(authStore.idUrl);
    let currentUserId = currentUserUri.pathname.split('/').pop();
    //build the post object - based on the information from https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_process_approvals_post.htm
    let dataObj = {
        requests:[
            { 
                actionType:'Submit', 
                contextActorId: currentUserId, 
                contextId: versionId.value, 
                nextApproverIds:[approverId.value], 
                processDefinitionNameOrId: approvalProcessId.value }]};
    //make the post to the approvals endpoint.
    try {
        let approvalRequestEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/process/approvals/`;
        await axios.post(approvalRequestEndpoint,dataObj,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        emit('approvalRequestSubmitted');
    } catch(e) {
        handleCalloutException(e);
    }
}
async function obtainMemorandumVersionStatusPicklist(){
    let endpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/describe`;
    try {
        let response = await axios({
            url: endpoint,
            method: 'get',
            responseType: 'json',
            headers: {'Authorization':`Bearer ${authStore.bearerToken}`}
        });
        let statusField = response.data.fields.find(obj => obj.name === 'Status__c');
        statusOptions.value = statusField.picklistValues.map( plItem => {
            return { label:plItem.label, value:plItem.value };
        })
    } catch(e) {
        handleCalloutException(e);
    }
}
async function handlePublishVersionRequest(){
    let versionData = {Status__c: 'Published'};
    try {
        let versionUpdateUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${versionId.value}`;
        let versionUpdateResponse = await axios.patch(versionUpdateUrl,versionData,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        console.log('Version Update Response: %s',JSON.stringify(versionUpdateResponse,null,"\t"));
        emit('approvalRequestSubmitted');
        obtainMemorandumVersionInfo(versionId.value);
    } catch(e) {
        handleCalloutException(e);
    }
}

//watchers
watch(() => props.versionId,(newValue)=>{
    determineDefaultApproverId(newValue);
    obtainMemorandumVersionInfo(newValue);
});

//lifecycle functions
onBeforeMount(async () => {
    getApprovalProcess();
    getCommunities();
    determineDefaultApproverId(versionId.value);
    obtainMemorandumVersionInfo(versionId.value);
    obtainMemorandumVersionStatusPicklist();
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
                                <button class="slds-button slds-button_neutral" v-on:click="showCloneForm = !showCloneForm">{{ (showCloneForm) ? 'Cancel Clone Version':'Clone Version' }}</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_neutral" v-on:click="redirectToPreview">Preview Version</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_neutral" v-bind:disabled="requestSubmitted || isPublished" v-on:click="handleSubmitApprovalRequest">Submit for Approval</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_neutral" v-bind:disabled="isPublished" v-on:click="handlePublishVersionRequest">Publish Version</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showCloneForm" class="slds-grid slds-wrap">
        <div class="slds-col slds-size_1-of-1">
            <div class="slds-card slds-var-m-bottom_large">
                <div class="slds-card__body slds-card__body-inner slds-var-p-horizontal_small">
                    <div class="slds-form-element">
                        <label class="slds-form-element__label" for="txtCanonicalVersion">Canonical Version</label>
                        <div class="slds-form-element__control">
                            <input type="number" id="txtCanonicalVersion" class="slds-input" v-model="newVersionCanonicalVersion"/>
                        </div>
                    </div>
                    <SelectorBox label="Status" placeholder="Select Status" v-bind:options="statusOptions" v-model="newVersionStatus" v-on:selection="handleStatusSelection($event)"/>
                    <div class="slds-form-element">
                        <label class="slds-form-element__label" for="txtDescription">Description</label>
                        <div class="slds-form-element__control">
                            <textarea id="txtDescription" placeholder="Enter Description..." v-model="newVersionDescription" class="slds-textarea"></textarea>
                        </div>
                    </div>
                    <div v-if="showErrMess" class="slds-text-color_destructive">
                        <p>{{  errMess }}</p>
                    </div>
                </div>
                <div class="slds-card__footer slds-text-align_right">
                    <button class="slds-button slds-button_brand" v-on:click="handleCloneVersion(props.versionId)">Save</button>
                    <button class="slds-button slds-button_destructive" v-on:click="showCloneForm = false;">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>