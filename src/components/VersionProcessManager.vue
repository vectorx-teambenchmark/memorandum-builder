<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';

const props = defineProps({
    versionId: {
        type: String
    }
});
const emit = defineEmits(['approvalProcessStatusChange']);
const authStore = useAuthStore();
const router = useRouter();

const processInstanceArray = ref([]);
const activeProcessDefinitionId = ref('');
const activeContextId = ref('');
const activeActorId = ref('');

//computed property
const versionId = computed(()=>{
    return props.versionId;
});

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
async function obtainActiveProcessInstanceInfo(versionIdIn) {
    let piQueryInfo = encodeURIComponent(`SELECT Id, LastActorId, LastActor.Name, ProcessDefinitionId, ProcessDefinition.Name, Status, (SELECT ActorId, Comments, StepStatus FROM Steps), (SELECT Id, ActorId, ProcessInstanceId FROM Workitems) FROM ProcessInstance WHERE TargetObjectId = '${versionIdIn}' ORDER By LastModifiedDate DESC`);
    let piQueryInfoUri = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${piQueryInfo}`;
    try {
        let piQueryInfoResponse = await axios.get(piQueryInfoUri,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        processInstanceArray.value = piQueryInfoResponse.data.records.map(( record ) => {
            if(record.Status === 'Pending') {
                activeProcessDefinitionId.value = record.ProcessDefinitionId;
                activeContextId.value = record.Workitems.records[0]?.Id;
                activeActorId.value = record.Workitems.records[0]?.ActorId;
            }
            return { 
                'id':record.Id,
                'processName':record.ProcessDefinition?.Name, 
                'actorName':record.LastActor?.Name, 
                'status':record.Status 
            };
        });
    } catch(e) {
        handleCalloutException(e);
    }
}
async function rejectApprovalStep(){
    let rejectionInfoUri = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/process/approvals/`;
    //let userUrl = new URL(authStore.idUrl);
    //let currentUserId = userUrl.pathname.split('/').pop();
    let rejectionData = {requests:[{ 
        actionType:'Reject', 
        contextId:activeContextId.value, 
        comments:'Rejected in CKEditor App.'
    }]};
    try {
        await axios.post(rejectionInfoUri,rejectionData,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        emit('approvalProcessStatusChange');
        obtainActiveProcessInstanceInfo(versionId.value);
    } catch(e) {
        handleCalloutException(e);
    } 
}
async function approveApprovalStep(){
    let approvalInfoUri = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/process/approvals/`;
    let approvalData = {requests:[{
        actionType:'Approve',
        contextId:activeContextId.value,
        comments:'Approved in CKEditor App.'
    }]};
    console.log('The Approval Request Being Sent: %s',JSON.stringify(approvalData,null,"\t"));
    try {
        await axios.post(approvalInfoUri,approvalData,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        emit('approvalProcessStatusChange');
        obtainActiveProcessInstanceInfo(versionId.value);
    } catch(e) {
        handleCalloutException(e);
    }

}

//watchers
watch(versionId, (newValue) => {
    console.log('watcher initiated.');
    obtainActiveProcessInstanceInfo(newValue);
});
//lifecycle functions
onBeforeMount(()=>{
    if(versionId.value !== undefined && versionId.value.length > 0){
        obtainActiveProcessInstanceInfo(versionId.value);
    }
})
</script>

<template>
    <table class="slds-table slds-table_cell-buffer slds-table_bordered" aria-labelledby="element-with-table-label">
        <thead>
            <tr class="slds-line-height_reset">
                <th class="" scope="col">
                    <div class="slds-truncate" title="Process Name">Process Name</div>
                </th>
                <th class="" scope="col">
                    <div class="slds-truncate" title="Last Actor">Last Actor</div>
                </th>
                <th class="" scope="col">
                    <div class="slds-truncate" title="Status">Status</div>
                </th>
                <th class="" scope="col">
                    <div class="slds-truncate" title="Actions">Actions</div>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in processInstanceArray" v-bind:key="item.id" class="slds-hint-parent">
                <td data-label="Process Name">
                    <div class="slds-truncate" v-bind:title="item.processName">{{  item.processName }}</div>
                </td>
                <td data-label="Last Actor">
                    <div class="slds-truncate" v-bind:title="item.actorName">{{  item.actorName }}</div>
                </td>
                <td data-label="Status">
                    <div class="slds-truncate" v-bind:title="item.status">{{ item.status }}</div>
                </td>
                <td data-label="Actions">
                    <div v-if=" item.status === 'Pending' " class="slds-truncate">
                        <button class="slds-button slds-button_icon slds-button_icon-brand" v-on:click="approveApprovalStep" title="Approve">
                            <svg class="slds-button__icon" aria-hidden="true">
                                <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                            </svg>
                        </button>
                        <button class="slds-button slds-button_icon slds-button_icon-brand" v-on:click="rejectApprovalStep" title="Reject">
                            <svg class="slds-button__icon" aria-hiddn="true">
                                <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>