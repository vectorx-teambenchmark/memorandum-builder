<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
    apiToken: {
        type: String,
        required: true
    },
    urlBase: {
        type: String,
        required: true
    },
    sectionId: {
        type: String,
        required: true
    }
});
const emit = defineEmits(['sectionupdate','movesectionup','movesectiondown']);
const sectionInfo = ref({});
const sectionName = ref('');
const contentArray = ref([]);
const showEditSectionForm = ref(false);
const currentSectionId = computed(()=>{
    return props.sectionId;
})
function cancelRename(){
    sectionName.value = sectionInfo.value.Name;
    showEditSectionForm.value = false;
}
async function updateSection(){
    let recordInfo = {'Name':sectionName.value};
    let endpoint = `${props.urlBase}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumSection__c/${props.sectionId}`;
    try {
        let response = await axios({
            method:'patch',
            url:endpoint,
            data:recordInfo,
            headers:{'Authorization':`Bearer ${props.apiToken}`}
        });
        obtainSectionInfo();
        showEditSectionForm.value = false;
    } catch(e) {
        console.log('Error: %s',JSON.stringify(e,null,"\t"));
    }
    emit('sectionupdate');
}
async function obtainSectionInfo(){
    let urlendpoint = `${props.urlBase}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumSection__c/${currentSectionId.value}`;
    let contentQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c, DisplayRecordName__c FROM MemorandumContent__c WHERE Parent__c ='${currentSectionId.value}' ORDER BY Order__c ASC`);
    let queryEndpoint = `${props.urlBase}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${contentQuery}`;
    try {
        let response = await axios({
            method:'get',
            url:urlendpoint,
            responseType:'json',
            headers:{'Authorization':`Bearer ${props.apiToken}`}
        });
        sectionInfo.value = response.data;
        sectionName.value = sectionInfo.value.Name;
        let contentResponse = await axios({
            method:'get',
            url:queryEndpoint,
            responseType:'json',
            headers:{'Authorization':`Bearer ${props.apiToken}`}
        });
        contentArray.value = contentResponse.data.records.map(item => item);
    } catch(e) {
        console.log('Error: %s',JSON.stringify(e,null,"\t"));
    }
}

watch(currentSectionId,()=>{
    obtainSectionInfo();
})

onBeforeMount(()=>{
    obtainSectionInfo();
})
</script>

<template>
    <article class="slds-card">
        <div class="slds-card__header slds-grid">
            <header class="slds-media slds-media_center slds-has-flexi-truncate">
                <div class="slds-media__figure">

                </div>
                <div class="slds-media__body">
                    <h2 class="slds-card__header-title">
                        <a class="slds-card__header-link slds-truncate" v-bind::title="sectionInfo.Name"><span>{{ sectionInfo.Name }}</span></a>
                    </h2>
                </div>
                <div class="slds-no-flex">
                    <div class="slds-button-group">
                        <button class="slds-button slds-button_brand" v-on:click="showEditSectionForm = !showEditSectionForm">{{ (showEditSectionForm) ? 'Cancel Rename':'Rename Section'}}</button>
                        <button class="slds-button slds-button_neutral" v-on:click="emit('movesectionup',currentSectionId)">Move Section Up</button>
                        <button class="slds-button slds-button_neutral" v-on:click="emit('movesectiondown',currentSectionId)">Move Section Down</button>
                        <button class="slds-button slds-button_brand">Clone Section</button>
                        <button class="slds-button slds-button_destructive">Delete Section</button>
                    </div>
                </div>
            </header>
        </div>
        <div class="slds-card__body">
            <div class="slds-grid slds-wrap">
                <div v-if="showEditSectionForm" class="slds-col slds-size_1-of-1 slds-theme_inverse slds-var-p-around_small">
                    <div class="slds-form-element">
                        <label class="slds-form-element__label" for="txtSectionName"><span class="slds-text-color_inverse">Section Name</span></label>
                        <div class="slds-form-element__control slds-text-color_default">
                            <input type="text" id="txtSectionName" class="slds-input" v-model="sectionName" />
                        </div>
                    </div>
                </div>
                <div v-if="showEditSectionForm" class="slds-col slds-size_1-of-1 slds-theme_inverse slds-var-p-horizontal_small slds-var-p-vertical_x-small">
                    <div class="slds-button-group">
                        <button class="slds-button slds-button_neutral" v-on:click="updateSection">Save</button>
                        <button class="slds-button slds-button_destructive" v-on:click="cancelRename">Cancel</button>
                    </div>
                </div>
                <div v-for="contentItem in contentArray" v-bind:key="contentItem.Id" class="slds-col slds-size_1-of-1 slds-var-p-around_small">
                    <div class="slds-box slds-grid slds-wrap">
                        <div class="slds-col slds-size_1-of-3">
                            <span class="slds-has-flexi-truncate">
                                <span class="slds-truncate">{{ contentItem.Name }}</span>
                            </span>
                        </div>
                        <div class="slds-col slds-size_1-of-3">

                        </div>
                        <div class="slds-col sls-size_1-of-3 slds-text-align_right">
                            <div class="slds-button-group">
                                <button class="slds-button slds-button_brand">Edit Content</button>
                                <button class="slds-button slds-button_neutral">Move Content Up</button>
                                <button class="slds-button slds-button_neutral">Move Content Down</button>
                                <button class="slds-button slds-button_destructive">Delete Content</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </article>
</template>