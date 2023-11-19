<script setup>
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useAuthStore from '../stores/auth';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

function authNavigation(){
    let fullUrl = `${authStore.authUrl}?client_id=${authStore.clientId}&redirect_uri=${authStore.callbackUrl}&response_type=${authStore.responseType}&display=${authStore.displayType}`;
    if(Array.isArray(route.params?.recordId) && route.params?.recordId?.length > 0){
        fullUrl += '&state=' + route.params.recordId[0];
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
        route.params.recordId = hashInfo?.state;
    }
    if(authStore.isAuthenticated){
        console.log('The authStore shows authentication - should push to editor.');
        router.push({name:'editor',params:route.params});
    } else {
        console.log('The authStore does not show Authentication.');
    }
})
</script>

<template>
    <button v-if="!authStore.isAuthenticated" class="button is-link is-medium" v-on:click="authNavigation">Authorize With Salesforce</button>
    <div v-else class="message is-success">
        <div class="message-header"><h2>Success</h2></div>
        <div class="message-body">
            <p>You have successfully authenticated using Salesforce.</p>
        </div>
    </div>
</template>