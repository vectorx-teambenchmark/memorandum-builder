<script setup>
    import { computed, ref, watch } from 'vue';
    import { useRouter } from 'vue-router';
    import axios from 'axios';
    import useAuthStore from '../stores/auth';
    import ImSelector from '../components/ImSelector.vue';
    import VersionSelector from '../components/VersionSelector.vue';
    import MemorandumVersionForm from '../components/MemorandumVersionForm.vue';

    const router = useRouter();
    const authStore = useAuthStore();
    const selectedCmm = ref({});
    const selectedVersion = ref({});
    const showNewVersionForm = ref(false);
    const hasCmmSelection = computed(()=>{
        return selectedCmm.value?.detail?.value !== undefined;
    });
    const selectedCmmId = computed(()=>{
        return selectedCmm.value?.detail?.value;
    });
    const hasVersionSelection = computed(()=>{
        return selectedVersion.value?.value !== undefined;
    })

    function sendToAuthorization(){
        authStore.$reset();
        router.push({ name: 'home'});
    }
    function handleCmmSelection(payload){
        
        selectedCmm.value = payload;
    }
    function handleVersionSelection(payload){
        selectedVersion.value = payload.selection;
    }
    function handleToggleNewVersionForm(){
        showNewVersionForm.value = !showNewVersionForm.value;
    }
    async function createMemorandumVersion(recordInfo){
        let endpoint = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c`;
        try {
            let response = await axios({
                method:'post',
                url:endpoint,
                data: recordInfo.detail,
                headers: {'Authorization':`Bearer ${authStore.bearerToken}`}
            });
            let newversion = {label:'New Record', value:response.data.id};
            selectedVersion.value = newversion;
            handleToggleNewVersionForm();   
        } catch(e) {
            console.log('Error: %s',JSON.stringify(e,null,"\t"));
        }
    }

    watch(selectedVersion,(newValue)=>{
        if(hasVersionSelection.value) {
            router.push({name:'memorandumversion',params:{recordId:newValue.value}});
        }
    });
</script>

<template>
    <div class="slds-container_x-large">
        <div class="slds-grid slds-wrap slds-gutters_small">
            <div class="slds-col sld-size_1-of-1 slds-box slds-theme_default slds-grid slds-wrap">
                <div class="slds-col slds-size_1-of-1">
                    <ImSelector v-bind:api-token="authStore.bearerToken" v-bind:url-base="authStore.apiUrl" 
                        v-on:unauthorized.once="sendToAuthorization" v-on:imselected="handleCmmSelection"/>
                </div>
                <div v-if="hasCmmSelection" class="slds-col slds-size_1-of-1">
                    <VersionSelector v-bind:api-token="authStore.bearerToken" v-bind:url-base="authStore.apiUrl" 
                        v-bind:cmm-id="selectedCmmId" v-on:versionselected="handleVersionSelection" />
                </div>
                <div v-if="hasCmmSelection" class="slds-col slds-size_1-of-1 slds-var-m-top_medium">
                    <div class="slds-button-group" role="group">
                        <button class="slds-button slds-button_brand" v-bind:disabled="!hasVersionSelection">Open Selected Version</button>
                        <button class="slds-button slds-button_neutral" v-on:click="handleToggleNewVersionForm">Create New Version</button>
                    </div>
                </div>
                <div v-if="showNewVersionForm" class="slds-col slds-size_1-of-1 slds-var-m-top_medium">
                    <MemorandumVersionForm v-bind:api-token="authStore.bearerToken" v-bind:url-base="authStore.apiUrl"
                        v-bind:cmm-id="selectedCmmId" v-on:cancel="showNewVersionForm = false" v-on:save="createMemorandumVersion($event)"/>
                </div>

            </div>
        </div>
    </div>
</template>