<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import useAuthStore from '../stores/auth';
import axios from 'axios';
import ContentManager from './ContentManager.vue';
import CommentList from './list/CommentList.vue';

const props = defineProps({
    sectionId: {
        type: String,
        required: true
    },
    restrictEditing: {
        type: Boolean,
        required: true,
        default(){
            return false;
        }
    }
});
const emit = defineEmits(['sectionupdate','sectiondelete','contentselection','contentupdate']);
const authStore = useAuthStore();
const router = useRouter();
const sectionInfo = ref({});
const sectionName = ref('');
const contentArray = ref([]);

const showEditSectionForm = ref(false);
const currentSectionId = computed(()=>{
    return props.sectionId;
});
const allowEditing = computed(()=>{
    return ! props.restrictEditing;
});


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
function cancelRename(){
    sectionName.value = sectionInfo.value.Name;
    showEditSectionForm.value = false;
}
function moveSectionDown(sectionItem,sectionArray){
    let sectionIndex = sectionArray.findIndex(arrItem => arrItem.Id === sectionItem.Id);
    if(sectionIndex === -1 || sectionIndex === sectionArray.length-1){
        return sectionArray;
    }
    //splice the item out of its current position
    let removedItem = sectionArray.splice(sectionIndex,1)[0];
    //insert the item one position below
    sectionArray.splice(sectionIndex + 1,0,removedItem);
    //re-order the sections
    var order = 1;
    sectionArray.forEach(curItem =>{
        curItem.Order__c = order;
        order++;
    });
    return sectionArray;
}
function moveSectionUp(sectionItem,sectionArray){
    let sectionIndex = sectionArray.findIndex(arrItem => arrItem.Id === sectionItem.Id);
    if(sectionIndex <= 0){
        return sectionArray;
    }
    //splice the item out of its current position
    let removedItem = sectionArray.splice(sectionIndex,1)[0];
    //insert the item one position below
    sectionArray.splice(sectionIndex - 1,0,removedItem);
    var order = 1;
    sectionArray.forEach(curItem =>{
        curItem.Order__c = order;
        order++;
    });
    return sectionArray;
}
async function handleMoveSectionDown(){
    try {
        let sectionRecords = await obtainAllSections();
        let updatedArray = moveSectionDown(sectionInfo.value,sectionRecords);
        let updateObj = { allOrNone: true, records: updatedArray };
        let sectionUpdateEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/composite/sobjects/`;
        await axios({
            method:'patch',
            url:sectionUpdateEndpoint,
            responseType:'json',
            data:updateObj,
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });  
        await obtainSectionInfo();
    } catch(e) {
        handleCalloutException(e);
    }
    emit('sectionupdate');
}
async function handleMoveSectionUp(){
    try {
        let sectionRecords = await obtainAllSections();
        let updatedArray = moveSectionUp(sectionInfo.value,sectionRecords);
        let updateObj = { allOrNone: true, records: updatedArray };
        let sectionUpdateEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/composite/sobjects/`;
        await axios({
            method:'patch',
            url:sectionUpdateEndpoint,
            responseType:'json',
            data:updateObj,
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        await obtainSectionInfo();
    } catch(e) {
        console.log('Error: %s',JSON.stringify(e,null,"\t"));
    }
    emit('sectionupdate');
}
async function obtainAllSections(){
    let sectionQuery = encodeURIComponent(`SELECT Id, Name, Order__c FROM MemorandumSection__c WHERE Parent__c = '${sectionInfo.value.Parent__c}' ORDER BY Order__c ASC`);
    let sectionQueryEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${sectionQuery}`;
    try {
        let sectionQueryResponse = await axios({
            method:'get',
            url:sectionQueryEndpoint,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        return sectionQueryResponse.data.records;
    } catch(e) {
        console.log('Error: %s',JSON.stringify(e,null,"\t"));
    }
    return null;
}

async function deleteSection(){
    if(window.confirm('Are you sure you want to delete this section?')){
        let endpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumSection__c/${props.sectionId}`;
        try {
            await axios({
                method:'delete',
                url:endpoint,
                headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
            });
            emit('sectiondelete');
        } catch(e) {
            handleCalloutException(e);
        }
    }
}
async function updateSection(){
    let recordInfo = {'Name':sectionName.value};
    let endpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumSection__c/${props.sectionId}`;
    try {
        await axios({
            method:'patch',
            url:endpoint,
            data:recordInfo,
            headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
        });
        await obtainSectionInfo();
        showEditSectionForm.value = false;
    } catch(e) {
        handleCalloutException(e);
    }
    emit('sectionupdate');
}
async function obtainSectionInfo(){
    let urlendpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumSection__c/${currentSectionId.value}`;
    let contentQuery = encodeURIComponent(`SELECT Id, Name, Order__c, Parent__c, DisplayRecordName__c FROM MemorandumContent__c WHERE Parent__c ='${currentSectionId.value}' ORDER BY Order__c ASC`);
    let queryEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${contentQuery}`;   
    let calloutHeaders = {'Authorization':`Bearer ${authStore.bearerToken}`}
    try {
        let response = await axios({
            method:'get',
            url:urlendpoint,
            responseType:'json',
            headers: calloutHeaders
        });
        sectionInfo.value = response.data;
        sectionName.value = sectionInfo.value.Name;
        let contentResponse = await axios({
            method:'get',
            url:queryEndpoint,
            responseType:'json',
            headers:calloutHeaders
        });
        
        let allSections = await obtainAllSections();
        sectionInfo.value.isFirst = (sectionInfo.value.Order__c === 1) ? true:false;
        sectionInfo.value.isLast = (sectionInfo.value.Order__c === allSections.length) ? true:false;
        contentArray.value = contentResponse.data.records.map(item => item);
        
    } catch(e) {
        handleCalloutException(e);
    }
}

watch(currentSectionId,async ()=>{
    await obtainSectionInfo();
});

onBeforeMount(async ()=>{
    await obtainSectionInfo();
});
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
                    <div v-if="allowEditing" class="slds-button-group">
                        <button class="slds-button slds-button_brand" v-on:click="showEditSectionForm = !showEditSectionForm">{{ (showEditSectionForm) ? 'Cancel Rename':'Rename Section'}}</button>
                        <button class="slds-button slds-button_neutral" v-on:click="handleMoveSectionUp" v-bind:disabled="sectionInfo.isFirst">Move Section Up</button>
                        <button class="slds-button slds-button_neutral" v-on:click="handleMoveSectionDown" v-bind:disabled="sectionInfo.isLast">Move Section Down</button>
                        <button class="slds-button slds-button_destructive" v-on:click="deleteSection">Delete Section</button>
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
                <ContentManager v-bind:restrict-editing="!allowEditing" v-bind:section-id="currentSectionId" v-on:contentselection="emit('contentselection',$event)" v-on:contentupdate="emit('contentupdate')"/>
            </div>
        </div>
    </article>
</template>