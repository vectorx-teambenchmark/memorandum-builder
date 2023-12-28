<script setup>
import { computed } from 'vue';

const props = defineProps({
    versionInfo:{
        type: Object,
        default(){
            return { VersionName__c:'N/A'}
        }
    },
    tocDisplay:{
        Boolean,
        default(){
            return false;
        }
    }
});
const emit = defineEmits(['update:tocDisplay']);

const tocToggleButtonLabel = computed(()=>{
    return (props.tocDisplay) ? 'Hide Table Of Contents':'Show Table of Contents';
});

</script>

<template>
    <div class="slds-page-header">
        <div class="slds-page-header__row">
            <div class="slds-page-header__col-title">
                <div class="slds-media">
                    <div class="slds-media__figure">
                        <span class="slds-icon_container slds-icon-standard-document" title="Memorandum Version">
                            <svg class="slds-icon slds-page-header__icon" aria-hidden="true">
                                <use xlink:href="/src/assets/icons/standard-sprite/svg/symbols.svg#document"></use>
                            </svg>
                            <span class="slds-assistive-text">memorandum version</span>
                        </span>
                    </div>
                    <div class="slds-media__body">
                        <div class="slds-page-header__name">
                            <div class="slds-page-header__name-title">
                                <h1><span class="slds-page-header__title">{{ props.versionInfo.VersionName__c }}</span></h1>
                            </div>
                        </div>
                        <p class="slds-page-header__name-meta">{{ props.versionInfo.Status__c }} &#9900; Canonical Version {{ props.versionInfo.CanonicalVersion__c }}</p>
                    </div>
                </div>
            </div>
            <div class="slds-page-header__col-actions">
                <div class="slds-page-header__controls">
                    <div class="slds-page-header__control">
                        <ul class="slds-button-group-list">
                            <li>
                                <button class="slds-button slds-button_neutral" v-on:click="emit('update:tocDisplay',!props.tocDisplay)">{{ tocToggleButtonLabel }}</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_neutral" disabled>Preview Version</button>
                            </li>
                            <li>
                                <button class="slds-button slds-button_neutral" disabled>Submit for Approval</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>