<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import axios from 'axios';
import useAuthStore from '../stores/auth';

const props = defineProps({
    versionInfo:{
        type: Object,
        default(){
            return { VersionName__c:'N/A'}
        }
    },
    tocDisplay:{
        Boolean,
        default(){
            return false;
        }
    }
});
const emit = defineEmits(['update:tocDisplay']);
const authStore = useAuthStore();

const approvalProcessId = ref('');
const approvalProcessName = ref('');

//computed properties
const tocToggleButtonLabel = computed(()=>{
    return (props.tocDisplay) ? 'Hide Table Of Contents':'Show Table of Contents';
});
const versionId = computed(()=>{
    return props.versionInfo.Id;
})

async function handleSubmitApprovalRequest() {
    //get the currentuser's Id
    let currentUserUri = new URL(authStore.idUrl);
    let currentUserId = currentUserUri.pathname.split('/').pop();
    //build the post object - based on the information from https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/resources_process_approvals_post.htm
    let dataObj = {requests:[{ actionType:'Submit', contextActorId: currentUserId, contextId: versionId.value, processDefinitionNameOrId: approvalProcessId.value }]};
    //make the post to the approvals endpoint.
    try {
        let approvalRequestEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/process/approvals/`;
        let approvalRequestResponse = await axios.post(approvalRequestEndpoint,dataObj,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        console.log('Response to Approval Request: %s',JSON.stringify(approvalRequestResponse,null,"\t"));
    } catch(e) {
        console.log('Error Submitting Approval Request: %s',JSON.stringify(e,null,"\t"));
    }
}

onBeforeMount(async () => {
    //get the list of process approvals.
    let processApprovalEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/process/approvals/`;
    try {
        let processApprovalResponse = await axios.get(processApprovalEndpoint,{responseType:'json',headers:{'authorization':`Bearer ${authStore.bearerToken}`}});
        //there should only be one approval process that we care about so lets get the first one and save the id and the name
        let memorandumVersionApproval = processApprovalResponse.data.approvals.MemorandumVersion__c[0];
        approvalProcessId.value = memorandumVersionApproval.id;
        approvalProcessName.value = memorandumVersionApproval.name;
    } catch(e) {
        console.log('Error obtaining Process Approvals: %s',JSON.stringify(e,null,"\t"));
    }
    //determine if there are any 'outstanding' processInstance records for this MemorandumVersion__c record

})

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
                                <h1><span class="slds-page-header__title">{{ props.versionInfo.VersionName__c }}</span></h1>
                            </div>
                        </div>
                        <p class="slds-page-header__name-meta">{{ props.versionInfo.Status__c }} &#9900; Canonical Version {{ props.versionInfo.CanonicalVersion__c }}</p>
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
                                <button class="slds-button slds-button_neutral" v-on:click="handleSubmitApprovalRequest">Submit for Approval</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>