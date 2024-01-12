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
const memberGroupList = ref([]);
const activeProcessDefinitionId = ref('');
const activeContextId = ref('');
const activeActorId = ref('');

//computed property
const versionId = computed(()=>{
    return props.versionId;
});
const currentUserId = computed(()=>{
    let userUrl = new URL(authStore.idUrl);
    let userId = userUrl.pathname.split('/').pop();
    return userId;
});
const isApprover = computed(()=>{
    let foundMemberId = memberGroupList.value.find(val => val === activeActorId.value);
    return activeActorId.value === currentUserId.value || foundMemberId === activeActorId.value;
});

//functions
function handleCalloutException(e) {
    if(e?.response?.status !== undefined){
        switch(e.response.status) {
            case 401:
                authStore.$reset();
                router.push({name:'home',params:{recordId:versionId.value}});
                break;
            default:
                console.log('There was an error: %s',JSON.stringify(e,null,"\t"));
        }
    } else {
        console.error('There was an error.')
        console.dir(e);
    }   
}
async function obtainGroupMemberships(){
    let groupMemberQuery = encodeURIComponent(`SELECT GroupId, Group.Name FROM GroupMember WHERE UserOrGroupId='${currentUserId.value}'`);
    let groupMemberUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${groupMemberQuery}`;
    try {
        let groupMemberResponse = await axios.get(groupMemberUrl,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        memberGroupList.value = groupMemberResponse.data.records.map(record => record.GroupId);
    } catch(e) {
        handleCalloutException(e);
    }
}
async function objectProcessInstanceHistoryInfo(versionIdIn){
    let pihQueryInfo = encodeURIComponent(`SELECT Id, Status, (SELECT Id, ProcessNodeId, ProcessNode.Name, ActorId, Actor.Name, ElapsedTimeInMinutes, IsPending, StepStatus FROM StepsAndWorkItems) FROM ProcessInstance WHERE TargetObjectId = '${versionIdIn}' AND Status = 'Pending' ORDER BY LastModifiedDate DESC`);
    let pihQueryInfoUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${pihQueryInfo}`;
    try {
        const pihQueryInfoResponse = await axios.get(pihQueryInfoUrl,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        let stepAndWorkItems = pihQueryInfoResponse.data.records[0].StepsAndWorkitems.records;        
        processInstanceArray.value = stepAndWorkItems?.map((item)=>{
            if(item.StepStatus === 'Pending'){
                activeProcessDefinitionId.value = pihQueryInfoResponse.data.records[0].Id;
                activeContextId.value = item.Id;
                activeActorId.value = item.ActorId;
            }
            return {
                'id':item.Id,
                'processName':`${(item?.ProcessNode?.Name === undefined) ? 'N/A':item?.ProcessNode?.Name}`,
                'actorName':`${(item?.Actor?.Name === undefined) ? 'N/A':item?.Actor?.Name}`,
                'status':item.StepStatus
            };
        });
    } catch(e) {
        handleCalloutException(e);
    }
}
async function rejectApprovalStep(){
    let rejectionInfoUri = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/process/approvals/`;
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
        objectProcessInstanceHistoryInfo(versionId.value);
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
    try {
        await axios.post(approvalInfoUri,approvalData,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        emit('approvalProcessStatusChange');
        objectProcessInstanceHistoryInfo(versionId.value);
    } catch(e) {
        handleCalloutException(e);
    }

}

//watchers
watch(versionId, (newValue) => {
    console.log('watcher initiated.');
    objectProcessInstanceHistoryInfo(newValue);
});
//lifecycle functions
onBeforeMount(()=>{
    if(versionId.value !== undefined && versionId.value.length > 0){
        objectProcessInstanceHistoryInfo(versionId.value);
        obtainGroupMemberships();
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
                    <div class="slds-truncate" title="Last Actor">Actor</div>
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
                    <div v-if=" item.status === 'Pending' && isApprover " class="slds-truncate">
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