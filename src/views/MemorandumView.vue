<script setup>
    import { computed, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import useAuthStore from '../stores/auth';
    import ImSelector from '../components/ImSelector.vue';
    import VersionSelector from '../components/VersionSelector.vue';

    const router = useRouter();
    const authStore = useAuthStore();
    const selectedCmm = ref({});
    const selectedVersion = ref({});
    const hasCmmSelection = computed(()=>{
        return selectedCmm.value?.detail?.value !== undefined;
    });
    const selectedCmmId = computed(()=>{
        return selectedCmm.value?.detail?.value;
    });

    function sendToAuthorization(){
        console.log('Attempting Redirect');
        authStore.$reset();
        router.push({ name: 'home'});
    }
    function handleCmmSelection(payload){
        console.log('Payload: %s',JSON.stringify(payload,null,"\t"));
        selectedCmm.value = payload;
    }
    function handleVersionSelection(payload){
        selectedVersion.value = payload;
    }
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
                        <button class="slds-button slds-button_brand">Open Selected Version</button>
                        <button class="slds-button slds-button_neutral">Create New Version</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>