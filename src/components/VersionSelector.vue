<script setup>
    import { onBeforeMount, ref } from 'vue';
    import axios from 'axios';

    const SelectorBox = import('./SelectorBox.vue');

    const props = defineProps({
        apiToken: {
            type: String,
            required: true
        },
        urlBase: {
            type: String,
            required: true
        },
        cmmId: {
            type: String,
            required: true
        }
    });
    const emit = defineEmits(['versionselected']);

    const versionsAvailable = ref([]);
    function handleVersionSelection(payload){
        emit('versionselected',payload.detail);
    }

    //before the component is loaded into the DOM
    onBeforeMount(async () => {
        let soqlString = encodeURIComponent(`SELECT Id, VersionName__c, Status__c, VersionNotes__c FROM MemorandumVersion__c WHERE ParentMarketingMaterial__c ='${props.cmmId}'`);
        let endpoint = `${props.urlBase}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${soqlString}`;
        try {
            let response = await axios({
                method: 'get',
                url: endpoint,
                responseType: 'json',
                headers: {'Authorization':`Bearer ${props.apiToken}`}
            });
            versionsAvailable.value = response.data.records.map((element)=>{
                return { label:`${element.VersionName__c} (${element.Status__c}) ${(element.VersionNotes__c !== undefined) ? '- ' + element.VersionNotes__c:''}`, value:element.Id };
            });
        } catch(e) {
            switch(e.response.status){
                case 401:
                    break;
                default:
                    console.log('Error: %s',JSON.stringify(e,null,"\t"));
            }
        }
    });

</script>

<template>
    <SelectorBox label="Select Memorandum Version" placeholder="Select Version..." v-bind:options="versionsAvailable" v-on:selection="handleVersionSelection" />
</template>