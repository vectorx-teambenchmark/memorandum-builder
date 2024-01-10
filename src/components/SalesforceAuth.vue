<script setup>
import { onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import useAuthStore from '../stores/auth';

//events that are able to be emitted.
const emit = defineEmits({
    authenticated: null
});

const authStore = useAuthStore();
const route = useRoute();

function authNavigation(){
    let fullUrl = `${authStore.authUrl}?client_id=${authStore.clientId}&redirect_uri=${authStore.callbackUrl}&response_type=${authStore.responseType}&display=${authStore.displayType}`;
    if(route.params?.recordId !== undefined){
        fullUrl += '&state=' + route.params.recordId;
    }
    window.location = fullUrl;
}

//lifecycle hooks 
onBeforeMount(()=>{
    //determine if hash parameters have been passed in.
    if(route.hash !== null && route.hash.length > 0) {
        let hashInfo = route.hash.substring(1).split('&').reduce( (prevItem,hashPart) => {
            let hashKeyVal = hashPart.split('=');
            if(!Object.hasOwn(prevItem,hashKeyVal[0])){
                prevItem[hashKeyVal[0]] = hashKeyVal[1];
            }
            return prevItem;
        },{}); 
        authStore.setToken(hashInfo?.access_token);
        authStore.setApiUrl(hashInfo?.instance_url);
        authStore.setIdUrl(hashInfo?.id);
        route.params.recordId = hashInfo?.state;
    }
    if(authStore.isAuthenticated){
        emit('authenticated');
    } else {
        console.log('The authStore does not show Authentication.');
    }
})
</script>

<template>
    <button v-if="!authStore.isAuthenticated" class="slds-button slds-button_brand" v-on:click="authNavigation">Authorize With Salesforce</button>
    <div v-else class="slds-box slds-theme_info">
        <p class="slds-text-title_caps slds-text-color_inverse">You have successfully authenticated using Salesforce.</p>
    </div>
</template>