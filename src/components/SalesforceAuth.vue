<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useAuthStore from '../stores/auth';

//events that are able to be emitted.
const emit = defineEmits({
    authenticated: null
    // The second argument is the recordId to navigate to after authentication.
});

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const isExchanging = ref(false);
const exchangeError = ref('');

async function authNavigation(){
    // Generate PKCE values before redirecting
    const { codeChallenge, state } = await authStore.generatePKCEValues(route.params?.recordId);

    let fullUrl = `${authStore.authUrl}?client_id=${authStore.clientId}` +
        `&redirect_uri=${authStore.callbackUrl}` +
        `&response_type=${authStore.responseType}` +
        `&display=${authStore.displayType}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256` +
        `&state=${state}`;

    window.location = fullUrl;
}

/**
 * Handles the OAuth callback from the authorization code flow.
 * Extracts the authorization code from the query parameters,
 * exchanges it for tokens, and stores the result.
 */
async function handleAuthCallback(){
    const code = route.query.code;
    const returnedState = route.query.state;

    if(!code || !returnedState){
        console.warn('OAuth callback missing code or state parameter. This may be a direct navigation, not a callback.');
        return false;
    }

    // Verify state for CSRF protection
    if(!authStore.verifyState(returnedState)){
        exchangeError.value = 'Security validation failed. The authorization request may have been tampered with. Please try again.';
        console.error('State mismatch - possible CSRF attack. Expected state from sessionStorage but received:', returnedState);
        return false;
    }

    isExchanging.value = true;
    exchangeError.value = '';

    try {
        const tokenResponse = await authStore.exchangeCodeForToken(code);

        authStore.setToken(tokenResponse.access_token);
        authStore.setApiUrl(tokenResponse.instance_url);
        authStore.setIdUrl(tokenResponse.id);

        // Restore the recordId from the PKCE session data
        const storedRecordId = sessionStorage.getItem('pkce_record_id');
        //sessionStorage.removeItem('pkce_record_id');

        // Clean the authorization code and state from the browser URL so a
        // page refresh doesn't attempt to re-use a single-use code.
        const cleanUrl = window.location.origin + window.location.pathname;
        //window.history.replaceState({}, document.title, cleanUrl);
        console.log('Record Id FROM State: %s', storedRecordId);
        return storedRecordId;
    } catch(error){
        console.error('Token exchange failed:', error);
        exchangeError.value = 'Failed to complete authentication with Salesforce. ' +
            (error.response?.data?.error_description || error.message || 'Please try again.');
        return false;
    } finally {
        isExchanging.value = false;
    }
}

//lifecycle hooks
onBeforeMount(async ()=>{
    // Check for the authorization code in the query parameters (PKCE / code flow)
    if(route.query?.code) {
        const recordId = await handleAuthCallback();
        if(recordId !== false && authStore.isAuthenticated){
            emit('authenticated', recordId);
        }
        return;
    }

    // Fallback: check for hash parameters (legacy implicit grant flow)
    if(route.hash !== null && route.hash.length > 0) {
        let hashInfo = route.hash.substring(1).split('&').reduce( (prevItem,hashPart) => {
            let hashKeyVal = hashPart.split('=');
            if(!Object.hasOwn(prevItem,hashKeyVal[0])){
                prevItem[hashKeyVal[0]] = hashKeyVal[1];
            }
            return prevItem;
        }, {});
        console.log('Hash Info: %s', JSON.stringify(hashInfo, null, "\t"));
        authStore.setToken(hashInfo?.access_token);
        authStore.setApiUrl(hashInfo?.instance_url);
        authStore.setIdUrl(hashInfo?.id);
        if(hashInfo?.state){
            const targetParams = { recordId: hashInfo.state };
            router.replace({ params: targetParams });
        }
    }

    if(authStore.isAuthenticated){
        emit('authenticated');
    } else {
        console.log('The authStore does not show Authentication.');
    }
})
</script>

<template>
    <div v-if="isExchanging" class="slds-box slds-theme_info">
        <p class="slds-text-body_regular">Completing authentication with Salesforce...</p>
    </div>
    <div v-else-if="exchangeError" class="slds-box slds-theme_alert-texture slds-theme_error">
        <p class="slds-text-body_regular">{{ exchangeError }}</p>
        <button class="slds-button slds-button_inverse slds-var-m-top_medium" v-on:click="exchangeError = ''">
            Try Again
        </button>
    </div>
    <button v-else-if="!authStore.isAuthenticated" class="slds-button slds-button_brand" v-on:click="authNavigation">Authorize With Salesforce</button>
    <div v-else class="slds-box slds-theme_info">
        <p class="slds-text-title_caps slds-text-color_inverse">You have successfully authenticated using Salesforce.</p>
    </div>
</template>
