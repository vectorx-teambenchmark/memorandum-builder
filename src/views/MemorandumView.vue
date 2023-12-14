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
        <ImSelector v-bind:api-token="authStore.bearerToken" v-bind:url-base="authStore.apiUrl" v-on:unauthorized.once="sendToAuthorization"/>
    </div>
</template>