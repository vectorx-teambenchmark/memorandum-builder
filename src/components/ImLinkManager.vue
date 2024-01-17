<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { DateTime } from 'luxon';
import axios from 'axios';
import useAuthStore from '../stores/auth';

//constructed properties
const props = defineProps({
    versionId: {
        type: String,
        required: true,
        default(){
            return '';
        }
    }
});
const router = useRouter();
const authStore = useAuthStore();

//computed properties
const isUrlValid = computed(()=>{
    return versionInfo.value?.ExternalUrlExpiration__c !== undefined && versionInfo.value?.ExternalUrlExpiration__c !== null;
});
const versionUrl = computed(()=>{
    return `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${props.versionId}/`;
});
const expirationFormDate = computed({
    get(){
        console.log('The ExternalUrlExpiration is in the format: %s',JSON.stringify(versionInfo.value.ExternalUrlExpiration__c));
        return versionInfo.value.ExternalUrlExpiration__c;
    },
    set(val){
        console.log('Value Passed in for ExternalUrlExpireation: %s',JSON.stringify(val));
        versionInfo.value.ExternalUrlExpiration__c = val;
    }
});
const expirationDisplayDate = computed(()=>{
    let dt = DateTime.fromISO(versionInfo.value?.ExternalUrlExpiration__c);
    return (dt.isValid) ? dt.toLocaleString():'';
});
const expirationDisplayUrl = computed(()=>{
    //get the right community
    return `${communityBase.value}/cim-preview?c__id=${versionInfo.value.ExternalId__c}`;
})

//reactive properties
const versionInfo = ref({});
const communitiesList = ref([]);
const showUpdateMessage = ref(false);
const updateMessage = ref('');
const communityBase = ref('');

//internal functions
function handleCalloutException(e) {
    switch(e.response.status) {
        case 401:
            authStore.$reset();
            router.push({name:'home',params:{recordId:props.versionId}});
            break;
        default:
            console.log('There was an error: %s',JSON.stringify(e,null,"\t"));
    }
}
function resetMessage(){
    setTimeout(()=>{
        showUpdateMessage.value = false;
    },3000);
}
function handleCopyLinkToClipboard(){
    navigator.clipboard.writeText(expirationDisplayUrl.value).then(()=>{
        console.log(`copied link ${expirationDisplayUrl.value} to clipboard`);
    }).catch(()=>{
        console.log('Crap - sorry, couldn\'t grab link.');
    })
}

async function obtainVersionInfo(versionIdIn) {
    try {
        //build Link to obtain record info
        let versionInfoUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/${versionIdIn}`;
        let versionInfoResponse = await axios.get(versionInfoUrl,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        versionInfo.value = versionInfoResponse.data;
    } catch(e) {
        handleCalloutException(e);
    }
}
async function getCommunities(){
    let communitiesUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/connect/communities/?status=Live`;
    try {
        let communitiesResponse = await axios.get(communitiesUrl,{
            headers: { 'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        communitiesList.value = communitiesResponse.data.communities;
        console.log('Communities Found: %s',JSON.stringify(communitiesList.value,null,"\t"));
    } catch(e) {
        handleCalloutException(e);
    }
}
async function getCommunityUrl(){
    let communityUrl = `${authStore.apiUrl}/services/apexrest/imservice/?sitename=${encodeURIComponent('Invite Confirmation')}`;
    try {
        let communityResponse = await axios.get(communityUrl,{headers:{'authorization':`Bearer ${authStore.bearerToken}`}});
        communityBase.value = communityResponse.data;
    } catch(e) {
        handleCalloutException(e);
    }
}
async function handlePreviewGenerationInfo(){
    let dt = DateTime.now().plus({'months':1});
    let versionUpdateData = { ExternalUrlExpiration__c: `${dt.toFormat('yyyy-MM-dd')}` };
    try {
        await axios.patch(versionUrl.value,versionUpdateData,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        obtainVersionInfo(props.versionId);
    } catch(e) {
        handleCalloutException(e);
    }
}
async function handleExpirationUpdate(){
    let versionUpdateData = { ExternalUrlExpiration__c: versionInfo.value.ExternalUrlExpiration__c };
    updateMessage.value = '';
    try {
        await axios.patch(versionUrl.value,versionUpdateData,{
            headers:{'authorization':`Bearer ${authStore.bearerToken}`},
            responseType:'json'
        });
        updateMessage.value = 'The Expiration Date has been updated.';
        showUpdateMessage.value = true;
        resetMessage();
        obtainVersionInfo(props.versionId);
    } catch(e) {
        handleCalloutException(e);
    }
}

//lifecycle methods
onBeforeMount(() => {
    obtainVersionInfo(props.versionId);
    getCommunityUrl();
});
</script>

<template>
    <div class="slds-grid slds-wrap">
        <div v-if="!isUrlValid" class="slds-col slds-size_1-of-1">
            <p class="slds-text-longform">If you need to share the content of the Selected Memorandum Version Externally, the press the 'Generate Preview Link' button.</p>
            <button class="slds-button slds-button_brand" v-on:click="handlePreviewGenerationInfo">Generate Preview Link</button>
        </div>
        <div v-else class="slds-col slds-size_1-of-1">
            <p class="slds-text-longform">In order to allow a user that does not log into Salesforce a preview of this version, please
                provide them with the following URL. The URL will be valid until <strong>{{ expirationDisplayDate }}</strong>
            </p>
            <div class="slds-form-element">
                <label class="slds-form-element__label" for="txtExternalUrl">External URL</label>
                <div class="slds-form-element__control">
                    <input type="text" id="txtExternalUrl" disabled v-model="expirationDisplayUrl" class="slds-input"/>
                </div>
            </div>
            <button class="slds-button slds-button_neutral slds-var-m-top_small" v-on:click="handleCopyLinkToClipboard">Copy To Clipboard</button>
            <p class="slds-text-longform">If you need to extend the expiration date of the URL, please provide the new date below and click 'Update'.</p>
            <div class="slds-form-element">
                <label class="slds-form-element__label" for="txtExpDate">External URL Expiration</label>
                <div class="slds-form-element__control">
                    <input type="date" class="slds-input" v-model="expirationFormDate" id="txtExpDate"/>
                </div>
            </div>
            <div class="slds-var-m-vertical_small">
                <button class="slds-button slds-button_brand" v-on:click="handleExpirationUpdate">Update</button>
            </div>
            <p v-if="showUpdateMessage">
                {{  updateMessage }}
            </p>
        </div>
    </div>
</template>