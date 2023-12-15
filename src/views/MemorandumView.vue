<script setup>
    import { useRouter } from 'vue-router'
    import useAuthStore from '../stores/auth';
    import ImSelector from '../components/ImSelector.vue';

    const router = useRouter();
    const authStore = useAuthStore();

    function sendToAuthorization(){
        console.log('Attempting Redirect');
        authStore.$reset();
        router.push({ name: 'home'});
    }
</script>

<template>
    <div class="slds-container_large">
        <div class="slds-grid slds-wrap slds-gutters_small">
            <div class="slds-col slds-size_1-of-1">
                <ImSelector v-bind:api-token="authStore.bearerToken" v-bind:url-base="authStore.apiUrl" 
                    v-on:unauthorized.once="sendToAuthorization"/>
            </div>
            <div class="slds-col slds-size_1-of-1">

            </div>
        </div>
    </div>
</template>