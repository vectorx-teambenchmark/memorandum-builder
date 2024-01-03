<script setup>
    import { onBeforeMount, ref } from 'vue';
    import axios from 'axios';
    import SelectorBox from './SelectorBox.vue';
    const props = defineProps({
        apiToken: {
            type: String,
            required: true
        },
        urlBase: {
            type: String,
            required: true
        },
        cmmId: {
            type: String,
            required: true
        },
        versionId: {
            type: String
        }
    });
    const emit =  defineEmits(['save','cancel']);

    const canonicalVersion = ref(0);
    const description = ref('');
    const statusOptions = ref([]);
    const status = ref('');

    function handleCancel() {
        emit('cancel');
    }
    function handleSave() {
        let payload = {'CanonicalVersion__c':canonicalVersion.value,'VersionNotes__c':description.value,
            'Status__c':status.value,'ParentMarketingMaterial__c':props.cmmId, 'Id':(props.versionId !== undefined) ? props.versionId:undefined};
        emit('save',{detail:payload});
    }

    onBeforeMount(async () => {
        let endpoint = `${props.urlBase}/services/data/${import.meta.env.VITE_SALESFORCE_VERSION}/sobjects/MemorandumVersion__c/describe`;
        try {
            let response = await axios({
                url: endpoint,
                method: 'get',
                responseType: 'json',
                headers: {'Authorization':`Bearer ${props.apiToken}`}
            });
            let statusField = response.data.fields.find(obj => obj.name === 'Status__c');
            statusOptions.value = statusField.picklistValues.map( plItem => {
                return { label:plItem.label, value:plItem.value };
            })
        } catch(e) {
            console.log('Error: %s',JSON.stringify(e,null,"\t"));
        }
    });
</script>

<template>
    <div class="slds-grid slds-wrap">
        <div class="slds-col slds-size_1-of-1">
            <div class="slds-form-element">
                <label class="slds-form-element__label" for="txtCanonicalVersion">Canonial Version Number</label>
                <div class="slds-form-element__control">
                    <input type="number" id="txtCanonicalVersion" v-model="canonicalVersion" class="slds-input"/>
                </div>
            </div>
        </div>
        <div class="slds-col slds-size_1-of-1">
            <SelectorBox label="Status" placeholder="Select Status" v-bind:options="statusOptions" v-on:selection="status = $event.detail.value"/>
        </div>
        <div class="slds-col slds-size_1-of-1">
            <div class="slds-form-element">
                <label class="slds-form-element__label" for="txtDescription">Description</label>
            </div>
            <div class="slds-form-element__control">
                <textarea id="txtDescription" placeholder="Enter Description..." v-model="description" class="slds-textarea"></textarea>
            </div>
        </div>
        <div class="slds-col slds-size_1-of-1">
            <div class="slds-button-group">
                <button class="slds-button slds-button_brand" v-on:click="handleSave">Save</button>
                <button class="slds-button slds-button_neutral" v-on:click="handleCancel">Cancel</button>
            </div>
        </div>
    </div>
</template>