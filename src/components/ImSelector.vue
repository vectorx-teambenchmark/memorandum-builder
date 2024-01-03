<script setup>
    import { ref, computed, watch } from 'vue'
    import axios from 'axios';
    import ComboBox from './ComboBox.vue';

    const props = defineProps({
        apiToken: {
            type: String,
            required: true
        },
        urlBase: {
            type: String,
            required: true
        }
    });
    const emit = defineEmits(['unauthorized','imselected']);
    const optionsArray = ref([]);

    const optionsReturned = computed(() => {
        let items = [];
        if(optionsArray.value.length > 0) {
            items = optionsArray.value.reduce((prev,cur) => {
                let foundItem = prev.find(element => element.value === cur.value);
                if(foundItem === undefined){
                    prev.push(cur);
                }
                return prev;
            },[]);
        }
        return items;
    });

    const searchTerm = ref('');

    function handleSelection(payload){
        optionsArray.value =[];
        searchTerm.value = '';
        emit('imselected',payload);
    }

    //watchers
    watch(searchTerm, async (newSearchTerm) => {
        let soslString = encodeURIComponent(`FIND {${newSearchTerm}*} IN ALL FIELDS RETURNING Client_Marketing_Material__c(Id, Name, Opportunity__r.Name, Seller_Account__r.Name WHERE RecordType.DeveloperName = 'IM')`);
        let endpoint = `${props.urlBase}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/search/?q=${soslString}`;
        let authToken = `Bearer ${props.apiToken}`;
        try {
            if(newSearchTerm.length >= 3) {
                let response = await axios({
                    method:'get',
                    url:endpoint,
                    responseType:'json',
                    headers: {'Authorization':authToken}
                });
                
                optionsArray.value = [...response.data.searchRecords.map(responseItem => {
                    return {'label':responseItem.Name,'value':responseItem.Id};
                })];
            }
        } catch(e) {
            //if the status is 401 - Unauthorized, then we need to fire an event
            switch(e.response.status) {
                case 401:
                    emit('unauthorized');
                    break;
                default:
                    console.log(JSON.stringify(e,null,"\t"));
            }
        }
    });

</script>

<template>
    <ComboBox label="Information Memorandum Search" placeholder="Search..." v-model="searchTerm" v-bind:options="optionsReturned" v-on:selection="handleSelection"/>
</template>