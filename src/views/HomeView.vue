<script setup>
import { ref } from 'vue';
import SalesforceAuth from '../components/SalesforceAuth.vue';
import { useRoute, useRouter } from 'vue-router';
import useAuthStore from '../stores/auth';
import axios from 'axios';
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const sObjectList = ref([]);

async function redirect() {
  await obtainGlobalDescribe();
  let providedId = route.params?.recordId;
  let redirectObj = {name:'home'};
  if(providedId !== undefined) {
    //try to find what object the providedId represents
    let providedObject = sObjectList.value.find(obj => providedId.startsWith(obj.keyPrefix));
    switch(providedObject.name){
      case 'Client_Marketing_Material__c':
        redirectObj.name = 'versionselect';
        redirectObj.params = {recordId:providedId};
        break;
      case 'MemorandumVersion__c':
        redirectObj.name = 'memorandumversion';
        redirectObj.params = {recordId:providedId};
        break;
      default:
        redirectObj.name = 'home';
    }
    router.push(redirectObj);
  } else {
    router.push({name:'cmm'});
  }
}
async function obtainGlobalDescribe(){
  if(authStore.bearerToken.length > 0) {
    let globalDescribeUrl = `${authStore.apiUrl}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/`;
    let globalDescribeResponse = await axios.get(globalDescribeUrl,{
      headers: {'Authorization':`Bearer ${authStore.bearerToken}`},
      responseType:'json'
    });
    console.log('Global Describe Response: %s',JSON.stringify(globalDescribeResponse.data,null,"\t"));
    sObjectList.value = globalDescribeResponse.data.sobjects;
  }
}
</script>

<template>
  <div class="slds-var-m-vertical_xx-large slds-grid slds-wrap grid_vertical-align-center">
    <div class="slds-col slds-size_1-of-1 slds-align_absolute-center">
      <SalesforceAuth v-on:authenticated="redirect"/>
    </div>
  </div>
</template>