<script setup>
    import { onBeforeMount, ref } from 'vue';
    import axios from 'axios';
    import SelectorBox from './SelectorBox.vue';

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

    const versionsAvailable = ref([]);

    //before the component is loaded into the DOM
    onBeforeMount(async () => {
        let soqlString = encodeURIComponent(`SELECT Id, VersionName__c, Status__c FROM MemorandumVersion__c WHERE ParentMarketingMaterial__c ='${props.cmmId}'`);
        let endpoint = `${props.urlBase}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${soqlString}`;
        try {
            let response = axios({
                method: 'get',
                url: endpoint,
                responseType: 'json',
                headers: {'Authorization':`Bearer ${props.apiToken}`}
            });
            console.log(response);
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
    <div class="slds-box slds-theme_default">
        <SelectorBox label="Select Memorandum Version" placeholder="Select Version..." v-bind:options="versionsAvailable" />
    </div>
</template>