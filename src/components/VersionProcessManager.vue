<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';

const props = defineProps({
    versionId: {
        type: String
    }
});
const authStore = useAuthStore();
const router = useRouter();

const processInstanceArray = ref([]);

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
    let piQueryInfo = encodeURIComponent(`SELECT Id, LastActorId, LastActor.Name, ProcessDefinitionId, ProcessDefinition.Name, Status, (SELECT ActorId, Comments, StepStatus FROM Steps) FROM ProcessInstance WHERE TargetObjectId = '${versionIdIn}'`);
    let piQueryInfoUri = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${piQueryInfo}`;
    try {
        let piQueryInfoResponse = await axios.get(piQueryInfoUri,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        processInstanceArray.value = piQueryInfoResponse.data.records.map(( record ) => {
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

//watchers
watch(versionId, (newValue) => {
    obtainActiveProcessInstanceInfo(newValue);
});
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
            </tr>
        </tbody>
    </table>
</template>