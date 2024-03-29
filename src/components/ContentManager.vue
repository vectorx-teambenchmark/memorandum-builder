<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import useAuthStore from '../stores/auth';
import Toggle from './Toggle.vue';

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

const emit = defineEmits(['contentselection','contentupdate']);
const authStore = useAuthStore();
const router = useRouter();
const currentSectionId = computed(()=>{
    return props.sectionId;
});
const allowEditing = computed(()=>{
    return !props.restrictEditing;
})
const contentArray = ref([]);
const showNewContentForm = ref(false);
const newContentDisplayName = ref(false);
const newContentName = ref('');

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
async function obtainContentInfo(){
    try {
        let contentArrayQuery = encodeURIComponent(`SELECT Id, Name, Order__c, DisplayRecordName__c FROM MemorandumContent__c WHERE Parent__c = '${currentSectionId.value}' ORDER BY Order__c ASC`);
        let contentArrayEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/query?q=${contentArrayQuery}`;
        let contentArrayResponse = await axios({
            method:'get',
            url:contentArrayEndpoint,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        let responseArray = contentArrayResponse.data.records.map((item,index,arr) =>{
            let retItem = Object.assign(item,{isFirst:false,isLast:false});
            retItem.isFirst = (index === 0) ? true:false;
            retItem.isLast = (index === arr.length - 1) ? true:false;
            return retItem;
        })
        contentArray.value = responseArray;
    } catch(e) {
        handleCalloutException(e);
    }
}
async function updateDisplayNameOnToggle(contentId,displayRecVal){
    let updateObj = {'DisplayRecordName__c': displayRecVal};
    let contentEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumContent__c/${contentId}`;
    try {
        await axios({
            method:'patch',
            url:contentEndpoint,
            data:updateObj,
            responseType:'json',
            headers:{'Authorization':`Bearer ${authStore.bearerToken}`}
        });
    } catch(e) {
        handleCalloutException(e);
    }
}
async function handleMoveContentUp(contentId){
    let selectedContentIndex = contentArray.value.findIndex(contentItem => contentItem.Id === contentId);
    if(selectedContentIndex <= 0){
        return;
    }
    let removedItem = contentArray.value.splice(selectedContentIndex,1)[0];
    contentArray.value.splice(selectedContentIndex - 1,0,removedItem);
    var order = 1;
    contentArray.value.forEach(contentItem => {
        contentItem.Order__c = order;
        delete contentItem['isFirst'];
        delete contentItem['isLast'];
        order++;
    });
    try {
        let updateObj = { allOrNone: true, records: contentArray.value };
        let contentUpdateEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/composite/sobjects/`;
        await axios({
            method:'patch',
            url:contentUpdateEndpoint,
            data:updateObj,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        emit('contentupdate');
        await obtainContentInfo();
    } catch(e){
        handleCalloutException(e);
    }
}
async function handleMoveContentDown(contentId){
    let selectedContentIndex = contentArray.value.findIndex(contentItem => contentItem.Id === contentId);
    if(selectedContentIndex === -1 || selectedContentIndex === contentArray.value.length){
        return;
    }
    let removedItem = contentArray.value.splice(selectedContentIndex,1)[0];
    contentArray.value.splice(selectedContentIndex + 1,0,removedItem);
    var order = 1;
    contentArray.value.forEach(contentItem => {
        contentItem.Order__c = order;
        delete contentItem['isFirst'];
        delete contentItem['isLast'];
        order++;
    });
    try {
        let updateObj = { allOrNone: true, records: contentArray.value };
        let contentUpdateEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/composite/sobjects/`;
        await axios({
            method:'patch',
            url:contentUpdateEndpoint,
            data:updateObj,
            responseType:'json',
            headers:{'authorization':`Bearer ${authStore.bearerToken}`}
        });
        emit('contentupdate');
        await obtainContentInfo();
    } catch(e) {
        handleCalloutException(e);
    }
}
async function handleDeleteContent(contentId){
    if(window.confirm('Are you sure you want to delete this content?')){
        try {
            let contentDeleteEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumContent__c/${contentId}`;
            await axios({
                method:'delete',
                url:contentDeleteEndpoint,
                responseType:'json',
                headers:{'authorization':`Bearer ${authStore.bearerToken}`}
            });
            emit('contentupdate');
            await obtainContentInfo();
        } catch(e) {
            handleCalloutException(e);
        }
    }
}
async function handleCreateNewContent(){
    try {
        let newContentObject = { Name:newContentName.value, DisplayRecordName__c: newContentDisplayName.value, 
            Order__c:contentArray.value.length + 1, Parent__c:currentSectionId.value };
        let newContentEndpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumContent__c/`;
        await axios({
            method: 'post',
            url: newContentEndpoint,
            responseType: 'json',
            data: newContentObject,
            headers: {'authorization':`Bearer ${authStore.bearerToken}`}
        });
        showNewContentForm.value = false;
        newContentDisplayName.value = false;
        newContentName.value = '';
        emit('contentupdate');
        await obtainContentInfo();
    } catch(e) {
        handleCalloutException(e);
    }
}

watch(currentSectionId,async ()=>{
    await obtainContentInfo();
});

onBeforeMount(async ()=>{
    //get the content
    await obtainContentInfo();
});
</script>
<template>
    <div v-for="contentItem in contentArray" v-bind:key="contentItem.Id" class="slds-col slds-size_1-of-1 slds-var-p-around_small">
        <div class="slds-box slds-grid slds-wrap">
            <div class="slds-col slds-size_1-of-3">
                <span class="slds-has-flexi-truncate">
                    <span class="slds-truncate">{{ contentItem.Name }}</span>
                </span>
            </div>
            <div class="slds-col slds-size_1-of-3">
                <Toggle v-if="allowEditing" label="Display Name As Title" active-label="Display" inactive-label="Hide" v-model="contentItem.DisplayRecordName__c"
                    v-on:change="updateDisplayNameOnToggle(contentItem.Id,contentItem.DisplayRecordName__c)"/>
            </div>
            <div class="slds-col sls-size_1-of-3 slds-text-align_right">
                <div v-if="allowEditing" class="slds-button-group">
                    <button class="slds-button slds-button_brand" v-on:click="emit('contentselection',contentItem.Id)">Edit Content</button>
                    <button class="slds-button slds-button_neutral" v-bind:disabled="contentItem.isFirst" v-on:click="handleMoveContentUp(contentItem.Id)">Move Content Up</button>
                    <button class="slds-button slds-button_neutral" v-bind:disabled="contentItem.isLast" v-on:click="handleMoveContentDown(contentItem.Id)">Move Content Down</button>
                    <button class="slds-button slds-button_destructive" v-on:click="handleDeleteContent(contentItem.Id)">Delete Content</button>
                </div>
            </div>
        </div>
    </div>
    <div class="slds-col slds-size_1-of-1 slds-var-m-top_medium slds-var-p-horizontal_small slds-var-m-bottom_small">
        <button v-if="allowEditing" v-bind:class="{ 'slds-button':true, 'slds-button_brand':!showNewContentForm, 'slds-button_destructive':showNewContentForm }" v-on:click="showNewContentForm = !showNewContentForm">{{ (showNewContentForm) ? 'Cancel':'New Content'}}</button>
    </div>
    <div v-if="showNewContentForm" class="slds-col slds-size_1-of-1 slds-theme_inverse slds-var-p-horizontal_small slds-var-p-vertical_x-small">
        <div class="slds-grid slds-wrap">
            <div class="slds-col slds-size_1-of-1">
                <div class="slds-form-element">
                    <label class="slds-form-element__label" for="txtContentName"><span class="slds-text-color_inverse">Content Name</span></label>
                    <div class="slds-form-element__control slds-text-color_default">
                        <input type="text" id="txtContentName" v-model="newContentName" class="slds-input"/>
                    </div>
                </div>
            </div>
            <div class="slds-col slds-size_1-of-1">
                <div class="slds-form-element slds-var-m-top_small">
                    <div class="slds-form-element__control">
                        <div class="slds-checkbox">
                            <input type="checkbox" name="options" id="chk-display-name" v-model="newContentDisplayName"/>
                            <label for="chk-display-name" class="slds-checkbox__label">
                                <span class="slds-checkbox_faux"></span>
                                <span class="slds-form-element__label"><span class="slds-text-color_inverse">Display Name as Title</span></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="slds-col slds-size_1-of-1 slds-var-m-top_small">
                <div class="slds-button-group">
                    <button class="slds-button slds-button_neutral" v-on:click="handleCreateNewContent">Save</button>
                    <button class="slds-button slds-button_destructive" v-on:click="showNewContentForm = false">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>